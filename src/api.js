import { chkr_tabs, chkr_svg, chkr_badges } from './enums.js';
import { overlayFrameDoc } from './app.js';

// Adagio API variables
export let apiKeyDetected = (typeof ADAGIO_KEY !== 'undefined' && ADAGIO_KEY) ? true : false; // Is API key detected on the page (via bookmarklet)
export let successRecordsItems; // API response for successful record items

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

export async function checkAdagioAPI(orgSitePairs) {
	// Ready to udapte the alert div
	const apiButtonElement = overlayFrameDoc.getElementById(`apiButton`);

    // Clear the successRecordItems array
    successRecordsItems = [];

	// Ensure user launched the bookmarket with the ADAGIO_KEY set up
	if (!apiKeyDetected) {
		// Ensure the ADAGIO_KEY is defined
		apiButtonElement.innerHTML = chkr_svg.api_red;
		apiButtonElement.setAttribute('title', "Adagio API - 'ADAGIO_KEY' is empty / not defined in the bookmarklet.");
		return;
	}

	// Launch the API call for the organizationIds
	if (orgSitePairs.length === 0) {
		apiButtonElement.innerHTML = chkr_svg.api_orange;
		apiButtonElement.setAttribute('title', 'Adagio API - No organizationId / siteName detected in traffic.');
		return;
	} 

    // API key detected and organizationIds found - Ready to query
    apiButtonElement.innerHTML = chkr_svg.api_green;
    apiButtonElement.setAttribute('title', `Adagio API - Ready to query data.`);

	// Catch all the organizationId records from the Adagio API to manage subdomains cases
	for (const { organizationId, site } of orgSitePairs) {
        // Build the query string
		let queryString = `filter=publisher_id||$eq||${encodeURIComponent(organizationId)}`;

        // Run the Adagio API call
		let orgIdApiDataResponse = await runAdagioAPI(queryString); // => data //.records

        // Analyze the API response
		if (orgIdApiDataResponse !== null && orgIdApiDataResponse.records !== null) {
			// Check if the records provides a domain match and a sitename match
			let matchedDomainsRecords = orgIdApiDataResponse.records.filter((record) => window.location.hostname.includes(record.domain)) || null;
			let matchedSiteNameRecords = orgIdApiDataResponse.records.filter((record) => site === record.name) || null;
			successRecordsItems.push(...matchedDomainsRecords.filter((domainRecord) => matchedSiteNameRecords.filter((siteNameRecord) => domainRecord === siteNameRecord)) || null);
		}
	}
}

async function runAdagioAPI(queryString) {
	// URL of the API endpoint
	const url = `https://api.adagio.io/api/v1/groups/1/websites?${queryString}`;

	// Ready to udapte the alert div
	const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
	const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

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
