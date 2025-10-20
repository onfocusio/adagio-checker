import { buildInterface } from './interface.js';
import { runChecks } from './checker.js';
import { chkr_ovrl, chkr_wrp } from './variables.js';
import { chkr_tabs } from './enums.js';

export async function runApp() {
    // Build the iframe container and web-app interface
    buildInterface();

    // If at least one Prebid wrapper found, run the checks
    if (chkr_wrp.prebidWrappers.length > 0) {
        await runChecks();
    } else {
        // Fill the alert with number of orgIds found
        const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
        const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);
        alertTextDiv.innerHTML += `<small>• No Prebid wrapper detected... </small><br>`;
    }
}

// Run the app
runApp();