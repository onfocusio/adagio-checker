import { chkr_titles, chkr_badges } from './enums.js';
import { appendHomeContainer, appendCheckerRow, appendAdUnitsRow, refreshChecker } from './app.js';
import { checkAdagioAPI } from './api.js';
import { checkPublisher, checkCurrentLocation, getPrebidVersion, computeAdUnitStatus } from './utils.js';

export let prebidWrappers = []; // Arrays of [wrapper, window] : window[wrapper]
export let prebidWrapper = undefined; // Current Prebid.js wrapper selected
export let prebidObject = undefined; // Current Prebid.js object selected
export let prebidVersionDetected = undefined; // Prebid.js version detected for the selected wrapper

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

export async function runChecks() {
	// Get bid requested events
	const bidRequestedEvents = prebidObject
		.getEvents()
		.filter((e) => e.eventType === 'bidRequested') // Filter for 'bidRequested' events
		.map((e) => e.args) // Extract the 'args' property
		.flat(); // Flatten the array of arguments

	// Get Adagio bids request events
	const adagioBids = bidRequestedEvents.filter((e) => e.bidderCode?.toLowerCase()?.includes('adagio')); // Filter for 'adagio' bidders

	// Get organizationIds and siteNames from Adagio bids
	const orgSitePairs = catchOrgIdsAndSiteNames(adagioBids);

	// Fill in the home container
	displayPrebidVersion();
	await checkPublisher(orgSitePairs);
	await checkCurrentLocation();

	// Run all checks
	await checkAdagioAPI(orgSitePairs);
	checkAdServer();
	checkAdagioModule();
	/* checkAdagioAdUnitParams(prebidObject.getEvents());
	checkRealTimeDataProvider(organizationIds, siteNames);
	checkDeviceAccess();
	checkAdagioUserSync();
	checkAdagioLocalStorage();
	checkAdagioAnalyticsModule();
	checkUserIds();
	checkDuplicatedAdUnitCode(
		prebidObject
			.getEvents()
			.filter((e) => e.eventType === 'bidRequested')
			.map((e) => e.args)
	);
	checkCurrencyModule();
	checkFloorPriceModule();
	checkDsaTransparency();*/
}

/*************************************************************************************************************************************************************************************************************************************
 * Functions
 ************************************************************************************************************************************************************************************************************************************/

export function setPrebidWrapper() {
	// Helper function to check and push valid wrappers, ensuring no duplicates
	const addWrappers = (windowObj, wrapperList) => {
		wrapperList.forEach((wrapper) => {
			const instance = windowObj[wrapper];
			// Only add the wrapper if it's valid and not already in prebidWrappers
			if (instance?.version && typeof instance.getEvents === 'function' && !prebidWrappers.some(([existingWrapper, existingWindow]) => existingWrapper === wrapper && existingWindow === windowObj)) {
				prebidWrappers.push([wrapper, windowObj]);
			}
		});
	};

	// Check top window for Prebid wrappers
	if (window._pbjsGlobals) addWrappers(window, window._pbjsGlobals);

	// Check iframes for Prebid wrappers
	Array.from(window.document.getElementsByTagName(`iframe`)).forEach((iframe) => {
		try {
			const iframeDoc = iframe.contentWindow;
			if (iframeDoc._pbjsGlobals) addWrappers(iframeDoc, iframeDoc._pbjsGlobals);
		} catch (e) {
			// Ignore iframe access errors (cross-origin or others)
		}
	});

	// Check ADAGIO versions for hidden wrappers, using addWrappers for consistency
	if (ADAGIO !== undefined && ADAGIO?.versions !== undefined) {
		addWrappers(
			window,
			Object.keys(ADAGIO.versions).filter((item) => item !== 'adagiojs')
		);
	}

	// Pre-select the wrapper based on adagio bidrequests, or name 'pbjs'
	if (prebidWrappers.length !== 0) {
		let maxAdagioBids,
			maxBids = 0;
		let maxAdagioBidsWrapper,
			maxBidsWrapper = null; // prebidWrappers[0];

		prebidWrappers.forEach(([wrapper, win]) => {
			const instance = win[wrapper];
			if (instance?.getEvents) {
				const bids = instance.getEvents()?.filter((event) => event.eventType === 'bidRequested') || [];
				const bidsCount = bids.length;
				const adagioBidsCount = bids.filter((bid) => bid.bidder?.toLowerCase().includes('adagio')).length;

				if (bidsCount >= maxBids) {
					maxBids = bidsCount;
					maxBidsWrapper = [wrapper, win];
				}
				if (adagioBidsCount >= maxAdagioBids) {
					maxAdagioBids = adagioBidsCount;
					maxAdagioBidsWrapper = [wrapper, win];
				}
			}
		});

		// Select the wrapper based on priority: most Adagio bids > most bids > first wrapper
		if (prebidWrapper === undefined && prebidObject === undefined) {
			prebidWrapper = maxAdagioBids > 0 ? maxAdagioBidsWrapper : maxBids > 0 ? maxBidsWrapper : prebidWrappers[0];
			prebidObject = prebidWrapper[1][prebidWrapper[0]];
			prebidVersionDetected = getPrebidVersion(prebidObject);
		}
	}
}

