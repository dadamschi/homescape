import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sanityWriteClient } from "@/lib/sanity";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

// Verify Slack request signature
function verifySlackRequest(body: string, timestamp: string, signature: string): boolean {
  if (!SLACK_SIGNING_SECRET) {
    console.log("SLACK_SIGNING_SECRET not set, skipping verification");
    return true; // Allow requests if signing secret not configured
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" + crypto.createHmac("sha256", SLACK_SIGNING_SECRET).update(sigBasestring).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
}

// Update the original Slack message
async function updateSlackMessage(
  responseUrl: string,
  title: string,
  action: "approved" | "rejected",
  user: string
): Promise<void> {
  const emoji = action === "approved" ? "✅" : "❌";
  const verb = action === "approved" ? "Published" : "Rejected";

  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      replace_original: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *${title}*\n\n${verb} by <@${user}>`,
          },
        },
      ],
    }),
  });
}

interface SanityDoc {
  _id: string;
  _type: string;
  title: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const body = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") || "";
  const signature = request.headers.get("x-slack-signature") || "";

  // Verify request is from Slack
  if (!verifySlackRequest(body, timestamp, signature)) {
    console.error("Invalid Slack signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse the payload (Slack sends it as URL-encoded)
  const params = new URLSearchParams(body);
  const payloadStr = params.get("payload");
  if (!payloadStr) {
    return NextResponse.json({ error: "No payload" }, { status: 400 });
  }

  const payload = JSON.parse(payloadStr);
  const action = payload.actions?.[0];
  const user = payload.user?.id;
  const responseUrl = payload.response_url;

  if (!action) {
    return NextResponse.json({ error: "No action" }, { status: 400 });
  }

  const documentId = action.value;
  const actionId = action.action_id;

  console.log(`Slack action: ${actionId} on document: ${documentId}`);

  try {
    // Try to find the document - check both with and without drafts prefix
    const baseId = documentId.replace(/^drafts\./, "");
    const draftId = `drafts.${baseId}`;

    // Query for either version
    const doc = await sanityWriteClient.fetch<SanityDoc | null>(
      `*[_id == $draftId || _id == $baseId][0]`,
      { draftId, baseId }
    );

    if (!doc) {
      console.error(`Document not found: ${documentId}`);
      await updateSlackMessage(responseUrl, "Unknown post", "rejected", user);
      return NextResponse.json({ error: "Document not found" });
    }

    const title = doc.title || "Blog Post";
    const actualId = doc._id;
    const isDraft = actualId.startsWith("drafts.");

    console.log(`Found document: ${actualId}, title: ${title}, isDraft: ${isDraft}`);

    if (actionId === "approve_post") {
      if (isDraft) {
        // Set publishedAt on the draft
        await sanityWriteClient
          .patch(actualId)
          .set({ publishedAt: new Date().toISOString() })
          .commit();

        // Fetch the updated draft
        const updatedDoc = await sanityWriteClient.fetch<SanityDoc>(`*[_id == $id][0]`, {
          id: actualId,
        });

        if (updatedDoc) {
          // Create the published version (without drafts. prefix)
          const { _id, ...docWithoutId } = updatedDoc;
          await sanityWriteClient.createOrReplace({
            ...docWithoutId,
            _id: baseId,
          });

          // Delete the draft
          await sanityWriteClient.delete(actualId);
          console.log(`Published: ${baseId}`);
        }
      } else {
        // Already published, just ensure publishedAt is set
        await sanityWriteClient
          .patch(actualId)
          .set({ publishedAt: new Date().toISOString() })
          .commit();
      }

      await updateSlackMessage(responseUrl, title, "approved", user);
    } else if (actionId === "reject_post") {
      // Delete the document (draft or published)
      await sanityWriteClient.delete(actualId);
      console.log(`Rejected/deleted: ${actualId}`);
      await updateSlackMessage(responseUrl, title, "rejected", user);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack interaction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
