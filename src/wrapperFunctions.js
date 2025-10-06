import { chkr_wrp, chkr_vars } from './variables.js';
import { chkr_titles, chkr_badges, chkr_errors } from './enums.js'; 
import * as htmlFunctions from './htmlFunctions.js';
import * as utils from './utils.js';

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

export function getPrebidWrappers() {
    // Helper function to check and push valid wrappers, ensuring no duplicates
    const addWrappers = (windowObj, wrapperList) => {
        wrapperList.forEach((wrapper) => {
            const instance = windowObj[wrapper];
            // Only add the wrapper if it's valid and not already in prebidWrappers
            if (
                instance?.version &&
                typeof instance.getEvents === 'function' &&
                !chkr_wrp.prebidWrappers.some(([existingWrapper, existingWindow]) => existingWrapper === wrapper && existingWindow === windowObj)
            ) {
                chkr_wrp.prebidWrappers.push([wrapper, windowObj]);
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
    if (chkr_wrp.adagioAdapter !== undefined && chkr_wrp.adagioAdapter?.versions !== undefined) {
        addWrappers(
            window,
            Object.keys(chkr_wrp.adagioAdapter.versions).filter((item) => item !== 'adagiojs')
        );
    }

    // Pre-select the wrapper based on adagio bidrequests, or name 'pbjs'
    if (chkr_wrp.prebidWrappers.length !== 0) {
        let maxAdagioBids,
            maxBids = 0;
        let maxAdagioBidsWrapper,
            maxBidsWrapper = null; // prebidWrappers[0];

        chkr_wrp.prebidWrappers.forEach(([wrapper, win]) => {
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
        if (chkr_wrp.prebidWrapper === undefined && chkr_wrp.prebidObject === undefined) {
            chkr_wrp.prebidWrapper = maxAdagioBids > 0 ? maxAdagioBidsWrapper : maxBids > 0 ? maxBidsWrapper : chkr_wrp.prebidWrappers[0];
            chkr_wrp.prebidObject = chkr_wrp.prebidWrapper[1][chkr_wrp.prebidWrapper[0]];
        }
    }
}

export function catchBidRequestsGlobalParams() {
    // Catch orgIds detected in the Adagio prebid traffic (used by API and adUnits tab)
    if (chkr_wrp.prebidWrapper !== undefined) {
        // Gets lists of Prebid events
        chkr_vars.prebidEvents = chkr_wrp.prebidObject.getEvents();
        // Gets bidrequest arguments
        chkr_vars.prebidBidsRequested = chkr_vars.prebidEvents.filter((e) => e.eventType === 'bidRequested').map((e) => e.args);
        // Gets flat list of bids
        chkr_vars.prebidBids = chkr_vars.prebidBidsRequested.map((e) => e.bids).flat();
        // Gets the Adagio bids requested
        chkr_vars.prebidAdagioBidsRequested = chkr_vars.prebidBids.filter((e) => e.bidder?.toLowerCase()?.includes('adagio'));
        // Find the params for Adagio adUnits and update manager URL
        chkr_vars.prebidAdagioParams = chkr_vars.prebidAdagioBidsRequested.map((e) => e.params);
        if (chkr_vars.prebidAdagioParams.length !== 0) {
            // Clear the array before filling it (usefull after wrapper switch)
            chkr_vars.organizationIds = [];
            // Get all the orgId parameter value sent to fill organizationIds[]
            for (const param in chkr_vars.prebidAdagioParams) {
                // Accept both string and integer, but store as string
                let paramOrganizationId = chkr_vars.prebidAdagioParams[param]?.organizationId;
                if (paramOrganizationId !== undefined) paramOrganizationId = paramOrganizationId.toString();
                if (paramOrganizationId !== undefined && !chkr_vars.organizationIds.includes(paramOrganizationId)) chkr_vars.organizationIds.push(paramOrganizationId);
            }
            // Clear the array before filling it (usefull after wrapper switch)
            chkr_vars.siteNames = [];
            // Get all the siteName parameter value sent to fill siteNames[]
            for (const param in chkr_vars.prebidAdagioParams) {
                let paramSiteName = chkr_vars.prebidAdagioParams[param]?.site;
                if (paramSiteName !== undefined && !chkr_vars.siteNames.includes(paramSiteName)) chkr_vars.siteNames.push(paramSiteName);
            }
        }
    }
}

export function checkPrebidVersion() {
    // Catch the Prebid version number from the wrapper object.
    if (chkr_wrp.prebidWrapper === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.prebid, `<code>window._pbjsGlobals</code>: <code>undefined</code>`);
    } else {
        chkr_wrp.prebidVersionDetected = chkr_wrp.prebidObject.version.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
        htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.prebid, `<code>window._pbjsGlobals</code>: <code>${chkr_wrp.prebidWrapper[0]} (${chkr_wrp.prebidObject.version})</code>`);
    }
}

export function checkAdagioModule() {
    // Gets ADAGIO adapter object
    chkr_wrp.adagioAdapter = window.ADAGIO;

    // Gets wrapper name integrity
    if (chkr_wrp.adagioAdapter !== undefined) {
        const pbjsAdUnits = chkr_wrp.adagioAdapter.pbjsAdUnits;
        let adagioJsVersion = chkr_wrp.adagioAdapter.versions.adagiojs;

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
        let brokenWrapperStringName = `${chkr_wrp.prebidWrapper[0]}AdUnits`;
        if (pbjsAdUnits === undefined || !Array.isArray(pbjsAdUnits) || (pbjsAdUnits.length === 0 && chkr_wrp.adagioAdapter[`${chkr_wrp.prebidWrapper[0]}AdUnits`] !== undefined && chkr_wrp.prebidWrapper[0] !== 'pbjs')) {
            wrapperIntegrityLog = `• Wrapper integrity: <code>🔴 Failed: Viewability / Analytics won't work.</code>`;
            adagioModuleStatus = chkr_badges.check;
        } else if (chkr_wrp.adagioAdapter[brokenWrapperStringName] !== undefined && chkr_wrp.prebidWrapper[0] !== 'pbjs') {
            wrapperIntegrityLog = `• Wrapper integrity: <code>🟠 Fixed: Try to contact client for bad behavior.</code>`;
        }
        // Display the final log
        htmlFunctions.appendCheckerRow(adagioModuleStatus, chkr_titles.adapter, adagiojsLog + wrapperIntegrityLog);
    } else {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.adapter, `<code>window.ADAGIO</code>: <code>${window.ADAGIO}</code>`);
    }
}

export function checkAdagioAdUnitParams() {
    // Adunits requieres pbjs
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.adunits, chkr_errors.prebidnotfound);
    } else {
        // Gets bidrequest arguments
        chkr_vars.prebidBidsRequested = chkr_vars.prebidEvents.filter((e) => e.eventType === 'bidRequested').map((e) => e.args);
        // Gets list of bidders out of bidrequested
        chkr_vars.prebidBidders = [...new Set(chkr_vars.prebidBidsRequested.map((e) => e.bidderCode))].sort();
        // Gets flat list of bids
        chkr_vars.prebidBids = chkr_vars.prebidBidsRequested.map((e) => e.bids).flat();
        // Gets the Adagio bids requested
        chkr_vars.prebidAdagioBidsRequested = chkr_vars.prebidBids.filter((e) => e.bidder?.toLowerCase()?.includes('adagio'));

        // Find the params for Adagio adUnits
        chkr_vars.prebidAdagioParams = chkr_vars.prebidAdagioBidsRequested.map((e) => e.params);
        if (chkr_vars.prebidAdagioParams.length !== 0) {
            // Get all the orgId parameter value sent to fill organizationIds[]
            for (const param in chkr_vars.prebidAdagioParams) {
                let paramOrganizationId = chkr_vars.prebidAdagioParams[param]?.organizationId;
                if (!chkr_vars.organizationIds.includes(paramOrganizationId)) chkr_vars.organizationIds.push(paramOrganizationId);
            }
        }

        // Find every adUnitsCode declared through bid requested
        chkr_vars.prebidAdUnitsCodes = new Set();
        const bidRequested = chkr_vars.prebidBidsRequested.map((e) => e.bids);
        for (const bid of bidRequested) {
            for (const adUnit of bid) {
                chkr_vars.prebidAdUnitsCodes.add(adUnit.adUnitCode);
            }
        }
        // Find adUnitsCodes found in Adagio bid requested
        chkr_vars.prebidAdagioAdUnitsCodes = [...new Set(chkr_vars.prebidAdagioBidsRequested.map((e) => e.adUnitCode))];
        // Find adUnitsCode found in ADAGIO object (adCall received)
        let adagioAdUnitsCodes = [];
        chkr_vars.adagioPbjsAdUnitsCode = [];

        if (chkr_wrp.adagioAdapter !== undefined) {
            adagioAdUnitsCodes = chkr_wrp.adagioAdapter?.adUnits;
            if (adagioAdUnitsCodes === undefined) adagioAdUnitsCodes = [];
            chkr_vars.adagioPbjsAdUnitsCode = chkr_wrp.adagioAdapter?.pbjsAdUnits?.map((e) => e.code);
            if (chkr_vars.adagioPbjsAdUnitsCode === undefined) chkr_vars.adagioPbjsAdUnitsCode = [];
        }

        chkr_vars.totalPrebidAdUnitsCodes = chkr_vars.prebidAdUnitsCodes.size;
        chkr_vars.totalPrebidAdagioAdUnitsCode = chkr_vars.prebidAdagioAdUnitsCodes.length;

        // Fill the Adunits table with all the requested bids
        const computedAdunitsStatus = htmlFunctions.appendAdUnitsRow(chkr_vars.prebidBidders, chkr_vars.prebidBids);

        // Compute the final adunits status (KO, CHECK, OK)
        const finalComputedAdunitsStatus = utils.computeAdUnitStatus(computedAdunitsStatus);
        
        // Compute the adunits counting status (KO, CHECK, OK)
        let adagioAdunitsStatus = chkr_badges.ok;
        if (chkr_vars.totalPrebidAdUnitsCodes === 0) adagioAdunitsStatus = chkr_badges.ko;
        else if (chkr_vars.totalPrebidAdagioAdUnitsCode === 0) adagioAdunitsStatus = chkr_badges.ko;
        else if (chkr_vars.totalPrebidAdUnitsCodes > chkr_vars.totalPrebidAdagioAdUnitsCode) adagioAdunitsStatus = chkr_badges.check;

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
        const resultStatus = utils.computeAdUnitStatus([finalComputedAdunitsStatus, adagioAdunitsStatus]);
        if (chkr_vars.totalPrebidAdUnitsCodes === 0) {
            htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.adunits, `<code>${chkr_vars.totalPrebidAdUnitsCodes}</code> adUnits(s) found`);
        } else {
            let details = `
                • Adagio called for <code>${chkr_vars.totalPrebidAdagioAdUnitsCode}</code> adUnit(s) out of <code>${chkr_vars.totalPrebidAdUnitsCodes}</code> adUnits(s) found<br>
            `;
            if (chkr_vars.totalPrebidAdagioAdUnitsCode > 0) {
                details += `• Params status: ${statusSummary}<br>`;
            }
            htmlFunctions.appendCheckerRow(
                resultStatus,
                chkr_titles.adunits,
                details
            );
        }
    }
}