function checkAdServer() {
	// The adserver is a key component of the auction, knowing it help us in our troubleshooting
	// By default, we support only GAM, SAS and APN for the viewability.
	// TODO: It's not because an adserver is detected that it is attached to the Prebid.js auction... (must look into adagio.js code to find a solution)
	const adServers = new Map();
	adServers.set('Google Ad Manager', typeof window?.googletag?.pubads === 'function');
	adServers.set('Smart AdServer', typeof window?.sas?.events?.on === 'function');
	adServers.set('Appnexus', typeof window?.apntag?.onEvent === 'function');

	// Loop on the map to check if value != undefined
	let stringAdServer = '';
	for (let [key, value] of adServers) {
		if (value != false) {
			if (stringAdServer === '') stringAdServer += `<code>${key}</code>`;
			else stringAdServer += `, <code>${key}</code>`;
		}
	}

	// Define badge, title and message for the checker row
	const badge = stringAdServer === '' ? chkr_badges.check : chkr_badges.ok;
	const title = chkr_titles.adserver;
	const message = stringAdServer === '' ? `No supported adserver: the viewability measurement may not work` : `${stringAdServer}`;
	appendCheckerRow(badge, title, message);
}

export function catchOrgIdsAndSiteNames(adagioBids) {
	// Build unique couples of organizationId + site
	const pairs = new Map();

	if (Array.isArray(adagioBids)) {
		for (const bid of adagioBids.flatMap((e) => e.bids || [])) {
			const params = bid.params || {};
			const org = params.organizationId != null ? String(params.organizationId) : null;
			const site = params.site != null ? String(params.site) : null;

			if (org && site) {
				const key = `${org}::${site}`;
				if (!pairs.has(key)) pairs.set(key, { organizationId: org, site });
			}
		}
	}

	// Return example:
	/*
		[
			{
				"organizationId": "1566",
				"site": "finance-ua"
			},
			{
				"organizationId": "1161",
				"site": "finance-ua"
			}
		]
	*/

	return Array.from(pairs.values());
}

export function displayPrebidVersion() {
	const message = `Prebid.js wrapper: <code>${prebidWrapper[0]} (${prebidObject.version})</code>`;
	appendHomeContainer(message)
}

