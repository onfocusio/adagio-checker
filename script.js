/*************************************************************************************************************************************************************************************************************************************
 * Global variables
 ************************************************************************************************************************************************************************************************************************************/
// Overlay iframe html object, and iframe document
let overlayFrame = undefined;
let buttonFrame = undefined;
let overlayFrameDoc = undefined;
let buttonFrameDoc = undefined;
// Overlay current state
let overlayVisible = true;
// Prebid.js object, and window.ADAGIO object and events
let prebidObject = undefined;
let prebidWrappers = []; // arrays of [wrapper, window] : window[wrapper]
let prebidWrapper = undefined;
let adagioAdapter = undefined;
let prebidVersion = undefined;
// Prebid events, bids and adUnits
let prebidEvents = undefined;
let prebidBidsRequested = undefined;
let prebidAdagioBidsRequested = undefined;
let prebidBids = undefined;
let prebidBidders = undefined;
let prebidAdUnitsCodes = undefined;
let prebidAdagioAdUnitsCodes = undefined;
let adagioBidsRequested = undefined;
let adagioPbjsAdUnitsCode = [];
let prebidAdagioParams = undefined;
let totalPrebidAdUnitsCodes = 0;
let totalPrebidAdagioAdUnitsCode = 0;
let totalAdagioAdUnitsCodes = 0;
let totalAdagioPbjsAdUnitsCodes = 0;
let organizationIds = [];
let siteNames = [];
// Active tab (from button html element)
let activeTab = undefined;
// Variables for draggable iframe
let isDragging = false;
// Adagio API key detected
let adagioApiKeyfound = false;
// let domainResponseRecords = null;
// let orgIdResponseRecord = null;
let matchedDomainRecords = null;
let matchedSiteNameRecords = null;
let successRecordItems = null;
let MY_BROKENOBJECT = null;
let MY_GOODOBJECT = null;

/*************************************************************************************************************************************************************************************************************************************
 * Enums
 ************************************************************************************************************************************************************************************************************************************/

const ADAGIOSVG = Object.freeze({
    LOGO: '<svg viewBox="0 0 101 92" style="height:1.5em;"><path d="M97 88.598H84.91l-33.473-72.96-.817-1.707-6.398 13.836 28.143 60.916h-12.2l-.106-.237-21.82-47.743-6.428 13.9 15.978 34.08H35.59l-9.802-21.056-9.698 20.97H4L43.109 4H57.89L97 88.598Z"></path></svg>',
    MANAGER: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z"></path></svg>',
    CHECKER: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.83 8.5 7 8.5z"></path></svg>',
    ADUNITS: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM7 4V3h10v1H7zm0 14V6h10v12H7zm0 3v-1h10v1H7z"></path><path d="M16 7H8v2h8V7z"></path></svg>',
    CONSENTS: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M13.17 4 18 8.83V20H6V4h7.17M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.99 0-1.93.21-2.78.58C8.48 15.9 8 16.62 8 17.43V18h8v-.57z"></path></svg>',
    PREBID: '<svg viewBox="0 0 24 24" style="height:1.2em"><g><g><g><path d="M19.973 4.724H.746A.743.743 0 0 1 0 3.978c0-.414.331-.746.746-.746H19.89c.415 0 .746.332.746.746.083.414-.248.746-.663.746z"/></g><g><path d="M27.35 8.868H4.391a.743.743 0 0 1-.745-.746c0-.414.331-.746.745-.746H27.35c.415 0 .746.332.746.746a.743.743 0 0 1-.746.746z"/></g><g><path d="M25.029 21.3H2.072a.743.743 0 0 1-.746-.747c0-.414.332-.745.746-.745h22.957c.414 0 .746.331.746.745 0 .332-.332.746-.746.746z"/></g><g><path d="M17.238 13.012H2.984a.743.743 0 0 1-.746-.746c0-.415.331-.746.746-.746h14.254c.415 0 .746.331.746.746a.743.743 0 0 1-.746.746z"/></g><g><path d="M23.371 17.155H7.045a.743.743 0 0 1-.746-.745c0-.415.331-.746.746-.746H23.37c.415 0 .746.331.746.746 0 .331-.331.745-.746.745z"/></g></g></g></svg>',
    EYEOPENED: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M6.30147 15.5771C4.77832 14.2684 3.6904 12.7726 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C14.1843 6 16.1261 7.07185 17.6986 8.42294C19.2218 9.73158 20.3097 11.2274 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18C9.81574 18 7.87402 16.9282 6.30147 15.5771ZM12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C2.00757 13.8624 3.23268 15.5772 4.99812 17.0941C6.75717 18.6054 9.14754 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C21.9925 10.1376 20.7674 8.42276 19.002 6.90595C17.2429 5.39462 14.8525 4 12 4ZM10 12C10 10.8954 10.8955 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8955 14 10 13.1046 10 12ZM12 8C9.7909 8 8.00004 9.79086 8.00004 12C8.00004 14.2091 9.7909 16 12 16C14.2092 16 16 14.2091 16 12C16 9.79086 14.2092 8 12 8Z"></path></svg>',
    EYECLOSED: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L14.032 8.55382C13.4365 8.20193 12.7418 8 12 8C9.79086 8 8 9.79086 8 12C8 12.7418 8.20193 13.4365 8.55382 14.032L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L9.96803 15.4462C10.5635 15.7981 11.2582 16 12 16C14.2091 16 16 14.2091 16 12C16 11.2582 15.7981 10.5635 15.4462 9.96803L19.7071 5.70711ZM12.518 10.0677C12.3528 10.0236 12.1792 10 12 10C10.8954 10 10 10.8954 10 12C10 12.1792 10.0236 12.3528 10.0677 12.518L12.518 10.0677ZM11.482 13.9323L13.9323 11.482C13.9764 11.6472 14 11.8208 14 12C14 13.1046 13.1046 14 12 14C11.8208 14 11.6472 13.9764 11.482 13.9323ZM15.7651 4.8207C14.6287 4.32049 13.3675 4 12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C1.92276 13.7326 2.86706 15.0637 4.21194 16.3739L5.62626 14.9596C4.4555 13.8229 3.61144 12.6531 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C12.7719 6 13.5135 6.13385 14.2193 6.36658L15.7651 4.8207ZM12 18C11.2282 18 10.4866 17.8661 9.78083 17.6334L8.23496 19.1793C9.37136 19.6795 10.6326 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C22.0773 10.2674 21.133 8.93627 19.7881 7.62611L18.3738 9.04043C19.5446 10.1771 20.3887 11.3469 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18Z"></path></svg>',
    DEBUGGING: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M4.6 15c-.9-2.6-.6-4.6-.5-5.4 2.4-1.5 5.3-2 8-1.3.7-.3 1.5-.5 2.3-.6-.1-.3-.2-.5-.3-.8h2l1.2-3.2-.9-.4-1 2.6h-1.8C13 4.8 12.1 4 11.1 3.4l2.1-2.1-.7-.7L10.1 3c-.7 0-1.5 0-2.3.1L5.4.7l-.7.7 2.1 2.1C5.7 4.1 4.9 4.9 4.3 6H2.5l-1-2.6-.9.4L1.8 7h2C3.3 8.3 3 9.6 3 11H1v1h2c0 1 .2 2 .5 3H1.8L.6 18.3l.9.3 1-2.7h1.4c.4.8 2.1 4.5 5.8 3.9-.3-.2-.5-.5-.7-.8-2.9 0-4.4-3.5-4.4-4zM9 3.9c2 0 3.7 1.6 4.4 3.8-2.9-1-6.2-.8-9 .6.7-2.6 2.5-4.4 4.6-4.4zm14.8 19.2l-4.3-4.3c2.1-2.5 1.8-6.3-.7-8.4s-6.3-1.8-8.4.7-1.8 6.3.7 8.4c2.2 1.9 5.4 1.9 7.7 0l4.3 4.3c.2.2.5.2.7 0 .2-.2.2-.5 0-.7zm-8.8-3c-2.8 0-5.1-2.3-5.1-5.1s2.3-5.1 5.1-5.1 5.1 2.3 5.1 5.1-2.3 5.1-5.1 5.1z"/><path fill="none" d="M0 0h24v24H0z"/></svg>',
    REFRESH: '<svg viewBox="0 0 24 24" style="height:1.2em;"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>',
    INFO: '<svg viewBox="0 0 416.979 416.979" style="height:1.2em;"><path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85 c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786 c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576 c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765 c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"></path></svg>',
    APIGREY: '<svg viewBox="0 0 24 24" style="height:1.2em;"><circle cx="12" cy="12" r="10" fill="grey"/></svg>',
    APIGREEN: '<svg viewBox="0 0 24 24" style="height:1.2em;"><circle cx="12" cy="12" r="10" fill="green"/></svg>',
    APIRED: '<svg viewBox="0 0 24 24" style="height:1.2em;"><circle cx="12" cy="12" r="10" fill="red"/></svg>',
    APIORANGE: '<svg viewBox="0 0 24 24" style="height:1.2em;"><circle cx="12" cy="12" r="10" fill="orange"/></svg>',
});

const ADAGIOTABSNAME = Object.freeze({
    MANAGER: "Manager",
    CHECKER: "Checker",
    ADUNITS: "Adunits",
    CONSENTS: "Consents",
    BUYERUIDS: "BuyerUids",
});

const COLOR = Object.freeze({
    GREENTEXT: "rgb(48 158 133)",
    GREENBACKGROUND: "rgb(226 248 243)",
    REDTEXT: "rgb(179 49 90)",
    REDBACKGROUND: "rgb(253 226 235)",
    YELLOWTEXT: "rgb(180 130 59)",
    YELLOWBACKGROUND: "rgb(253 243 228)",
    BLUETEXT: "rgb(38, 130, 185)",
    BLUEBACKGROUND: "rgb(222, 241, 248)",
    GREYTEXT: "rgb(120, 120, 120)",
    GREYBACKGROUD: "rgb(230, 230, 230)",
});

const STATUSBADGES = Object.freeze({
    OK: `<kbd style="color:${COLOR.GREENTEXT};background-color:${COLOR.GREENBACKGROUND};">OK</kbd>`,
    KO: `<kbd style="color:${COLOR.REDTEXT};background-color:${COLOR.REDBACKGROUND};">KO</kbd>`,
    CHECK: `<kbd style="color:${COLOR.YELLOWTEXT};background-color:${COLOR.YELLOWBACKGROUND};">!?</kbd>`,
    UPDATE: `<kbd style="color:${COLOR.YELLOWTEXT};background-color:${COLOR.YELLOWBACKGROUND};">Update</kbd>`,
    INFO: `<kbd style="color:${COLOR.BLUETEXT};background-color:${COLOR.BLUEBACKGROUND};">Info</kbd>`,
    NA: `<kbd style="color:${COLOR.GREYTEXT};background-color:${COLOR.GREYBACKGROUD};">N/A</kbd>`,
});

const ADAGIOCHECK = Object.freeze({
    ADSERVER: "Adserver",
    PREBID: "Prebid.js (wrapper)",
    ADAPTER: "Adagio adapter",
    ANALYTICS: "Adagio analytics",
    USERIDS: "User IDs (UIDs)",
    LOCALSTORAGE: "Local storage",
    DEVICEACCESS: "9️⃣ Device access",
    ADUNITS: "Adunits",
    DUPLICATED: "Duplicated adUnitCode",
    USERSYNC: "User sync (iframe)",
    FLOORS: "Floors price module",
    CURRENCY: "Currency module",
    SCO: "Supply chain object (SCO)",
    CMP: "Consent management platform (CMP)",
    CONSENT: "Consent metadata",
    GDPR: "GDPR consent string",
    RDTMODULE: "9️⃣ Real time data (RTD)",
    TIDS: "Transaction identifiers (TIDs)",
    ORTB2: "9️⃣ First-party data (ortb2)",
    DSA: "DSA Transparency",
});

const ADAGIOERRORS = Object.freeze({
    PREBIDNOTFOUND: "Prebid.js not found",
});

const ADAGIOLINKS = Object.freeze({
    WEBSITE: "https://app.adagio.io/",
    MANAGER: "https://app.adagio.io/",
});

const ADAGIOPARAMS = {
    ORGANIZATIONID: null,
    SITE: null,
};

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

function run() {;
    createOverlay();
    getPrebidWrappers();
    buildOverlayHtml();
    buildAdagioButton();
    createManagerDiv();
    createCheckerDiv();
    createAdUnitsDiv();
    createConsentsDiv();
    makeIframeDraggable();
    runCheck();
}
run();

/*************************************************************************************************************************************************************************************************************************************
 * HTML functions
 ************************************************************************************************************************************************************************************************************************************/

function createOverlay() {
    // create a new button element
    buttonFrame = window.document.createElement("iframe");
    buttonFrame.setAttribute("id", "adagio-button-frame");
    buttonFrame.style.position = "fixed";
    buttonFrame.style.top = "10px";
    buttonFrame.style.right = "10px";
    buttonFrame.style.width = "45px";
    buttonFrame.style.height = "45px";
    buttonFrame.style.zIndex = "2147483647";
    buttonFrame.style.backgroundColor = "rgb(47, 55, 87)";
    buttonFrame.style.border = "none";
    buttonFrame.style.borderRadius = "10px";
    buttonFrame.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px";
    buttonFrame.style.display = "block";
    window.document.body.appendChild(buttonFrame);

    // create a new iframe element
    overlayFrame = window.document.createElement("iframe");
    buttonFrame.setAttribute("id", "adagio-overlay-frame");
    overlayFrame.classList.add("adagio-overlay");
    overlayFrame.style.position = "fixed";
    overlayFrame.style.top = "10px";
    overlayFrame.style.left = "10px";
    overlayFrame.style.width = "1000px";
    overlayFrame.style.height = "95%";
    overlayFrame.style.zIndex = "2147483647";
    overlayFrame.style.backgroundColor = "transparent";
    overlayFrame.style.border = "none";
    overlayFrame.style.borderRadius = "10px";
    overlayFrame.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px";
    overlayFrame.style.resize = "both";
    overlayFrame.style.display = "block";
    window.document.body.appendChild(overlayFrame);

    if (!overlayVisible) overlayFrame.style.display = "none";
    else buttonFrame.style.opacity = "0.4";

    // get the iframe document objects
    buttonFrameDoc =
        buttonFrame.contentDocument || buttonFrame.contentWindow.document;
    overlayFrameDoc =
        overlayFrame.contentDocument || overlayFrame.contentWindow.document;

    // set the background color
    // overlayFrameDoc.body.style.setProperty('--primary', 'rgb(246, 247, 248)');
    // overlayFrameDoc.body.style.setProperty('--primary-hover', 'rgb(246, 247, 248)');
}

