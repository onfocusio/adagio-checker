# Adagio Checker

This project uses Webpack to bundle and minify the JavaScript code for the bookmarklet. Follow the steps below to generate the final `script.js` file:

## Steps to Build

1. **Install Dependencies**
   Make sure you have Node.js installed. Then, run the following command to install the required dependencies:
   ```bash
   npm install
   ```

2. **Build the Project**
   To bundle and minify the code into a single `script.js` file, run:
   ```bash
   npx webpack --mode production
   ```

   This will generate the final file in the `dist/` directory.

3. **Development Mode**
   If you want to build the project in development mode (without minification), use:
   ```bash
   npx webpack --mode development
   ```

4. **Output Location**
   The bundled file will be located at:
   ```
   dist/script.js
   ```

## Notes
- Ensure all source files are located in the `src/` directory.
- The entry point for Webpack is `src/main.js`.