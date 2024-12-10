/* FUNCTIONS */

/**
 * This function searches for all Prebid.js wrapper instances in the current page, including those within iframes and hidden ones often caused by misconfigurations.
 * It checks the global `_pbjsGlobals` variable for Prebid wrappers and verifies that they contain a `version` property and a `getEvents` method, indicating valid Prebid wrapper instances.
 * Additionally, it checks the ADAGIO configuration to catch any Prebid wrappers that might be misconfigured or hidden.
 *
 * @param {Window} _window - The window object of the top-level browsing context (i.e., the main window).
 * @param {Object} [_ADAGIO] - The ADAGIO object containing versions and other configuration data.
 * 
 * @returns {Array} - An array of tuples, where each tuple contains:
 *                    - The wrapper name (as a string).
 *                    - The window object associated with the wrapper.
 *                    Example: [['prebidWrapper1', window], ['prebidWrapper2', iframeDoc]]
 * 
 * @note This function accounts for cross-origin restrictions when accessing iframe content and will silently ignore iframe access errors.
 */
function getPrebidWrappers(_window, _ADAGIO) {
    const prebidWrappers = [];
    
    // Helper function to check and push valid wrappers, ensuring no duplicates
    const addWrappers = (windowObj, wrapperList) => {
        wrapperList.forEach(wrapper => {
            const instance = windowObj[wrapper];
            // Only add the wrapper if it's valid and not already in prebidWrappers
            if (instance?.version && typeof instance.getEvents === 'function' &&
                !prebidWrappers.some(([existingWrapper, existingWindow]) =>
                    existingWrapper === wrapper && existingWindow === windowObj
                )) {
                prebidWrappers.push([wrapper, windowObj]);
            }
        });
    };

    // Check top window for Prebid wrappers
    if (_window._pbjsGlobals) addWrappers(_window, _window._pbjsGlobals);

    // Check iframes for Prebid wrappers
    Array.from(_window.document.getElementsByTagName(`iframe`)).forEach(iframe => {
        try {
            const iframeDoc = iframe.contentWindow;
            if (iframeDoc._pbjsGlobals) addWrappers(iframeDoc, iframeDoc._pbjsGlobals);
        } catch (e) {
            // Ignore iframe access errors (cross-origin or others)
        }
    });

    // Check ADAGIO versions for hidden wrappers, using addWrappers for consistency
    if (_ADAGIO !== undefined && _ADAGIO?.versions !== undefined) {
        addWrappers(window, Object.keys(_ADAGIO.versions).filter(item => item !== 'adagiojs'));
    }

    return prebidWrappers;
}

/**
 * Fetches the Adagio sellers.json file and extracts account information.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of account objects,
 * each containing the seller_id, name, domain, and seller_type. Returns an empty array in case of an error.
 */
export async function getAccountsListFromSellersJson() {
    const adagioSellersJsonUrl = "https://adagio.io/sellers.json";

    try {
        const response = await fetch(adagioSellersJsonUrl);
        if (!response.ok) throw new Error(`Failed to fetch sellers.json: ${response.statusText}`);
        const { sellers } = await response.json();
        return sellers.map(({ seller_id, name, domain, seller_type }) => ({ seller_id, name, domain, seller_type}));
    } catch (error) {
        console.error("Error fetching or parsing sellers.json:", error);
        return [];
    }
}

/**
 * Fetches all website data for a given organization ID from the Adagio API with pagination.
 *
 * @param {string} organizationId - The unique identifier of the organization (publisher).
 * @returns {Promise<Object[]>} - Returns an array of all records fetched from the API.
 */
export async function runAdagioApi(organizationId) {
    // const ADAGIO_KEY = ''; // REMOVE BEFORE PUBLISHING
    const baseUrl = `https://api.adagio.io/api/v1/groups/1/websites?filter=publisher_id||$eq||${encodeURIComponent(organizationId)}&per_page=500`;
    let currentPage = 1, allRecords = [];

    try {
        while (true) {
            const response = await fetch(`${baseUrl}&page=${currentPage}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${ADAGIO_KEY}` },
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const { records = [], maxPage } = await response.json();
            console.log(records);
            allRecords.push(...records);
            if (currentPage++ >= maxPage) break;
        }
    } catch (error) {
        console.error("Error fetching Adagio API:", error);
    }

    return allRecords;
}

