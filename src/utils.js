import { chkr_badges } from './enums.js';
import { appendHomeContainer } from './app.js';

export let detectedCountryCodeIso3; // Detected country code (alpha-3)

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

export async function fetchPublishersFromOrgIds(orgIds) {
	// Fetch the Adagio seller.json to ensure that the orgId refers to an existing organization
	let adagioSellersJsonUrl = 'https://adagio.io/sellers.json';
	let adagioSellersJson = null;

    // Build the result string (set the default value)
	let strBuilder = `Organization: No org. detected... Try to refresh the checker or the page.`;

	if (orgIds.length) {
		// Fetch the adagio sellers.json
		try {
			// Fetch the adagio sellers.json
			const response = await fetch(adagioSellersJsonUrl);
			adagioSellersJson = await response.json();

			// Build the organization list
			const orgHtmlList = [];

			// Loop through the organizationIds to build the HTML list
			for (const orgId of orgIds) {
				const matched = adagioSellersJson?.sellers.filter((e) => e.seller_id === orgId);
				const org = matched && matched[0] ? matched[0] : { name: orgId, seller_id: orgId, seller_type: 'unknown' };
				orgHtmlList.push(`<code>${org.name} (${org.seller_id}) - ${org.seller_type}</code>`);
			}

            // Build the final string
            strBuilder = `${orgHtmlList.length > 1 ? 'Organizations' : 'Organization'}: ${orgHtmlList.join(', ')}`;
		} catch (error) {
			// Handle JSON failure here
			adagioSellersJson = null;
		}
	}

	// Append the result to the home container div
	appendHomeContainer(strBuilder);
}

export async function fetchCurrentLocationData() {
    // Reset the detected country code
    detectedCountryCodeIso3 = null;

	// Fetch the country code using ipapi.co
	await fetch('https://ipapi.co/json/')
		.then((response) => response.json())
		.then((data) => {
			const countryCode = data.country_code;
			const countryName = data.country_name;
			detectedCountryCodeIso3 = data.country_code_iso3;
			// Convert country code to emoji using a function
			const countryEmoji = getFlagEmoji(countryCode);
			if (countryName !== 'France') {
				appendHomeContainer(`Current location detected: <code>${countryName}</code> (${countryEmoji})`);
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
	// else if (paramsCheckingArray.includes(chkr_badges.info)) return chkr_badges.info;
	else return chkr_badges.ok;
}

export function loadDebuggingMode() {
	window.localStorage.setItem('ADAGIO_DEV_DEBUG', true);
	const url = window.location.href.indexOf('?pbjs_debug=true') ? window.location.href + '?pbjs_debug=true' : window.location.href;
	window.location.href = url;
}

export function getPrebidVersion(prebidObject) {
	return prebidObject.version.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
}
