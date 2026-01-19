# GitHub Pages Deployment Configuration

This project is now configured for automated deployment to GitHub Pages via GitHub Actions.

## Automatic Deployments

Every push to the `main` branch automatically triggers a build and deployment via `.github/workflows/pages-deploy.yml`.

## Required GitHub Secrets

Add the following secrets to your GitHub repository settings (Settings → Secrets and variables → Actions → New repository secret):

### Firebase Configuration

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Values to use:** These are the same Firebase credentials currently in `.env.local.txt` in the repository root. Copy each value (without quotes) into the corresponding GitHub secret.

## GitHub Pages Configuration

1. Go to your GitHub repository Settings
2. Navigate to Pages (Settings → Pages)
3. Ensure **Source** is set to "GitHub Actions"
4. Your site will be published at: `https://<username>.github.io/samta-matrimony/`

## Local Development

```bash
npm install           # Install dependencies
npm run dev          # Start dev server at http://localhost:5173/samta-matrimony/
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## SPA Routing

The app uses client-side routing (React Router). GitHub Pages has been configured to serve `dist/404.html` (which is a copy of `index.html`) so that client-side routing works correctly.

This is handled automatically via the `postbuild` script in `package.json`, which copies `dist/index.html` → `dist/404.html` after each build.

## Troubleshooting

### Build Fails in GitHub Actions

1. Check the Actions tab in your GitHub repository for error logs
2. Ensure all Firebase secrets are correctly set
3. Verify that `npm ci && npm run build` works locally

### Site Not Updating After Push

1. GitHub Actions workflows can take 1-2 minutes to complete
2. Check the Actions tab to confirm the workflow succeeded
3. Hard-refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that the deployment is active in Settings → Pages

### 404 Errors on Subpages

1. The `dist/404.html` file should exist after build
2. GitHub Pages should be configured to use "GitHub Actions" as the source
3. Try hard-refreshing or clearing browser cache

## Migration from Netlify

- **Previous hosting:** Netlify (paused due to usage limits)
- **New hosting:** GitHub Pages (free, unlimited for public repos)
- **Deployment method:** Automated via GitHub Actions on each push
- **No more `netlify.toml` or Netlify-specific config** — all configuration is in `.github/workflows/pages-deploy.yml` and `package.json`

## Rollback

To rollback to a previous version:

1. Find the commit hash of the desired version in Git history
2. Push that commit: `git reset --hard <commit-hash> && git push --force-with-lease`
3. GitHub Actions will automatically redeploy from that version

(Use `--force-with-lease` carefully as it rewrites history)
