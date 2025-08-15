# GitHub Actions Setup Guide

This repository includes automated workflows for testing, building, and publishing the granular-rbac packages to npm.

## Workflows Overview

### 1. `publish-npm.yml` - Automatic Publishing
**Triggers:**
- Push to `main` or `master` branch with changes in `packages/` directory
- Pull requests to `main` or `master` (testing only, no publishing)
- Manual trigger via GitHub Actions UI

**Features:**
- Detects which packages have changed
- Builds and tests only changed packages
- Automatically publishes to npm on main/master push
- Auto-increments patch version if version already exists
- Creates git tags for releases
- Provides detailed release summary

### 2. `manual-publish.yml` - Manual Publishing
**Triggers:**
- Manual trigger via GitHub Actions UI

**Features:**
- Choose specific package or all packages
- Choose version bump type (patch/minor/major/none)
- Immediate publishing control
- Useful for hotfixes or specific releases

### 3. `test.yml` - Continuous Integration
**Triggers:**
- Push to any branch
- Pull requests
- Manual trigger

**Features:**
- Tests across multiple Node.js versions (16, 18, 20)
- Tests all packages
- Runs linting, tests, and builds
- Type checking with TypeScript
- Package installation testing
- Code coverage reporting (on PRs)

## Setup Requirements

### 1. NPM Token Setup
You need to create an npm access token and add it to GitHub secrets:

1. **Create NPM Token:**
   ```bash
   # Login to npm
   npm login
   
   # Create automation token (recommended for CI/CD)
   npm token create --type=automation
   ```

2. **Add to GitHub Secrets:**
   - Go to your repository on GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token from step 1

### 2. Package Configuration
Ensure all packages have proper configuration:

```json
{
  "name": "granular-rbac-core",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/**/*"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 3. Repository Settings
Make sure your repository has:
- **Actions enabled** (Settings → Actions → General)
- **Workflow permissions** set to "Read and write permissions" (for creating tags)

## Usage

### Automatic Publishing (Recommended)
1. Make changes to packages
2. Commit and push to main/master
3. GitHub Actions will:
   - Detect changed packages
   - Build and test them
   - Publish to npm automatically
   - Create git tags

### Manual Publishing
1. Go to Actions tab in GitHub
2. Select "Manual NPM Publish" workflow
3. Click "Run workflow"
4. Choose package and version bump type
5. Click "Run workflow"

### Testing Only
All workflows include comprehensive testing. PRs will:
- Run tests across multiple Node.js versions
- Check TypeScript types
- Generate coverage reports
- Test package installation

## Workflow Status

You can monitor workflow status:
- **Actions tab**: See all workflow runs
- **Pull requests**: Status checks on PRs
- **Releases**: Automatic tags created for published versions

## Troubleshooting

### Common Issues:

1. **NPM Token Error:**
   - Verify `NPM_TOKEN` secret is correctly set
   - Check token hasn't expired
   - Ensure token has publish permissions

2. **Version Already Exists:**
   - Workflow auto-increments patch version
   - Or manually bump version before push

3. **Build Failures:**
   - Check TypeScript compilation errors
   - Verify all dependencies are declared
   - Check test failures in logs

4. **Permission Errors:**
   - Verify repository workflow permissions
   - Check if you have admin access for secrets

### Debug Tips:

1. **Check Workflow Logs:**
   - Go to Actions tab
   - Click on failed workflow
   - Expand failed step to see details

2. **Test Locally:**
   ```bash
   # Test build process locally
   cd packages/core
   npm run build
   npm pack
   ```

3. **Validate Package:**
   ```bash
   # Check package contents
   npm view granular-rbac-core
   ```

## Customization

### Modify Triggers
Edit the `on:` section in workflow files:
```yaml
on:
  push:
    branches: [main, develop]  # Add/remove branches
    paths: ['packages/**']     # Modify paths
```

### Change Node.js Versions
Edit the test matrix:
```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]  # Add/remove versions
```

### Add More Checks
Add additional steps to workflows:
```yaml
- name: Security Audit
  run: npm audit --audit-level=high
```

## Security Considerations

1. **NPM Token Security:**
   - Use automation tokens (not personal tokens)
   - Rotate tokens regularly
   - Limit token scope to necessary packages

2. **Workflow Security:**
   - Review all workflow changes in PRs
   - Limit workflow permissions to minimum required
   - Monitor workflow execution logs

3. **Package Security:**
   - Include security audits in CI
   - Keep dependencies updated
   - Use `npm audit` in workflows
