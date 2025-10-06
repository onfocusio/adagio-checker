// Overlay iframe html object, and iframe document
export const chkr_ovrl = {
    overlayFrame: undefined,                // HTML iframe element for the overlay
    buttonFrame: undefined,                 // HTML iframe element for the button
    overlayFrameDoc: undefined,             // Document object for the overlay iframe
    buttonFrameDoc: undefined,              // Document object for the button iframe
    overlayVisible: true,                   // Overlay current state
    activeTab: undefined,                   // Active tab name
    isDragged: false                        // Is the iframe being dragged
}

// Prebid.js wrapper objects
export const chkr_wrp = {
    prebidObject: undefined,                // Prebid.js object
    prebidWrappers: [],                     // Arrays of [wrapper, window] : window[wrapper]
    prebidWrapper: undefined,               // Current Prebid.js wrapper selected
    adagioAdapter: undefined,               // Adagio adapter object (window.ADAGIO)
    prebidVersionDetected: undefined,       // Prebid.js version detected
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
    prebidAdagioParams: undefined,
    totalPrebidAdUnitsCodes: 0,
    totalPrebidAdagioAdUnitsCode: 0,
    totalAdagioAdUnitsCodes: 0,
    totalAdagioPbjsAdUnitsCodes: 0,
    organizationIds: [],
    siteNames: []
}