/**
 * Retrieves the site name for a given organization ID from the API response, based on the current window's hostname 
 * and a predefined list of site names.
 * 
 * @param {Object} orgIdApiDataResponse - The API response containing organization data.
 * @param {Object} _window - The global window object to access the current hostname.
 * @returns {Object} An object containing:
 *  - `status`: 'OK' if a unique matching record is found, otherwise 'KO'.
 *  - `siteName`: The name of the matching site, or `null` if no unique match exists.
 *  - `details`: A message explaining the status or why a match could not be made.
 */
function getSiteNameForOrganizationIdFromApi(orgIdApiDataResponse, _window) {
    const records = orgIdApiDataResponse?.records;
    if (!records) {
        return { status: 'KO', siteName: null, details: 'No records available in the API response.' };
    }

    const hostname = _window.location.hostname.replace("www.", "");
    const successRecords = records.filter(
        record => record.domain.includes(hostname) && siteNames.includes(record.name)
    );

    if (successRecords.length === 1) {
        return { status: 'OK', siteName: successRecords[0].name, details: 'Record successfully matched.' };
    }
    return {
        status: 'KO',
        siteName: null,
        details: successRecords.length > 1 
            ? 'Multiple records matched, expected a unique match.' 
            : 'No matching records found.'
    };
}

/**
 * This function retrieves the ADAGIO adapter object from the provided window context.
 * It returns the global `ADAGIO` object, which contains configuration and version data related to the ADAGIO bidder.
 *
 * @param {Window} _window - The window object from which to retrieve the ADAGIO adapter.
 * 
 * @returns {Object} - The ADAGIO adapter object, or undefined if it is not present in the provided window context.
 */
function getAdagioAdapter(_window) {
    return _window.ADAGIO;
}

/**
 * This function retrieves the `__tcfapi` object, which is used for interacting with the
 * Transparency and Consent Framework (TCF) API. The TCF API provides access to the consent
 * information for GDPR compliance, typically used by advertisers and ad tech providers.
 *
 * @param {Window} _window - The window object from which to retrieve the `__tcfapi` object.
 * 
 * @returns {Function|undefined} - The `__tcfapi` function, or undefined if it is not present in the provided window context.
 */
function getTcfApi(_window) {
    return _window.__tcfapi;
}

/**
 * Get a list of supported ad servers on the given window object.
 * This function checks for the presence of specific ad server SDKs and returns the names of the ones found.
 *
 * @param {Object} _window - The window object to check for ad server SDKs.
 * @returns {Array} - A list of supported ad server names.
 */
function getSupportedAdServers(_window) {
    // Define an array of ad servers and corresponding checks.
    // Each object has a 'name' (ad server name) and a 'check' (function to verify if the ad server is present).
    const adServerChecks = [
        { name: `Google Ad Manager`, check: () => typeof _window?.googletag?.pubads === 'function' },
        { name: `Smart AdServer`, check: () => typeof _window?.sas?.events?.on === 'function' },
        { name: `Appnexus`, check: () => typeof _window?.apntag?.onEvent === 'function' }
    ];

    // Filter the ad servers based on their checks and return an array of names of supported ad servers.
    // - filter() checks if the ad server is supported (i.e., the check function returns true).
    // - map() extracts the 'name' property of each supported ad server.
    return adServerChecks.filter(server => server.check()).map(server => server.name);
}

/**
 * Extracts and formats the Prebid version from the provided _pbjs object.
 * The version is cleaned by removing the `v`, any build information, 
 * and truncating it to major and minor versions.
 * 
 * @param {Object} _pbjs - The Prebid object from which the version will be extracted.
 * @returns {string} The formatted Prebid version (major.minor).
 */
function getPrebidVersion(_pbjs) {
    return _pbjs?.version?.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
}

/**
 * Checks if the Adagio JS library is loaded by verifying its presence in the ADAGIO object.
 * 
 * @param {object} _ADAGIO - The ADAGIO object containing version details.
 * @returns {boolean} `true` if the Adagio JS library is loaded, `false` otherwise.
 */
function hasAdagioJsLoaded(_ADAGIO) {
    return Boolean(_ADAGIO && _ADAGIO?.versions?.adagiojs);
}