export function checkRealTimeDataProvider() {
    // Since Prebid 9, the RTD module and Adagio provider are necessary for our visibility/repackaging optimization.
    // It requires the module and the Adagio provider module to be installed and configured.
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.rtdmodule, chkr_errors.prebidnotfound);
        return;
    }
    // Ensure the module is built through ADAGIO
    if (chkr_wrp.adagioAdapter !== undefined) {
        // First try to load installedModules
        const prebidInstalledModules = chkr_wrp.prebidObject.installedModules;
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
                htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, messageString);
                return;
            }
        }
        // If installedModules not usable, relies on ADAGIO
        else if (!chkr_wrp.adagioAdapter.hasRtd) {
            htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `<code>ADAGIO.hasRtd</code>: <code>${chkr_wrp.adagioAdapter.hasRtd}</code>`);
            return;
        }
    }
    // Ensure that the rtd module exists in the wrapper configuration
    const prebidRtdModule = chkr_wrp.prebidObject.getConfig('realTimeData');
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
                if (paramsOrgId === undefined)
                    htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Missing 'organizationId' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
                else if (paramsSite === undefined)
                    htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Missing 'site' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
                else if (!chkr_vars.siteNames.includes(paramsSite) || !chkr_vars.organizationIds.includes(paramsOrgId))
                    htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `Parameters doesn't match with bids.params: <code>${JSON.stringify(adagioRtdProvider)}</code>`);
                else htmlFunctions.appendCheckerRow(computeBadgeToDisplay(false, 9, null), chkr_titles.rtdmodule, `<code>${JSON.stringify(adagioRtdProvider)}</code>`);
            } else {
                htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `No Adagio RTD provider configured: <code>${JSON.stringify(prebidRtdModule.dataProviders)}</code>`);
            }
        } else {
            htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `No RTD providers configured: <code>${JSON.stringify(prebidRtdModule)}</code>`);
        }
    } else {
        htmlFunctions.appendCheckerRow(computeBadgeToDisplay(true, 9, null), chkr_titles.rtdmodule, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('realTimeData')</code>: <code>${prebidRtdModule}</code>`);
    }
}

export function checkDeviceAccess() {
    // The device access is necessary for the TIDs since Prebid 9
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.deviceaccess, chkr_errors.prebidnotfound);
    } else {
        // Is local storage enabled?
        const deviceAccess = chkr_wrp.prebidObject.getConfig('deviceAccess');
        htmlFunctions.appendCheckerRow(
            computeBadgeToDisplay(deviceAccess ? false : true, 9, null),
            chkr_titles.deviceaccess,
            `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`
        );
    }
}

export function checkAdagioUserSync() {
    // Adagio strongly recommends enabling user syncing through iFrames.
    // This functionality improves DSP user match rates and increases the bid rate and bid price.
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.usersync, chkr_errors.prebidnotfound);
    } else {
        const prebidUserSync = chkr_wrp.prebidObject.getConfig('userSync');
        if (prebidUserSync === undefined) {
            htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.usersync, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('userSync')</code>: <code>${prebidUserSync}</code>`);
        } else {
            const prebidUserSyncIframe = prebidUserSync?.filterSettings?.iframe;
            const prebidUserSyncAll = prebidUserSync?.filterSettings?.all;

            if (
                prebidUserSyncIframe !== undefined &&
                (prebidUserSyncIframe?.bidders?.includes('*') ||
                    (Array.isArray(prebidUserSyncIframe?.bidders) && prebidUserSyncIframe?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) &&
                prebidUserSyncIframe.filter === 'include'
            ) {
                htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSyncIframe)}</code>`);
            } else if (
                prebidUserSyncAll !== undefined &&
                (prebidUserSyncAll?.bidders?.includes('*') || (Array.isArray(prebidUserSyncAll?.bidders) && prebidUserSyncAll?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) &&
                prebidUserSyncAll.filter === 'include'
            ) {
                htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSyncAll)}</code>`);
            } else {
                htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.usersync, `<code>${JSON.stringify(prebidUserSync)}</code>`);
            }
        }
    }
}

