#!/bin/bash
set -e

echo "🏗  Homescape → GitHub → Vercel deploy script"
echo "----------------------------------------------"

# 1. Create GitHub repo (requires gh CLI — install with: brew install gh)
echo "→ Staging and committing files..."
git add .
git commit -m "Initial commit" || echo "(nothing new to commit)"

echo "→ Creating GitHub repo..."
gh repo create dadamschi/homescape \
  --public \
  --description "Homescape Construction — Marketing SPA" \
  --source=. \
  --remote=origin \
  --push

echo "✅ Repo created and pushed to github.com/dadamschi/homescape"

# 2. Deploy to Vercel
echo ""
echo "→ Deploying to Vercel..."
npx vercel --yes \
  --name homescape-construction \
  --build-env VITE_SANITY_PROJECT_ID="${VITE_SANITY_PROJECT_ID}" \
  --build-env VITE_SANITY_DATASET="${VITE_SANITY_DATASET}"

echo ""
echo "🎉 Done! Your site is live on Vercel."
echo "   Future pushes to main will auto-deploy."