/**
 * Checks if the wrapper maintains its integrity by ensuring Adagio's Prebid configuration remains accessible.
 *
 * @param {string} wrapperName - The name of the wrapper (global variable alias for Prebid.js).
 * @param {object} _ADAGIO - The ADAGIO object containing configuration data.
 * @returns {boolean} `true` if the wrapper's integrity is intact, `false` otherwise.
 */
function hasWrapperIntegrity(wrapperName, _ADAGIO) {
    // TODO
}

/**
 * Checks if the Adagio bidder adapter is installed.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkAdagioBidAdapter(_pbjs) {
    const hasAdapter = _pbjs.installedModules.includes('adagioBidAdapter');
    const modulesEmpty = !_pbjs.installedModules.length;
    const config = `installedModules.includes('adagioBidAdapter')`

    if (hasAdapter) return { config, status: 'OK', details: '' };
    return {
        config,
        status: modulesEmpty ? 'UNKNWN' : 'KO',
        details: modulesEmpty ? 'installedModules[] is empty (often due to wrappers like hubjs).' : ''
    };
}

/**
 * Checks if the Real-Time Data (rtdModule) is installed.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkRealTimeDataModule(_pbjs) {
    const hasAdapter = _pbjs.installedModules.includes('rtdModule');
    const modulesEmpty = !_pbjs.installedModules.length;
    const config = `installedModules.includes('rtdModule')`

    if (hasAdapter) return { config, status: 'OK', details: '' };
    return {
        config,
        status: modulesEmpty ? 'UNKNWN' : 'KO',
        details: modulesEmpty ? 'installedModules[] is empty (often due to wrappers like hubjs).' : ''
    };
}

/**
 * Checks if the Adagio RTD Provider (adagioRtdProvider) is installed.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkAdagioRtdProviderModule(_pbjs) {
    const hasAdapter = _pbjs.installedModules.includes('adagioRtdProvider');
    const modulesEmpty = !_pbjs.installedModules.length;
    const config = `installedModules.includes('adagioRtdProvider')`

    if (hasAdapter) return { config, status: 'OK', details: '' };
    return {
        config,
        status: modulesEmpty ? 'UNKNWN' : 'KO',
        details: modulesEmpty ? 'installedModules[] is empty (often due to wrappers like hubjs).' : ''
    };
}

/**
 * Checks if the Adagio Analytics Adapter is installed via Prebid or detected in the ADAGIO object.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkAdagioAnalyticsAdapter(_pbjs) {
    const hasAdapter = _pbjs.installedModules.includes('adagioAnalyticsAdapter');
    const modulesEmpty = !_pbjs.installedModules.length;
    const config = `installedModules.includes('adagioAnalyticsAdapter')`;

    if (hasAdapter) return { config, status: 'OK', details: '' };
    return {
        config,
        status: modulesEmpty ? 'UNKNWN' : 'KO',
        details: modulesEmpty ? 'installedModules[] is empty (often due to wrappers like hubjs).' : ''
    };
}

/**
 * Checks the configuration for 'realTimeData' in the Prebid object and returns the status of parameters.
 * 
 * @param {Object} _pbjs - The Prebid object containing the configuration.
 * @param {string|null} expectedOrgId - The expected value for 'organizationId', or null if no comparison is needed.
 * @param {string|null} expectedSiteName - The expected value for 'site', or null if no comparison is needed.
 * @returns {Object} An object containing the status of 'organizationId' and 'site' parameters.
 */
function checkRealTimeDataConfig(_pbjs, expectedOrgId = null, expectedSiteName = null) {
    const { params: { organizationId, site } = {} } = 
        _pbjs.getConfig('realTimeData')?.dataProviders?.find(p => p.name === "adagio") || {};

    const buildParamStatus = (value, expected, key) => ({
        config: key,
        value,
        status: !value ? 'KO' : expected === null ? 'CHECK' : value !== expected ? 'KO' : 'OK',
        details: !value ? 'Parameter undefined.' : expected === null ? 'Could not check value validity.' : value !== expected ? `Expected '${expected}' but got '${value}'.` : ''
    });

    return {
        params: {
            organizationId: buildParamStatus(organizationId, expectedOrgId, 'params.organizationId'),
            site: buildParamStatus(site, expectedSiteName, 'params.site')
        }
    };
}