function getPrebidWrappers() {
    
    // Helper function to check and push valid wrappers, ensuring no duplicates
    const addWrappers = (windowObj, wrapperList) => {
        wrapperList.forEach(wrapper => {
            const instance = windowObj[wrapper];
            // Only add the wrapper if it's valid and not already in prebidWrappers
            if (instance?.version && typeof instance.getEvents === 'function' &&
                !prebidWrappers.some(([existingWrapper, existingWindow]) =>
                    existingWrapper === wrapper && existingWindow === windowObj
                )) {
                prebidWrappers.push([wrapper, windowObj]);
            }
        });
    };

    // Check top window for Prebid wrappers
    if (window._pbjsGlobals) addWrappers(window, window._pbjsGlobals);

    // Check iframes for Prebid wrappers
    Array.from(window.document.getElementsByTagName(`iframe`)).forEach(iframe => {
        try {
            const iframeDoc = iframe.contentWindow;
            if (iframeDoc._pbjsGlobals) addWrappers(iframeDoc, iframeDoc._pbjsGlobals);
        } catch (e) {
            // Ignore iframe access errors (cross-origin or others)
        }
    });

    // Check ADAGIO versions for hidden wrappers, using addWrappers for consistency
    if (adagioAdapter !== undefined && adagioAdapter?.versions !== undefined) {
        addWrappers(window, Object.keys(adagioAdapter.versions).filter(item => item !== 'adagiojs'));
    }

    // Pre-select the wrapper based on adagio bidrequests, or name 'pbjs'
    if (prebidWrappers.length !== 0) {
        let maxAdagioBids, maxBids = 0;
        let maxAdagioBidsWrapper, maxBidsWrapper = null; // prebidWrappers[0];

        prebidWrappers.forEach(([wrapper, win]) => {
            const instance = win[wrapper];
            if (instance?.getEvents) {
                const bids = instance.getEvents()?.filter(event => event.eventType === "bidRequested") || [];
                const bidsCount = bids.length;
                const adagioBidsCount = bids.filter(bid => bid.bidder?.toLowerCase().includes("adagio")).length;

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
            prebidWrapper = maxAdagioBids > 0 ? maxAdagioBidsWrapper :
                    maxBids > 0 ? maxBidsWrapper :
                    prebidWrappers[0];
            prebidObject = prebidWrapper[1][prebidWrapper[0]];
        }
    }
}

function buildOverlayHtml() {
    // append pico style
    const picoStyle = overlayFrameDoc.createElement("link");
    picoStyle.setAttribute("rel", "stylesheet");
    picoStyle.setAttribute(
        "href",
        "https://unpkg.com/@picocss/pico@1.5.7/css/pico.min.css",
    );

    // create navigation element
    const nav = buildNavBar();
    nav.appendChild(buildAdagioLogo());

    // create second unordered list inside navigation
    const ul = overlayFrameDoc.createElement("ul");
    ul.appendChild(
        buildTabButton(ADAGIOTABSNAME.MANAGER, ADAGIOSVG.MANAGER, false),
    );
    ul.appendChild(
        buildTabButton(ADAGIOTABSNAME.CHECKER, ADAGIOSVG.CHECKER, true),
    );
    ul.appendChild(
        buildTabButton(ADAGIOTABSNAME.ADUNITS, ADAGIOSVG.ADUNITS, false),
    );
    ul.appendChild(
        buildTabButton(ADAGIOTABSNAME.CONSENTS, ADAGIOSVG.CONSENTS, false),
    );
    ul.appendChild(
        buildApiButton("API status", ADAGIOSVG.APIGREY, true),
    );
    ul.appendChild(
        buildPrebidButton("Prebid versions detected", ADAGIOSVG.PREBID, true),
    );
    ul.appendChild(
        buildDebuggingButton("Enable debbug mode and reload page",ADAGIOSVG.DEBUGGING,true,),
    );
    ul.appendChild(
        buildRefreshButton("Refresh", ADAGIOSVG.REFRESH, true),
    );

    // append unordered lists to navigation
    nav.appendChild(ul);

    // append main containers to iframeDoc body
    overlayFrameDoc.head.appendChild(picoStyle);
    overlayFrameDoc.body.appendChild(nav);
}

function buildNavBar() {
    // create navigation element
    const nav = overlayFrameDoc.createElement("nav");
    nav.classList.add("container-fluid");
    nav.setAttribute("id", "adagio-nav");
    nav.style.zIndex = "99";
    nav.style.position = "fixed";
    nav.style.top = "0";
    nav.style.right = "0";
    nav.style.left = "0";
    nav.style.padding = "0 var(--spacing)";
    nav.style.backgroundColor = "var(--card-background-color)";
    nav.style.boxShadow = "var(--card-box-shadow)";
    return nav;
}

function buildAdagioButton() {
    // button to hide and show the iframe
    const a = buttonFrameDoc.createElement("a");
    a.innerHTML = ADAGIOSVG.LOGO;
    a.style.fill = "white";
    buttonFrameDoc.body.appendChild(a);

    buttonFrameDoc.querySelector("html").style.cursor = "pointer";
    buttonFrameDoc.querySelector("html").addEventListener("click", () => {
        if (overlayVisible) {
            overlayVisible = false;
            overlayFrame.style.display = "none";
            buttonFrame.style.opacity = "";
        } else {
            overlayVisible = true;
            overlayFrame.style.display = "";
            buttonFrame.style.opacity = "0.4";
        }
    });
}

function buildAdagioLogo() {
    // create first unordered list inside navigation
    const ul = overlayFrameDoc.createElement("ul");
    const li = overlayFrameDoc.createElement("li");
    const a = overlayFrameDoc.createElement("a");
    a.setAttribute("href", ADAGIOLINKS.WEBSITE);
    a.setAttribute("target", "_blank");
    a.innerHTML = ADAGIOSVG.LOGO;
    li.appendChild(a);
    ul.appendChild(li);
    return ul;
}

function buildTabButton(name, svg, isactive) {
    const tabName = name.toLowerCase().replace(" ", "-");
    const li = overlayFrameDoc.createElement("li");
    const tabButton = overlayFrameDoc.createElement("button");
    tabButton.setAttribute("id", `${tabName}-button`);
    tabButton.innerHTML = svg;
    tabButton.innerHTML += ` ${name} `;
    tabButton.addEventListener("click", () => switchTab(tabName));
    if (!isactive) tabButton.classList.add("outline");
    else activeTab = tabName;
    tabButton.style.padding = "0.3em";
    tabButton.style.textTransform = "uppercase";
    tabButton.style.fontSize = "0.85em";
    li.appendChild(tabButton);
    return li;
}

function buildPrebidButton(name, svg, isactive) {
    // Get the number of wrapper found
    let nbWrappers = prebidWrappers.length;

    // As website can use different wrapper for Prebid, this button allows to switch between them
    const li = overlayFrameDoc.createElement("li");
    const button = overlayFrameDoc.createElement("button");
    button.setAttribute("title", name);
    // Disabled button if no wrapper found
    if (!isactive || nbWrappers === 0) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener("click", () => displayAdunits(button));
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.position = "relative";
    button.style.display = "inline-block";
    button.style.padding = "0.3em";

    // If more than one wrapper, display a badge with the number of wrappers found
    const badge = overlayFrameDoc.createElement("span");
    badge.style.position = "absolute";
    badge.style.top = "-10px";
    badge.style.right = "-10px";
    badge.style.padding = "0.5em 0.9em";
    badge.style.borderRadius = "50%";
    badge.style.fontSize = "0.6em";
    badge.style.background = COLOR.REDBACKGROUND;
    badge.style.color = COLOR.REDTEXT;
    badge.innerHTML = nbWrappers;
    // Shows number if more than 1
    if (nbWrappers < 2) badge.style.display = "none";

    // On click, a modal appears to select the wrapper and work on the according Prebid object
    const dialog = overlayFrameDoc.createElement("dialog");
    dialog.setAttribute("open", false);
    const article = overlayFrameDoc.createElement("article");
    const header = overlayFrameDoc.createElement("header");
    const closeLink = overlayFrameDoc.createElement("a");
    closeLink.setAttribute("aria-label", "Close");
    closeLink.classList.add("close");
    header.innerHTML = "Prebid wrappers detected";
    const paragraph = overlayFrameDoc.createElement("p");

    // Add eventlistner to show and hide the modal
    closeLink.addEventListener("click", () => {
        dialog.setAttribute("open", false);
    });
    button.addEventListener("click", () => {
        dialog.setAttribute("open", true);
    });

    // Append elements
    li.appendChild(button);
    button.appendChild(badge);
    overlayFrameDoc.body.appendChild(dialog);
    dialog.appendChild(article);
    article.appendChild(header);
    header.appendChild(closeLink);
    article.appendChild(paragraph);

    // Fill the modal with the list Prebid wrappers found
    for (let i = 0; i < nbWrappers; i++) {
        // Create the radio button for the current wrapper item
        const item = prebidWrappers[i];

        const wrapperItem = overlayFrameDoc.createElement("div");
        const itemInput = overlayFrameDoc.createElement("input");
        itemInput.setAttribute("type", "radio");
        itemInput.setAttribute("value", i);
        itemInput.setAttribute("name", "radio-group"); // added the 'name' attribute
        // itemInput.setAttribute('id', `${item.replace(' ', '-')}-wrapper`)
        const itemLabel = overlayFrameDoc.createElement("label");
        itemLabel.setAttribute("for", i);
        itemLabel.innerHTML = item[0];
        if (prebidWrappers[i][1] !== window) itemLabel.innerHTML += " (iframe)";

        // If current wrapper is the used one at the moment, check the radio
        if (prebidWrapper[0] === item[0] && Object.is(prebidWrapper[1], item[1])) {
            itemInput.checked = true;
        }

        itemInput.addEventListener("click", function() {
            if (itemInput.checked) {
                prebidWrapper = prebidWrappers[itemInput.value];
                prebidObject = prebidWrapper[1][prebidWrapper[0]];
                refreshChecker();
            }
        });

        // Append the wrapper item
        paragraph.appendChild(wrapperItem);
        wrapperItem.appendChild(itemInput);
        wrapperItem.appendChild(itemLabel);
    }

    return li;
}

function buildOverlayButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement("li");
    const button = overlayFrameDoc.createElement("button");
    button.setAttribute("title", name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener("click", () => displayAdunits(button));
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.padding = "0.3em";
    li.appendChild(button);
    return li;
}

function buildDebuggingButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement("li");
    const button = overlayFrameDoc.createElement("button");
    button.setAttribute("title", name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener("click", () => loadDebuggingMode());
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.padding = "0.3em";
    li.appendChild(button);
    return li;
}

function buildApiButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement("li");
    const button = overlayFrameDoc.createElement("button");
    button.setAttribute("id", "apiButton");
    button.setAttribute("title", name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.padding = "0.3em";
    li.appendChild(button);
    return li;
}

function buildRefreshButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement("li");
    const button = overlayFrameDoc.createElement("button");
    button.setAttribute("title", name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener("click", () => refreshChecker());
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.padding = "0.3em";
    li.appendChild(button);
    return li;
}

function createManagerDiv() {
    // build id name
    const tabName = ADAGIOTABSNAME.MANAGER.toLowerCase().replace(" ", "-");

    // create main container element
    const mainContainer = overlayFrameDoc.createElement("div");
    mainContainer.setAttribute("id", `${tabName}-container`);
    mainContainer.style.display = "none";
    mainContainer.style.paddingTop = "3rem";
    mainContainer.style.paddingBottom = "0";

    // create the iframe
    const managerIframe = overlayFrameDoc.createElement("iframe");
    managerIframe.setAttribute("id", `${tabName}-iframe`);
    managerIframe.setAttribute("src", ADAGIOLINKS.MANAGER);
    managerIframe.setAttribute("aria-busy", "true");
    managerIframe.style.width = "100%";
    managerIframe.style.height = "100%";

    // append the container to the body
    mainContainer.appendChild(managerIframe);
    overlayFrameDoc.body.appendChild(mainContainer);
}

function createCheckerDiv() {
    // build id name
    const tabName = ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-");

    // create main container element
    const mainContainer = overlayFrameDoc.createElement("main");
    mainContainer.classList.add("container-fluid");
    mainContainer.setAttribute("id", `${tabName}-container`);
    mainContainer.style.paddingTop = "5rem";
    mainContainer.style.paddingBottom = "0";

    // create headings container
    const headings = overlayFrameDoc.createElement("div");
    headings.classList.add("headings");

    const h2 = overlayFrameDoc.createElement("h2");
    h2.textContent = "Integration checker";
    const h3 = overlayFrameDoc.createElement("h3");
    h3.textContent = "Expectations for a proper Adagio integration";
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article and text
    const alertContainer = overlayFrameDoc.createElement("article");
    alertContainer.style.padding = "1em";
    alertContainer.style.marginLeft = "";
    alertContainer.style.marginRight = "";
    alertContainer.style.marginTop = "1em";
    alertContainer.style.marginBottom = "1em";
    alertContainer.style.color = COLOR.YELLOWTEXT;
    alertContainer.style.backgroundColor = COLOR.YELLOWBACKGROUND;

    const alertTextDiv = overlayFrameDoc.createElement("div");
    alertTextDiv.setAttribute("id", `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create table element
    const table = overlayFrameDoc.createElement("table");
    const thead = overlayFrameDoc.createElement("thead");
    const tr = overlayFrameDoc.createElement("tr");
    const th1 = overlayFrameDoc.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = "Status";
    const th2 = overlayFrameDoc.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = "Name";
    const th3 = overlayFrameDoc.createElement("th");
    th3.setAttribute("scope", "col");
    th3.textContent = "Details";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    const tbody = overlayFrameDoc.createElement("tbody");
    tbody.setAttribute("id", `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);
    mainContainer.appendChild(table);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

function createAdUnitsDiv() {
    // build id name
    const tabName = ADAGIOTABSNAME.ADUNITS.toLowerCase().replace(" ", "-");

    // create main container element
    const mainContainer = overlayFrameDoc.createElement("main");
    mainContainer.classList.add("container-fluid");
    mainContainer.setAttribute("id", `${tabName}-container`);
    mainContainer.style.display = "none";
    mainContainer.style.paddingTop = "5rem";
    mainContainer.style.paddingBottom = "0";

    // create headings container
    const headings = overlayFrameDoc.createElement("div");
    headings.classList.add("headings");
    const h2 = overlayFrameDoc.createElement("h2");
    h2.textContent = "AdUnits";
    const h3 = overlayFrameDoc.createElement("h3");
    h3.textContent = "Bid requested for each adUnit and by bidders";
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article
    const alertContainer = overlayFrameDoc.createElement("article");
    alertContainer.style.padding = "1em";
    alertContainer.style.marginLeft = "";
    alertContainer.style.marginRight = "";
    alertContainer.style.marginTop = "1em";
    alertContainer.style.marginBottom = "1em";
    alertContainer.style.color = COLOR.YELLOWTEXT;
    alertContainer.style.backgroundColor = COLOR.YELLOWBACKGROUND;

    const alertTextDiv = overlayFrameDoc.createElement("div");
    alertTextDiv.setAttribute("id", `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create bidder filter
    const bidderFilter = overlayFrameDoc.createElement("details");
    bidderFilter.setAttribute("role", "list");
    const selectFilter = overlayFrameDoc.createElement("summary");
    selectFilter.setAttribute("aria-haspopup", "listbox");
    selectFilter.textContent = "Filter requested bids by bidders";
    const ulFilter = overlayFrameDoc.createElement("ul");
    ulFilter.setAttribute("role", "listbox");
    ulFilter.setAttribute("id", "bidderFilter");
    bidderFilter.appendChild(selectFilter);
    bidderFilter.appendChild(ulFilter);

    // create table element
    const table = overlayFrameDoc.createElement("table");
    const thead = overlayFrameDoc.createElement("thead");
    const tr = overlayFrameDoc.createElement("tr");
    const th0 = overlayFrameDoc.createElement("th");
    th0.setAttribute("scope", "col");
    th0.textContent = "Status";
    const th1 = overlayFrameDoc.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = "Code";
    const th2 = overlayFrameDoc.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = "Mediatypes";
    const th3 = overlayFrameDoc.createElement("th");
    th3.setAttribute("scope", "col");
    th3.textContent = "🔎 Bidder params";
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = overlayFrameDoc.createElement("tbody");
    tbody.setAttribute("id", `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);
    mainContainer.appendChild(bidderFilter);
    mainContainer.appendChild(table);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

function createConsentsDiv() {
    // build id name
    const tabName = ADAGIOTABSNAME.CONSENTS.toLowerCase().replace(" ", "-");

    // create main container element
    const mainContainer = overlayFrameDoc.createElement("main");
    mainContainer.classList.add("container-fluid");
    mainContainer.setAttribute("id", `${tabName}-container`);
    mainContainer.style.display = "none";
    mainContainer.style.paddingTop = "5rem";
    mainContainer.style.paddingBottom = "0";

    // create headings container
    const headings = overlayFrameDoc.createElement("div");
    headings.classList.add("headings");

    const h2 = overlayFrameDoc.createElement("h2");
    h2.textContent = "Consents";
    const h3 = overlayFrameDoc.createElement("h3");
    h3.textContent = "Consents managemement platform for Adagio partners";
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create table element
    const table = overlayFrameDoc.createElement("table");
    const thead = overlayFrameDoc.createElement("thead");
    const tr = overlayFrameDoc.createElement("tr");
    const th1 = overlayFrameDoc.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = "Partner";
    const th2 = overlayFrameDoc.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = "Consent";
    const th3 = overlayFrameDoc.createElement("th");
    th3.setAttribute("scope", "col");
    th3.textContent = "Legitimate";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    const tbody = overlayFrameDoc.createElement("tbody");
    tbody.setAttribute("id", `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(table);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

function createBuyerUidsDiv() {
    // build id name
    const tabName = ADAGIOTABSNAME.BUYERUIDS.toLowerCase().replace(" ", "-");

    // create main container element
    const mainContainer = overlayFrameDoc.createElement("main");
    mainContainer.classList.add("container-fluid");
    mainContainer.setAttribute("id", `${tabName}-container`);
    mainContainer.style.display = "none";
    mainContainer.style.paddingTop = "5rem";
    mainContainer.style.paddingBottom = "0";

    // create headings container
    const headings = overlayFrameDoc.createElement("div");
    headings.classList.add("headings");

    const h2 = overlayFrameDoc.createElement("h2");
    h2.textContent = "Consents";
    const h3 = overlayFrameDoc.createElement("h3");
    h3.textContent = "User synchronization for Adagio partners";
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create table element
    const table = overlayFrameDoc.createElement("table");
    const thead = overlayFrameDoc.createElement("thead");
    const tr = overlayFrameDoc.createElement("tr");
    const th1 = overlayFrameDoc.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = "Partner";
    const th2 = overlayFrameDoc.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = "Uids";
    const th3 = overlayFrameDoc.createElement("th");
    th3.setAttribute("scope", "col");
    th3.textContent = "Sync";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    const tbody = overlayFrameDoc.createElement("tbody");
    tbody.setAttribute("id", `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(table);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

function switchTab(tabName) {
    // switch visible div and button outline
    if (tabName !== activeTab) {
        goTopPage();
        const activeTabButton = overlayFrameDoc.getElementById(
            `${activeTab}-button`,
        );
        const activeTabContainer = overlayFrameDoc.getElementById(
            `${activeTab}-container`,
        );
        const targetTabButton = overlayFrameDoc.getElementById(
            `${tabName}-button`,
        );
        const targetTabContainer = overlayFrameDoc.getElementById(
            `${tabName}-container`,
        );
        targetTabButton.classList.remove("outline");
        activeTabButton.classList.add("outline");
        targetTabContainer.style.display = "";
        activeTabContainer.style.display = "none";
        activeTab = tabName;
    }
}

function goTopPage() {
    overlayFrameDoc.body.scrollTop = 0;
}

function appendCheckerRow(status, name, details) {
    // build id name
    const tabName = ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-");
    // get the tbody element
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);
    // Create the row
    const newRow = overlayFrameDoc.createElement("tr");
    // Create the cells
    const statusCell = overlayFrameDoc.createElement("td");
    const nameCell = overlayFrameDoc.createElement("td");
    const detailsCell = overlayFrameDoc.createElement("td");
    // Fill the cells
    statusCell.innerHTML = status;
    nameCell.innerHTML = name;
    detailsCell.innerHTML = details;
    // Add the cells
    tableBody.appendChild(newRow);
    newRow.appendChild(statusCell);
    newRow.appendChild(nameCell);
    newRow.appendChild(detailsCell);
}

function appendAdUnitsRow(bidders, bids) {
    // check if Adagio is detected and get bidder name
    let adagioId = "";
    if (prebidAdagioBidsRequested.length > 0)
        adagioId = prebidAdagioBidsRequested[0].bidder;

    // build id name
    const tabName = ADAGIOTABSNAME.ADUNITS.toLowerCase().replace(" ", "-");
    // gets working element element
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

    // fill the article section
    alertTextDiv.innerHTML = "<small>Adunit(s) found:</small> ";
    if (prebidAdUnitsCodes !== undefined && totalPrebidAdUnitsCodes > 0) {
        for (const adUnitCode of prebidAdUnitsCodes) {
            alertTextDiv.innerHTML += `<small> <code>${adUnitCode}</code>;</small>`;
        }
    } else alertTextDiv.innerHTML += `<small><kbd> 0</kbd></small>`;

    // Fill the table section
    bids.forEach((bid) => {

        // Gather the initial info: code, type, bidder
        const adUnitCode = bid.adUnitCode;
        const mediaTypes = bid.mediaTypes;
        const bidderId = bid.bidder;

        // Checks if the concerned bidder is Adagio
        const bidderAdagioDetected = bidderId.toLowerCase().includes('adagio');

        // Build the bid checking array and compute the adunit status
        let paramsCheckingArray = [];
        if (bidderAdagioDetected) buildParamsCheckingArray(bid, paramsCheckingArray);
        const status = bidderAdagioDetected ? computeAdUnitStatus(paramsCheckingArray) : STATUSBADGES.NA;

        // Create the row
        const newRow = overlayFrameDoc.createElement("tr");
        newRow.classList.add(`${bidderId.replace(" ", "-")}-bid`);
        // hides the row if adagio found
        if (adagioId !== "" && adagioId !== bidderId) {
            newRow.style.display = "none";
        }

        // Create the cells
        const statusCell = overlayFrameDoc.createElement("td");
        const codeCell = overlayFrameDoc.createElement("td");
        const mediatypesCell = overlayFrameDoc.createElement("td");
        const bidderIdCell = overlayFrameDoc.createElement("td");
        const bidderParamButton = overlayFrameDoc.createElement("kbd");
        bidderParamButton.addEventListener("click", () =>
            createBidderParamsModal(bid, paramsCheckingArray, bidderAdagioDetected),
        );
        bidderParamButton.style.cursor = "pointer";

        statusCell.innerHTML = status;
        codeCell.innerHTML = `<code>${adUnitCode}</code>`;
        for (const mediaType in mediaTypes) {
            if (mediaTypes[mediaType]?.context) mediatypesCell.innerHTML += `<code>${mediaTypes[mediaType].context}</code> `;
            else mediatypesCell.innerHTML += `<code>${mediaType}</code> `;
        }
        bidderParamButton.innerHTML = `🔎 ${bidderId}`;

        // Add the cells
        newRow.appendChild(statusCell);
        newRow.appendChild(codeCell);
        newRow.appendChild(mediatypesCell);
        newRow.appendChild(bidderIdCell);
        bidderIdCell.appendChild(bidderParamButton);
        tableBody.appendChild(newRow);
    });

    // fill the filter dropdown list
    const bidderFilter = overlayFrameDoc.getElementById("bidderFilter");

    bidders.forEach((bidder) => {
        const libidder = overlayFrameDoc.createElement("li");
        const labbidder = overlayFrameDoc.createElement("label");
        const inputbidder = overlayFrameDoc.createElement("input");
        inputbidder.setAttribute("type", "checkbox");
        inputbidder.setAttribute("id", `${bidder.replace(" ", "-")}-bidder`);
        bidderFilter.appendChild(libidder);
        libidder.appendChild(labbidder);
        labbidder.appendChild(inputbidder);
        labbidder.innerHTML += `<code>${bidder}</code>`;

        const newInput = overlayFrameDoc.getElementById(
            `${bidder.replace(" ", "-")}-bidder`,
        );
        if (adagioId !== "" && adagioId !== bidder) newInput.checked = false;
        else newInput.checked = true;
        newInput.addEventListener("click", function() {
            toggleBidRow(newInput, bidder);
        });
    });
}

function toggleBidRow(inputbidder, bidder) {
    // Depending on checkbox, hide or show bidrequested for the bidder
    const bidderRows = overlayFrameDoc.getElementsByClassName(
        `${bidder.replace(" ", "-")}-bid`,
    );
    for (const bidderRow of bidderRows) {
        if (inputbidder.checked === false) {
            bidderRow.style.display = "none";
        } else {
            bidderRow.style.display = "";
        }
    }
}

function appendConsentsRow(bidderName, bidderConsent, bidderLegitimate) {
    // build id name
    const tabName = ADAGIOTABSNAME.CONSENTS.toLowerCase().replace(" ", "-");
    // get the tbody element
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);

    // Create the row
    const newRow = overlayFrameDoc.createElement("tr");

    // Create the cells
    const bidderNameCell = overlayFrameDoc.createElement("td");
    const bidderConsentCell = overlayFrameDoc.createElement("td");
    const bidderLegitimateCell = overlayFrameDoc.createElement("td");

    // Fill the cells
    bidderNameCell.innerHTML = bidderName;
    bidderConsentCell.innerHTML = bidderConsent;
    bidderLegitimateCell.innerHTML = bidderLegitimate;

    // Add the cells
    tableBody.appendChild(newRow);
    newRow.appendChild(bidderNameCell);
    newRow.appendChild(bidderConsentCell);
    newRow.appendChild(bidderLegitimateCell);
}

function loadDebuggingMode() {
    window.localStorage.setItem("ADAGIO_DEV_DEBUG", true);
    let url = window.location.href.indexOf("?pbjs_debug=true") ?
        window.location.href + "?pbjs_debug=true" :
        window.location.href;
    window.location.href = url;
}

function refreshChecker() {
    // Remove the adagio-button-frame and adagio-overlay-frame elements if they exist
    const buttonFrameElement = document.getElementById("adagio-button-frame");
    if (buttonFrameElement) {
        buttonFrameElement.remove();
    }
    const overlayFrameElement = document.getElementById("adagio-overlay-frame");
    if (overlayFrameElement) {
        overlayFrameElement.remove();
    }
    // Then re-run the checker
    run();
}

function displayAdunits(eyeButton) {
    /*
     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L14.032 8.55382C13.4365 8.20193 12.7418 8 12 8C9.79086 8 8 9.79086 8 12C8 12.7418 8.20193 13.4365 8.55382 14.032L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L9.96803 15.4462C10.5635 15.7981 11.2582 16 12 16C14.2091 16 16 14.2091 16 12C16 11.2582 15.7981 10.5635 15.4462 9.96803L19.7071 5.70711ZM12.518 10.0677C12.3528 10.0236 12.1792 10 12 10C10.8954 10 10 10.8954 10 12C10 12.1792 10.0236 12.3528 10.0677 12.518L12.518 10.0677ZM11.482 13.9323L13.9323 11.482C13.9764 11.6472 14 11.8208 14 12C14 13.1046 13.1046 14 12 14C11.8208 14 11.6472 13.9764 11.482 13.9323ZM15.7651 4.8207C14.6287 4.32049 13.3675 4 12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C1.92276 13.7326 2.86706 15.0637 4.21194 16.3739L5.62626 14.9596C4.4555 13.8229 3.61144 12.6531 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C12.7719 6 13.5135 6.13385 14.2193 6.36658L15.7651 4.8207ZM12 18C11.2282 18 10.4866 17.8661 9.78083 17.6334L8.23496 19.1793C9.37136 19.6795 10.6326 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C22.0773 10.2674 21.133 8.93627 19.7881 7.62611L18.3738 9.04043C19.5446 10.1771 20.3887 11.3469 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18Z" fill="#000000"></path> </g></svg>
    */
    adagioPbjsAdUnitsCode.forEach((adagioAdUnit) => {
        for (const bid in adagioAdUnit.bids) {
            const adUnitElementId =
                adagioAdUnit.bids[bid].params["adUnitElementId"];
            const originalDiv = window.document.getElementById(adUnitElementId);
            // Create a new div element
            const newDiv = window.document.createElement("div");
            newDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            // Add the new div as a parent of the original div
            originalDiv.parentNode.insertBefore(newDiv, originalDiv);
            newDiv.appendChild(originalDiv);
        }
    });
}

function createBidderParamsModal(bid, paramsCheckingArray, bidderAdagioDetected) {
    // Create a dialog window showing the params of the bidrequest.
    const dialog = overlayFrameDoc.createElement("dialog");
    dialog.setAttribute("open", true);

    const article = overlayFrameDoc.createElement("article");
    article.style.maxWidth = "100%";
    const header = overlayFrameDoc.createElement("header");
    header.innerHTML = `<code>${bid.bidder}</code>: <code>${bid.adUnitCode} (${Object.keys(bid.mediaTypes)})</code>`;
    header.style.marginBottom = "0px";
    const closeLink = overlayFrameDoc.createElement("a");
    closeLink.setAttribute("aria-label", "Close");
    closeLink.classList.add("close");
    closeLink.addEventListener("click", () => {
        dialog.remove();
    });

    article.appendChild(header);
    header.appendChild(closeLink);

    // If the bidder is Adagio, we display the params checking
    if (bidderAdagioDetected) {
        const parametersCheckTable = overlayFrameDoc.createElement("p");
        createParametersCheckTable(parametersCheckTable, paramsCheckingArray);
        article.appendChild(parametersCheckTable);
    }    

    // Display the bidrequest json from pbjs.getEvents()
    const paragraph = overlayFrameDoc.createElement("p");
    paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(bid, null, 2)}</code></pre>`;

    article.appendChild(paragraph);
    dialog.appendChild(article);
    overlayFrameDoc.body.appendChild(dialog);
}

function updateManagerFilters(params) {
    ADAGIOPARAMS.ORGANIZATIONID = params.organizationId;
    ADAGIOPARAMS.SITE = params.site;

    let managerURL = "https://app.adagio.io/";
    if (ADAGIOPARAMS.ORGANIZATIONID !== null) {
        managerURL += `publishers/${ADAGIOPARAMS.ORGANIZATIONID}/`;
        if (ADAGIOPARAMS.SITE !== null) {
            managerURL += `dashboards/41?filters=inventoryWebsiteName=${ADAGIOPARAMS.SITE};`;
        }
    }

    // build id name
    const tabName = ADAGIOTABSNAME.MANAGER.toLowerCase().replace(" ", "-");
    const managerIframe = overlayFrameDoc.getElementById(`${tabName}-iframe`);
    managerIframe.setAttribute("src", managerURL);
}

function makeIframeDraggable() {
    // Gets elements IDs
    const navbar = overlayFrameDoc.getElementById("adagio-nav");
    let targetElement = undefined;

    // Set up start x, y
    let startX = 0;
    let startY = 0;

    navbar.addEventListener("mousedown", startDragging);
    navbar.addEventListener("mouseup", stopDragging);
    navbar.addEventListener("mouseover", updateCursor);
    overlayFrame.addEventListener("mouseup", stopDragging);

    function updateCursor(e) {
        targetElement = e.target.tagName;
        if (
            targetElement === "NAV" ||
            targetElement === "UL" ||
            targetElement === "LI"
        ) {
            navbar.style.cursor = "grab";
        } else navbar.style.cursor = "default";
    }

    function startDragging(e) {
        targetElement = e.target.tagName;
        if (
            targetElement === "NAV" ||
            targetElement === "UL" ||
            targetElement === "LI"
        ) {
            isDragging = true;
            navbar.style.cursor = "grabbing";
            overlayFrame.style.opacity = "0.4";
            startX = e.clientX;
            startY = e.clientY;
        }
    }

    function stopDragging() {
        isDragging = false;
        navbar.style.cursor = "grab";
        overlayFrame.style.opacity = "";
    }

    overlayFrameDoc.addEventListener("mousemove", function(e) {
        if (!isDragging) {
            return;
        }
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const iframeRect = overlayFrame.getBoundingClientRect();
        const iframeX = iframeRect.left;
        const iframeY = iframeRect.top;
        overlayFrame.style.left = iframeX + deltaX + "px";
        overlayFrame.style.top = iframeY + deltaY + "px";
    });
}

function base64Decode(base64String) {
    var base64 =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var bufferLength = base64String.length * 0.75;
    var len = base64String.length;
    var decodedBytes = new Uint8Array(bufferLength);

    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    for (var i = 0; i < len; i += 4) {
        encoded1 = base64.indexOf(base64String[i]);
        encoded2 = base64.indexOf(base64String[i + 1]);
        encoded3 = base64.indexOf(base64String[i + 2]);
        encoded4 = base64.indexOf(base64String[i + 3]);

        decodedBytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        decodedBytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        decodedBytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return new TextDecoder().decode(decodedBytes);
}

function createParametersCheckTable(paragraph, paramsCheckingArray) {

    // Create the alert text
    // create the alert article
    const alertContainer = overlayFrameDoc.createElement("article");
    alertContainer.style.padding = "1em";
    alertContainer.style.marginLeft = "";
    alertContainer.style.marginRight = "";
    alertContainer.style.marginTop = "1em";
    alertContainer.style.marginBottom = "1em";
    alertContainer.style.color = COLOR.YELLOWTEXT;
    alertContainer.style.backgroundColor = COLOR.YELLOWBACKGROUND;

    // Create the parameter checker table
    const table = overlayFrameDoc.createElement("table");
    const thead = overlayFrameDoc.createElement("thead");
    const tr = overlayFrameDoc.createElement("tr");
    const th1 = overlayFrameDoc.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = "Status";
    const th2 = overlayFrameDoc.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = "Parameter";
    const th3 = overlayFrameDoc.createElement("th");
    th3.setAttribute("scope", "col");
    th3.textContent = "Details";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = overlayFrameDoc.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);

    /// HERE WAS THE PARAMS CHECKING (todo)
    for (let item of paramsCheckingArray) {
        const status = item[0];
        const parameter = item[1];
        const details = item[2];
        appendParametersCheckerTableRow(tbody, status, parameter, details);
    }

    // paragraph.appendChild(alertContainer);
    paragraph.appendChild(table);
}

function appendParametersCheckerTableRow(tbody, status, parameter, details) {
    // Create the row
    const newRow = overlayFrameDoc.createElement("tr");
    // Create the cells
    const statusCell = overlayFrameDoc.createElement("td");
    const parameterCell = overlayFrameDoc.createElement("td");
    const detailsCell = overlayFrameDoc.createElement("td");
    // Fill the cells
    statusCell.innerHTML = status;
    parameterCell.innerHTML = parameter;
    detailsCell.innerHTML = details;
    // Add the cells
    tbody.appendChild(newRow);
    newRow.appendChild(statusCell);
    newRow.appendChild(parameterCell);
    newRow.appendChild(detailsCell);
}

// Depending on the Prebid version, a misconfiguration is or is not an issue
function computeBadgeToDisplay(isError, minVersion, maxVersion) {
    // Handle 'null' values for minVersion and maxVersion
    const min = minVersion === null ? -Infinity : minVersion;
    const max = maxVersion === null ? Infinity : maxVersion;

    if (isError === "warn") {
        if (prebidVersion >= min && prebidVersion <= max) {
            return STATUSBADGES.CHECK;
        }
        return STATUSBADGES.INFO;
    } else if (isError) {
        if (prebidVersion >= min && prebidVersion <= max) {
            return STATUSBADGES.KO;
        }
        return STATUSBADGES.INFO;
    } else {
        return STATUSBADGES.OK;
    }
}

function catchBidRequestsGlobalParams() {
    // Catch orgIds detected in the Adagio prebid traffic (used by API and adUnits tab)
    if (prebidWrapper !== undefined) {
        // Gets lists of Prebid events
        prebidEvents = prebidObject.getEvents();
        // Gets bidrequest arguments
        prebidBidsRequested = prebidEvents
            .filter((e) => e.eventType === "bidRequested")
            .map((e) => e.args);
        // Gets flat list of bids
        prebidBids = prebidBidsRequested.map((e) => e.bids).flat();
        // Gets the Adagio bids requested
        prebidAdagioBidsRequested = prebidBids.filter((e) =>
            e.bidder?.toLowerCase()?.includes("adagio"),
        );
        // Find the params for Adagio adUnits and update manager URL
        prebidAdagioParams = prebidAdagioBidsRequested.map((e) => e.params);
        if (prebidAdagioParams.length !== 0) {
            // Clear the array before filling it (usefull after wrapper switch)
            organizationIds = [];
            // Get all the orgId parameter value sent to fill organizationIds[]
            for (const param in prebidAdagioParams) {
                let paramOrganizationId =
                    prebidAdagioParams[param]?.organizationId;
                if (
                    paramOrganizationId !== undefined &&
                    !organizationIds.includes(paramOrganizationId)
                )
                    organizationIds.push(paramOrganizationId);
            }
            // Clear the array before filling it (usefull after wrapper switch)
            siteNames = [];
            // Get all the siteName parameter value sent to fill siteNames[]
            for (const param in prebidAdagioParams) {
                let paramSiteName = prebidAdagioParams[param]?.site;
                if (
                    paramSiteName !== undefined &&
                    !siteNames.includes(paramSiteName)
                )
                    siteNames.push(paramSiteName);
            }
        }
    }
}

function buildParamsCheckingArray(bid, paramsCheckingArray) {
    
    // Check the adagio bidder params (orgId and site in params)
    let paramOrganizationId = bid?.params?.organizationId;
    let paramSite = bid?.params?.site;

    // Since Prebid 9, placement and divId should be in ortb2Imp
    let paramPlacement = bid?.params?.placement;
    let paramAdUnitElementId = bid?.params?.adUnitElementId;
    let ortb2ImpPlacement = bid?.ortb2Imp?.ext?.data?.placement;
    let ortb2ImpDivId = bid?.ortb2Imp?.ext?.data?.divId;

    // Since Prebid 9.39, Adagio supports interstitial and rewarded
    let ortb2ImpInterstitial = bid?.ortb2Imp?.instl;
    let ortb2ImpRewarded = bid?.ortb2Imp?.rwdd;
    let deepOrtb2ImpInterstitial = findParam(bid, 'instl') || null;
    let deepOrtb2ImpRewarded = findParam(bid, 'rwdd') || null;

    if (paramOrganizationId === undefined) {
        MY_BROKENOBJECT = bid.params;
    }
    else MY_GOODOBJECT = bid.params;

    // Check the organizationId
    if (paramOrganizationId === undefined)
        paramsCheckingArray.push([
            STATUSBADGES.KO,
            `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
            `Parameter not found.`,
        ]);
    else {
        // Accept both integer and string representations of 4-digit numbers
        if (
            (typeof paramOrganizationId === "string" && !/^\d{4}$/.test(paramOrganizationId)) ||
            (typeof paramOrganizationId === "number" && (paramOrganizationId < 1000 || paramOrganizationId > 9999))
        ) {
            paramsCheckingArray.push([
                STATUSBADGES.CHECK,
                `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
                `Should be a 4-digit integer or string (e.g., 1000 or '1000').`,
            ]);
        } else {
                paramsCheckingArray.push([
                STATUSBADGES.OK,
                `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
                ``,
            ]);
        }
    }

    // Check the site name
    if (paramSite === undefined)
        paramsCheckingArray.push([
            STATUSBADGES.KO,
            `<code>params.site</code>: <code>${paramSite}</code>`,
            "Parameter not found.",
        ]);
    else {
        if (paramSite.trim() !== paramSite)
            paramsCheckingArray.push([
                STATUSBADGES.KO,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                `Space character detected.`,
            ]);
        else if (adagioApiKeyfound && successRecordItems !== null)
            paramsCheckingArray.push([
                STATUSBADGES.OK,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                ``,
            ]);
        else if (adagioApiKeyfound && successRecordItems === null)
            paramsCheckingArray.push([
                STATUSBADGES.KO,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                `No API record found, check logs.`,
            ]);
        else
            paramsCheckingArray.push([
                STATUSBADGES.INFO,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                "No API loaded for checking.",
            ]);
    }

    // AdUnitElementId (1/3): Depending on the Prebid version, we don't expect the same param
    let divIdStatus = "";
    let divIdSetup = "";
    let divIdRes = "";
    // AdUnitElementId (2/3): First checks if a value is found
    if (prebidVersion >= 9) {
        if (ortb2ImpDivId !== undefined) {
            divIdStatus = STATUSBADGES.OK;
            divIdSetup = "ortb2Imp.ext.data.divId";
            divIdRes = ortb2ImpDivId;
            divIdDetails = '';
        } else if (paramAdUnitElementId !== undefined) {
            divIdStatus = STATUSBADGES.INFO; // STATUSBADGES.UPDATE;
            divIdSetup = "params.adUnitElementId";
            divIdRes = paramAdUnitElementId;
            divIdDetails = 'Recommendation: Setup the new divId param in ortb2Imp.';
        } else {
            divIdStatus = STATUSBADGES.KO;
            divIdSetup = "ortb2Imp.ext.data.divId";
            divIdRes = undefined;
            divIdDetails = '';
        }
    } else {
        if (paramAdUnitElementId !== undefined) {
            divIdStatus = STATUSBADGES.OK;
            divIdSetup = "params.adUnitElementId";
            divIdRes = paramAdUnitElementId;
            divIdDetails = '';
        } else {
            divIdStatus = STATUSBADGES.KO;
            divIdSetup = "params.adUnitElementId";
            divIdRes = undefined;
            divIdDetails = '';
        }
    }
    // AdUnitElementId (3/3): Then ensure the value is correct
    if (divIdRes === undefined)
        paramsCheckingArray.push([
            divIdStatus,
            `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
            `Not defined in the adUnit configuration.`,
        ]);
    else {
        const htlmDiv = document.getElementById(divIdRes);
        if (divIdRes.trim() !== divIdRes)
            paramsCheckingArray.push([
                STATUSBADGES.CHECK,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                `Space character detected.`,
            ]);
        else if (htlmDiv === null)
            paramsCheckingArray.push([
                STATUSBADGES.CHECK,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                `Div id not found in the page.`,
            ]);
        else
            paramsCheckingArray.push([
                divIdStatus,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                divIdDetails,
            ]);
    }

    // Placement (1/3): Depending on the Prebid version, we don't expect the same param
    let placementStatus = "";
    let placementSetup = "";
    let placementRes = "";
    let placementDetails = "";
    // Placement (2/3): First checks if a value is found
    if (prebidVersion >= 10) {
        if (paramPlacement !== undefined) {
            placementStatus = STATUSBADGES.OK;
            placementSetup = "params.placement";
            placementRes = paramPlacement;
            placementDetails = '';
        } else if (ortb2ImpPlacement !== undefined) {
            placementStatus = STATUSBADGES.INFO;
            placementSetup = "ortb2Imp.ext.data.placement";
            placementRes = ortb2ImpPlacement;
            placementDetails = 'Fallback: placement found in ortb2Imp, but should be in params.placement for Prebid 10+.';
        } else {
            placementStatus = STATUSBADGES.KO;
            placementSetup = "params.placement";
            placementRes = undefined;
            placementDetails = '';
        }
    } else if (prebidVersion >= 9) {
        if (ortb2ImpPlacement !== undefined) {
            placementStatus = STATUSBADGES.OK;
            placementSetup = "ortb2Imp.ext.data.placement";
            placementRes = ortb2ImpPlacement;
            placementDetails = '';
        } else if (paramPlacement !== undefined) {
            placementStatus = STATUSBADGES.INFO;
            placementSetup = "params.placement";
            placementRes = paramPlacement;
            placementDetails = 'Fallback: placement found in params, but should be in ortb2Imp.ext.data.placement for Prebid 9.x.';
        } else {
            placementStatus = STATUSBADGES.KO;
            placementSetup = "ortb2Imp.ext.data.placement";
            placementRes = undefined;
            placementDetails = '';
        }
    } else {
        if (paramPlacement !== undefined) {
            placementStatus = STATUSBADGES.OK;
            placementSetup = "params.placement";
            placementRes = paramPlacement;
            placementDetails = '';
        } else {
            placementStatus = STATUSBADGES.KO;
            placementSetup = "params.placement";
            placementRes = undefined;
            placementDetails = '';
        }
    }
    // Placement (3/3): Then ensure the value is correct
    if (placementRes === undefined)
        paramsCheckingArray.push([
            placementStatus,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            `Not defined in the adUnit configuration.`,
        ]);
    else if (placementRes.trim() !== placementRes)
        paramsCheckingArray.push([
            STATUSBADGES.CHECK,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            `Space character detected.`,
        ]);
    else if (
        /mobile/i.test(placementRes) ||
        /desktop/i.test(placementRes) ||
        /tablet/i.test(placementRes)
    )
        paramsCheckingArray.push([
            STATUSBADGES.CHECK,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            `Should not include reference to an environment`,
        ]);
    else
        paramsCheckingArray.push([
            placementStatus,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            placementDetails,
        ]);

    // Check the mediatypes parameters
    let mediatypeBanner = bid.mediaTypes?.banner;
    let mediatypeVideo = bid.mediaTypes?.video;
    let mediatypeNative = bid.mediaTypes?.native;

    if (
        mediatypeBanner === undefined &&
        mediatypeVideo === undefined &&
        mediatypeNative === undefined
    )
        paramsCheckingArray.push([
            STATUSBADGES.KO,
            `<code>mediaTypes</code>: <code>${JSON.stringify(bid.mediaTypes)}</code>`,
            `No mediatype detected.`,
        ]);
    else {
        if (mediatypeBanner !== undefined) {
            let mediatypeBannerSizes = mediatypeBanner?.sizes;

            // Check the banner sizes
            if (mediatypeBannerSizes !== undefined) {
                let supportedSizes = [
                    [120, 600],
                    [160, 600],
                    [250, 250],
                    [300, 50],
                    [300, 100],
                    [300, 250],
                    [300, 300],
                    [300, 600],
                    [320, 50],
                    [320, 100],
                    [320, 160],
                    [320, 320],
                    [320, 480],
                    [336, 280],
                    [728, 90],
                    [800, 250],
                    [930, 180],
                    [970, 90],
                    [970, 250],
                    [1800, 1000]
                ];
                let commonArrays = [];
                supportedSizes.forEach((ss) => {
                    mediatypeBannerSizes.forEach((mbs) => {
                        if (JSON.stringify(ss) === JSON.stringify(mbs))
                            commonArrays.push(ss);
                    });
                });
                if (commonArrays.length > 0)
                    paramsCheckingArray.push([
                        STATUSBADGES.OK,
                        `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(commonArrays)}</code>`,
                        ``,
                    ]);
                else
                    paramsCheckingArray.push([
                        STATUSBADGES.KO,
                        `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`,
                        `No supported size detected.`,
                    ]);
            } else
                paramsCheckingArray.push([
                    STATUSBADGES.KO,
                    `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`,
                    `No parameter found.`,
                ]);
        }

        if (mediatypeVideo !== undefined) {

            // Required for both instream and outstream
            let mediatypeVideoContext = mediatypeVideo?.context; // DONE
            let mediatypeVideoApi = mediatypeVideo?.api; // DONE
            let mediatypeVideoPlayerSize = mediatypeVideo?.playerSize; // DONE
            // Required for instream only
            let mediatypeVideoMimes = mediatypeVideo?.mimes; // DONE
            let mediatypeVideoPlcmt = mediatypeVideo?.plcmt; // DONE
            // Highly recommended for instream and outstream
            let mediatypeVideoPlaybackMethod = mediatypeVideo?.playbackmethod; // DONE
            // Highly recommended for instream only
            let mediatypeVideoStartDelay = mediatypeVideo?.startdelay; // DONE
            let mediatypeVideoStartProtocols = mediatypeVideo?.protocols;

            // For checking purpose
            let hasOutstreamContext = mediatypeVideoContext === 'outstream';
            let hasInstreamContext = mediatypeVideoContext === 'instream';
            let videoApiSupported = [1,2,3,4,5];
            let mimesExpected = ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'];
            let plcmtExpected = [1,2];
            let protocolsExpected = [3, 6, 7, 8];

            // Check the video context: instream or outstream
            if (hasOutstreamContext || hasInstreamContext) {
                paramsCheckingArray.push([
                    STATUSBADGES.OK,
                    `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`,
                    ``,
                ]);
            } else {
                paramsCheckingArray.push([
                    STATUSBADGES.KO,
                    `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`,
                    `No supported context found.`,
                ]);
                // If no context found, we should not check params furthermore
                return;
            }

            // Check the video api: [1, 2, 3, 4, 5]
            if (mediatypeVideoApi !== undefined) {
                if (hasOutstreamContext && !mediatypeVideoApi.includes(2))
                    paramsCheckingArray.push([
                        STATUSBADGES.KO,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        `Must support api <code>2</code>'`,
                    ]);
                else if (!videoApiSupported.some(i => mediatypeVideoApi.includes(i)) && hasInstreamContext)
                    paramsCheckingArray.push([
                        STATUSBADGES.KO,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        `Must support at least one of <code>${JSON.stringify(videoApiSupported)}</code>`,
                    ]);
                else
                    paramsCheckingArray.push([
                        STATUSBADGES.OK,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        ``,
                    ]);
            } else
                paramsCheckingArray.push([
                    STATUSBADGES.KO,
                    `<code>mediaTypes.video.api</code>: <code>${mediatypeVideoApi}</code>`,
                    `No video api detected.`,
                ]);

            // Check the player size
            if (mediatypeVideoPlayerSize && Array.isArray(mediatypeVideoPlayerSize) && mediatypeVideoPlayerSize.every(subArr => Array.isArray(subArr) && subArr.length === 2 && subArr.every(Number.isInteger))) {
                paramsCheckingArray.push([
                    STATUSBADGES.OK,
                    `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`,
                    ``,
                ]);
            } else {
                paramsCheckingArray.push([
                    STATUSBADGES.KO,
                    `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`,
                    `Wrong format or not size detected.`,
                ]);
            }

            // Check the video mimes: ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'] (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoMimes === undefined) {
                    paramsCheckingArray.push([
                        STATUSBADGES.KO,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        `No mimes detected.`,
                    ]);
                }
                else if (!mimesExpected.every(i => mediatypeVideoMimes.includes(i))) {
                    paramsCheckingArray.push([
                        STATUSBADGES.CHECK,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        `Missing mimes: <code>${JSON.stringify(mimesExpected.filter(i => !mediatypeVideoMimes.includes(i)))}</code>`,
                    ]);
                }
                else {
                    paramsCheckingArray.push([
                        STATUSBADGES.OK,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        ``,
                    ]);
                }
            }

            // Check the placement (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoPlcmt !== undefined) {
                    if (plcmtExpected.includes(mediatypeVideoPlcmt)) {
                        paramsCheckingArray.push([
                            STATUSBADGES.OK,
                            `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                            ``,
                        ]);
                    } else {
                        paramsCheckingArray.push([
                            STATUSBADGES.KO,
                            `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                            `Must be one of <code>${JSON.stringify(plcmtExpected)}</code>`,
                        ]);
                    }
                } 
                else {
                    paramsCheckingArray.push([
                        STATUSBADGES.KO,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        `No placement detected.`,
                    ]);
                }
            }

            // Check the video playbackmethod
            if (mediatypeVideoPlaybackMethod !== undefined) {
                const expectedMethod = hasInstreamContext ? 2 : (hasOutstreamContext ? 6 : null);
            
                if (expectedMethod && !mediatypeVideoPlaybackMethod.includes(expectedMethod)) {
                    paramsCheckingArray.push([
                        STATUSBADGES.CHECK,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        `Recommended playback method is: [${expectedMethod}].`,
                    ]);
                } else if (!expectedMethod) {
                    paramsCheckingArray.push([
                        STATUSBADGES.CHECK,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        `No playback method detected or context not available.`,
                    ]);
                } else {
                    paramsCheckingArray.push([
                        STATUSBADGES.OK,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        ``,
                    ]);
                }
            } else {
                paramsCheckingArray.push([
                    STATUSBADGES.CHECK,
                    `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                    `No playback method detected.`,
                ]);
            }

            // Check the startdelay (for instream only)
            if (hasInstreamContext) {
                if(mediatypeVideoStartDelay !== undefined) {
                    paramsCheckingArray.push([
                        STATUSBADGES.OK,
                        `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`,
                        ``,
                    ]);
                }
                else {
                    paramsCheckingArray.push([
                        STATUSBADGES.CHECK,
                        `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`,
                        `No start delay detected.`,
                    ]);
                }
            }

            // Check the protocols (for instream only)
            if (hasInstreamContext) {
                if(mediatypeVideoStartProtocols !== undefined) {
                    if (protocolsExpected.every(i => mediatypeVideoStartProtocols.includes(i))) {
                        paramsCheckingArray.push([
                            STATUSBADGES.OK,
                            `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                            ``,
                        ]);
                    }
                    else {
                        paramsCheckingArray.push([
                            STATUSBADGES.CHECK,
                            `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                            `Missing protocols: <code>${JSON.stringify(protocolsExpected.filter(i => !mediatypeVideoStartProtocols.includes(i)))}</code>`,
                        ]);
                    }
                }
                else {
                    paramsCheckingArray.push([
                        STATUSBADGES.CHECK,
                        `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                        `No protocol detected.`,
                    ]);
                }
            } 
        }

        // Interstitial - Supported since Prebid 9.39, should be in ortb2Imp.
    if (ortb2ImpInterstitial !== undefined) {
        if (prebidVersion < 9.39) {
            paramsCheckingArray.push([
                STATUSBADGES.INFO,
                `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`,
                'Not supported before Prebid 9.39.',
            ]);
        } else {
            paramsCheckingArray.push([
                STATUSBADGES.OK,
                `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`,
                '',
            ]);
        }
    }
    else if (deepOrtb2ImpInterstitial !== null) {
        paramsCheckingArray.push([
            prebidVersion < 9.39 ? STATUSBADGES.INFO : STATUSBADGES.CHECK,
            `<code>${deepOrtb2ImpInterstitial.path}</code>: <code>${deepOrtb2ImpInterstitial.value}</code>`,
            'Misplaced, should be in <code>ortb2Imp.instl</code>.',
        ]);
    }
    else {
        paramsCheckingArray.push([
            prebidVersion < 9.39 ? STATUSBADGES.INFO : STATUSBADGES.CHECK,
            `<code>ortb2Imp.instl</code>: <code>undefined</code>`,
            'No interstitial parameter detected.',
        ]);
    }
    
    // Rewarded - Supported since Prebid 9.39, should be in ortb2Imp.
    if (ortb2ImpRewarded !== undefined) {
        if (prebidVersion < 9.39) {
            paramsCheckingArray.push([
                STATUSBADGES.INFO,
                `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`,
                'Not supported before Prebid 9.39.',
            ]);
        } else {
            paramsCheckingArray.push([
                STATUSBADGES.OK,
                `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`,
                '',
            ]);
        }
    }
    else if (deepOrtb2ImpRewarded !== null) {
        paramsCheckingArray.push([
            prebidVersion < 9.39 ? STATUSBADGES.INFO : STATUSBADGES.CHECK,
            `<code>${deepOrtb2ImpRewarded.path}</code>: <code>${deepOrtb2ImpRewarded.value}</code>`,
            'Misplaced, should be in <code>ortb2Imp.rwdd</code>',
        ]);
    }
    else {
        paramsCheckingArray.push([
            prebidVersion < 9.39 ? STATUSBADGES.INFO : STATUSBADGES.CHECK,
            `<code>ortb2Imp.rwdd</code>: <code>undefined</code>`,
            'No rewarded parameter detected.',
        ]);
    }

        if (mediatypeNative !== undefined) {
            // TODO
        }
    }
}

