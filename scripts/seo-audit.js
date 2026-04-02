import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "2omgdk67",
  dataset: "production",
  useCdn: false,
  apiVersion: "2025-02-06",
});

async function audit() {
  console.log("\n🔍 SANITY SEO CONTENT AUDIT\n");
  console.log("=".repeat(50));

  // 1. Projects
  const projects = await client.fetch(`
    *[_type == "project"] {
      _id,
      title,
      description,
      "descLength": length(description),
      "hasImage": defined(image.asset),
      "imageAlt": image.alt,
      "imagesCount": count(images),
      "imagesWithAlt": count(images[defined(alt)])
    }
  `);

  console.log("\n📁 PROJECTS (" + projects.length + " total)");
  console.log("-".repeat(50));

  let projectIssues = [];
  for (const p of projects) {
    const issues = [];
    if (!p.description) issues.push("Missing description");
    else if (p.descLength < 100) issues.push(`Short description (${p.descLength} chars)`);
    if (!p.hasImage) issues.push("No main image");
    else if (!p.imageAlt) issues.push("Main image missing alt text");
    if (p.imagesCount > 0 && p.imagesWithAlt < p.imagesCount) {
      issues.push(`${p.imagesCount - p.imagesWithAlt}/${p.imagesCount} gallery images missing alt`);
    }

    if (issues.length > 0) {
      projectIssues.push({ title: p.title, issues });
      console.log(`  ⚠️  ${p.title}`);
      issues.forEach(i => console.log(`      - ${i}`));
    } else {
      console.log(`  ✅ ${p.title}`);
    }
  }

  // 2. Site Settings
  const settings = await client.fetch(`
    *[_type == "siteSettings"][0] {
      companyName,
      tagline,
      phone,
      email,
      social
    }
  `);

  console.log("\n⚙️  SITE SETTINGS");
  console.log("-".repeat(50));

  const settingsIssues = [];
  if (!settings?.companyName) settingsIssues.push("Missing company name");
  if (!settings?.tagline) settingsIssues.push("Missing tagline (used for meta description)");
  if (!settings?.phone) settingsIssues.push("Missing phone (critical for local SEO)");
  if (!settings?.email) settingsIssues.push("Missing email");
  if (!settings?.social?.facebook && !settings?.social?.instagram && !settings?.social?.linkedin) {
    settingsIssues.push("No social links configured");
  }

  if (settingsIssues.length > 0) {
    settingsIssues.forEach(i => console.log(`  ⚠️  ${i}`));
  } else {
    console.log("  ✅ All fields complete");
  }

  // 3. Hero Content
  const hero = await client.fetch(`
    *[_type == "heroContent"][0] {
      headline,
      story,
      "storyLength": length(story),
      "heroImagesCount": count(heroImages),
      "heroImagesWithAlt": count(heroImages[defined(alt)])
    }
  `);

  console.log("\n🏠 HERO CONTENT");
  console.log("-".repeat(50));

  const heroIssues = [];
  if (!hero?.headline) heroIssues.push("Missing headline");
  if (!hero?.story) heroIssues.push("Missing story");
  else if (hero.storyLength < 100) heroIssues.push(`Short story (${hero.storyLength} chars)`);
  if (!hero?.heroImagesCount || hero.heroImagesCount === 0) {
    heroIssues.push("No hero background images");
  } else if (hero.heroImagesWithAlt < hero.heroImagesCount) {
    heroIssues.push(`${hero.heroImagesCount - hero.heroImagesWithAlt}/${hero.heroImagesCount} hero images missing alt`);
  }

  if (heroIssues.length > 0) {
    heroIssues.forEach(i => console.log(`  ⚠️  ${i}`));
  } else {
    console.log("  ✅ All fields complete");
  }

  // 4. About Content
  const about = await client.fetch(`
    *[_type == "aboutContent"][0] {
      headline,
      story,
      "storyLength": length(story),
      "hasImage": defined(image.asset),
      "imageAlt": image.alt,
      "valuesCount": count(values),
      "statsCount": count(stats)
    }
  `);

  console.log("\n📖 ABOUT CONTENT");
  console.log("-".repeat(50));

  const aboutIssues = [];
  if (!about?.headline) aboutIssues.push("Missing headline");
  if (!about?.story) aboutIssues.push("Missing story");
  else if (about.storyLength < 200) aboutIssues.push(`Short story (${about.storyLength} chars, recommend 200+)`);
  if (!about?.hasImage) aboutIssues.push("No about image");
  else if (!about?.imageAlt) aboutIssues.push("About image missing alt text");
  if (!about?.valuesCount || about.valuesCount === 0) aboutIssues.push("No values defined");
  if (!about?.statsCount || about.statsCount === 0) aboutIssues.push("No stats defined");

  if (aboutIssues.length > 0) {
    aboutIssues.forEach(i => console.log(`  ⚠️  ${i}`));
  } else {
    console.log("  ✅ All fields complete");
  }

  // 5. Testimonials
  const testimonials = await client.fetch(`
    *[_type == "testimonial"] {
      _id,
      name,
      quote,
      "quoteLength": length(quote),
      project,
      rating
    }
  `);

  console.log("\n⭐ TESTIMONIALS (" + testimonials.length + " total)");
  console.log("-".repeat(50));

  if (testimonials.length === 0) {
    console.log("  ⚠️  No testimonials (important for E-E-A-T)");
  } else if (testimonials.length < 3) {
    console.log(`  ⚠️  Only ${testimonials.length} testimonial(s) - recommend 3+ for credibility`);
  } else {
    console.log(`  ✅ ${testimonials.length} testimonials`);
  }

  for (const t of testimonials) {
    const issues = [];
    if (!t.name) issues.push("Missing name");
    if (!t.quote) issues.push("Missing quote");
    else if (t.quoteLength < 50) issues.push(`Short quote (${t.quoteLength} chars)`);
    if (!t.project) issues.push("No project linked");

    if (issues.length > 0) {
      console.log(`  ⚠️  "${t.name || 'Unnamed'}": ${issues.join(", ")}`);
    }
  }

  // 6. Locations
  const locations = await client.fetch(`
    *[_type == "location"] {
      _id,
      name,
      address,
      hours
    }
  `);

  console.log("\n📍 LOCATIONS (" + locations.length + " total)");
  console.log("-".repeat(50));

  if (locations.length === 0) {
    console.log("  ⚠️  No locations (critical for local SEO)");
  } else {
    for (const loc of locations) {
      const issues = [];
      if (!loc.address) issues.push("Missing address");
      if (!loc.hours) issues.push("Missing hours");

      if (issues.length > 0) {
        console.log(`  ⚠️  ${loc.name || 'Unnamed'}: ${issues.join(", ")}`);
      } else {
        console.log(`  ✅ ${loc.name}`);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));

  const totalIssues =
    projectIssues.length +
    settingsIssues.length +
    heroIssues.length +
    aboutIssues.length;

  if (totalIssues === 0) {
    console.log("\n✅ No critical SEO issues found in Sanity content!\n");
  } else {
    console.log(`\n⚠️  ${totalIssues} content areas need attention\n`);
    console.log("Priority fixes:");
    console.log("  1. Add alt text to all images (accessibility + SEO)");
    console.log("  2. Ensure descriptions are 100+ characters");
    console.log("  3. Complete all location data for local SEO");
    console.log("  4. Add 3+ testimonials for E-E-A-T signals\n");
  }
}

audit().catch(console.error);
