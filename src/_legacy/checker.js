// Legacy: src/checker.js
// This copy saved to src/_legacy during cleanup.

import { chkr_titles, chkr_badges } from './enums.js';
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

export async function runChecks() {
	const prebidEvents = getPrebidEvents(prebidObject);
	const prebidBidRequested = getBidRequested(prebidEvents);
	const prebidAdagioBidRequested = getAdagioBidRequested(prebidBidRequested);

	const { orgSitePairs, uniqueOrgIds } = getOrgIdsAndSiteNames(prebidAdagioBidRequested);

	const apiRecordsItems = await fetchApiInventoryRecords(orgSitePairs);

	displayWrapperIntegrity();
	await fetchPublishersFromOrgIds(uniqueOrgIds);
	displayAdServer(prebidWrapper);
	displayAdagioJs(prebidWrapper, prebidVersionDetected);
	await displayCurrentLocation();

	checkAdagioBidderAdapterModule();
	checkAdagioAdUnitParams(prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems);

	if (prebidVersionDetected >= 9) {
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
}

export function getOrgIdsAndSiteNames(prebidAdagioBidRequested) {
	const pairs = new Map();
	for (const bid of prebidAdagioBidRequested) {
		const params = bid.params || {};
		const org = params?.organizationId ? String(params.organizationId) : null;
		const site = params?.site ? String(params.site) : null;
		if (org && site) {
			const key = `${org}::${site}`;
			if (!pairs.has(key)) pairs.set(key, { organizationId: org, site });
		}
	}
	const orgSitePairs = Array.from(pairs.values());
	const uniqueOrgIds = [...new Set(orgSitePairs.map((p) => p.organizationId))];
	const uniqueSiteNames = [...new Set(orgSitePairs.map((p) => p.site))];
	return { orgSitePairs: orgSitePairs, uniqueOrgIds: uniqueOrgIds, uniqueSiteNames: uniqueSiteNames };
}

export function displayWrapperIntegrity() {
	if (typeof ADAGIO !== 'undefined' && ADAGIO.pbjsAdUnits) {
		const pbjsAdUnits = ADAGIO.pbjsAdUnits;
		let brokenWrapperStringName = `${prebidWrapper[0]}AdUnits`;
		if (pbjsAdUnits === undefined || !Array.isArray(pbjsAdUnits) || (pbjsAdUnits.length === 0 && ADAGIO[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs')) {
			appendHomeContainer(`Wrapper integrity: 🔴 Adagio won't work as expected - Contact SE for more info.`);
		} else if (ADAGIO[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs') {
			appendHomeContainer(`Wrapper integrity: 🟠 Repaired - Contact SE for more info.`);
		}
	}
}

export function checkDeviceAccess() {
	const rawDeviceAccess = prebidObject.getConfig('deviceAccess');
	const deviceAccess = rawDeviceAccess === true ? true : rawDeviceAccess === false ? false : undefined;

	if (deviceAccess === true) appendCheckerRow(chkr_badges.ok, chkr_titles.deviceaccess, `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
	else if (deviceAccess === false || deviceAccess === undefined) appendCheckerRow(chkr_badges.ko, chkr_titles.deviceaccess, `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
	else appendCheckerRow(chkr_badges.ko, chkr_titles.deviceaccess, `Contact SE - <code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
}
