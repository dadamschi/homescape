#!/usr/bin/env node
/**
 * Bulk Image Upload Script for Sanity
 *
 * Usage:
 *   node scripts/bulk-upload-images.js ./images
 *   node scripts/bulk-upload-images.js ./images --document project --id abc123 --field images
 *
 * Options:
 *   --document <type>  Document type to attach images to (e.g., "project")
 *   --id <id>          Document ID to attach images to
 *   --field <name>     Field name for the image(s) (default: "images")
 *   --dry-run          Preview what would be uploaded without making changes
 *
 * Environment:
 *   SANITY_TOKEN       Required. Create at https://www.sanity.io/manage
 *
 * Examples:
 *   # Upload all images from ./project-photos folder
 *   node scripts/bulk-upload-images.js ./project-photos
 *
 *   # Upload and attach to a specific project's images array
 *   node scripts/bulk-upload-images.js ./photos --document project --id abc123 --field images
 *
 *   # Preview without uploading
 *   node scripts/bulk-upload-images.js ./photos --dry-run
 */

import { createClient } from "@sanity/client";
import { createReadStream, readdirSync, statSync } from "fs";
import { basename, extname, join, resolve } from "path";

// --- Configuration ---
const PROJECT_ID = "2omgdk67";
const DATASET = "production";
const API_VERSION = "2025-02-06";

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif", ".heif", ".tiff"];

// --- Parse CLI Arguments ---
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    directory: null,
    document: null,
    id: null,
    field: "images",
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--document") {
      options.document = args[++i];
    } else if (arg === "--id") {
      options.id = args[++i];
    } else if (arg === "--field") {
      options.field = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (!arg.startsWith("--")) {
      options.directory = arg;
    }
  }

  return options;
}

// --- Validate Environment ---
function validateEnv() {
  const token = process.env.SANITY_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_TOKEN environment variable is required.\n" +
      "Create a token at: https://www.sanity.io/manage/project/2omgdk67/api#tokens"
    );
  }
  return token;
}

// --- Get Image Files from Directory ---
function getImageFiles(directory) {
  const absolutePath = resolve(directory);
  const files = readdirSync(absolutePath);

  return files
    .filter((file) => {
      const ext = extname(file).toLowerCase();
      const filePath = join(absolutePath, file);
      return SUPPORTED_EXTENSIONS.includes(ext) && statSync(filePath).isFile();
    })
    .map((file) => ({
      name: file,
      path: join(absolutePath, file),
    }));
}

// --- Upload Single Image ---
async function uploadImage(client, filePath, filename) {
  const stream = createReadStream(filePath);
  const asset = await client.assets.upload("image", stream, {
    filename: filename,
  });
  return asset;
}

// --- Attach Images to Document ---
async function attachImagesToDocument(client, documentId, field, assetIds, isArray) {
  const imageRefs = assetIds.map((assetId) => ({
    _type: "image",
    _key: assetId.replace("image-", "").slice(0, 12),
    asset: {
      _type: "reference",
      _ref: assetId,
    },
  }));

  if (isArray) {
    // Append to existing array
    await client
      .patch(documentId)
      .setIfMissing({ [field]: [] })
      .append(field, imageRefs)
      .commit();
  } else {
    // Set single image (use first one)
    await client
      .patch(documentId)
      .set({
        [field]: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: assetIds[0],
          },
        },
      })
      .commit();
  }
}

// --- Main ---
async function main() {
  const options = parseArgs();

  if (!options.directory) {
    console.error("Usage: node scripts/bulk-upload-images.js <directory> [options]");
    console.error("\nRun with --help for more information.");
    process.exit(1);
  }

  const token = validateEnv();

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: token,
    useCdn: false,
  });

  // Get image files
  const imageFiles = getImageFiles(options.directory);

  if (imageFiles.length === 0) {
    console.log("No image files found in:", options.directory);
    console.log("Supported formats:", SUPPORTED_EXTENSIONS.join(", "));
    process.exit(0);
  }

  console.log(`\nFound ${imageFiles.length} images to upload:`);
  imageFiles.forEach((f) => console.log(`  - ${f.name}`));

  if (options.dryRun) {
    console.log("\n[DRY RUN] No changes made.");
    if (options.document && options.id) {
      console.log(`Would attach to: ${options.document} (${options.id}) -> ${options.field}`);
    }
    process.exit(0);
  }

  console.log("\nUploading...\n");

  const uploadedAssets = [];
  const errors = [];

  for (const file of imageFiles) {
    try {
      process.stdout.write(`  Uploading ${file.name}...`);
      const asset = await uploadImage(client, file.path, file.name);
      uploadedAssets.push(asset);
      console.log(` ✓ ${asset._id}`);
    } catch (error) {
      console.log(` ✗ Failed`);
      errors.push({ file: file.name, error: error.message });
    }
  }

  console.log(`\n✓ Uploaded ${uploadedAssets.length}/${imageFiles.length} images`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  - ${e.file}: ${e.error}`));
  }

  // Attach to document if specified
  if (options.document && options.id && uploadedAssets.length > 0) {
    console.log(`\nAttaching to ${options.document} (${options.id})...`);

    try {
      // Check if field is an array by querying the document
      const doc = await client.fetch(`*[_type == $type && _id == $id][0]`, {
        type: options.document,
        id: options.id,
      });

      if (!doc) {
        throw new Error(`Document not found: ${options.document} with ID ${options.id}`);
      }

      const isArray = Array.isArray(doc[options.field]) || options.field === "images";
      const assetIds = uploadedAssets.map((a) => a._id);

      await attachImagesToDocument(client, options.id, options.field, assetIds, isArray);
      console.log(`✓ Attached ${assetIds.length} images to ${options.field}`);
    } catch (error) {
      console.error(`✗ Failed to attach: ${error.message}`);
      process.exit(1);
    }
  }

  // Print asset IDs for reference
  console.log("\n--- Uploaded Asset IDs ---");
  uploadedAssets.forEach((a) => {
    console.log(`${a.originalFilename}: ${a._id}`);
  });

  console.log("\n--- Asset URLs ---");
  uploadedAssets.forEach((a) => {
    console.log(`${a.originalFilename}: ${a.url}`);
  });
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
