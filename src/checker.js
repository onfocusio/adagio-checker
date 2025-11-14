import { chkr_titles, chkr_badges } from './enums.js';
/**
 * Module: checker
 *
 * Orchestrator that runs the full suite of integration checks. This module
 * collects Prebid events, queries the Adagio API, displays wrapper integrity
 * information and executes the individual check modules under `src/checks/`.
 *
 * @module checker
 */
import { appendHomeContainer, appendCheckerRow } from './app.js';
import { fetchApiInventoryRecords } from './api/index.js';
import { fetchPublishersFromOrgIds, fetchCurrentLocationData as displayCurrentLocation } from './utils.js';
import { displayAdServer, displayAdagioJs } from './helpers/display.js';
import { prebidWrapper, prebidObject, prebidVersionDetected, getPrebidEvents, getBidRequested, getAdagioBidRequested } from './prebid/wrapper.js';
import { checkAdagioBidderAdapterModule } from './checks/adapter.js';
import { checkRealTimeDataModule, checkAdagioRealTimeDataProviderModule, checkRealTimeDataConfig } from './checks/rtd.js';
import { checkAdagioUserSync } from './checks/usersync.js';
import { checkAdagioLocalStorage } from './checks/localstorage.js';
import { checkAdCallsDuplication } from './checks/duplication.js';
import { checkUserIds } from './checks/userIds.js';
import { checkCurrencyModule, checkFloorPriceModule } from './checks/pricing.js';
import { checkAdagioAdUnitParams } from './checks/adUnitParams.js';

// Re-export for compatibility with existing imports (e.g. `main.js`)
// Previously re-exported prebid symbols; consumers should import from `src/prebid/wrapper.js` directly.

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

/**
 * Run the full suite of integration checks.
 *
 * This orchestrates collecting Prebid events, querying the Adagio API for
 * organization/site matches, displays wrapper integrity info and executes
 * individual checks (RTD, localStorage, user sync, duplication, pricing, etc.).
 *
 * @returns {Promise<void>} Resolves when all checks have completed.
 */
export async function runChecks() {
	// Get Prebid.js events, bidrequested and Adagio bids
	const prebidEvents = getPrebidEvents(prebidObject);
	const prebidBidRequested = getBidRequested(prebidEvents);
	const prebidAdagioBidRequested = getAdagioBidRequested(prebidBidRequested);

	// Get organizationIds and siteNames from Adagio bids
	const { orgSitePairs, uniqueOrgIds } = getOrgIdsAndSiteNames(prebidAdagioBidRequested);

	// Fetch API data based on organizationId and siteName pairs
	const apiRecordsItems = await fetchApiInventoryRecords(orgSitePairs); // TODO: Improve by adding 'search' in params and passing the domain name rather than site name to eventually catch sitename

	// Fill in the home container
	displayWrapperIntegrity();
	await fetchPublishersFromOrgIds(uniqueOrgIds);
	displayAdServer(prebidWrapper); // -- TODO: Adserver detection is not reliable enough yet (cannot target by wrapper)
	displayAdagioJs(prebidWrapper, prebidVersionDetected);
	await displayCurrentLocation();

	// Run all checks
	checkAdagioBidderAdapterModule();
	checkAdagioAdUnitParams(prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems);

	if (prebidVersionDetected >= 9) {
		// Since Prebid 9 the adagio.js loading is done via RTD
		checkRealTimeDataModule();
		checkAdagioRealTimeDataProviderModule();
		await checkRealTimeDataConfig(orgSitePairs);
	} else {
		checkAdagioLocalStorage();
	}

	checkDeviceAccess();
	checkAdagioUserSync();
	checkAdCallsDuplication(prebidEvents);

	checkUserIds();
	checkCurrencyModule();
	checkFloorPriceModule();

	// TODO: Add other checks later
	// checkAdagioAnalyticsModule(); -- TODO: Needs deeper investigation to provide meaningful information
	// checkDsaTransparency(); -- TODO: Do the check at the adunit level
}

/*************************************************************************************************************************************************************************************************************************************
 * Functions
 ************************************************************************************************************************************************************************************************************************************/

// Prebid wrapper logic extracted to `src/prebid/wrapper.js`.

// `displayAdServer` moved to `src/helpers/display.js`.

/**
 * Extract unique organizationId/site pairs from Adagio bid requests.
 *
 * @param {Array<Object>} prebidAdagioBidRequested Array of bid objects filtered for Adagio bidder.
 * @returns {{orgSitePairs:Array<{organizationId:string,site:string}>, uniqueOrgIds:Array<string>, uniqueSiteNames:Array<string>}}
 */