export function checkAdagioModule() {
	// Gets ADAGIO adapter object
	ADAGIO = window.ADAGIO;

	// Gets wrapper name integrity
	if (ADAGIO !== undefined) {
		const pbjsAdUnits = ADAGIO.pbjsAdUnits;
		let adagioJsVersion = ADAGIO.versions.adagiojs;

		// Define and set checker item status
		let adagioModuleStatus = chkr_badges.ok;
		// Define and set adagioJsLog
		let adagiojsLog = `• Adagiojs: <code>🟢 Version: ${JSON.stringify(adagioJsVersion)}</code><br>`;
		if (adagioJsVersion === undefined) {
			adagiojsLog = `• Adagiojs: <code>🔴 Failed: Script not loaded.</code><br>`;
			adagioModuleStatus = chkr_badges.check;
		}
		// Define and set wrapper integrity log
		let wrapperIntegrityLog = `• Wrapper integrity: <code>🟢 Successed</code>`;
		let brokenWrapperStringName = `${prebidWrapper[0]}AdUnits`;
		if (pbjsAdUnits === undefined || !Array.isArray(pbjsAdUnits) || (pbjsAdUnits.length === 0 && ADAGIO[`${prebidWrapper[0]}AdUnits`] !== undefined && prebidWrapper[0] !== 'pbjs')) {
			wrapperIntegrityLog = `• Wrapper integrity: <code>🔴 Failed: Viewability / Analytics won't work.</code>`;
			adagioModuleStatus = chkr_badges.check;
		} else if (ADAGIO[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs') {
			wrapperIntegrityLog = `• Wrapper integrity: <code>🟠 Fixed: Try to contact client for bad behavior.</code>`;
		}
		// Display the final log
		appendCheckerRow(adagioModuleStatus, chkr_titles.adapter, adagiojsLog + wrapperIntegrityLog);
	} else {
		appendCheckerRow(chkr_badges.ko, chkr_titles.adapter, `<code>window.ADAGIO</code>: <code>${window.ADAGIO}</code>`);
	}
}

export function checkAdagioAdUnitParams(prebidEvents) {
	// Gets bidrequest arguments
	const prebidBidsRequested = prebidEvents.filter((e) => e.eventType === 'bidRequested').map((e) => e.args);
	// Gets list of bidders out of bidrequested
	const prebidBidders = [...new Set(prebidBidsRequested.map((e) => e.bidderCode))].sort();
	// Gets flat list of bids
	const prebidBids = prebidBidsRequested.map((e) => e.bids).flat();
	// Gets the Adagio bids requested
	const prebidAdagioBidsRequested = prebidBids.filter((e) => e.bidder?.toLowerCase()?.includes('adagio'));

	// Find every adUnitsCode declared through bid requested
	const prebidAdUnitsCodes = new Set();
	const bidRequested = prebidBidsRequested.map((e) => e.bids);
	for (const bid of bidRequested) {
		for (const adUnit of bid) {
			prebidAdUnitsCodes.add(adUnit.adUnitCode);
		}
	}
	// Find adUnitsCodes found in Adagio bid requested
	const prebidAdagioAdUnitsCodes = [...new Set(prebidAdagioBidsRequested.map((e) => e.adUnitCode))];
	// Find adUnitsCode found in ADAGIO object (adCall received)
	let adagioAdUnitsCodes = [];
	let adagioPbjsAdUnitsCode = [];

	if (ADAGIO !== undefined) {
		adagioAdUnitsCodes = ADAGIO?.adUnits;
		if (adagioAdUnitsCodes === undefined) adagioAdUnitsCodes = [];
		adagioPbjsAdUnitsCode = ADAGIO?.pbjsAdUnits?.map((e) => e.code) || [];
	}

	const totalPrebidAdUnitsCodes = prebidAdUnitsCodes.size;
	const totalPrebidAdagioAdUnitsCode = prebidAdagioAdUnitsCodes.length;

	// Fill the Adunits table with all the requested bids
	const computedAdunitsStatus = appendAdUnitsRow(prebidBidders, prebidBids, prebidAdagioBidsRequested);

	// Compute the final adunits status (KO, CHECK, OK)
	const finalComputedAdunitsStatus = computeAdUnitStatus(computedAdunitsStatus);

	// Compute the adunits counting status (KO, CHECK, OK)
	let adagioAdunitsStatus = chkr_badges.ok;
	if (totalPrebidAdUnitsCodes === 0) adagioAdunitsStatus = chkr_badges.ko;
	else if (totalPrebidAdagioAdUnitsCode === 0) adagioAdunitsStatus = chkr_badges.ko;
	else if (totalPrebidAdUnitsCodes > totalPrebidAdagioAdUnitsCode) adagioAdunitsStatus = chkr_badges.check;

	// Count occurrences of each unique status in computedAdunitsStatus
	const statusCounts = computedAdunitsStatus.reduce((acc, status) => {
		acc[status] = (acc[status] || 0) + 1;
		return acc;
	}, {});

	// Build a summary string for status counts
	const statusSummary = Object.entries(statusCounts)
		.map(([status, count]) => `${status} (${count})`)
		.join(', ');

	// Compile the status and display the infos.
	const resultStatus = computeAdUnitStatus([finalComputedAdunitsStatus, adagioAdunitsStatus]);
	if (totalPrebidAdUnitsCodes === 0) {
		appendCheckerRow(chkr_badges.ko, chkr_titles.adunits, `<code>${totalPrebidAdUnitsCodes}</code> adUnits(s) found`);
	} else {
		let details = `
                • Adagio called for <code>${totalPrebidAdagioAdUnitsCode}</code> adUnit(s) out of <code>${totalPrebidAdUnitsCodes}</code> adUnits(s) found<br>
            `;
		if (totalPrebidAdagioAdUnitsCode > 0) {
			details += `• Params status: ${statusSummary}<br>`;
		}
		appendCheckerRow(resultStatus, chkr_titles.adunits, details);
	}
}

export function checkRealTimeDataProvider(organizationIds, siteNames) {
	// Since Prebid 9, the RTD module and Adagio provider are necessary for our visibility/repackaging optimization.
	// Ensure the module is built through ADAGIO
	if (ADAGIO !== undefined) {
		// First try to load installedModules
		const prebidInstalledModules = prebidObject.installedModules;
		if (prebidInstalledModules !== undefined && prebidInstalledModules.length !== 0) {
			// Get the modules from the installedModules array
			const hasRtdModule = prebidInstalledModules.includes('rtdModule');
			const hasAdagioRtdProvider = prebidInstalledModules.includes('adagioRtdProvider');
			let messageString = '';

			// Check if modules are present, build the checker message then displays it (leave the function is missing module).
			if (!hasRtdModule && !hasAdagioRtdProvider) messageString = `Missing rtd and adagioRtdProvider modules: <code>${prebidInstalledModules}</code>`;
			else if (!hasRtdModule) messageString = `Missing rtd module: <code>${prebidInstalledModules}</code>`;
			else if (!hasAdagioRtdProvider) messageString = `Missing adagioRtdProvider module: <code>${prebidInstalledModules}</code>`;

			if (messageString !== '') {
				appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, messageString);
				return;
			}
		}
		// If installedModules not usable, relies on ADAGIO
		else if (!ADAGIO.hasRtd) {
			appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `<code>ADAGIO.hasRtd</code>: <code>${ADAGIO.hasRtd}</code>`);
			return;
		}
	}
	// Ensure that the rtd module exists in the wrapper configuration
	const prebidRtdModule = prebidObject.getConfig('realTimeData');
	if (prebidRtdModule !== undefined) {
		// Validate RTD provider and configuration
		if (prebidRtdModule.dataProviders !== undefined) {
			// Look for Adagio in the list of dataProviders
			let adagioRtdProvider = prebidRtdModule.dataProviders.find((provider) => provider.name === 'adagio') || null;
			// If Adagio is find, check the parameters
			if (adagioRtdProvider !== null) {
				let paramsOrgId = adagioRtdProvider?.params?.organizationId;
				if (paramsOrgId !== undefined) paramsOrgId = paramsOrgId.toString();
				let paramsSite = adagioRtdProvider?.params?.site;
				// Check if params are well configured
				if (paramsOrgId === undefined) appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Missing 'organizationId' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
				else if (paramsSite === undefined) appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Missing 'site' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
				else if (!siteNames.includes(paramsSite) || !organizationIds.includes(paramsOrgId)) appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Parameters doesn't match with bids.params: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
				else appendCheckerRow(computeBadgeToDisplay(false, 9, null), chkr_titles.rtdmodule, `<code>${JSON.stringify(adagioRtdProvider)}</code>`);
			} else {
				appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `No Adagio RTD provider configured: <code>${JSON.stringify(prebidRtdModule.dataProviders)}</code>`);
			}
		} else {
			appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `No RTD providers configured: <code>${JSON.stringify(prebidRtdModule)}</code>`);
		}
	} else {
		appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `<code>${prebidWrapper[0]}.getConfig('realTimeData')</code>: <code>${prebidRtdModule}</code>`);
	}
}