function computeAdUnitStatus(paramsCheckingArray) {
    // The array contains X item with the following structure: [string, string, string] (html code)
    const statuses = [STATUSBADGES.OK, STATUSBADGES.INFO, STATUSBADGES.CHECK, STATUSBADGES.KO]; // Priority ranking
    // Check the full array to get the highest status (is it ko, check, ok)
    const highestStatus = paramsCheckingArray.reduce((highest, current) => 
        statuses.indexOf(current[0]) > statuses.indexOf(highest) ? current[0] : highest, STATUSBADGES.OK
    );
    return highestStatus;
}

// Deep search for a specific parameter in the bid object
function findParam(obj, param, path = []) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const currentPath = [...path, key];
            if (key === param) {
                return { path: currentPath.join('.'), value: obj[key] };
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                const result = findParam(obj[key], param, currentPath);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}

/*************************************************************************************************************************************************************************************************************************************
 * PBJS functions
 ************************************************************************************************************************************************************************************************************************************/

async function runCheck() {
    catchBidRequestsGlobalParams();
    await checkAdagioAPI();
    await checkPublisher();
    await checkCurrentLocation();
    checkAdServer();
    checkPrebidVersion();
    checkAdagioModule();
    checkAdagioAdUnitParams();
    checkRealTimeDataProvider();
    checkDeviceAccess();
    checkFirstPartyData();
    checkAdagioUserSync();
    checkAdagioLocalStorage();
    checkAdagioAnalyticsModule();
    checkUserIds();
    checkDuplicatedAdUnitCode();
    // checkSupplyChainObject(); HIDING SSC AS NOT CORRECTLY IMPLEMENTED ATM
    checkCurrencyModule();
    checkConsentMetadata();
    checkAdagioCMP();
    checkFloorPriceModule();
    checkDsaTransparency();
}