/**
 * Checks if localStorage is enabled for the Adagio Prebid wrapper or if it's not needed in Prebid 9+.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkAdagioLocalStorage(_pbjs) {
    const standardStorage = _pbjs?.bidderSettings?.standard?.storageAllowed;
    const adagioStorage = _pbjs?.bidderSettings?.adagio?.storageAllowed;

    if (standardStorage || adagioStorage) return { config: standardStorage ? 'bidderSettings.standard.storageAllowed' : 'bidderSettings.adagio.storageAllowed', status: 'OK', details: '' };
    return { config: 'bidderSettings.adagio.storageAllowed', status: 'KO', details: 'Local storage is not configured in either bidderSettings.standard or bidderSettings.adagio.' };
}

/**
 * Checks if the deviceAccess configuration in Prebid is enabled.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkDeviceAccess(_pbjs) {
    const deviceAccess = _pbjs.getConfig(`deviceAccess`);
    return {
        config: `getConfig('deviceAccess')`,
        status: deviceAccess ? 'OK' : 'KO',
        details: deviceAccess ? '' : 'False or undefined.'
    };
}

/**
 * Checks if Adagio user sync is configured correctly in Prebid.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {object} An object containing `config`, `status`, and `details`.
 */
function checkAdagioUserSync(_pbjs) {
    const userSync = _pbjs?.getConfig('userSync');
    if (!userSync) return { config: `getConfig('userSync')`, status: 'KO', details: 'User sync is not configured.' };

    const isValid = (settings) => settings?.filter === 'include' &&
        (settings.bidders?.includes('*') || settings.bidders?.some(b => b.toLowerCase().includes('adagio')));

    if (isValid(userSync?.filterSettings?.iframe)) return { config: 'userSync.filterSettings.iframe', status: 'OK', details: 'Adagio user sync for iframe is correct.' };
    if (isValid(userSync?.filterSettings?.all)) return { config: 'userSync.filterSettings.all', status: 'OK', details: 'Adagio user sync for all is correct.' };

    return { config: 'userSync.filterSettings.iframe', status: 'KO', details: 'Adagio user sync is not configured in either userSync.filterSettings.iframe or userSync.filterSettings.all.' };
}

/**
 * Retrieves all bids requested by Adagio from Prebid events.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @returns {Array} An array of Adagio bids or an empty array if none found.
 */
function getAdagioBidRequested(_pbjs) {
    return _pbjs.getEvents()
        .filter(e => e.eventType === `bidRequested` && e?.args?.bidderCode.toLowerCase().includes('adagio'))
        .flatMap(e => e?.args?.bids || []);
}

/**
 * Extracts unique Adagio organization IDs from the given adUnits, ensuring they are valid (four-digit strings).
 * It also handles misconfigurations like numeric IDs or trailing spaces.
 * 
 * @param {Array} adagioBidRequested - The Adagio bid request data.
 * @returns {Array} An array of unique organization IDs that are valid.
 */
function getAdagioOrganizationIds(adagioBidRequested) {
    const organizationIds = new Set();

    adagioBidRequested.forEach((e) => {
        // Coerce organizationId to a string and trim any extra spaces
        const orgId = String(e.params?.organizationId).trim();

        // Check if the coerced organizationId is a valid four-digit string
        if (/^\d{4}$/.test(orgId)) {
            organizationIds.add(orgId);  // Add to set if valid
        }
    });
    return [...organizationIds];  // Return as an array
}

/**
 * Checks the validity of the organizationId parameter.
 * 
 * @param {object} bid - The bid object containing the organization ID parameter.
 * @returns {object} An object with `config`, `value`, `status`, and `details` indicating the result of the check.
 */
function checkOrganizationIdParam(bid) {
    const organizationId = bid?.params?.organizationId;
    const config = 'params.organizationId';

    if (!organizationId) return { config, value: organizationId, status: 'KO', details: 'Parameter undefined.' };
    if (typeof organizationId !== 'string') return { config, value: organizationId, status: 'KO', details: 'Must be a string, not a number or other type.' };
    if (organizationId.length !== 4) return { config, value: organizationId, status: 'KO', details: 'Must be exactly 4 characters long.' };
    if (!/^\d{4}$/.test(organizationId)) return { config, value: organizationId, status: 'KO', details: 'Must contain exactly 4 digits.' };

    return { config, value: organizationId, status: 'OK', details: '' };
}

