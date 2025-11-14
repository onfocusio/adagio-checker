import { chkr_badges } from './enums.js';
import { appendHomeContainer } from './app.js';

/**
 * Module: utils
 *
 * Shared utilities used across the checker: version parsing, badge computation,
 * location helpers and small UI helpers that do not belong to the UI package.
 *
 * @module utils
 */

/**
 * Detected country code (ISO 3166-1 alpha-3). Populated by `fetchCurrentLocationData`.
 * @type {string|undefined}
 */
export let detectedCountryCodeIso3; // Detected country code (alpha-3)

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

/**
 * Fetch Adagio sellers.json and append detected organization names to the home container.
 *
 * @param {Array<string>} orgIds List of organization IDs to look up.
 * @returns {Promise<void>} Resolves once the operation completes.
 */
export async function fetchPublishersFromOrgIds(orgIds) {
	// Fetch the Adagio seller.json to ensure that the orgId refers to an existing organization
	if (orgIds.length) {
		// Fetch the adagio sellers.json
		try {
			// Fetch the adagio sellers.json
			const response = await fetch('https://adagio.io/sellers.json');
			let adagioSellersJson = await response.json();

			// Build the organization list
			const orgHtmlList = [];

			// Loop through the organizationIds to build the HTML list
			for (const orgId of orgIds) {
				const matched = adagioSellersJson?.sellers.filter((e) => e.seller_id === orgId);
				const org = matched && matched[0] ? matched[0] : { name: orgId, seller_id: orgId, seller_type: 'unknown' };
				orgHtmlList.push(`<code>${org.name} (${org.seller_id}) - ${org.seller_type}</code>`);
			}

			// Append the result to the home container div
            let strBuilder = `${orgHtmlList.length > 1 ? 'Organizations' : 'Organization'}: ${orgHtmlList.join(', ')}`;
            appendHomeContainer(strBuilder);
		} catch (error) {
			// Handle JSON failure here
			console.error('Error fetching Adagio sellers.json:', error);
		}
	}
}

/**
 * Fetch the current location data (country) based on the user's IP and
 * populate `detectedCountryCodeIso3`. Also appends a short message to
 * the home container when a country other than France is detected.
 *
 * @returns {Promise<void>} Resolves after fetching and processing location data.
 */
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

/**
 * Compute an aggregated ad unit status from an array of parameter check statuses.
 *
 * The input array contains status badges (strings) and this function returns
 * the most severe badge found according to the priority: KO > check > update > OK.
 *
 * @param {Array<string>} paramsCheckingArray Array of status badges to evaluate.
 * @returns {string} One of the `chkr_badges` values representing the aggregated status.
 */
export function computeAdUnitStatus(paramsCheckingArray) {
	// The array contains X item with the following structure: [string, string, string] (html code)
	if (paramsCheckingArray.includes(chkr_badges.ko)) return chkr_badges.ko;
	else if (paramsCheckingArray.includes(chkr_badges.check)) return chkr_badges.check;
	else if (paramsCheckingArray.includes(chkr_badges.update)) return chkr_badges.update;
	// else if (paramsCheckingArray.includes(chkr_badges.info)) return chkr_badges.info;
	else return chkr_badges.ok;
}

/**
 * Enable a debugging flag in localStorage and reload the page with
 * a query parameter that activates Prebid debug mode.
 *
 * Note: this will navigate away from the current page.
 */
export function loadDebuggingMode() {
	window.localStorage.setItem('ADAGIO_DEV_DEBUG', true);
	const url = window.location.href.indexOf('?pbjs_debug=true') ? window.location.href + '?pbjs_debug=true' : window.location.href;
	window.location.href = url;
}

/**
 * Extract the major.minor version from a Prebid object version string.
 *
 * @param {{version:string}} prebidObject Prebid global object with a `version` string like `vX.Y.Z`.
 * @returns {string} The `major.minor` portion of the version (e.g. `1.2`).
 */
export function getPrebidVersion(prebidObject) {
	return prebidObject.version.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
}

/**
 * Decide which badge to display based on detected Prebid version and rules.
 *
 * @param {number} prebidVersionDetected Numeric Prebid version (major.minor as a number).
 * @param {boolean|string} isError Either `true` for an error, `false` for ok, or `'warn'` for a warning-level rule.
 * @param {number|null} minVersion Minimum (inclusive) version for the rule, or `null` for -Infinity.
 * @param {number|null} maxVersion Maximum (inclusive) version for the rule, or `null` for +Infinity.
 * @returns {string} One of the `chkr_badges` values to display.
 */
export function computeBadgeToDisplay(prebidVersionDetected, isError, minVersion, maxVersion) {
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