async function checkAdagioAPI() {
    // Ready to udapte the alert div
    const apiButtonElement = overlayFrameDoc.getElementById(`apiButton`);

    // button.setAttribute("title", name);
    /// button.innerHTML = svg;

    // Ensure user launched the bookmarket with the ADAGIO_KEY declared
    if (typeof ADAGIO_KEY === "undefined") {
        // Ensure the ADAGIO_KEY is defined
        apiButtonElement.innerHTML = ADAGIOSVG.APIRED;
        apiButtonElement.setAttribute("title", "Adagio API - 'ADAGIO_KEY' is not defined in the bookmarklet.");
        return;
    } else if (ADAGIO_KEY === "") {
        // Ensure the ADAGIO_KEY is not empty ('')
        apiButtonElement.innerHTML = ADAGIOSVG.APIRED;
        apiButtonElement.setAttribute("title", "Adagio API - 'ADAGIO_KEY' value is empty in the bookmarklet.");
        return;
    } else {
        // Declare the API as found
        adagioApiKeyfound = true;
    }

    // Declare the necessary variables
    let queryString = null;

    // Launch the API call for the organizationIds
    if (organizationIds.length === 0) {
        apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
        apiButtonElement.setAttribute("title", "Adagio API - No organizationId detected in traffic.");
    } else if (organizationIds.length > 1) {
        apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
        apiButtonElement.setAttribute("title", "Adagio API - Multiple organizations detected in traffic (not supported).");
    } else {
        queryString = `filter=publisher_id||$eq||${encodeURIComponent(organizationIds[0])}`;
        let orgIdApiDataResponse = await runAdagioAPI(queryString); // => data //.records

        if (
            orgIdApiDataResponse !== null &&
            orgIdApiDataResponse.records !== null
        ) {
            // Check if the records provides a domain match and a sitename match
            matchedDomainRecords =
                orgIdApiDataResponse.records.filter((record) =>
                    window.location.hostname.includes(record.domain),
                ) || null;
            matchedSiteNameRecords =
                orgIdApiDataResponse.records.filter((record) =>
                    siteNames.includes(record.name),
                ) || null;
            successRecordItems =
                matchedDomainRecords.filter((domainRecord) =>
                    matchedSiteNameRecords.filter(
                        (siteNameRecord) => domainRecord === siteNameRecord,
                    ),
                ) || null;

            // Check display API status regarding record results.
            if (matchedDomainRecords === null) {
                apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
                apiButtonElement.setAttribute("title", `Adagio API - No manager domain match: '${window.location.hostname}'.`);
            }
            else if (matchedSiteNameRecords === null) {
                apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
                apiButtonElement.setAttribute("title", `Adagio API - No manager sitename match: ${siteNames}'.`);
            }
            else if (successRecordItems === null) {
                apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
                apiButtonElement.setAttribute("title", `Adagio API - No manager domain and sitename match: '${window.location.hostname}' / '${siteNames}'.`);
            }
            else {
                apiButtonElement.innerHTML = ADAGIOSVG.APIGREEN;
                apiButtonElement.setAttribute("title", `Adagio API - Successfull record(s) fetched.`);
            }
        } else {
            apiButtonElement.innerHTML = ADAGIOSVG.APIORANGE;
            apiButtonElement.setAttribute("title", `Adagio API - No manager organizationId match: '${organizationIds[0]}'.`);
        }
    }
}