/**
 * Validates the `site` parameter in a bid object.
 * 
 * @param {object} bid - The bid object containing the `site` parameter to validate.
 * @param {string|null} expectedSiteName - The expected value for the `site` parameter, or `null` if no comparison is required.
 * @returns {object} An object with `config`, `value`, `status`, and `details` indicating the result of the check.
 */
function checkSiteParam(bid, expectedSiteName) {
    const site = bid?.params?.site, config = 'params.site';

    if (!site) return { config, value: site, status: 'KO', details: 'Parameter undefined.' };
    if (site.trim() !== site) return { config, value: site, status: 'KO', details: 'Space character detected.' };
    if (expectedSiteName !== null && expectedSiteName !== site) return { config, value: site, status: 'KO', details: `Doesn't match with declared siteName.` };

    return { config, value: site, status: 'OK', details: '' };
}

/**
 * Validates the placement parameter with priority to ortb2Imp.ext.data.placement for Prebid 9+.
 * 
 * @param {object} bid - The bid object containing placement information.
 * @param {number} prebidVersion - The version of Prebid being used.
 * @returns {object} An object containing `config`, `value`, `status`, and `details`.
 */
function checkPlacementParam(bid, prebidVersion) {
    const ortb2Placement = bid?.ortb2Imp?.ext?.data?.placement;
    const paramPlacement = bid?.params?.placement;
    const useFallback = prebidVersion >= 9 && ortb2Placement === undefined;

    const config = useFallback ? 'params.placement' : 'ortb2Imp.ext.data.placement';
    const value = useFallback ? paramPlacement : ortb2Placement;

    if (!value) return { config, value, status: 'KO', details: 'Parameter undefined.' };
    if (value.trim() !== value) return { config, value, status: 'CHECK', details: 'Space character detected.' };
    if (/mobile|desktop|tablet/i.test(value)) return { config, value, status: 'CHECK', details: 'Should not include reference to an environment.' };

    const status = useFallback && prebidVersion >= 9 ? 'INFO' : 'OK';
    const details = status === 'INFO' ? 'Using fallback to params.placement.' : '';
    return { config, value, status, details };
}

/**
 * Validates the adUnitElementId parameter with priority to ortb2Imp.ext.data.divId for Prebid 9+.
 * 
 * @param {object} bid - The bid object containing adUnitElementId information.
 * @param {number} prebidVersion - The version of Prebid being used.
 * @returns {object} An object containing `config`, `value`, `status`, and `details`.
 */
function checkAdUnitElementIdParam(bid, prebidVersion) {
    const ortb2DivId = bid?.ortb2Imp?.ext?.data?.divId;
    const paramAdUnitElementId = bid?.params?.adUnitElementId;
    const useFallback = prebidVersion >= 9 && ortb2DivId === undefined;

    const config = useFallback ? 'params.adUnitElementId' : 'ortb2Imp.ext.data.divId';
    const value = useFallback ? paramAdUnitElementId : ortb2DivId;

    // Validate the value
    if (!value) return { config, value, status: 'KO', details: 'Parameter undefined.' };
    if (!document.getElementById(value)) return { config, value, status: 'CHECK', details: 'Div ID not found in the page.' };

    // Set status and details for valid values
    const status = useFallback && prebidVersion >= 9 ? 'INFO' : 'OK';
    const details = status === 'INFO' ? 'Using fallback to params.adUnitElementId.' : '';
    return { config, value, status, details };
}

/**
 * Validates the pagetype parameter with priority to ortb2.site.ext.data.pagetype for Prebid 9+.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @param {object} bid - The bid object containing placement information.
 * @param {number} prebidVersion - The version of Prebid being used.
 * @returns {object} An object containing `config`, `value`, `status`, and `details`.
 */
function checkPagetypeParam(_pbjs, bid, prebidVersion) {
    const ortb2Pagetype = _pbjs.getConfig('ortb2')?.site?.ext?.data?.pagetype;
    const paramPageType = bid?.params?.pagetype;
    const useFallback = prebidVersion >= 9 && ortb2Pagetype === undefined;

    const config = useFallback ? 'params.pagetype' : 'ortb2.site.ext.data.pagetype';
    const value = useFallback ? paramPageType : ortb2Pagetype;

    // Validate the value
    if (!value) return { config, value, status: 'CHECK', details: 'Parameter undefined.' };

    // Set status and details for valid values
    const status = useFallback && prebidVersion >= 9 ? 'INFO' : 'OK';
    const details = status === 'INFO' ? 'Using fallback to params.pagetype.' : '';
    return { config, value, status, details };
}