export function checkAdagioLocalStorage() {
    // Localstorage requieres pbjs
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.localstorage, chkr_errors.prebidnotfound);
    } else {
        // Is local storage enabled?
        const localStorage = chkr_wrp.prebidObject.bidderSettings;

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
            htmlFunctions.appendCheckerRow(
                chkr_badges.ok,
                chkr_titles.localstorage,
                `<code>${chkr_wrp.prebidWrapper[0]}.bidderSettings.standard.storageAllowed</code>: <code>${JSON.stringify(localStorage.standard?.storageAllowed)}</code>`
            );
        } else if (isStorageAllowed(localStorage.adagio?.storageAllowed)) {
            htmlFunctions.appendCheckerRow(
                chkr_badges.ok,
                chkr_titles.localstorage,
                `<code>${chkr_wrp.prebidWrapper[0]}.bidderSettings.adagio.storageAllowed</code>: <code>${JSON.stringify(localStorage.adagio?.storageAllowed)}</code>`
            );
        } else if (chkr_wrp.prebidVersionDetected >= 9) {
            htmlFunctions.appendCheckerRow(chkr_badges.na, chkr_titles.localstorage, 'Localstorage not found. But not required anymore since Prebid 9.');
        } else {
            htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.localstorage, `Localstorage not found: <code>${JSON.stringify(localStorage)}</code>`);
        }
    }
}