export function getOrgIdsAndSiteNames(prebidAdagioBidRequested) {
	// Build unique couples of organizationId + site
	const pairs = new Map();

	// Loop through Adagio bids to extract organizationId and site
	for (const bid of prebidAdagioBidRequested) {
		const params = bid.params || {};
        const org = params?.organizationId ? String(params.organizationId) : null;
        const site = params?.site ? String(params.site) : null;

		if (org && site) {
			const key = `${org}::${site}`;
			if (!pairs.has(key)) pairs.set(key, { organizationId: org, site });
		}
	}

	// Build the results arrays
	const orgSitePairs = Array.from(pairs.values()); // Pairs of {organizationId, site} detected
	const uniqueOrgIds = [...new Set(orgSitePairs.map((p) => p.organizationId))]; // List of unique organizationIds
	const uniqueSiteNames = [...new Set(orgSitePairs.map((p) => p.site))]; // List of unique site names

	return { orgSitePairs: orgSitePairs, uniqueOrgIds: uniqueOrgIds, uniqueSiteNames: uniqueSiteNames };
}

// Adapter check moved to `src/checks/adapter.js` (imported above)

// `displayAdagioJs` moved to `src/helpers/display.js`.

/**
 * Display wrapper integrity information in the home container.
 *
 * Detects whether the selected wrapper provides expected adUnit lists and
 * reports a warning if a wrapper is misconfigured or repaired.
 */
export function displayWrapperIntegrity() {
	if (typeof ADAGIO !== 'undefined' && ADAGIO.pbjsAdUnits) {
		// Get the Prebid.js adUnits as collected by the adapter
		const pbjsAdUnits = ADAGIO.pbjsAdUnits;
		// Define and set wrapper integrity log
		let brokenWrapperStringName = `${prebidWrapper[0]}AdUnits`;

		// Some user misconfigure their wrapper but manually renaming the pbjs variable in the code
		// instead of using the 'globalVarName' from the package.json configuration.
		// https://github.com/prebid/Prebid.js/blob/426ddcc027d74b54382df72162f297276994eabc/package.json#L48C4-L48C17
		if (pbjsAdUnits === undefined || !Array.isArray(pbjsAdUnits) || (pbjsAdUnits.length === 0 && ADAGIO[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs')) {
			appendHomeContainer(`Wrapper integrity: 🔴 Adagio won't work as expected - Contact SE for more info.`);
		} else if (ADAGIO[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs') {
			appendHomeContainer(`Wrapper integrity: 🟠 Repaired - Contact SE for more info.`);
		}
	}
}

// `checkAdagioAdUnitParams` moved to `src/checks/adUnitParams.js`.

// RTD checks moved to `src/checks/rtd.js` and are imported at the top of this file.

/**
 * Check device access configuration from the Prebid object and report status.
 *
 * This reads `prebidObject.getConfig('deviceAccess')` and appends a checker row
 * describing whether device access is enabled, disabled or undefined.
 */
export function checkDeviceAccess() {
	// Localstorage is required since Prebid 9 for adagio.js to work properly.
	// deviceAccess can be true, false or undefined — evaluate using strict equality
	const rawDeviceAccess = prebidObject.getConfig('deviceAccess');
	const deviceAccess = rawDeviceAccess === true ? true : rawDeviceAccess === false ? false : undefined;

	if (deviceAccess === true) appendCheckerRow(chkr_badges.ok, chkr_titles.deviceaccess, `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
	else if (deviceAccess === false || deviceAccess === undefined) appendCheckerRow(chkr_badges.ko, chkr_titles.deviceaccess, `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
	else appendCheckerRow(chkr_badges.ko, chkr_titles.deviceaccess, `Contact SE - <code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
}

// checkAdagioUserSync moved to `src/checks/usersync.js`.

// checkAdagioLocalStorage moved to `src/checks/localstorage.js`.

// `checkAdagioAnalyticsModule` moved to `src/checks/analytics.js`.

// `checkUserIds` moved to `src/checks/userIds.js`.

// checkAdCallsDuplication moved to `src/checks/duplication.js`.

// `checkCurrencyModule` and `checkFloorPriceModule` moved to `src/checks/pricing.js`.

// `checkDsaTransparency` moved to `src/checks/dsa.js`.

/*************************************************************************************************************************************************************************************************************************************
 * Helper functions
 ************************************************************************************************************************************************************************************************************************************/

// Depending on the Prebid version, a misconfiguration is or is not an issue
// `computeBadgeToDisplay` moved to `src/utils.js`.

// Prebid event helpers moved to `src/prebid/wrapper.js`.
