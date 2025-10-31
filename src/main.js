import { buildApp, appendHomeContainer } from './app.js';
import { setPrebidWrapper, prebidObject, runChecks } from './checker.js';
import { runAdagioApiQuery } from './api.js';

export async function main() {
    // Get the Prebid wrappers
    setPrebidWrapper();

    // Build the iframe container and web-app interface
    buildApp();

    // Try to reach the Adagio API
    const apiReadyCall = await runAdagioApiQuery('https://api.adagio.io/api/v1/profile');

    // A wrapper must be detected and the API must be reachable to run the checks
    if (prebidObject === undefined) appendHomeContainer(`Prebid.js: 🔴 No wrapper detected - Try to reload checker / page.`);
    else if (apiReadyCall === null) appendHomeContainer(`Adagio API: 🔴 Not reachable - Contact SE.`);

    // Tests past all conditions, run the checks
    await runChecks();
}

// Run the app
main();