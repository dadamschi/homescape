import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sanityWriteClient } from "@/lib/sanity";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// Verify Slack request signature
function verifySlackRequest(body: string, timestamp: string, signature: string): boolean {
  if (!SLACK_SIGNING_SECRET) return false;

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

export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const body = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") || "";
  const signature = request.headers.get("x-slack-signature") || "";

  // Verify request is from Slack
  if (SLACK_SIGNING_SECRET && !verifySlackRequest(body, timestamp, signature)) {
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

  try {
    // Fetch the document to get its title
    const doc = await sanityWriteClient.fetch<{ title: string } | null>(
      `*[_id == $id][0]{ title }`,
      { id: documentId }
    );

    if (!doc) {
      // Also check with drafts prefix
      const draftDoc = await sanityWriteClient.fetch<{ title: string } | null>(
        `*[_id == $id][0]{ title }`,
        { id: `drafts.${documentId}` }
      );
      if (!draftDoc) {
        await updateSlackMessage(responseUrl, "Unknown post", "rejected", user);
        return NextResponse.json({ error: "Document not found" });
      }
    }

    const title = doc?.title || "Blog Post";

    if (actionId === "approve_post") {
      // Publish the draft by setting publishedAt
      const draftId = documentId.startsWith("drafts.") ? documentId : `drafts.${documentId}`;

      await sanityWriteClient
        .patch(draftId)
        .set({ publishedAt: new Date().toISOString() })
        .commit();

      // Publish the document (copy draft to published)
      const publishedId = documentId.replace("drafts.", "");
      const draftDoc = await sanityWriteClient.fetch(`*[_id == $id][0]`, {
        id: draftId,
      });

      if (draftDoc) {
        // Create or replace the published version
        await sanityWriteClient.createOrReplace({
          ...draftDoc,
          _id: publishedId,
        });
        // Delete the draft
        await sanityWriteClient.delete(draftId);
      }

      console.log(`Published blog post: ${title}`);
      await updateSlackMessage(responseUrl, title, "approved", user);
    } else if (actionId === "reject_post") {
      // Delete the draft
      const draftId = documentId.startsWith("drafts.") ? documentId : `drafts.${documentId}`;

      await sanityWriteClient.delete(draftId);

      console.log(`Rejected blog post: ${title}`);
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
