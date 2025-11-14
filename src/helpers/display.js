import { appendHomeContainer } from '../app.js';

/**
 * Module: helpers/display
 *
 * Small display helpers that append information to the home container.
 * These functions are UI-adjacent but intentionally lightweight so they can
 * be called from the orchestration layer without pulling the full UI code.
 *
 * @module helpers/display
 */

/**
 * Inspect ADAGIO.windows entries to extract and append detected adservers.
 *
 * @returns {void}
 */
export function displayAdServer() {
    // Rely on ADAGIO.windows if available
    if (typeof ADAGIO !== 'undefined') {
        const adagioWindows = ADAGIO.windows;
        if (adagioWindows) {
            const entries = Array.isArray(adagioWindows) ? adagioWindows : Object.values(adagioWindows);
            const unique = new Set();
            entries.forEach((winItem) => {
                const srv = winItem?.adserver;
                if (srv) unique.add(String(srv).toLowerCase());
            });
            if (unique.size) {
                let stringAdServer = Array.from(unique)
                    .map((s) => `<code>${s}</code>`)
                    .join(', ');
                appendHomeContainer(`Adserver: ${stringAdServer}`);
            }
        }
    }
}

/**
 * Report if Adagio.js is present (based on `ADAGIO.versions.adagiojs`) or
 * provide guidance depending on Prebid version.
 *
 * @param {number} prebidVersionDetected Detected Prebid numeric version.
 * @returns {void}
 */
export function displayAdagioJs(prebidVersionDetected) {
    let message = '';
    // If ADAGIO.versions.adagiojs is defined, Adagio.js is loaded
    if (typeof ADAGIO !== 'undefined' && ADAGIO.versions && ADAGIO.versions.adagiojs) message = `Adagio.js: 🟢 <code>v${ADAGIO.versions.adagiojs}</code>`;
    else if (prebidVersionDetected >= 9) message = `Adagio.js: 🔴 <code>Not loaded - Ensure RTD is setup.</code>`;
    else message = `Adagio.js: 🔴 <code>Not loaded - Ensure localstorage is enabled.</code>`;
    appendHomeContainer(message);
}
