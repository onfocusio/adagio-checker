// Overlay iframe html object, and iframe document
export const chkr_ovrl = {
    overlayFrame: undefined,                // HTML iframe element for the overlay
    overlayFrameDoc: undefined,             // Document object for the overlay iframe
    activeTab: undefined,                   // Active tab name
    isDragged: false                        // Is the iframe being dragged
}

// Adagio API variables
export const chkr_api = {
    apiKeyDetected: false,                  // Is API key detected on the page (via bookmarklet)
    matchedDomainsRecords: null,            // API response for matched domains
    matchedSiteNameRecords: null,           // API response for matched site names
    successRecordItems: null,               // API response for successful record items
    detectedCountryCodeIso3: null           // Detected country code (alpha-3)
}

// Others... (to be moved later)
export const chkr_vars = {
    prebidEvents: undefined,
    prebidBidsRequested: undefined,
    prebidAdagioBidsRequested: undefined,
    prebidBids: undefined,
    prebidBidders: undefined,
    prebidAdUnitsCodes: undefined,
    prebidAdagioAdUnitsCodes: undefined,
    adagioBidsRequested: undefined,
    adagioPbjsAdUnitsCode: [],
}