async function runAdagioAPI(queryString) {
    // URL of the API endpoint
    const url = `https://api.adagio.io/api/v1/groups/1/websites?${queryString}`;

    // Ready to udapte the alert div
    const tabName = ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-");
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

    // Making the GET request using fetch()
    try {
        const response = await fetch(url, {
            method: "GET", // HTTP method
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

async function checkCurrentLocation() {
    // Fill the alert with number of orgIds found
    const tabName = ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-");
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

    // Fetch the country code using ipapi.co
    fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
            const countryCode = data.country_code;
            const countryName = data.country_name;
            // Convert country code to emoji using a function
            const countryEmoji = getFlagEmoji(countryCode);
            if (countryName !== 'France') {
                alertTextDiv.innerHTML += `<small>• Current location detected: <code>${countryName}</code> (${countryEmoji})</small><br>`;
            }
        })
        .catch((error) => console.error("Error fetching country data:", error));

    // Function to convert country code to emoji (unchanged)
    function getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }
}

function checkAdServer() {
    // The adserver is a key component of the auction, knowing it help us in our troubleshooting
    // By default, we support only GAM, SAS and APN for the viewability.
    const adServers = new Map();
    adServers.set("Google Ad Manager", typeof window?.googletag?.pubads === 'function');
    adServers.set("Smart AdServer", typeof window?.sas?.events?.on === 'function');
    adServers.set("Appnexus", typeof window?.apntag?.onEvent === 'function');

    // Loop on the map to check if value != undefined
    let stringAdServer = "";
    for (let [key, value] of adServers) {
        if (value != false) {
            if (stringAdServer === "") stringAdServer += `<code>${key}</code>`;
            else stringAdServer += `, <code>${key}</code>`;
        }
    }

    // Display the adserver checking result
    if (stringAdServer === "") {
        appendCheckerRow(
            STATUSBADGES.CHECK,
            ADAGIOCHECK.ADSERVER,
            `No supported adserver: the viewability measurement may not work`,
        );
    }
    else {
        appendCheckerRow(
            STATUSBADGES.OK,
            ADAGIOCHECK.ADSERVER,
            `${stringAdServer}`,
        );
    }
}

function checkPrebidVersion() {
    // Catch the Prebid version number from the wrapper object.
    if (prebidWrapper === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.PREBID,
            `<code>window._pbjsGlobals</code>: <code>undefined</code>`,
        );
    } else {
        prebidVersion = prebidObject.version
            .replace("v", "")
            .split("-")[0]
            .split(".")
            .slice(0, 2)
            .join(".");
        appendCheckerRow(
            STATUSBADGES.OK,
            ADAGIOCHECK.PREBID,
            `<code>window._pbjsGlobals</code>: <code>${prebidWrapper[0]} (${prebidObject.version})</code>`,
        );
        if (typeof prebidObject.getEvents === "function") {
            prebidEvents = prebidObject.getEvents();
        }
    }
}

