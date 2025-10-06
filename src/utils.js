import { chkr_ovrl, chkr_api, chkr_vars } from './variables.js';
import { chkr_tabs, chkr_svg, chkr_badges, chkr_titles } from './enums.js'
import * as htmlFunctions from './htmlFunctions.js';

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/  

export async function checkAdagioAPI() {
    // Ready to udapte the alert div
    const apiButtonElement = chkr_ovrl.overlayFrameDoc.getElementById(`apiButton`);

    // Ensure user launched the bookmarket with the ADAGIO_KEY declared
    if (typeof ADAGIO_KEY === 'undefined') {
        // Ensure the ADAGIO_KEY is defined
        apiButtonElement.innerHTML = chkr_svg.api_red;
        apiButtonElement.setAttribute('title', "Adagio API - 'ADAGIO_KEY' is not defined in the bookmarklet.");
        return;
    } else if (ADAGIO_KEY === '') {
        // Ensure the ADAGIO_KEY is not empty ('')
        apiButtonElement.innerHTML = chkr_svg.api_red;
        apiButtonElement.setAttribute('title', "Adagio API - 'ADAGIO_KEY' value is empty in the bookmarklet.");
        return;
    } else {
        // Declare the API as found
        chkr_api.apiKeyDetected = true;
    }

    // Declare the necessary variables
    let queryString = null;

    // Launch the API call for the organizationIds
    if (chkr_vars.organizationIds.length === 0) {
        apiButtonElement.innerHTML = chkr_svg.api_orange;
        apiButtonElement.setAttribute('title', 'Adagio API - No organizationId detected in traffic.');
    } else if (chkr_vars.organizationIds.length > 1) {
        apiButtonElement.innerHTML = chkr_svg.api_orange;
        apiButtonElement.setAttribute('title', 'Adagio API - Multiple organizations detected in traffic (not supported).');
    } else {
        queryString = `filter=publisher_id||$eq||${encodeURIComponent(chkr_vars.organizationIds[0])}`;
        let orgIdApiDataResponse = await runAdagioAPI(queryString); // => data //.records

        if (orgIdApiDataResponse !== null && orgIdApiDataResponse.records !== null) {
            // Check if the records provides a domain match and a sitename match
            chkr_api.matchedDomainsRecords = orgIdApiDataResponse.records.filter((record) => window.location.hostname.includes(record.domain)) || null;
            chkr_api.matchedSiteNameRecords = orgIdApiDataResponse.records.filter((record) => chkr_vars.siteNames.includes(record.name)) || null;
            chkr_api.successRecordItems = chkr_api.matchedDomainsRecords.filter((domainRecord) => chkr_api.matchedSiteNameRecords.filter((siteNameRecord) => domainRecord === siteNameRecord)) || null;

            // Check display API status regarding record results.
            if (chkr_api.matchedDomainsRecords === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager domain match: '${window.location.hostname}'.`);
            } else if (chkr_api.matchedSiteNameRecords === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager sitename match: ${chkr_vars.siteNames}'.`);
            } else if (chkr_api.successRecordItems === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager domain and sitename match: '${window.location.hostname}' / '${chkr_vars.siteNames}'.`);
            } else {
                apiButtonElement.innerHTML = chkr_svg.api_green;
                apiButtonElement.setAttribute('title', `Adagio API - Successfull record(s) fetched.`);
            }
        } else {
            apiButtonElement.innerHTML = chkr_svg.api_orange;
            apiButtonElement.setAttribute('title', `Adagio API - No manager organizationId match: '${chkr_vars.organizationIds[0]}'.`);
        }
    }
}

export async function checkPublisher() {
    // Fetch the Adagio seller.json to ensure that the orgId refers to an existing organization
    let adagioSellersJsonUrl = 'https://adagio.io/sellers.json';
    let adagioSellersJson = null;
    let organizationJson = null;

    // Fill the alert with number of orgIds found
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);

    if (chkr_vars.organizationIds.length > 0) {
        // Fetch the adagio sellers.json
        try {
            const response = await fetch(adagioSellersJsonUrl);
            adagioSellersJson = await response.json();
            // Fill with org found
            alertTextDiv.innerHTML += `<small>• Organization(s) detected: </small>`;
            for (const organizationId in chkr_vars.organizationIds) {
                organizationJson = adagioSellersJson?.sellers.filter((e) => e.seller_id === chkr_vars.organizationIds[organizationId]);
                alertTextDiv.innerHTML += `<small><code>${organizationJson[0].name} (${organizationJson[0].seller_id}) - ${organizationJson[0].seller_type}</code></small><br>`;
            }
        } catch (error) {
            // Handle JSON failure here
            adagioSellersJson = null;
        }
    } else {
        alertTextDiv.innerHTML += `<small>• No organization(s) detected... Try to refresh the checker or the page.`;
    }
}

export async function checkCurrentLocation() {
    // Fill the alert with number of orgIds found
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);

    // Fetch the country code using ipapi.co
    await fetch('https://ipapi.co/json/')
        .then((response) => response.json())
        .then((data) => {
            const countryCode = data.country_code;
            const countryName = data.country_name;
            chkr_api.detectedCountryCodeIso3 = data.country_code_iso3;
            // Convert country code to emoji using a function
            const countryEmoji = getFlagEmoji(countryCode);
            if (countryName !== 'France') {
                alertTextDiv.innerHTML += `<small>• Current location detected: <code>${countryName}</code> (${countryEmoji})</small><br>`;
            }
        })
        .catch((error) => console.error('Error fetching country data:', error));

    // Function to convert country code to emoji (unchanged)
    function getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }
}

export function checkAdServer() {
    // The adserver is a key component of the auction, knowing it help us in our troubleshooting
    // By default, we support only GAM, SAS and APN for the viewability.
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

    // Display the adserver checking result
    if (stringAdServer === '') {
        htmlFunctions.appendCheckerRow(chkr_badges.check, chkr_titles.adserver, `No supported adserver: the viewability measurement may not work`);
    } else {
        htmlFunctions.appendCheckerRow(chkr_badges.ok, chkr_titles.adserver, `${stringAdServer}`);
    }
}

export function computeAdUnitStatus(paramsCheckingArray) {
    // The array contains X item with the following structure: [string, string, string] (html code)
    if (paramsCheckingArray.includes(chkr_badges.ko)) return chkr_badges.ko;
    else if (paramsCheckingArray.includes(chkr_badges.check)) return chkr_badges.check;
    else if (paramsCheckingArray.includes(chkr_badges.update)) return chkr_badges.update;
    else if (paramsCheckingArray.includes(chkr_badges.info)) return chkr_badges.info;
    else return chkr_badges.ok;
}

export function loadDebuggingMode() {
    window.localStorage.setItem('ADAGIO_DEV_DEBUG', true);
    let url = window.location.href.indexOf('?pbjs_debug=true') ? window.location.href + '?pbjs_debug=true' : window.location.href;
    window.location.href = url;
}