/**
 * Validates the category parameter with priority to ortb2.site.ext.data.category for Prebid 9+.
 * 
 * @param {object} _pbjs - The Prebid.js object.
 * @param {object} bid - The bid object containing placement information.
 * @param {number} prebidVersion - The version of Prebid being used.
 * @returns {object} An object containing `config`, `value`, `status`, and `details`.
 */
function checkCategoryParam(_pbjs, bid, prebidVersion) {
    const ortb2Category = _pbjs.getConfig('ortb2')?.site?.ext?.data?.category;
    const paramCategory = bid?.params?.category;
    const useFallback = prebidVersion >= 9 && ortb2Category === undefined;

    const config = useFallback ? 'params.category' : 'ortb2.site.ext.data.category';
    const value = useFallback ? paramCategory : ortb2Category;

    // Validate the value
    if (!value) return { config, value, status: 'CHECK', details: 'Parameter undefined.' };

    // Set status and details for valid values
    const status = useFallback && prebidVersion >= 9 ? 'INFO' : 'OK';
    const details = status === 'INFO' ? 'Using fallback to params.category.' : '';
    return { config, value, status, details };
}

/* MAIN - Run function */

export function run(_window, organizationId, siteName) {
    const _ADAGIO = getAdagioAdapter(_window);
    const prebidWrappers = getPrebidWrappers(_window, _ADAGIO);
    const adServers = getSupportedAdServers(_window);

    const results = {
        'supportedAdServersDetected': adServers,
        'wrappers': {},
    }; // Object to store the prebid data for each wrapper

    prebidWrappers.forEach(([wrapperName, wrapperWindow]) => {
        const _pbjs = wrapperWindow[wrapperName];
        const prebidVersion = getPrebidVersion(_pbjs);
        const adagioBidsRequested = getAdagioBidRequested(_pbjs);
        const detectedOrganizationIds = getAdagioOrganizationIds(adagioBidsRequested);

        const modules = {
            'adagioBidderAdapter': checkAdagioBidAdapter(_pbjs, _ADAGIO),
            'rtdModule': checkRealTimeDataModule(_pbjs, _ADAGIO),
            'adagioRtdProvider': checkAdagioRtdProviderModule(_pbjs, _ADAGIO),
            'adagioAnalyticsAdapter': checkAdagioAnalyticsAdapter(_pbjs, _ADAGIO),
        }

        // Create an object to hold ad units for the current wrapper
        const adUnitsList = [];

        // Create the prebid wrapper object and assign it to results using the wrapper name as the key
        results.wrappers[wrapperName] = {
            'adUnits': adUnitsList,
            'pbjsLocalName': wrapperName,
            'pbjsVersionNumber': prebidVersion,
            'pbjsVersionString': _pbjs.version,
            'detectedOrganizationIds': detectedOrganizationIds,
            // 'pbjsIntegrity': hasWrapperIntegrity(wrapperName, _ADAGIO)
            'localstorage': checkAdagioLocalStorage(_pbjs),
            'userSync': checkAdagioUserSync(_pbjs),
            'deviceAccess': checkDeviceAccess(_pbjs),
            'rtdConfig': checkRealTimeDataConfig(_pbjs, null, null),
            'modules': modules,
        };

        // Iterate over each bid and populate the adUnitsList
        adagioBidsRequested.forEach((bid) => {
            // Add the ad unit to the adUnitsList array
            adUnitsList.push({
                'adUnitCode': bid.adUnitCode,
                'params': {
                    'organizationId': checkOrganizationIdParam(bid),
                    'site': checkSiteParam(bid, null),
                    'placement': checkPlacementParam(bid, prebidVersion),
                    'adUnitElementId': checkAdUnitElementIdParam(bid, prebidVersion),
                    'pagetype': checkPagetypeParam(_pbjs, bid, prebidVersion),
                    'category': checkCategoryParam(_pbjs, bid, prebidVersion),
                }
            });
        });
    });

    return results;
}