export function checkAdagioAnalyticsModule() {
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.analytics, chkr_errors.prebidnotfound);
        return;
    }
    // The wrapper object never references information related to the analytics, we can only rely on the ADAGIO objct information
    if (chkr_wrp.adagioAdapter === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.analytics, `<code>window.ADAGIO</code>: <code>${chkr_wrp.adagioAdapter}</code>`);
        return;
    }

    // Prebid Analytics is ready to use since Prebid 8.14
    // And additional 'options' parameters are required since Prebid 9
    let hasEligibleVersion = chkr_wrp.prebidVersionDetected > 8.14;
    let hasPrebidNineVersion = chkr_wrp.prebidVersionDetected > 9;
    let hasEnabledAnalytics = chkr_wrp.adagioAdapter.versions?.adagioAnalyticsAdapter;

    if (!hasEligibleVersion) htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>${chkr_wrp.prebidWrapper[0]}.version</code>: <code>${chkr_wrp.prebidVersionDetected}</code>`);
    else if (!hasEnabledAnalytics) htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>ADAGIO.versions.adagioAnalyticsAdapter</code>: <code>${hasEnabledAnalytics}</code>`);
    else if (!hasPrebidNineVersion) htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Prebid version: <code>${chkr_wrp.prebidVersionDetected}</code> / Analytics: <code>${hasEnabledAnalytics}</code>`);
    else {
        // Try to retrieve the 'options' from the analytics wrapper configuration
        let paramOrganizationId = chkr_wrp.adagioAdapter?.options?.organizationId;
        let paramSitename = chkr_wrp.adagioAdapter?.options?.site;

        // Options are necessary for Adagio to get the analytics even if the Adagio bidder adapter is not loaded
        if (!paramOrganizationId || !paramSitename) {
            htmlFunctions.appendCheckerRow(chkr_badges.check, chkr_titles.analytics, `Missing parameters: <code>${chkr_wrp.prebidWrapper[0]}.enableAnalytics.options</code> should contain 'organizationId' and 'site'`);
        } else {
            htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Options: <code>${chkr_wrp.adagioAdapter?.options}</code>`);
        }
    }
}

