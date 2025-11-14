/**
 * Module: api/index
 *
 * API helper functions used to query the Adagio public API for website
 * records. These helpers encapsulate the network calls and basic result
 * filtering used by the checker.
 *
 * @module api/index
 */
/*************************************************************************************************************************************************************************************************************************************
 * API helpers extracted from `src/api.js`
 ************************************************************************************************************************************************************************************************************************************/

/**
 * Fetch matching inventory records from Adagio API for given organization/site pairs.
 *
 * For each `{organizationId, site}` pair this function queries the Adagio
 * websites endpoint and returns a Set of matching records (unique items).
 *
 * @param {Array<{organizationId:string,site:string}>} bidReqOrgSitePairs
 * @returns {Promise<Set>} A Set containing unique matching API records.
 */
export async function fetchApiInventoryRecords(bidReqOrgSitePairs) {
    // Clear the successRecordItems array
    const apiRecordsItems = new Set();

    // If no organizationId / site pairs, exit
    if (bidReqOrgSitePairs.length) {
        // Catch all the organizationId records from the Adagio API to manage subdomains cases
        for (const { organizationId, site } of bidReqOrgSitePairs) {
            // Build the query string
            const hostname = window.location.hostname.replace(/^www\./i, '');
            const queryString = `filter=publisher_id||$eq||${encodeURIComponent(organizationId)}&search=${encodeURIComponent(hostname)}`;

            // Run the Adagio API call
            const url = `https://api.adagio.io/api/v1/groups/1/websites?${queryString}`;
            const orgIdApiDataResponse = await runAdagioApiQuery(url); // => data //.records

            // If results detected, process them
            if (orgIdApiDataResponse !== null) {
                // Check if the records provides a domain match and a sitename match
                const matchedDomainsRecords = orgIdApiDataResponse.records.filter((record) => hostname.includes(record.domain)) || null;
                const matchedSiteNameRecords = orgIdApiDataResponse.records.filter((record) => site === record.name) || null;
                const successRecordsItems = matchedDomainsRecords.filter((domainRecord) => matchedSiteNameRecords.filter((siteNameRecord) => domainRecord === siteNameRecord)) || [];

                // If at least one record matched, add it to the apiRecordsItems set
                if (successRecordsItems.length) {
                    successRecordsItems.forEach((item) => apiRecordsItems.add(item));
                }
            }
        }
    }

    // Return the set of unique matching records
    return apiRecordsItems;
}

/**
 * Run a GET request against the Adagio API and return parsed JSON or `null`.
 *
 * @param {string} url Full URL to call.
 * @returns {Promise<Object|null>} Parsed JSON response or `null` on error.
 */
export async function runAdagioApiQuery(url) {
    // Making the GET request using fetch()
    try {
        const response = await fetch(url, {
            method: 'GET', // HTTP method
            headers: {
                Authorization: `Bearer ${ADAGIO_KEY}`, // Adding the Bearer token in the header
            },
        });
        if (!response.ok) throw new Error(response.status);
        return await response.json();
    } catch (error) {
        console.error('Error fetching Adagio API:', error);
        return null;
    }
}
