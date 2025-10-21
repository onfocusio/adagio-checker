import { buildApp, appendHomeContainer } from './app.js';
import { setPrebidWrapper, prebidObject, runChecks } from './checker.js';

export async function main() {
    // Get the Prebid wrappers
    setPrebidWrapper();

    // Build the iframe container and web-app interface
    buildApp();

    // If at least one Prebid wrapper found, run the checks
    if (prebidObject !== undefined) {
        await runChecks();
    } else {
        // No Prebid wrapper found, show alert
        appendHomeContainer(`No Prebid wrapper detected...`);
    }
}

// Run the app
main();