export function checkUserIds() {
    // Check if Prebid wrapper is present
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.userids, chkr_errors.prebidnotfound);
        return;
    }

    // Check if Get User IDs function is enabled
    if (typeof chkr_wrp.prebidObject.getUserIdsAsEids !== 'function') {
        htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.userids, `<code>${chkr_wrp.prebidWrapper[0]}.getUserIdsAsEids()</code> is not a function`);
        return;
    }

    // Count the total installed user IDs
    const userIds = chkr_wrp.prebidObject.getUserIdsAsEids();
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
        htmlFunctions.appendCheckerRow(
            chkr_badges.ok,
            chkr_titles.userids,
            `
                • Installed / present: <code>${totalInstalledUserIds}/${presentUserIdsCount} (${percentagePresent.toFixed(2)}%)</code><br>
                • Found uids: <code>${presentUserIdsNames.join(', ')}</code>
            `
        );
    } else {
        // Indicate that no user IDs are present
        htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.userids, 'No User IDs present');
    }
}

export function checkDuplicatedAdUnitCode() {
    // If Prebid.js is not found, display error
    if (!chkr_wrp.prebidObject) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.duplicated, chkr_errors.prebidnotfound);
        return;
    }

    const duplicates = [];
    // Filter only Adagio bidRequested events
    const adgioBidsRequested = chkr_vars.prebidBidsRequested.filter((e) => e.bidderCode?.toLowerCase()?.includes('adagio'));

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
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.duplicated, `Duplicated found: ${formatted}`);
    } else {
        htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.duplicated, `No duplicated found.`);
    }
}

