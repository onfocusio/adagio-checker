import * as htmlFunctions from './htmlFunctions.js';
import * as wrapperFunctions from './wrapperFunctions.js';
import * as utils from './utils.js';
import { chkr_ovrl, chkr_wrp } from './variables.js';
import { chkr_tabs } from './enums.js';

export async function buildInterface() {
    // Build the interface
    htmlFunctions.createOverlay();
    wrapperFunctions.getPrebidWrappers();
    htmlFunctions.buildOverlayHtml();
    htmlFunctions.buildAdagioButton();
    htmlFunctions.createCheckerDiv();
    htmlFunctions.createAdUnitsDiv();
    htmlFunctions.makeIframeDraggable();

    // If at least one Prebid wrapper found, run the checks
    if (chkr_wrp.prebidWrappers.length > 0) {
        runChecks();
    } else {
        // Fill the alert with number of orgIds found
        const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
        const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);
        alertTextDiv.innerHTML += `<small>• No Prebid wrapper detected... </small><br>`;
    }
}

async function runChecks() {
    wrapperFunctions.catchBidRequestsGlobalParams();
    await utils.checkAdagioAPI();
    await utils.checkPublisher();
    await utils.checkCurrentLocation();
    utils.checkAdServer();
    wrapperFunctions.checkPrebidVersion();
    wrapperFunctions.checkAdagioModule();
    wrapperFunctions.checkAdagioAdUnitParams();
    wrapperFunctions.checkRealTimeDataProvider();
    wrapperFunctions.checkDeviceAccess();
    wrapperFunctions.checkAdagioUserSync();
    wrapperFunctions.checkAdagioLocalStorage();
    wrapperFunctions.checkAdagioAnalyticsModule();
    wrapperFunctions.checkUserIds();
    wrapperFunctions.checkDuplicatedAdUnitCode();
    wrapperFunctions.checkCurrencyModule();
    wrapperFunctions.checkFloorPriceModule();
    wrapperFunctions.checkDsaTransparency();
}

buildInterface();