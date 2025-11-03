# Adagio Checker

[![npm version](https://img.shields.io/npm/v/adagio-checker?label=npm)][npm]
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

> A small bookmarklet / script to help debug Adagio and Prebid.js client integrations.

This repository produces a distributable bundle at `dist/script.js` that can be used as a bookmarklet or included directly via CDN.

## Table of Contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Development](#development)
- [Build (production)](#build-production)
- [Publishing to npm](#publishing-to-npm)
- [CDN (jsDelivr)](#cdn-jsdelivr)
- [Release checklist](#release-checklist)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Quick start

Clone the repo and install dependencies:

```powershell
git clone https://github.com/onfocusio/adagio-checker.git
cd adagio-checker
npm install
```

## Prerequisites

- Node.js (v14+ recommended)
- npm (the project's scripts use webpack)

## Development

Edit source files in `src/` (entry: `src/main.js`). For iterative development, build a dev bundle with source maps:

```powershell
npm run dev
```

To test locally, serve the repository root as a static site and open a test page that includes `dist/script.js` (or load it directly in the browser):

```powershell
npx http-server ./ -p 8080
# then open a test page or directly inspect http://localhost:8080/dist/script.js
```

## Build (production)

Create an optimized production build:

```powershell
npm run build
```

The build output used for publishing and CDN distribution is `dist/script.js`.

Note: `prepublishOnly` in `package.json` runs `npm run build` automatically before publishing. Still, run and verify the build locally before publishing.

## Publishing to npm

Ensure you have publish permissions for the package name and are logged in to npm.

1. Verify login:

```powershell
npm whoami
```

2. (Recommended) Preview what will be published:

```powershell
npm publish --dry-run
```

3. Bump the package version (recommended — this creates a commit and git tag):

```powershell
# bug fix
npm version patch
# new feature
npm version minor
# breaking change
npm version major
```

4. Push commits and tags:

```powershell
git push origin main
git push --tags
```

5. Publish:

```powershell
npm publish
# If the package is scoped and should be public:
# npm publish --access public
```

If `npm publish` returns a 403 mentioning an existing version, bump the version (see step 3) — npm will not allow publishing over an existing version.

[npm]: https://www.npmjs.com/package/adagio-checker

## CDN (jsDelivr)

After publishing to npm, the package becomes available via jsDelivr. Example URLs:

- Latest: `https://cdn.jsdelivr.net/npm/adagio-checker/dist/script.js`
- Versioned: `https://cdn.jsdelivr.net/npm/adagio-checker@1.2.3/dist/script.js`
