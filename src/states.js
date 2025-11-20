import { getPrebidVersion } from './utils.js';

export let _ADAGIO = window.ADAGIO || {}; // Global ADAGIO object created by the adapter
export let _ADAGIO_KEY = window.ADAGIO_KEY || ''; // The Adagio api key to call the Adagio API
export let prebidWrappers = []; // Arrays of [wrapper, window] : window[wrapper]
export let prebidWrapper = undefined; // Current Prebid.js wrapper selected - [wrapper, window] : window[wrapper]
export let prebidObject = undefined; // Current Prebid.js object selected
export let prebidVersionDetected = undefined; // Prebid.js version detected for the selected wrapper

window.ckrIframes = window.ckrIframes || []; // Array of iframes detected during the app lifetime
_ADAGIO.ckrViewability = _ADAGIO.ckrViewability || {}; // Local copy of ADAGIO.ckrViewability for security

// Periodically watch for changes on the global ADAGIO.ckrViewability and sync local _ADAGIO
setInterval(() => {
    // Compare ckrViewability and sync when different
    if (window.ADAGIO && ADAGIO.ckrViewability !== _ADAGIO.ckrViewability) {
        console.log('ADAGIO: ', ADAGIO.ckrViewability);
        console.log('_ADAGIO: ', _ADAGIO.ckrViewability);
        _ADAGIO = window.ADAGIO;
    }
}, 500);

export function setPrebidWrapper() {
    // Helper function to check and push valid wrappers, ensuring no duplicates
    const addWrappers = (windowObj, wrapperList) => {
        wrapperList.forEach((wrapper) => {
            const instance = windowObj[wrapper];
            // Only add the wrapper if it's valid and not already in prebidWrappers
            if (
                instance?.version &&
                typeof instance.getEvents === 'function' &&
                !prebidWrappers.some(
                    ([existingWrapper, existingWindow]) =>
                        existingWrapper === wrapper &&
                        existingWindow === windowObj,
                )
            ) {
                prebidWrappers.push([wrapper, windowObj]);
            }
        });
    };

    // Check top window for Prebid wrappers
    if (window._pbjsGlobals) addWrappers(window, window._pbjsGlobals);

    // Check iframes for Prebid wrappers
    Array.from(window.document.getElementsByTagName('iframe')).forEach(
        (iframe) => {
            try {
                const iframeDoc = iframe.contentWindow || {};
                if (iframeDoc._pbjsGlobals) {
                    addWrappers(iframeDoc, iframeDoc._pbjsGlobals);
                }
            } catch (e) {
                // Ignore iframe access errors (cross-origin or others)
                window.ckrIframes.push(iframe);
            }
        },
    );

    // Check ADAGIO versions for hidden wrappers, using addWrappers for consistency
    if (_ADAGIO.versions) {
        addWrappers(
            window,
            Object.keys(_ADAGIO.versions).filter((item) => item !== 'adagiojs'),
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
                const bids =
                    instance
                        .getEvents()
                        ?.filter(
                            (event) => event.eventType === 'bidRequested',
                        ) || [];
                const bidsCount = bids.length;
                const adagioBidsCount = bids.filter((bid) =>
                    bid.bidder?.toLowerCase().includes('adagio'),
                ).length;

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
            prebidWrapper =
                maxAdagioBids > 0
                    ? maxAdagioBidsWrapper
                    : maxBids > 0
                      ? maxBidsWrapper
                      : prebidWrappers[0];
            prebidObject = prebidWrapper[1][prebidWrapper[0]];
            prebidVersionDetected = getPrebidVersion(prebidObject);
        }
    }
};

export function switchToSelectedPrebidWrapper(value) {
    prebidWrapper = prebidWrappers[value];
    prebidObject = prebidWrapper[1][prebidWrapper[0]];
    prebidVersionDetected = getPrebidVersion(prebidObject);
}
