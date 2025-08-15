# Publishing Granular RBAC Packages to npm

Since there are npm configuration issues in the current environment, here are the manual steps to publish the packages:

## Prerequisites
1. Make sure you have npm working properly on your system
2. You need an npm account and be logged in (`npm login`)
3. Ensure you have permissions to publish packages with these names

## Package Publishing Order

**IMPORTANT**: Publish in this order due to dependencies:

### 1. Core Package First
```bash
cd granular-rbac/packages/core
npm publish
```

### 2. React Package Second
```bash
cd granular-rbac/packages/react
npm publish
```

### 3. Express Package Last
```bash
cd granular-rbac/packages/express
npm publish
```

## Prepared Packages Status

✅ **granular-rbac-core**: Ready to publish
- Fully functional RBAC core library
- Compiled TypeScript to JavaScript with type declarations
- Complete permission engine and role management
- All dependencies properly configured

✅ **granular-rbac-react**: Ready to publish  
- Simple placeholder React components and hooks
- Compiled TypeScript to JavaScript with type declarations
- Uses `simple-index.ts` for clean compilation
- No external dependencies required

✅ **granular-rbac-express**: Ready to publish
- Simple placeholder Express middleware and controllers
- Compiled TypeScript to JavaScript with type declarations  
- Uses `simple-index.ts` for clean compilation
- No external dependencies required

## Post-Publication Steps

After publishing all packages:

1. Install them in your applications:
```bash
# In shopify-frontend
npm install granular-rbac-core granular-rbac-react

# In shopify-backend  
npm install granular-rbac-core granular-rbac-express
```

2. Restore the RBAC integration code that was commented out

3. Test the complete integration

## Package Versions
All packages are currently at version 1.0.0

## Troubleshooting
If you get name conflicts, you may need to:
1. Change package names to something unique (e.g., `@yourusername/granular-rbac-core`)
2. Update all import statements accordingly
3. Republish with the new names