export function checkCurrencyModule() {
    // Currency requiere Prebid as it is a Prebid module
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.currency, chkr_errors.prebidnotfound);
    }
    // Currency module allow to bid regardless of the adServer currency. It's mandatory when the adServer currency isn't USD
    else {
        const prebidCurrency = chkr_wrp.prebidObject.getConfig('currency');
        if (prebidCurrency !== undefined) {
            htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.currency, `<code>${JSON.stringify(prebidCurrency)}</code>`);
        } else {
            htmlFunctions.appendCheckerRow(chkr_badges.check, chkr_titles.currency, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('currency')</code>: <code>${prebidCurrency}</code>`);
        }
    }
}

export function checkFloorPriceModule() {
    // Floor price requiere Prebid as it is a Prebid module
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.floors, chkr_errors.prebidnotfound);
    }
    // Floor price module allow to share the lower price acceptable for an adUnit with the bidders
    else {
        const prebidFloorPrice = chkr_wrp.prebidObject.getConfig('floors');
        if (prebidFloorPrice !== undefined) {
            htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.floors, `<code>${JSON.stringify(prebidFloorPrice)}</code>`);
        } else {
            htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.floors, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('floors')</code>: <code>${prebidFloorPrice}</code>`);
        }
    }
}

export function checkDsaTransparency() {
    // Since Prebid 9, the pagetype and category Adagio parameters are to be stored in the first-party data (ortb2).
    if (chkr_wrp.prebidObject === undefined) {
        htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.dsa, chkr_errors.prebidnotfound);
    } else {
        const prebidOrtb2 = chkr_wrp.prebidObject.getConfig('ortb2');
        if (prebidOrtb2 !== undefined) {
            let dsa = prebidOrtb2?.regs?.ext?.dsa;
            let dsarequired = prebidOrtb2?.regs?.ext?.dsa?.dsarequired;
            let pubrender = prebidOrtb2?.regs?.ext?.dsa?.pubrender;
            let datatopub = prebidOrtb2?.regs?.ext?.dsa?.datatopub;
            let transparency = prebidOrtb2?.regs?.ext?.dsa?.transparency;

            if (dsa === undefined) htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
            else {
                if (dsarequired === undefined || pubrender === undefined || datatopub === undefined || transparency === undefined)
                    htmlFunctions.appendCheckerRow(chkr_badges.ko, chkr_titles.dsa, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
                else htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.dsa, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
            }
        } else {
            htmlFunctions.appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${chkr_wrp.prebidWrapper[0]}.getConfig('ortb2')</code>: <code>${JSON.stringify(prebidOrtb2)}</code>`);
        }
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
        if (chkr_wrp.prebidVersionDetected >= min && chkr_wrp.prebidVersionDetected <= max) {
            return chkr_badges.check;
        }
        return chkr_badges.info;
    } else if (isError) {
        if (chkr_wrp.prebidVersionDetected >= min && chkr_wrp.prebidVersionDetected <= max) {
            return chkr_badges.ko;
        }
        return chkr_badges.info;
    } else {
        return chkr_badges.ok;
    }
}