function checkAdagioModule() {
    // Gets ADAGIO adapter object
    adagioAdapter = window.ADAGIO;

    // Gets wrapper name integrity
    if (adagioAdapter !== undefined) {
        const pbjsAdUnits = adagioAdapter.pbjsAdUnits;
        let adagioJsVersion = adagioAdapter.versions.adagiojs;

        // Define and set checker item status
        let adagioModuleStatus = STATUSBADGES.OK;
        // Define and set adagioJsLog
        let adagiojsLog = `• Adagiojs: <code>🟢 Version: ${JSON.stringify(adagioJsVersion)}</code><br>`;
        if (adagioJsVersion === undefined) {
            adagiojsLog = `• Adagiojs: <code>🔴 Failed: Script not loaded.</code><br>`;
            adagioModuleStatus = STATUSBADGES.CHECK;
        }
        // Define and set wrapper integrity log
        let wrapperIntegrityLog = `• Wrapper integrity: <code>🟢 Successed</code>`;
        let brokenWrapperStringName = `${prebidWrapper[0]}AdUnits`;
        if (pbjsAdUnits === undefined || !Array.isArray(pbjsAdUnits) || (pbjsAdUnits.length === 0 && (adagioAdapter[`${prebidWrapper[0]}AdUnits`] !== undefined && prebidWrapper[0] !== 'pbjs'))) {
            wrapperIntegrityLog =  `• Wrapper integrity: <code>🔴 Failed: Viewability / Analytics won't work.</code>`;
            adagioModuleStatus = STATUSBADGES.CHECK;
        }
        else if (adagioAdapter[brokenWrapperStringName] !== undefined && prebidWrapper[0] !== 'pbjs') {
            wrapperIntegrityLog =  `• Wrapper integrity: <code>🟠 Fixed: Try to contact client for bad behavior.</code>`;
        }
        // Display the final log
        appendCheckerRow(
            adagioModuleStatus,
            ADAGIOCHECK.ADAPTER,
            adagiojsLog + wrapperIntegrityLog,
        );
    }
    else {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.ADAPTER,
            `<code>window.ADAGIO</code>: <code>${window.ADAGIO}</code>`,
        );
    }
}

function checkRealTimeDataProvider() {
    // Since Prebid 9, the RTD module and Adagio provider are necessary for our visibility/repackaging optimization.
    // It requires the module and the Adagio provider module to be installed and configured.
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.RDTMODULE,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        return;
    }
    // Ensure the module is built through ADAGIO
    if (adagioAdapter !== undefined) {
        // First try to load installedModules
        const prebidInstalledModules = prebidObject.installedModules;
        if (prebidInstalledModules !== undefined && prebidInstalledModules.length !== 0) {
            // Get the modules from the installedModules array
            const hasRtdModule = prebidInstalledModules.includes('rtdModule');
            const hasAdagioRtdProvider = prebidInstalledModules.includes('adagioRtdProvider');
            let messageString = '';

            // Check if modules are present, build the checker message then displays it (leave the function is missing module).
            if (!hasRtdModule && !hasAdagioRtdProvider) messageString = `Missing rtd and adagioRtdProvider modules: <code>${prebidInstalledModules}</code>`;
            else if (!hasRtdModule) messageString = `Missing rtd module: <code>${prebidInstalledModules}</code>`;
            else if (!hasAdagioRtdProvider) messageString = `Missing adagioRtdProvider module: <code>${prebidInstalledModules}</code>`;

            if (messageString !== '') {
                appendCheckerRow(
                    computeBadgeToDisplay(true, 9, null),
                    ADAGIOCHECK.RDTMODULE,
                    messageString,
                );
                return;
            }
        }
        // If installedModules not usable, relies on ADAGIO.hasRtd
        else if (!adagioAdapter.hasRtd) {
            appendCheckerRow(
                computeBadgeToDisplay(true, 9, null),
                ADAGIOCHECK.RDTMODULE,
                `<code>ADAGIO.hasRtd</code>: <code>${adagioAdapter.hasRtd}</code>`,
            );
            return;
        }
    }
    // Ensure that the rtd module exists in the wrapper configuration
    const prebidRtdModule = prebidObject.getConfig("realTimeData");
    if (prebidRtdModule !== undefined) {
        // Validate RTD provider and configuration
        if (prebidRtdModule.dataProviders !== undefined) {
            // Look for Adagio in the list of dataProviders
            let adagioRtdProvider =
                prebidRtdModule.dataProviders.find(
                    (provider) => provider.name === "adagio",
                ) || null;
            // If Adagio is find, check the parameters
            if (adagioRtdProvider !== null) {
                let paramsOrgId = adagioRtdProvider?.params?.organizationId;
                let paramsSite = adagioRtdProvider?.params?.site;
                // Check if params are well configured
                if (paramsOrgId === undefined)
                    appendCheckerRow(
                        computeBadgeToDisplay(true, 9, null),
                        ADAGIOCHECK.RDTMODULE,
                        `Missing 'organizationId' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`,
                    );
                else if (paramsSite === undefined)
                    appendCheckerRow(
                        computeBadgeToDisplay(true, 9, null),
                        ADAGIOCHECK.RDTMODULE,
                        `Missing 'site' parameter: <code>${JSON.stringify(adagioRtdProvider)}</code>`,
                    );
                else if (!siteNames.includes(paramsSite) || !organizationIds.includes(paramsOrgId))
                    appendCheckerRow(
                        computeBadgeToDisplay(true, 9, null),
                        ADAGIOCHECK.RDTMODULE,
                        `Parameters doesn't match with bids.params: <code>${JSON.stringify(adagioRtdProvider)}</code>`,
                    );
                else
                    appendCheckerRow(
                        computeBadgeToDisplay(false, 9, null),
                        ADAGIOCHECK.RDTMODULE,
                        `<code>${JSON.stringify(adagioRtdProvider)}</code>`,
                    );
            } else {
                appendCheckerRow(
                    computeBadgeToDisplay(true, 9, null),
                    ADAGIOCHECK.RDTMODULE,
                    `No Adagio RTD provider configured: <code>${JSON.stringify(prebidRtdModule.dataProviders)}</code>`,
                );
            }
        } else {
            appendCheckerRow(
                computeBadgeToDisplay(true, 9, null),
                ADAGIOCHECK.RDTMODULE,
                `No RTD providers configured: <code>${JSON.stringify(prebidRtdModule)}</code>`,
            );
        }
    } else {
        appendCheckerRow(
            computeBadgeToDisplay(true, 9, null),
            ADAGIOCHECK.RDTMODULE,
            `<code>${prebidWrapper[0]}.getConfig('realTimeData')</code>: <code>${prebidRtdModule}</code>`,
        );
    }
}

