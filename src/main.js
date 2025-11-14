import { buildApp, appendHomeContainer } from './app.js';
import { setPrebidWrapper, prebidObject } from './prebid/wrapper.js';
import { runChecks } from './checker.js';
import { runAdagioApiQuery } from './api/index.js';

/**
 * Module: main
 *
 * Application entrypoint that initializes the UI and Prebid wrapper and
 * orchestrates execution of the checks. Intended to run only in a browser
 * environment.
 *
 * @module main
 */

/**
 * Main entrypoint for the Adagio Checker app. Initializes the Prebid wrapper,
 * builds the overlay UI, verifies API connectivity and runs the checks.
 *
 * This function is intended to run in a browser environment.
 *
 * @returns {Promise<void>} Resolves when checks have completed or when an early-exit condition is met.
 */
export async function main() {
    // Get the Prebid wrappers
    setPrebidWrapper();

    // Build the iframe container and web-app interface
    buildApp();

    // Try to reach the Adagio API
    if (typeof ADAGIO_KEY === 'undefined') window.ADAGIO_KEY = '';
    const apiReadyCall = await runAdagioApiQuery('https://api.adagio.io/api/v1/profile');

    // A wrapper must be detected and the API must be reachable to run the checks
    if (prebidObject === undefined) {
        appendHomeContainer(`Prebid.js: 🔴 No wrapper detected - Try to reload checker / page.`);
        return;
    } else if (apiReadyCall === null) {
        appendHomeContainer(`Adagio API: 🔴 Not reachable - Contact SE.`);
        return;
    }

    // Tests past all conditions, run the checks
    await runChecks();
}

// Run the app (only when running in a browser environment)
if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    main();
}