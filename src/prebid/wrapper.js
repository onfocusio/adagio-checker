import { getPrebidVersion } from '../utils.js';
import { refreshChecker } from '../app.js';

/**
 * Module: prebid/wrapper
 *
 * Utilities to detect and select a Prebid.js wrapper on the page. The project
 * supports pages that may include multiple Prebid instances (top window, iframes,
 * and wrappers referenced in the ADAGIO metadata). This module finds available
 * wrappers, exposes a selected wrapper and helper functions to extract events
 * and bids from the Prebid instance.
 *
 * @module prebid/wrapper
 */

/**
 * Detected Prebid wrappers available in the page. Each item is `[wrapperName, windowObj]`.
 * @type {Array<[string, Window]>}
 */
export let prebidWrappers = []; // Arrays of [wrapper, window] : window[wrapper]

/**
 * Currently selected Prebid wrapper tuple `[name, window]`.
 * @type {[string, Window]|undefined}
 */
export let prebidWrapper = undefined; // Current Prebid.js wrapper selected

/**
 * Reference to the Prebid global object for the selected wrapper (e.g., `pbjs`).
 * @type {Object|undefined}
 */
export let prebidObject = undefined; // Current Prebid.js object selected

/**
 * Numeric Prebid version detected for the selected wrapper (major.minor as number-like string).
 * @type {string|undefined}
 */
export let prebidVersionDetected = undefined; // Prebid.js version detected for the selected wrapper

/**
 * Discover available Prebid wrappers in the page and select the most relevant one.
 *
 * This inspects `window._pbjsGlobals`, iframes and ADAGIO metadata to find
 * Prebid instances, then selects a wrapper prioritizing the one with the
 * most Adagio bids, falling back to the wrapper with most overall bids.
 */
/**
 * Discover available Prebid wrappers in the page and select the most relevant one.
 *
 * This inspects `window._pbjsGlobals`, iframes and ADAGIO metadata to find
 * Prebid instances, then selects a wrapper prioritizing the one with the
 * most Adagio bids, falling back to the wrapper with most overall bids.
 *
 * @returns {void}
 */
export function setPrebidWrapper() {
    // Helper function to check and push valid wrappers, ensuring no duplicates
    const addWrappers = (windowObj, wrapperList) => {
        wrapperList.forEach((wrapper) => {
            const instance = windowObj[wrapper];
            // Only add the wrapper if it's valid and not already in prebidWrappers
            if (instance?.version && typeof instance.getEvents === 'function' && !prebidWrappers.some(([existingWrapper, existingWindow]) => existingWrapper === wrapper && existingWindow === windowObj)) {
                prebidWrappers.push([wrapper, windowObj]);
            }
        });
    };

    // Check top window for Prebid wrappers
    if (window._pbjsGlobals) addWrappers(window, window._pbjsGlobals);

    // Check iframes for Prebid wrappers
    Array.from(window.document.getElementsByTagName(`iframe`)).forEach((iframe) => {
        try {
            const iframeDoc = iframe.contentWindow;
            if (iframeDoc._pbjsGlobals) addWrappers(iframeDoc, iframeDoc._pbjsGlobals);
        } catch (e) {
            // Ignore iframe access errors (cross-origin or others)
        }
    });

    // Check ADAGIO versions for hidden wrappers, using addWrappers for consistency
    if (typeof ADAGIO !== 'undefined' && ADAGIO?.versions !== undefined) {
        addWrappers(
            window,
            Object.keys(ADAGIO.versions).filter((item) => item !== 'adagiojs')
        );
    }

    // Pre-select the wrapper based on adagio bidrequests, or name 'pbjs'
    if (prebidWrappers.length !== 0) {
        let maxAdagioBids,
            maxBids = 0;
        let maxAdagioBidsWrapper,
            maxBidsWrapper = null; // prebidWrappers[0];

        prebidWrappers.forEach(([wrapper, win]) => {
            const instance = win[wrapper];
            if (instance?.getEvents) {
                const bids = instance.getEvents()?.filter((event) => event.eventType === 'bidRequested') || [];
                const bidsCount = bids.length;
                const adagioBidsCount = bids.filter((bid) => bid.bidder?.toLowerCase().includes('adagio')).length;

                if (bidsCount >= maxBids) {
                    maxBids = bidsCount;
                    maxBidsWrapper = [wrapper, win];
                }
                if (adagioBidsCount >= maxAdagioBids) {
                    maxAdagioBids = adagioBidsCount;
                    maxAdagioBidsWrapper = [wrapper, win];
                }
            }
        });

        // Select the wrapper based on priority: most Adagio bids > most bids > first wrapper
        if (prebidWrapper === undefined && prebidObject === undefined) {
            prebidWrapper = maxAdagioBids > 0 ? maxAdagioBidsWrapper : maxBids > 0 ? maxBidsWrapper : prebidWrappers[0];
            prebidObject = prebidWrapper[1][prebidWrapper[0]];
            prebidVersionDetected = getPrebidVersion(prebidObject);
        }
    }
}

/**
 * Switch currently selected Prebid wrapper by index from `prebidWrappers`.
 *
 * @param {number} value Index of the wrapper in `prebidWrappers` to select.
 */
/**
 * Switch currently selected Prebid wrapper by index from `prebidWrappers`.
 *
 * @param {number} value Index of the wrapper in `prebidWrappers` to select.
 * @returns {void}
 */
export function switchToSelectedPrebidWrapper(value) {
    prebidWrapper = prebidWrappers[value];
    prebidObject = prebidWrapper[1][prebidWrapper[0]];
    prebidVersionDetected = getPrebidVersion(prebidObject);
    refreshChecker();
}

// Helper functions to extract Prebid events and requests
/**
 * Return Prebid event list from a Prebid object.
 *
 * @param {Object} _prebidObject Prebid instance exposing `getEvents()`.
 * @returns {Array<Object>} Array of Prebid event objects.
 */
export function getPrebidEvents(_prebidObject) {
    return _prebidObject.getEvents();
}

/**
 * Extract all bidRequested bid entries from a list of Prebid events.
 *
 * @param {Array<Object>} prebidEvents Prebid events array.
 * @returns {Array<Object>} Flattened array of bid objects from bidRequested events.
 */
export function getBidRequested(prebidEvents) {
    return prebidEvents
        .filter((e) => e.eventType === 'bidRequested')
        .map((e) => e.args)
        .map((e) => e.bids)
        .flat();
}

/**
 * Filter bidRequested entries and return only those coming from Adagio bidders.
 *
 * @param {Array<Object>} bidRequested Array of bid objects.
 * @returns {Array<Object>} Filtered array where `bidder` contains 'adagio'.
 */
export function getAdagioBidRequested(bidRequested) {
    return bidRequested.filter((e) => e.bidder?.toLowerCase()?.includes('adagio')) || [];
}
