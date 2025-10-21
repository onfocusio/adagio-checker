import { chkr_ovrl, chkr_api } from './variables.js';
import { chkr_tabs, chkr_svg, chkr_badges } from './enums.js';

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/  

export async function checkAdagioAPI(organizationIds, siteNames) {
    // Ready to udapte the alert div
    const apiButtonElement = chkr_ovrl.overlayFrameDoc.getElementById(`apiButton`);

    // Ensure user launched the bookmarket with the ADAGIO_KEY set up
    if (typeof ADAGIO_KEY === 'undefined' || ADAGIO_KEY === '') {
        // Ensure the ADAGIO_KEY is defined
        apiButtonElement.innerHTML = chkr_svg.api_red;
        apiButtonElement.setAttribute('title', "Adagio API - 'ADAGIO_KEY' is empty / not defined in the bookmarklet.");
        return;
    }

    // Declare the API as found
    chkr_api.apiKeyDetected = true;

    // Launch the API call for the organizationIds
    if (organizationIds.length === 0) {
        apiButtonElement.innerHTML = chkr_svg.api_orange;
        apiButtonElement.setAttribute('title', 'Adagio API - No organizationId detected in traffic.');
    } else if (organizationIds.length > 1) {
        apiButtonElement.innerHTML = chkr_svg.api_orange;
        apiButtonElement.setAttribute('title', 'Adagio API - Multiple organizations detected in traffic (not supported).');
    } else {
        let queryString = `filter=publisher_id||$eq||${encodeURIComponent(organizationIds[0])}`;
        let orgIdApiDataResponse = await runAdagioAPI(queryString); // => data //.records

        if (orgIdApiDataResponse !== null && orgIdApiDataResponse.records !== null) {
            // Check if the records provides a domain match and a sitename match
            chkr_api.matchedDomainsRecords = orgIdApiDataResponse.records.filter((record) => window.location.hostname.includes(record.domain)) || null;
            chkr_api.matchedSiteNameRecords = orgIdApiDataResponse.records.filter((record) => siteNames.includes(record.name)) || null;
            chkr_api.successRecordItems = chkr_api.matchedDomainsRecords.filter((domainRecord) => chkr_api.matchedSiteNameRecords.filter((siteNameRecord) => domainRecord === siteNameRecord)) || null;

            // Check display API status regarding record results.
            if (chkr_api.matchedDomainsRecords === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager domain match: '${window.location.hostname}'.`);
            } else if (chkr_api.matchedSiteNameRecords === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager sitename match: ${siteNames}'.`);
            } else if (chkr_api.successRecordItems === null) {
                apiButtonElement.innerHTML = chkr_svg.api_orange;
                apiButtonElement.setAttribute('title', `Adagio API - No manager domain and sitename match: '${window.location.hostname}' / '${siteNames}'.`);
            } else {
                apiButtonElement.innerHTML = chkr_svg.api_green;
                apiButtonElement.setAttribute('title', `Adagio API - Successfull record(s) fetched.`);
            }
        } else {
            apiButtonElement.innerHTML = chkr_svg.api_orange;
            apiButtonElement.setAttribute('title', `Adagio API - No manager organizationId match: '${organizationIds[0]}'.`);
        }
    }
}

async function runAdagioAPI(queryString) {
    // URL of the API endpoint
    const url = `https://api.adagio.io/api/v1/groups/1/websites?${queryString}`;

    // Ready to udapte the alert div
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);

    // Making the GET request using fetch()
    try {
        const response = await fetch(url, {
            method: 'GET', // HTTP method
            headers: {
                Authorization: `Bearer ${ADAGIO_KEY}`, // Adding the Bearer token in the header
            },
        });
        if (!response.ok) {
            // alertTextDiv.innerHTML += `<small>• Adagio API - <code>🔴 ${response.status}</code></small><br>`;
            throw new Error(response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        alertTextDiv.innerHTML += `<small>• Adagio API - <code>🔴 Error on loading: ${error}</code></small><br>`;
        return null;
    }
}

export async function checkPublisher(organizationIds) {
    // Fetch the Adagio seller.json to ensure that the orgId refers to an existing organization
    let adagioSellersJsonUrl = 'https://adagio.io/sellers.json';
    let adagioSellersJson = null;
    let organizationJson = null;

    // Fill the alert with number of orgIds found
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);

    if (organizationIds.length > 0) {
        // Fetch the adagio sellers.json
        try {
            const response = await fetch(adagioSellersJsonUrl);
            adagioSellersJson = await response.json();
            // Fill with org found
            alertTextDiv.innerHTML += `<small>• Organization(s) detected: </small>`;
            for (const organizationId in organizationIds) {
                organizationJson = adagioSellersJson?.sellers.filter((e) => e.seller_id === organizationIds[organizationId]);
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

export function getPrebidVersion(prebidObject) {
    return prebidObject.version.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
}
