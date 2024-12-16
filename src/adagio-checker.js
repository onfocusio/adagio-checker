/*************************************************************************************************************************************************************************************************************************************
 * Prebid core functions import
 ************************************************************************************************************************************************************************************************************************************/
import { run } from './checker-functions';

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
// Active tab (from button html element)
let activeTab = undefined;
// Variables for draggable iframe
let isDragging = false;
// Adagio API key detected
let adagioApiKeyfound = false;

/*************************************************************************************************************************************************************************************************************************************
 * Enums
 ************************************************************************************************************************************************************************************************************************************/

const ADAGIOSVG = Object.freeze({
    LOGO: '<svg viewBox="0 0 101 92" style="height:1.5em;"><path d="M97 88.598H84.91l-33.473-72.96-.817-1.707-6.398 13.836 28.143 60.916h-12.2l-.106-.237-21.82-47.743-6.428 13.9 15.978 34.08H35.59l-9.802-21.056-9.698 20.97H4L43.109 4H57.89L97 88.598Z"></path></svg>',
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
    INFO: `<kbd style="color:${COLOR.BLUETEXT};background-color:${COLOR.BLUEBACKGROUND};">Info</kbd>`,
    NA: `<kbd style="color:${COLOR.GREYTEXT};background-color:${COLOR.GREYBACKGROUD};">N/A</kbd>`,
});

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

function runCheck() {
    createOverlay();
    buildOverlayHtml();
    buildAdagioButton();
    createCheckerDiv();
    createAdUnitsDiv();
    createConsentsDiv();
    makeIframeDraggable();
}
runCheck();
let result = run(window, null, null);
console.log('helllo bitch');

/*************************************************************************************************************************************************************************************************************************************
 * HTML functions
 ************************************************************************************************************************************************************************************************************************************/

function createOverlay() {
    // create a new button element
    buttonFrame = window.document.createElement("iframe");
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
    /*ul.appendChild(
        buildPrebidButton("Prebid versions detected", ADAGIOSVG.PREBID, true),
    );*/
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
    a.setAttribute("href", "https://www.notion.so/adagioio/Presentation-2eec6495921045e18481fb0cf270a2d4?pvs=4");
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
        if (prebidWrapper === item) {
            itemInput.checked = true;
        }

        itemInput.addEventListener("click", function() {
            if (itemInput.checked) {
                prebidWrapper = prebidWrappers[itemInput.value];
                prebidObject = prebidWrapper[1][prebidWrapper[0]];
                refreshTables();
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
    button.addEventListener("click", () => refreshTables());
    button.classList.add("outline");
    button.style.borderColor = "transparent";
    button.style.padding = "0.3em";
    li.appendChild(button);
    return li;
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

function refreshTables() {
    goTopPage();
    const checkertbody = overlayFrameDoc.getElementById(
        `${ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-")}-tbody`,
    );
    const checkeradunits = overlayFrameDoc.getElementById(
        `${ADAGIOTABSNAME.ADUNITS.toLowerCase().replace(" ", "-")}-tbody`,
    );
    const checkerconsents = overlayFrameDoc.getElementById(
        `${ADAGIOTABSNAME.CONSENTS.toLowerCase().replace(" ", "-")}-tbody`,
    );
    const alertTextDiv = overlayFrameDoc.getElementById(
        `${ADAGIOTABSNAME.CHECKER.toLowerCase().replace(" ", "-")}-alert`,
    );
    checkertbody.innerHTML = "";
    checkeradunits.innerHTML = "";
    checkerconsents.innerHTML = "";
    alertTextDiv.innerHTML = ""; 
    runCheck();
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

function createParametersCheckTable(paragraph, paramsCheckingArray) {
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