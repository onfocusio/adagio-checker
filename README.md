# Adagio Checker

A simple bookmarklet tool for debugging and analyzing Adagio client-side integrations on websites. 
This tool helps to validate the Prebid.js and Adagio adapter configurations.

### Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/onfocusio/adagio-checker.git
   cd adagio-checker
   npm install
   ```

2. **Build for Production**
   ```bash
   npm run build
   ## Adagio Checker

   This repository builds a small bookmarklet / script that helps debug Adagio and Prebid.js integrations. Below are concise, actionable steps to update source code, build the distributable, and publish a new npm release.

   ## Quick overview
   - Source: `src/`
   - Output bundle: `dist/script.js` (this is what gets published and used by the bookmarklet/CDN)
   - Build tooling: Webpack (see `webpack.config.js`)
   - Key npm scripts (from `package.json`):
     - `npm run build` — production build (webpack --mode production)
     - `npm run dev` — development build (webpack --mode development)

   ---

   ## 1) Edit the code (local development)

   1. Open the files in `src/` and make your changes. Typical entry files:
      - `src/main.js` (entry)
      - helper modules in `src/` (utils, enums, checker logic)

   2. Install dependencies (first time):

   ```powershell
   npm install
   ```

   3. Build a development bundle with source maps for fast iteration:

   ```powershell
   npm run dev
   ```

   4. Test the built script in a browser:
   - Serve the project (simple static server) and open a page that includes the built file. Example using `npx http-server`:

   ```powershell
   npx http-server ./ -p 8080
   # then open http://localhost:8080/dist/script.js or include it from a test page
   ```

   Alternatively, you can directly load `dist/script.js` into any page (via console or by creating a test HTML file) to validate behavior.

   ---

   ## 2) Create a production build

   When you're ready to publish, create an optimized production bundle:

   ```powershell
   npm run build
   ```

   This produces the optimized file at `dist/script.js` which is included in the published package.

   Note: `prepublishOnly` in `package.json` will run `npm run build` automatically when publishing, but it's good practice to run and verify the build locally first.

   ---

   ## 3) Publishing to npm

   Make sure you are logged in to npm and have publishing rights for `onfocusio/adagio-checker` (or the configured package scope).

   ```powershell
   npm publish
   # if the package is scoped and needs public access explicitly:
   # npm publish --access public
   ```

   ---

   ## 4) CDN availability (jsDelivr)

   Once the package is published to npm, jsDelivr will typically reflect the new version automatically. Example URLs:

   - Latest: `https://cdn.jsdelivr.net/npm/adagio-checker/dist/script.js`
   - Specific version: `https://cdn.jsdelivr.net/npm/adagio-checker@1.2.3/dist/script.js`

   Note: CDN caches can take a short time to update. Use the versioned URL to ensure deterministic loading.
