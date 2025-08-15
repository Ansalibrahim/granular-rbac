# GitHub Actions Workflows

This directory contains automated workflows for the granular-rbac monorepo.

## Quick Start

1. **Setup NPM Token:**
   ```bash
   npm token create --type=automation
   ```
   Add this token as `NPM_TOKEN` in GitHub repository secrets.

2. **Enable Auto-Publishing:**
   Push changes to `main` branch and packages will auto-publish to npm.

3. **Manual Publishing:**
   Use the "Manual NPM Publish" workflow in GitHub Actions tab.

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `publish-npm.yml` | Push to main with package changes | Automatic npm publishing |
| `manual-publish.yml` | Manual trigger | On-demand publishing with version control |
| `test.yml` | Push/PR to any branch | CI testing across Node.js versions |

## Files

- `publish-npm.yml` - Main auto-publishing workflow
- `manual-publish.yml` - Manual publishing with options
- `test.yml` - Comprehensive testing pipeline
- `SETUP.md` - Detailed setup and troubleshooting guide

## Status Badges

Add these to your main README:

```markdown
[![NPM Publish](https://github.com/yourusername/granular-rbac/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/yourusername/granular-rbac/actions/workflows/publish-npm.yml)
[![Test](https://github.com/yourusername/granular-rbac/actions/workflows/test.yml/badge.svg)](https://github.com/yourusername/granular-rbac/actions/workflows/test.yml)
```

## Quick Commands

```bash
# Test locally before push
npm run build
npm test

# Manual version bump
npm version patch
git push origin main --tags

# Check package status
npm view granular-rbac-core
```