function checkFirstPartyData() {
    // Since Prebid 9, the pagetype and category Adagio parameters are to be stored in the first-party data (ortb2).
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.ORTB2,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        const prebidOrtb2 = prebidObject.getConfig("ortb2");
        if (prebidOrtb2 !== undefined) {
            // Try to get pagetype and category
            let dataPagetype = prebidOrtb2?.site?.ext?.data?.pagetype;
            let dataCategory = prebidOrtb2?.site?.ext?.data?.category;

            if (dataPagetype === undefined && dataCategory === undefined)
                appendCheckerRow(
                    computeBadgeToDisplay("warn", 9, null),
                    ADAGIOCHECK.ORTB2,
                    `Missing 'pagetype'/'category': <code>ortb2.site.ext.data</code>`,
                );
            else if (dataPagetype === undefined)
                appendCheckerRow(
                    computeBadgeToDisplay("warn", 9, null),
                    ADAGIOCHECK.ORTB2,
                    `Missing 'pagetype': <code>ortb2.site.ext.data.pagetype</code>`,
                );
            else if (dataCategory === undefined)
                appendCheckerRow(
                    computeBadgeToDisplay("warn", 9, null),
                    ADAGIOCHECK.ORTB2,
                    `Missing 'category': <code>ortb2.site.ext.data.category</code>`,
                );
            else
                appendCheckerRow(
                    computeBadgeToDisplay(false, 9, null),
                    ADAGIOCHECK.ORTB2,
                    `<code>${JSON.stringify(prebidOrtb2)}</code>`,
                );
        } else {
            appendCheckerRow(
                computeBadgeToDisplay("warn", 9, null),
                ADAGIOCHECK.ORTB2,
                `<code>${prebidWrapper[0]}.getConfig('ortb2')</code>: <code>${JSON.stringify(prebidOrtb2)}</code>`,
            );
        }
    }
}

function checkTransactionIdentifiers() {
    // Is off by default since Prebid 9.
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.TIDS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        const enableTIDs = prebidObject.getConfig("enableTIDs");
        appendCheckerRow(
            computeBadgeToDisplay(!enableTIDs, 9, null),
            ADAGIOCHECK.TIDS,
            `<code>${prebidWrapper[0]}.getConfig('enableTIDs')</code>: <code>${enableTIDs}</code>`,
        );
    }
}

function checkAdagioLocalStorage() {
    // Localstorage requieres pbjs
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.LOCALSTORAGE,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        // Is local storage enabled?
        const localStorage = prebidObject.bidderSettings;

        if (localStorage.standard?.storageAllowed) {
            appendCheckerRow(
                STATUSBADGES.OK,
                ADAGIOCHECK.LOCALSTORAGE,
                `<code>${prebidWrapper[0]}.bidderSettings.standard.storageAllowed</code>: <code>true</code>`,
            );
        } else if (localStorage.adagio?.storageAllowed) {
            appendCheckerRow(
                STATUSBADGES.OK,
                ADAGIOCHECK.LOCALSTORAGE,
                `<code>${prebidWrapper[0]}.bidderSettings.adagio.storageAllowed</code>: <code>true</code>`,
            );
        } else if (localStorage.adagio?.storageAllowed === false) {
            appendCheckerRow(
                STATUSBADGES.KO,
                ADAGIOCHECK.LOCALSTORAGE,
                `<code>${prebidWrapper[0]}.bidderSettings.adagio.storageAllowed</code>: <code>false</code>`,
            );
        } else {
            if (prebidVersion >= 9) {
                appendCheckerRow(
                    STATUSBADGES.NA,
                    ADAGIOCHECK.LOCALSTORAGE,
                    "Localstorage not found. But not required anymore since Prebid 9.",
                );
            }
            else {
                appendCheckerRow(
                    STATUSBADGES.KO,
                    ADAGIOCHECK.LOCALSTORAGE,
                    "Localstorage not found. But not required anymore since Prebid 9.",
                );
            }
        }
    }
}

function checkDeviceAccess() {
    // The device access is necessary for the TIDs since Prebid 9
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.DEVICEACCESS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        // Is local storage enabled?
        const deviceAccess = prebidObject.getConfig("deviceAccess");
        appendCheckerRow(
            computeBadgeToDisplay(deviceAccess ? false : true, 9, null),
            ADAGIOCHECK.DEVICEACCESS,
            `<code>${prebidWrapper[0]}.getConfig('deviceAccess')</code>: <code>${deviceAccess}</code>`,
        );
    }
}

function checkAdagioUserSync() {
    // Adagio strongly recommends enabling user syncing through iFrames.
    // This functionality improves DSP user match rates and increases the bid rate and bid price.
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.USERSYNC,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        const prebidUserSync = prebidObject.getConfig("userSync");
        if (prebidUserSync === undefined) {
            appendCheckerRow(
                STATUSBADGES.KO,
                ADAGIOCHECK.USERSYNC,
                `<code>${prebidWrapper[0]}.getConfig('userSync')</code>: <code>${prebidUserSync}</code>`,
            );
        } else {
            const prebidUserSyncIframe = prebidUserSync?.filterSettings?.iframe;
            const prebidUserSyncAll = prebidUserSync?.filterSettings?.all;

            if (
                prebidUserSyncIframe !== undefined &&
                (prebidUserSyncIframe?.bidders?.includes("*") ||
                    (Array.isArray(prebidUserSyncIframe?.bidders) &&
                        prebidUserSyncIframe?.bidders.some((item) =>
                            item?.toLowerCase()?.includes("adagio"),
                        ))) &&
                prebidUserSyncIframe.filter === "include"
            ) {
                appendCheckerRow(
                    STATUSBADGES.OK,
                    ADAGIOCHECK.USERSYNC,
                    `<code>${JSON.stringify(prebidUserSyncIframe)}</code>`,
                );
            } else if (
                prebidUserSyncAll !== undefined &&
                (prebidUserSyncAll?.bidders?.includes("*") ||
                    (Array.isArray(prebidUserSyncAll?.bidders) &&
                        prebidUserSyncAll?.bidders.some((item) =>
                            item?.toLowerCase()?.includes("adagio"),
                        ))) &&
                prebidUserSyncAll.filter === "include"
            ) {
                appendCheckerRow(
                    STATUSBADGES.OK,
                    ADAGIOCHECK.USERSYNC,
                    `<code>${JSON.stringify(prebidUserSyncAll)}</code>`,
                );
            } else {
                appendCheckerRow(
                    STATUSBADGES.KO,
                    ADAGIOCHECK.USERSYNC,
                    `<code>${JSON.stringify(prebidUserSync)}</code>`,
                );
            }
        }
    }
}

function checkAdagioAnalyticsModule() {
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.ANALYTICS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        return;
    }
    // The wrapper object never references information related to the analytics, we can only rely on the ADAGIO objct information
    if (adagioAdapter === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.ANALYTICS,
            `<code>window.ADAGIO</code>: <code>${adagioAdapter}</code>`,
        );
        return;
    }

    // Prebid Analytics is ready to use since Prebid 8.14
    // And additional 'options' parameters are required since Prebid 9
    let hasEligibleVersion = prebidVersion > 8.14;
    let hasPrebidNineVersion = prebidVersion > 9;
    let hasEnabledAnalytics = adagioAdapter.versions?.adagioAnalyticsAdapter;

    if (!hasEligibleVersion)
        appendCheckerRow(
            STATUSBADGES.INFO,
            ADAGIOCHECK.ANALYTICS,
            `<code>${prebidWrapper[0]}.version</code>: <code>${prebidVersion}</code>`,
        );
    else if (!hasEnabledAnalytics)
        appendCheckerRow(
            STATUSBADGES.INFO,
            ADAGIOCHECK.ANALYTICS,
            `<code>ADAGIO.versions.adagioAnalyticsAdapter</code>: <code>${hasEnabledAnalytics}</code>`,
        );
    else if (!hasPrebidNineVersion)
        appendCheckerRow(
            STATUSBADGES.OK,
            ADAGIOCHECK.ANALYTICS,
            `Prebid version: <code>${prebidVersion}</code> / Analytics: <code>${hasEnabledAnalytics}</code>`,
        );
    else {
        // Try to retrieve the 'options' from the analytics wrapper configuration
        let paramOrganizationId = adagioAdapter?.options?.organizationId;
        let paramSitename = adagioAdapter?.options?.site;

        // Options are necessary for Adagio to get the analytics even if the Adagio bidder adapter is not loaded
        if (!paramOrganizationId || !paramSitename) {
            appendCheckerRow(
                STATUSBADGES.CHECK,
                ADAGIOCHECK.ANALYTICS,
                `Missing parameters: <code>${prebidWrapper[0]}.enableAnalytics.options</code> should contain 'organizationId' and 'site'`,
            );
        } else {
            appendCheckerRow(
                STATUSBADGES.OK,
                ADAGIOCHECK.ANALYTICS,
                `Options: <code>${adagioAdapter?.options}</code>`,
            );
        }
    }
}

function checkUserIds() {
    // Check if Prebid wrapper is present
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.USERIDS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        return;
    }

    // Check if Get User IDs function is enabled
    if (typeof prebidObject.getUserIdsAsEids !== "function") {
        appendCheckerRow(
            STATUSBADGES.INFO,
            ADAGIOCHECK.USERIDS,
            `<code>${prebidWrapper[0]}.getUserIdsAsEids()</code> is not a function`,
        );
        return;
    }

    // Count the total installed user IDs
    const userIds = prebidObject.getUserIdsAsEids();
    const totalInstalledUserIds = userIds.length;
    const presentUserIds = userIds.filter((userId) => userId.uids.length > 0);

    if (presentUserIds.length > 0) {
        // Count the present user IDs
        const presentUserIdsCount = presentUserIds.length;

        // Get the names of present user IDs
        const presentUserIdsNames = presentUserIds.map(
            (userId) => userId.source,
        );

        // Calculate the percentage of present user IDs
        const percentagePresent =
            (presentUserIdsCount / totalInstalledUserIds) * 100;

        // Display the information
        appendCheckerRow(
            STATUSBADGES.OK,
            ADAGIOCHECK.USERIDS,
            `
            • Installed / present: <code>${totalInstalledUserIds}/${presentUserIdsCount} (${percentagePresent.toFixed(2)}%)</code><br>
            • Found uids: <code>${presentUserIdsNames.join(", ")}</code>
        `,
        );
    } else {
        // Indicate that no user IDs are present
        appendCheckerRow(
            STATUSBADGES.INFO,
            ADAGIOCHECK.USERIDS,
            "No User IDs present",
        );
    }
}

function checkAdagioAdUnitParams() {
    // Adunits requieres pbjs
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.ADUNITS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        // Gets bidrequest arguments
        prebidBidsRequested = prebidEvents
            .filter((e) => e.eventType === "bidRequested")
            .map((e) => e.args);
        // Gets list of bidders out of bidrequested
        prebidBidders = [
            ...new Set(prebidBidsRequested.map((e) => e.bidderCode)),
        ].sort();
        // Gets flat list of bids
        prebidBids = prebidBidsRequested.map((e) => e.bids).flat();
        // Gets the Adagio bids requested
        prebidAdagioBidsRequested = prebidBids.filter((e) =>
            e.bidder?.toLowerCase()?.includes("adagio"),
        );
        
        // Find the params for Adagio adUnits and update manager URL
        prebidAdagioParams = prebidAdagioBidsRequested.map((e) => e.params);
        if (prebidAdagioParams.length !== 0) {
            // Update manager url
            updateManagerFilters(prebidAdagioParams[0]);
            // Get all the orgId parameter value sent to fill organizationIds[]
            for (const param in prebidAdagioParams) {
                let paramOrganizationId =
                    prebidAdagioParams[param]?.organizationId;
                if (!organizationIds.includes(paramOrganizationId))
                    organizationIds.push(paramOrganizationId);
            }
        }

        // Find every adUnitsCode declared through bid requested
        prebidAdUnitsCodes = new Set();
        const bidRequested = prebidBidsRequested.map((e) => e.bids);
        for (const bid of bidRequested) {
            for (const adUnit of bid) {
                prebidAdUnitsCodes.add(adUnit.adUnitCode);
            }
        }
        // Find adUnitsCodes found in Adagio bid requested
        prebidAdagioAdUnitsCodes = [
            ...new Set(prebidAdagioBidsRequested.map((e) => e.adUnitCode)),
        ];
        // Find adUnitsCode found in ADAGIO object (adCall received)
        let adagioAdUnitsCodes = [];
        adagioPbjsAdUnitsCode = [];

        if (adagioAdapter !== undefined) {
            adagioAdUnitsCodes = adagioAdapter?.adUnits;
            if (adagioAdUnitsCodes === undefined) adagioAdUnitsCodes = [];
            adagioPbjsAdUnitsCode = adagioAdapter?.pbjsAdUnits?.map(
                (e) => e.code,
            );
            if (adagioPbjsAdUnitsCode === undefined) adagioPbjsAdUnitsCode = [];
        }

        totalPrebidAdUnitsCodes = prebidAdUnitsCodes.size;
        totalPrebidAdagioAdUnitsCode = prebidAdagioAdUnitsCodes.length;
        totalAdagioAdUnitsCodes = adagioAdUnitsCodes.length;
        totalAdagioPbjsAdUnitsCodes = adagioPbjsAdUnitsCode.length;

        if (totalPrebidAdUnitsCodes === 0) {
            appendCheckerRow(
                STATUSBADGES.KO,
                ADAGIOCHECK.ADUNITS,
                `<kbd>${totalPrebidAdUnitsCodes}</kbd> adUnits(s) found`,
            );
        } else if (
            totalPrebidAdUnitsCodes > 0 &&
            totalPrebidAdagioAdUnitsCode === 0
        ) {
            appendCheckerRow(
                STATUSBADGES.KO,
                ADAGIOCHECK.ADUNITS,
                `Adagio called for <kbd>${totalPrebidAdagioAdUnitsCode}</kbd> adUnit(s) out of <kbd>${totalPrebidAdUnitsCodes}</kbd> adUnits(s) found`,
            );
        } else if (
            totalPrebidAdUnitsCodes > 0 &&
            totalPrebidAdagioAdUnitsCode > 0
        ) {
            if (totalPrebidAdUnitsCodes > totalPrebidAdagioAdUnitsCode) {
                appendCheckerRow(
                    STATUSBADGES.CHECK,
                    ADAGIOCHECK.ADUNITS,
                    `Adagio called for <kbd>${totalPrebidAdagioAdUnitsCode}</kbd> adUnit(s) out of <kbd>${totalPrebidAdUnitsCodes}</kbd> adUnits(s) found`,
                );
            } else {
                appendCheckerRow(
                    STATUSBADGES.OK,
                    ADAGIOCHECK.ADUNITS,
                    `Adagio called for <kbd>${totalPrebidAdagioAdUnitsCode}</kbd> adUnit(s) out of <kbd>${totalPrebidAdUnitsCodes}</kbd> adUnits(s) found`,
                );
            }
        }
        // Fill the Adunits table with all the requested bids
        appendAdUnitsRow(prebidBidders, prebidBids);
    }
}

