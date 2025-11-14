// Legacy: src/main.js
// This copy saved to src/_legacy during cleanup.

import { buildApp, appendHomeContainer } from '../app.js';
import { setPrebidWrapper, prebidObject } from '../prebid/wrapper.js';
import { runChecks } from '../checker.js';
import { runAdagioApiQuery } from '../api/index.js';

export async function main() {
    setPrebidWrapper();
    buildApp();

    if (typeof ADAGIO_KEY === 'undefined') window.ADAGIO_KEY = '';
    const apiReadyCall = await runAdagioApiQuery('https://api.adagio.io/api/v1/profile');

    if (prebidObject === undefined) {
        appendHomeContainer(`Prebid.js: 🔴 No wrapper detected - Try to reload checker / page.`);
        return;
    } else if (apiReadyCall === null) {
        appendHomeContainer(`Adagio API: 🔴 Not reachable - Contact SE.`);
        return;
    }

    await runChecks();
}

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    main();
}
