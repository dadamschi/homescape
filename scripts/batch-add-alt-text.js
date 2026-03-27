import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "2omgdk67",
  dataset: "production",
  useCdn: false,
  apiVersion: "2025-02-06",
  token: process.env.SANITY_TOKEN, // Need write token
});

async function batchAddAltText() {
  console.log("\n🖼️  BATCH ADD ALT TEXT\n");
  console.log("=".repeat(50));

  let patchCount = 0;

  // 1. Projects - main image alt
  const projectsWithImage = await client.fetch(`
    *[_type == "project" && defined(image.asset) && !defined(image.alt)] {
      _id,
      title,
      category,
      location
    }
  `);

  console.log(`\n📁 Projects needing main image alt: ${projectsWithImage.length}`);
  for (const p of projectsWithImage) {
    const alt = `${p.title} - ${p.category || "construction"} project${p.location ? ` in ${p.location}` : ""}`;
    console.log(`  → ${p.title}: "${alt}"`);

    await client.patch(p._id)
      .set({ "image.alt": alt })
      .commit();
    patchCount++;
  }

  // 2. Projects - gallery images alt
  const projectsWithGallery = await client.fetch(`
    *[_type == "project" && count(images) > 0] {
      _id,
      title,
      category,
      location,
      "images": images[] {
        _key,
        alt,
        "hasAsset": defined(asset)
      }
    }
  `);

  console.log(`\n🖼️  Projects with gallery images: ${projectsWithGallery.length}`);
  for (const p of projectsWithGallery) {
    const imagesNeedingAlt = p.images.filter(img => img.hasAsset && !img.alt);
    if (imagesNeedingAlt.length === 0) continue;

    console.log(`  → ${p.title}: ${imagesNeedingAlt.length} images need alt`);

    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      if (img.hasAsset && !img.alt) {
        const alt = `${p.title} - ${p.category || "construction"} project photo ${i + 1}${p.location ? `, ${p.location}` : ""}`;
        console.log(`      Image ${i + 1}: "${alt}"`);

        await client.patch(p._id)
          .set({ [`images[_key=="${img._key}"].alt`]: alt })
          .commit();
        patchCount++;
      }
    }
  }

  // 3. Hero images alt
  const hero = await client.fetch(`
    *[_type == "heroContent"][0] {
      _id,
      headline,
      "images": heroImages[] {
        _key,
        alt,
        "hasAsset": defined(asset)
      }
    }
  `);

  if (hero?.images) {
    const heroImagesNeedingAlt = hero.images.filter(img => img.hasAsset && !img.alt);
    console.log(`\n🏠 Hero images needing alt: ${heroImagesNeedingAlt.length}`);

    for (let i = 0; i < hero.images.length; i++) {
      const img = hero.images[i];
      if (img.hasAsset && !img.alt) {
        const alt = `Homescape Construction - ${hero.headline || "quality craftsmanship"} hero image ${i + 1}`;
        console.log(`  → Hero image ${i + 1}: "${alt}"`);

        await client.patch(hero._id)
          .set({ [`heroImages[_key=="${img._key}"].alt`]: alt })
          .commit();
        patchCount++;
      }
    }
  }

  // 4. About image alt
  const about = await client.fetch(`
    *[_type == "aboutContent" && defined(image.asset) && !defined(image.alt)][0] {
      _id,
      headline
    }
  `);

  if (about) {
    console.log(`\n📖 About image needing alt: 1`);
    const alt = `Homescape Construction team - ${about.headline || "about us"}`;
    console.log(`  → About image: "${alt}"`);

    await client.patch(about._id)
      .set({ "image.alt": alt })
      .commit();
    patchCount++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Added alt text to ${patchCount} images`);
  console.log("=".repeat(50) + "\n");
}

// Check for token
if (!process.env.SANITY_TOKEN) {
  console.error("\n❌ Error: SANITY_TOKEN environment variable required");
  console.log("\nTo get a token:");
  console.log("  1. Go to https://www.sanity.io/manage/project/2omgdk67/api#tokens");
  console.log("  2. Create a token with 'Editor' permissions");
  console.log("  3. Run: SANITY_TOKEN=your_token node scripts/batch-add-alt-text.js\n");
  process.exit(1);
}

batchAddAltText().catch(console.error);