export function checkDeviceAccess() {
	// Is local storage enabled?
	const deviceAccess = prebidObject.getConfig('deviceAccess');
	appendCheckerRow(computeBadgeToDisplay(deviceAccess ? false : true, 9, null), chkr_titles.deviceaccess, `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`);
}

export function checkAdagioUserSync() {
	// Adagio strongly recommends enabling user syncing through iFrames.
	// This functionality improves DSP user match rates and increases the bid rate and bid price.
	const prebidUserSync = prebidObject.getConfig('userSync');
	if (prebidUserSync === undefined) {
		appendCheckerRow(chkr_badges.ko, chkr_titles.usersync, `<code>${prebidWrapper[0]}.getConfig('userSync')</code>: <code>${prebidUserSync}</code>`);
	} else {
		const prebidUserSyncIframe = prebidUserSync?.filterSettings?.iframe;
		const prebidUserSyncAll = prebidUserSync?.filterSettings?.all;

		if (prebidUserSyncIframe !== undefined && (prebidUserSyncIframe?.bidders?.includes('*') || (Array.isArray(prebidUserSyncIframe?.bidders) && prebidUserSyncIframe?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) && prebidUserSyncIframe.filter === 'include') {
			appendCheckerRow(chkr_badges.ok, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSyncIframe)}</code>`);
		} else if (prebidUserSyncAll !== undefined && (prebidUserSyncAll?.bidders?.includes('*') || (Array.isArray(prebidUserSyncAll?.bidders) && prebidUserSyncAll?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) && prebidUserSyncAll.filter === 'include') {
			appendCheckerRow(chkr_badges.ok, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSyncAll)}</code>`);
		} else {
			appendCheckerRow(chkr_badges.ko, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSync)}</code>`);
		}
	}
}

export function checkAdagioLocalStorage() {
	// Is local storage enabled?
	const localStorage = prebidObject.bidderSettings;

	// Internal function to check if storageAllowed is correctly configured
	function isStorageAllowed(value) {
		if (typeof value === 'boolean') {
			return value === true;
		}
		if (Array.isArray(value)) {
			return value.includes('html5');
		}
		return false;
	}

	// Check the local storage configuration
	if (isStorageAllowed(localStorage.standard?.storageAllowed)) {
		appendCheckerRow(chkr_badges.ok, chkr_titles.localstorage, `<code>${prebidWrapper[0]}.bidderSettings.standard.storageAllowed</code>: <code>${JSON.stringify(localStorage.standard?.storageAllowed)}</code>`);
	} else if (isStorageAllowed(localStorage.adagio?.storageAllowed)) {
		appendCheckerRow(chkr_badges.ok, chkr_titles.localstorage, `<code>${prebidWrapper[0]}.bidderSettings.adagio.storageAllowed</code>: <code>${JSON.stringify(localStorage.adagio?.storageAllowed)}</code>`);
	} else if (prebidVersionDetected >= 9) {
		appendCheckerRow(chkr_badges.na, chkr_titles.localstorage, 'Localstorage not found. But not required anymore since Prebid 9.');
	} else {
		appendCheckerRow(chkr_badges.ko, chkr_titles.localstorage, `Localstorage not found: <code>${JSON.stringify(localStorage)}</code>`);
	}
}

export function checkAdagioAnalyticsModule() {
	// The wrapper object never references information related to the analytics, we can only rely on the ADAGIO objct information
	if (ADAGIO === undefined) {
		appendCheckerRow(chkr_badges.ko, chkr_titles.analytics, `<code>window.ADAGIO</code>: <code>${ADAGIO}</code>`);
		return;
	}

	// Prebid Analytics is ready to use since Prebid 8.14
	// And additional 'options' parameters are required since Prebid 9
	let hasEligibleVersion = prebidVersionDetected > 8.14;
	let hasPrebidNineVersion = prebidVersionDetected > 9;
	let hasEnabledAnalytics = ADAGIO.versions?.adagioAnalyticsAdapter;

	if (!hasEligibleVersion) appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>${prebidWrapper[0]}.version</code>: <code>${prebidVersionDetected}</code>`);
	else if (!hasEnabledAnalytics) appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>ADAGIO.versions.adagioAnalyticsAdapter</code>: <code>${hasEnabledAnalytics}</code>`);
	else if (!hasPrebidNineVersion) appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Prebid version: <code>${prebidVersionDetected}</code> / Analytics: <code>${hasEnabledAnalytics}</code>`);
	else {
		// Try to retrieve the 'options' from the analytics wrapper configuration
		let paramOrganizationId = ADAGIO?.options?.organizationId;
		let paramSitename = ADAGIO?.options?.site;

		// Options are necessary for Adagio to get the analytics even if the Adagio bidder adapter is not loaded
		if (!paramOrganizationId || !paramSitename) {
			appendCheckerRow(chkr_badges.check, chkr_titles.analytics, `Missing parameters: <code>${prebidWrapper[0]}.enableAnalytics.options</code> should contain 'organizationId' and 'site'`);
		} else {
			appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Options: <code>${ADAGIO?.options}</code>`);
		}
	}
}

export function checkUserIds() {
	// Check if Get User IDs function is enabled
	if (typeof prebidObject.getUserIdsAsEids !== 'function') {
		appendCheckerRow(chkr_badges.info, chkr_titles.userids, `<code>${prebidWrapper[0]}.getUserIdsAsEids()</code> is not a function`);
		return;
	}

	// Count the total installed user IDs
	const userIds = prebidObject.getUserIdsAsEids();
	const totalInstalledUserIds = userIds.length;
	const presentUserIds = userIds.filter((userId) => userId.uids.length > 0);

	if (presentUserIds.length > 0) {
		// Count the present user IDs
		const presentUserIdsCount = presentUserIds.length;

		// Get the names of present user IDs
		const presentUserIdsNames = presentUserIds.map((userId) => userId.source);

		// Calculate the percentage of present user IDs
		const percentagePresent = (presentUserIdsCount / totalInstalledUserIds) * 100;

		// Display the information
		appendCheckerRow(
			chkr_badges.ok,
			chkr_titles.userids,
			`
                • Installed / present: <code>${totalInstalledUserIds}/${presentUserIdsCount} (${percentagePresent.toFixed(2)}%)</code><br>
                • Found uids: <code>${presentUserIdsNames.join(', ')}</code>
            `
		);
	} else {
		// Indicate that no user IDs are present
		appendCheckerRow(chkr_badges.info, chkr_titles.userids, 'No User IDs present');
	}
}

export function checkDuplicatedAdUnitCode(prebidBidsRequested) {
	const duplicates = [];
	// Filter only Adagio bidRequested events
	const adgioBidsRequested = prebidBidsRequested.filter((e) => e.bidderCode?.toLowerCase()?.includes('adagio'));

	adgioBidsRequested.forEach((bidRequested) => {
		// Object to count occurrences of each adUnitCode + mediatype
		const seen = {};
		bidRequested.bids.forEach((bid) => {
			const code = bid.adUnitCode;
			// Get all mediatypes for this bid (e.g. banner, video, native)
			const types = Object.keys(bid.mediaTypes || {});
			types.forEach((type) => {
				const key = `${code}::${type}`;
				seen[key] = (seen[key] || 0) + 1;
			});
		});
		// Add to duplicates if the same code+mediatype appears more than once
		Object.entries(seen).forEach(([key, count]) => {
			if (count > 1) duplicates.push(key);
		});
	});

	if (duplicates.length) {
		// Format output: code (mediatype)
		const formatted = duplicates
			.map((str) => {
				const [code, type] = str.split('::');
				return `<code>${code}</code> (<code>${type}</code>)`;
			})
			.join(', ');
		appendCheckerRow(chkr_badges.ko, chkr_titles.duplicated, `Duplicated found: ${formatted}`);
	} else {
		appendCheckerRow(chkr_badges.ok, chkr_titles.duplicated, `No duplicated found.`);
	}
}

export function checkCurrencyModule() {
	// Currency module allow to bid regardless of the adServer currency. It's mandatory when the adServer currency isn't USD
	const prebidCurrency = prebidObject.getConfig('currency');
	if (prebidCurrency !== undefined) {
		appendCheckerRow(chkr_badges.ok, chkr_titles.currency, `<code>${JSON.stringify(prebidCurrency)}</code>`);
	} else {
		appendCheckerRow(chkr_badges.check, chkr_titles.currency, `<code>${prebidWrapper[0]}.getConfig('currency')</code>: <code>${prebidCurrency}</code>`);
	}
}

export function checkFloorPriceModule() {
	// Floor price module allow to share the lower price acceptable for an adUnit with the bidders
	const prebidFloorPrice = prebidObject.getConfig('floors');
	if (prebidFloorPrice !== undefined) {
		appendCheckerRow(chkr_badges.info, chkr_titles.floors, `<code>${JSON.stringify(prebidFloorPrice)}</code>`);
	} else {
		appendCheckerRow(chkr_badges.info, chkr_titles.floors, `<code>${prebidWrapper[0]}.getConfig('floors')</code>: <code>${prebidFloorPrice}</code>`);
	}
}

export function checkDsaTransparency() {
	const prebidOrtb2 = prebidObject.getConfig('ortb2');
	if (prebidOrtb2 !== undefined) {
		let dsa = prebidOrtb2?.regs?.ext?.dsa;
		let dsarequired = prebidOrtb2?.regs?.ext?.dsa?.dsarequired;
		let pubrender = prebidOrtb2?.regs?.ext?.dsa?.pubrender;
		let datatopub = prebidOrtb2?.regs?.ext?.dsa?.datatopub;
		let transparency = prebidOrtb2?.regs?.ext?.dsa?.transparency;

		if (dsa === undefined) appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
		else {
			if (dsarequired === undefined || pubrender === undefined || datatopub === undefined || transparency === undefined) appendCheckerRow(chkr_badges.ko, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
			else appendCheckerRow(chkr_badges.ok, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
		}
	} else {
		appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2')</code>: <code>${JSON.stringify(prebidOrtb2)}</code>`);
	}
}

/*************************************************************************************************************************************************************************************************************************************
 * Helper functions
 ************************************************************************************************************************************************************************************************************************************/

// Depending on the Prebid version, a misconfiguration is or is not an issue
function computeBadgeToDisplay(isError, minVersion, maxVersion) {
	// Handle 'null' values for minVersion and maxVersion
	const min = minVersion === null ? -Infinity : minVersion;
	const max = maxVersion === null ? Infinity : maxVersion;

	if (isError === 'warn') {
		if (prebidVersionDetected >= min && prebidVersionDetected <= max) {
			return chkr_badges.check;
		}
		return chkr_badges.info;
	} else if (isError) {
		if (prebidVersionDetected >= min && prebidVersionDetected <= max) {
			return chkr_badges.ko;
		}
		return chkr_badges.info;
	} else {
		return chkr_badges.ok;
	}
}

export function switchToSelectedPrebidWrapper(value) {
	prebidWrapper = prebidWrappers[value];
	prebidObject = prebidWrapper[1][prebidWrapper[0]];
	prebidVersionDetected = getPrebidVersion(prebidObject);
	refreshChecker();
}