function checkDuplicatedAdUnitCode() {
    // In one bidRequest, we shall find only one occurence of each adUnit code detected
    // If not, it will be refused
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.DUPLICATED,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        const duplicates = [];
        const adgioBidsRequested = prebidBidsRequested.filter((e) =>
            e.bidderCode?.toLowerCase()?.includes("adagio"),
        );

        adgioBidsRequested.forEach((bidRequested) => {
            const adUnitCodes = new Set();
            bidRequested.bids.forEach((bid) => {
                if (adUnitCodes.has(bid.adUnitCode)) {
                    if (!duplicates.includes(bid.adUnitCode))
                        duplicates.push(bid.adUnitCode);
                } else {
                    adUnitCodes.add(bid.adUnitCode);
                }
            });
        });
        if (duplicates.length !== 0)
            appendCheckerRow(
                STATUSBADGES.KO,
                ADAGIOCHECK.DUPLICATED,
                `<code>${duplicates}</code>`,
            );
        else
            appendCheckerRow(
                STATUSBADGES.OK,
                ADAGIOCHECK.DUPLICATED,
                `No duplicated found`,
            );
    }
}

async function checkPublisher() {
    // Fetch the Adagio seller.json to ensure that the orgId refers to an existing organization
    let adagioSellersJsonUrl = "https://adagio.io/sellers.json";
    let adagioSellersJson = null;
    let organizationJson = null;

    // Fill the alert with number of orgIds found
    const tabName = ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-");
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

    if (organizationIds.length > 0) {
        // Fetch the adagio sellers.json
        try {
            const response = await fetch(adagioSellersJsonUrl);
            adagioSellersJson = await response.json();
            // Fill with org found
            alertTextDiv.innerHTML += `<small>• Organization(s) detected: </small>`;
            for (const organizationId in organizationIds) {
                organizationJson = adagioSellersJson?.sellers.filter(
                    (e) => e.seller_id === organizationIds[organizationId],
                );
                alertTextDiv.innerHTML += `<small><code>${organizationJson[0].name} (${organizationJson[0].seller_id}) - ${organizationJson[0].seller_type}</code></small><br>`;
            }
        } catch (error) {
            // Handle JSON failure here
            adagioSellersJson = null;
        }
    }
    else {
        alertTextDiv.innerHTML += `<small>• No organization(s) detected... Try to refresh the checker or the page.`;
    }
}

function checkFloorPriceModule() {
    // Floor price requiere Prebid as it is a Prebid module
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.FLOORS,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    }
    // Floor price module allow to share the lower price acceptable for an adUnit with the bidders
    else {
        const prebidFloorPrice = prebidObject.getConfig("floors");
        if (prebidFloorPrice !== undefined) {
            appendCheckerRow(
                STATUSBADGES.INFO,
                ADAGIOCHECK.FLOORS,
                `<code>${JSON.stringify(prebidFloorPrice)}</code>`,
            );
        } else {
            appendCheckerRow(
                STATUSBADGES.INFO,
                ADAGIOCHECK.FLOORS,
                `<code>${prebidWrapper[0]}.getConfig('floors')</code>: <code>${prebidFloorPrice}</code>`,
            );
        }
    }
}

function checkCurrencyModule() {
    // Currency requiere Prebid as it is a Prebid module
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.CURRENCY,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    }
    // Currency module allow to bid regardless of the adServer currency. It's mandatory when the adServer currency isn't USD
    else {
        const prebidCurrency = prebidObject.getConfig("currency");
        if (prebidCurrency !== undefined) {
            appendCheckerRow(
                STATUSBADGES.OK,
                ADAGIOCHECK.CURRENCY,
                `<code>${JSON.stringify(prebidCurrency)}</code>`,
            );
        } else {
            appendCheckerRow(
                STATUSBADGES.CHECK,
                ADAGIOCHECK.CURRENCY,
                `<code>${prebidWrapper[0]}.getConfig('currency')</code>: <code>${prebidCurrency}</code>`,
            );
        }
    }
}

function checkSupplyChainObject() {
    // The supply chain object is a transparency coding the supply chain
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.SCO,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        appendConsentsRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.SCO,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        return;
    } else if (typeof prebidObject.getEvents !== "function") {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.SCO,
            `<code>${prebidWrapper[0]}.getEvents()</code> is not a function`,
        );
        appendConsentsRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.SCO,
            `<code>${prebidWrapper[0]}.getEvents()</code> is not a function`,
        );
        return;
    }
    // Find the first Adagio bidRequested event with an SCO
    const adagioBid = prebidEvents
        .filter((e) => e.eventType === "bidRequested") // && e.args.bidderCode.toLowerCase().includes('adagio'))
        .map((e) => e.args.bids)
        .flat()
        .find((r) => r.schain);
    if (adagioBid !== undefined) {
        appendCheckerRow(
            STATUSBADGES.OK,
            ADAGIOCHECK.SCO,
            `<code>${JSON.stringify(adagioBid.schain)}</code>`,
        );
        // appendConsentsRow(STATUSBADGES.OK, 'Supply chain object', `<code>${JSON.stringify(adagioBid.schain)}</code>`);
    } else {
        appendCheckerRow(
            STATUSBADGES.CHECK,
            ADAGIOCHECK.SCO,
            "If website is owned and operated, no SCO",
        );
        // appendConsentsRow(STATUSBADGES.CHECK, 'Supply chain object', 'If website is owned and managed, no SCO');
    }
}

function checkConsentMetadata() {
    // From country to country, regulation may apply (like GDPR)
    if (prebidObject === undefined) {
        appendConsentsRow(
            STATUSBADGES.KO,
            "Consents",
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
        return;
    } else if (typeof prebidObject.getConsentMetadata !== "function") {
        appendCheckerRow(
            STATUSBADGES.CHECK,
            "Consents",
            `<code>${prebidWrapper[0]}.getConsentMetadata()</code> not a function`,
        );
        appendConsentsRow(
            STATUSBADGES.CHECK,
            "Consents",
            `<code>${prebidWrapper[0]}.getConsentMetadata()</code> not a function`,
        );
        return;
    }

    // Gets consents metadata from prebid object
    let consentMetadata = prebidObject.getConsentMetadata();
    if (consentMetadata !== undefined) {
        let gdprMetadata = consentMetadata?.gdpr;
        let gppMetadata = consentMetadata?.gpp;
        // let coppaMetadata = consentMetadata?.coppa;
        // let uspMetadata = consentMetadata?.usp;

        // If has gdpr set, then ok
        if (gdprMetadata !== undefined && gdprMetadata?.consentStringSize > 0) {
            appendCheckerRow(
                STATUSBADGES.OK,
                "GDPR metadata",
                `<code>${JSON.stringify(gdprMetadata)}</code>`,
            );
        } else
            appendCheckerRow(
                STATUSBADGES.CHECK,
                "Consent metadata",
                `<code>${prebidWrapper[0]}.getConsentMetadata()</code>: <code>${JSON.stringify(consentMetadata)}</code>`,
            );
    } else {
        appendCheckerRow(
            STATUSBADGES.CHECK,
            "Consent metadata",
            `<code>${prebidWrapper[0]}.getConsentMetadata()</code>: <code>${JSON.stringify(consentMetadata)}</code>`,
        );
    }
}

function checkGgprConsentString() {
    // Has been found or not
    let hasCstString = false;
    // Checks if bids have been requested
    if (prebidBidsRequested !== undefined) {
        // Loop on the bidrequests
        prebidBidsRequested.forEach((bidRequested) => {
            // Look for consent string
            let cstString = bidRequested?.gdprConsent?.consentString;
            // Checks if not empty
            if (cstString !== undefined && !hasCstString) {
                appendCheckerRow(
                    STATUSBADGES.OK,
                    "GDPR consent string",
                    `<code>${cstString}</code>`,
                );
                hasCstString = true;
            }
        });
    } else {
        appendCheckerRow(
            STATUSBADGES.KO,
            "GDPR consent string",
            `<code>${prebidBidsRequested}</code>`,
        );
    }
}

function checkAdagioCMP() {
    // Based on Adagio resellers, ensure resellers CMP is present in the tcfapi configuration
    if (typeof window.__tcfapi !== "function") {
        appendCheckerRow(
            STATUSBADGES.KO,
            "Consent management platform",
            "<code>window.__tcfapi</code> function is not defined",
        );
        appendConsentsRow(
            STATUSBADGES.KO,
            "Consent management platform",
            "<code>window.__tcfapi</code> function is not defined",
        );
        return;
    }
    // Gives the Consent Management strings values
    window.__tcfapi("getTCData", 2, (tcdata, success) => {
        const cmpAdagioBidders = new Map();
        cmpAdagioBidders.set(617, "Adagio");
        cmpAdagioBidders.set(58, "33Across");
        cmpAdagioBidders.set(1218, "Aidem");
        cmpAdagioBidders.set(138, "ConnectAd");
        cmpAdagioBidders.set(90, "E-Planning");
        cmpAdagioBidders.set(285, "Freewheel");
        cmpAdagioBidders.set(149, "Illumin / ADman");
        cmpAdagioBidders.set(910, "Insticator");
        cmpAdagioBidders.set(253, "Improve Digital");
        cmpAdagioBidders.set(10, "Index Exchange");
        cmpAdagioBidders.set(36, "Nexxen (Unruly)");
        cmpAdagioBidders.set(241, "OneTag");
        cmpAdagioBidders.set(69, "OpenX");
        cmpAdagioBidders.set(76, "Pubmatic");
        cmpAdagioBidders.set(16, "RTB House S.A.");
        cmpAdagioBidders.set(52, "Rubicon");
        cmpAdagioBidders.set(45, "Smart Adserver");
        cmpAdagioBidders.set(13, "Sovrn");
        cmpAdagioBidders.set(28, "TripleLift");
        // cmpAdagioBidders.set(25, 'Yahoo');

        let adagioFound = false;
        let biddersNotFound = "";

        for (let [key, value] of cmpAdagioBidders) {
            const consent = tcdata.vendor.consents[key];
            const legitimate = tcdata.vendor.legitimateInterests[key];

            if (key === 617 && (consent || legitimate)) {
                adagioFound = true;
            }

            // Build the line values per partner
            const bidderName = "<code>" + value + " (" + key + ")</code>";
            const bidderConsent = consent ? STATUSBADGES.OK : STATUSBADGES.KO;
            const bidderLegitimate = legitimate ?
                STATUSBADGES.OK :
                STATUSBADGES.KO;
            appendConsentsRow(bidderName, bidderConsent, bidderLegitimate);

            // Build the log string of partners CMP to add
            if (!consent) biddersNotFound = biddersNotFound + bidderName + "; ";
        }

        if (biddersNotFound !== "") {
            if (!adagioFound)
                appendCheckerRow(
                    STATUSBADGES.KO,
                    "Consent management platform",
                    `Missing: ${biddersNotFound}`,
                );
            else
                appendCheckerRow(
                    STATUSBADGES.CHECK,
                    "Consent management platform",
                    `Missing: ${biddersNotFound}`,
                );
        } else {
            appendCheckerRow(
                STATUSBADGES.OK,
                "Consent management platform",
                "Adagio consent: <code>true</code>",
            );
        }
    });
}

function checkDsaTransparency() {
    // Since Prebid 9, the pagetype and category Adagio parameters are to be stored in the first-party data (ortb2).
    if (prebidObject === undefined) {
        appendCheckerRow(
            STATUSBADGES.KO,
            ADAGIOCHECK.DSA,
            ADAGIOERRORS.PREBIDNOTFOUND,
        );
    } else {
        const prebidOrtb2 = prebidObject.getConfig("ortb2");
        if (prebidOrtb2 !== undefined) {

            let dsa = prebidOrtb2?.regs?.ext?.dsa;
            let dsarequired = prebidOrtb2?.regs?.ext?.dsa?.dsarequired;
            let pubrender = prebidOrtb2?.regs?.ext?.dsa?.pubrender;
            let datatopub = prebidOrtb2?.regs?.ext?.dsa?.datatopub;
            let transparency = prebidOrtb2?.regs?.ext?.dsa?.transparency;

            if (dsa === undefined)
                appendCheckerRow(
                    STATUSBADGES.INFO,
                    ADAGIOCHECK.DSA,
                    `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`,
                );
            else {
                if (dsarequired === undefined || pubrender === undefined || datatopub === undefined || transparency === undefined)
                    appendCheckerRow(
                        STATUSBADGES.KO,
                        ADAGIOCHECK.DSA,
                        `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`,
                    );
                else
                    appendCheckerRow(
                        STATUSBADGES.OK,
                        ADAGIOCHECK.DSA,
                        `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`,
                    );
            }

        } else {
            appendCheckerRow(
                STATUSBADGES.INFO,
                ADAGIOCHECK.DSA,
                `<code>${prebidWrapper[0]}.getConfig('ortb2')</code>: <code>${JSON.stringify(prebidOrtb2)}</code>`,
            );
        }
    }
}
