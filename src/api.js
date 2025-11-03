/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

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
    };

    // Return the set of unique matching records
    return apiRecordsItems;
}

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
