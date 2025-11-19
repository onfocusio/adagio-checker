import { chkr_svg, chkr_tabs, chkr_colors, chkr_badges } from './enums.js';
import {
    prebidWrappers,
    prebidWrapper,
    prebidVersionDetected,
    switchToSelectedPrebidWrapper,
} from './checker.js';
import { main } from './main.js';
import {
    loadDebuggingMode,
    computeAdUnitStatus,
    detectedCountryCodeIso3,
    getPrebidVersion,
    getParamsFromBidRequestedEvent,
} from './utils.js';
import { TCString } from '@iabtcf/core';

export let overlayFrame = undefined; // HTML iframe element for the overlay
export let overlayFrameDoc = undefined; // Document object for the overlay iframe
let activeTab = undefined; // Active tab name
let isDragged = false; // Is the iframe being dragged

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

export async function buildApp() {
    // Build the check app overlay
    createOverlay();
    buildInterface();
    createCheckerDiv();
    createAdUnitsDiv();
    createMeasurersDiv();
    makeIframeDraggable();
}

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

export function createOverlay() {
    // create a new iframe element
    overlayFrame = window.document.createElement('iframe');
    overlayFrame.id = 'adagio-overlay-frame';
    overlayFrame.style.position = 'fixed';
    overlayFrame.style.top = '10px';
    overlayFrame.style.left = '10px';
    overlayFrame.style.width = '1000px';
    overlayFrame.style.height = '95%';
    overlayFrame.style.zIndex = '2147483647';
    overlayFrame.style.backgroundColor = 'transparent';
    overlayFrame.style.border = 'none';
    overlayFrame.style.borderRadius = '10px';
    overlayFrame.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
    overlayFrame.style.resize = 'both';
    overlayFrame.style.display = 'block';
    window.document.body.appendChild(overlayFrame);

    // get the iframe document objects
    overlayFrameDoc =
        overlayFrame.contentDocument || overlayFrame.contentWindow.document;
}

export function buildInterface() {
    // append pico style
    const picoStyle = overlayFrameDoc.createElement('link');
    picoStyle.setAttribute('rel', 'stylesheet');
    picoStyle.setAttribute(
        'href',
        'https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.7/css/pico.min.css',
    );

    // create navigation element
    const nav = buildNavBar();
    nav.appendChild(buildAdagioLogo());

    // create second unordered list inside navigation
    const ul = overlayFrameDoc.createElement('ul');
    ul.appendChild(buildTabButton(chkr_tabs.checker, chkr_svg.checker, true));
    ul.appendChild(buildTabButton(chkr_tabs.adunits, chkr_svg.adunits, false));
    ul.appendChild(
        buildTabButton(chkr_tabs.measurers, chkr_svg.measurers, false),
    );
    ul.appendChild(buildWrappersDropdownSelector());
    ul.appendChild(
        buildDebuggingButton(
            'Enable debbug mode and reload page',
            chkr_svg.debbuging,
            true,
        ),
    );
    ul.appendChild(buildRefreshButton('Refresh', chkr_svg.refresh, true));

    // append unordered lists to navigation
    nav.appendChild(ul);

    // append main containers to iframeDoc body
    overlayFrameDoc.head.appendChild(picoStyle);
    overlayFrameDoc.body.appendChild(nav);
}

export function createCheckerDiv() {
    // build id name
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');

    // create main container element
    const mainContainer = overlayFrameDoc.createElement('main');
    mainContainer.classList.add('container-fluid');
    mainContainer.setAttribute('id', `${tabName}-container`);
    mainContainer.style.paddingTop = '5rem';
    mainContainer.style.paddingBottom = '0';

    // create headings container
    const headings = overlayFrameDoc.createElement('div');
    headings.classList.add('headings');

    // create and append h2 and h3
    const h2 = overlayFrameDoc.createElement('h2');
    h2.textContent = 'Integration checker';
    const h3 = overlayFrameDoc.createElement('h3');
    h3.textContent = 'Expectations for a proper Adagio integration';
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article and text
    const alertContainer = overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    const alertTextDiv = overlayFrameDoc.createElement('div');
    alertTextDiv.setAttribute('id', `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create table element
    const table = overlayFrameDoc.createElement('table');
    const thead = overlayFrameDoc.createElement('thead');
    const tr = overlayFrameDoc.createElement('tr');
    const th1 = overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Status';
    const th2 = overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Name';
    const th3 = overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Details';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    const tbody = overlayFrameDoc.createElement('tbody');
    tbody.setAttribute('id', `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);
    mainContainer.appendChild(table);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

export function createAdUnitsDiv() {
    // build id name
    const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');

    // create main container element
    const mainContainer = overlayFrameDoc.createElement('main');
    mainContainer.classList.add('container-fluid');
    mainContainer.setAttribute('id', `${tabName}-container`);
    mainContainer.style.display = 'none';
    mainContainer.style.paddingTop = '5rem';
    mainContainer.style.paddingBottom = '0';

    // create headings container
    const headings = overlayFrameDoc.createElement('div');
    headings.classList.add('headings');
    const h2 = overlayFrameDoc.createElement('h2');
    h2.textContent = 'Measurers';
    const h3 = overlayFrameDoc.createElement('h3');
    h3.textContent = 'Measurers from adagio.js (for viewability)';
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article
    const alertContainer = overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    const alertTextDiv = overlayFrameDoc.createElement('div');
    alertTextDiv.setAttribute('id', `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create bidder filter
    const bidderFilter = overlayFrameDoc.createElement('details');
    bidderFilter.setAttribute('role', 'list');
    const selectFilter = overlayFrameDoc.createElement('summary');
    selectFilter.setAttribute('aria-haspopup', 'listbox');
    selectFilter.textContent = 'Filter requested bids by bidders';
    const ulFilter = overlayFrameDoc.createElement('ul');
    ulFilter.setAttribute('role', 'listbox');
    ulFilter.setAttribute('id', 'bidderFilter');
    bidderFilter.appendChild(selectFilter);
    bidderFilter.appendChild(ulFilter);

    // create table element
    const table = overlayFrameDoc.createElement('table');
    const thead = overlayFrameDoc.createElement('thead');
    const tr = overlayFrameDoc.createElement('tr');
    const th0 = overlayFrameDoc.createElement('th');
    th0.setAttribute('scope', 'col');
    th0.textContent = 'Status';
    const th1 = overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Viewability';
    const th2 = overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Code';
    const th3 = overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Mediatypes';
    const th4 = overlayFrameDoc.createElement('th');
    th4.setAttribute('scope', 'col');
    th4.textContent = '🔎 Bidder params';
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);
    thead.appendChild(tr);

    const tbody = overlayFrameDoc.createElement('tbody');
    tbody.setAttribute('id', `${tabName}-tbody`);
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

export function createMeasurersDiv() {
    // build id name
    const tabName = chkr_tabs.measurers.toLowerCase().replace(' ', '-');

    // create main container element
    const mainContainer = overlayFrameDoc.createElement('main');
    mainContainer.classList.add('container-fluid');
    mainContainer.setAttribute('id', `${tabName}-container`);
    mainContainer.style.display = 'none';
    mainContainer.style.paddingTop = '5rem';
    mainContainer.style.paddingBottom = '0';

    // create headings container
    const headings = overlayFrameDoc.createElement('div');
    headings.classList.add('headings');
    const h2 = overlayFrameDoc.createElement('h2');
    h2.textContent = 'Measurers';
    const h3 = overlayFrameDoc.createElement('h3');
    h3.textContent = 'Adservers signals caught by adagio.js (for viewability)';
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article
    const alertContainer = overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    // create the text div for container
    const alertTextDiv = overlayFrameDoc.createElement('div');
    alertTextDiv.setAttribute('id', `${tabName}-alert`);

    // Displays the ADAGIO.ckrViewability entries with issues
    if (ADAGIO.ckrViewability) {
        // Display the bidrequest json from pbjs.getEvents()
        const paragraph = overlayFrameDoc.createElement('p');
        paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(ADAGIO.ckrViewability, null, 2)}</code></pre>`;
        alertTextDiv.appendChild(paragraph);
    }

    // append text to container
    alertContainer.appendChild(alertTextDiv);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);

    // append the container to the body
    overlayFrameDoc.body.appendChild(mainContainer);
}

export function makeIframeDraggable() {
    // Gets elements IDs
    const navbar = overlayFrameDoc.getElementById('adagio-nav');
    let targetElement = undefined;

    // Set up start x, y
    let startX = 0;
    let startY = 0;

    navbar.addEventListener('mousedown', startDragging);
    navbar.addEventListener('mouseup', stopDragging);
    navbar.addEventListener('mouseover', updateCursor);
    overlayFrame.addEventListener('mouseup', stopDragging);

    function updateCursor(e) {
        targetElement = e.target.tagName;
        if (
            targetElement === 'NAV' ||
            targetElement === 'UL' ||
            targetElement === 'LI'
        ) {
            navbar.style.cursor = 'grab';
        } else navbar.style.cursor = 'default';
    }

    function startDragging(e) {
        targetElement = e.target.tagName;
        if (
            targetElement === 'NAV' ||
            targetElement === 'UL' ||
            targetElement === 'LI'
        ) {
            isDragged = true;
            navbar.style.cursor = 'grabbing';
            overlayFrame.style.opacity = '0.4';
            startX = e.clientX;
            startY = e.clientY;
        }
    }

    function stopDragging() {
        isDragged = false;
        navbar.style.cursor = 'grab';
        overlayFrame.style.opacity = '';
    }

    overlayFrameDoc.addEventListener('mousemove', function (e) {
        if (!isDragged) {
            return;
        }
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const iframeRect = overlayFrame.getBoundingClientRect();
        const iframeX = iframeRect.left;
        const iframeY = iframeRect.top;
        overlayFrame.style.left = iframeX + deltaX + 'px';
        overlayFrame.style.top = iframeY + deltaY + 'px';
    });
}

export function appendCheckerRow(status, name, details) {
    // build id name
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    // get the tbody element
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);
    // Create the row
    const newRow = overlayFrameDoc.createElement('tr');
    // Create the cells
    const statusCell = overlayFrameDoc.createElement('td');
    const nameCell = overlayFrameDoc.createElement('td');
    nameCell.style.whiteSpace = 'nowrap'; // prevent wrapping
    const detailsCell = overlayFrameDoc.createElement('td');
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

export function appendHomeContainer(htmlContent) {
    // Fill the home info container
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);
    alertTextDiv.innerHTML += `<small>• ${htmlContent}</small><br>`;
}

export function appendAdUnitsRow(
    prebidBidders,
    prebidBidRequested,
    prebidAdagioBidRequested,
    apiRecordsItems,
) {
    // check if Adagio is detected and get bidder name
    let adagioId = '';
    if (prebidAdagioBidRequested.length)
        adagioId = prebidAdagioBidRequested[0].bidder;

    // build id name
    const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');
    // gets working element element
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);

    // Get unique adUnit codes (filter out falsy values)
    const prebidAdUnitsCodes = Array.isArray(prebidBidRequested)
        ? [
            ...new Set(
                prebidBidRequested.map((b) => b?.adUnitCode).filter(Boolean),
            ),
        ]
        : [];

    // Display adunits detected
    const codesHtml = prebidAdUnitsCodes
        .map((code) => `<small> <code>${code}</code>;</small>`)
        .join(' ');
    alertTextDiv.innerHTML += `• <small>Adunit(s):</small> ${codesHtml ? ' ' + codesHtml : '<small><code>0</code></small>'}<br>`;

    // Will hold the computed status for each adunit
    const computedAdunitsStatus = [];

    // Will hold the list of processed adunit codes to avoid duplicates
    const processedAdUnitCodes = [];

    // Fill the table section
    prebidBidRequested.forEach((bid) => {
        // Gather the initial info: code, type, bidder
        const adUnitCode = bid.adUnitCode || null;
        const mediaTypes = bid.mediaTypes || {};
        const bidderId = bid.bidder || '_null';

        // Checks if the concerned bidder is Adagio
        const bidderAdagioDetected = bidderId.toLowerCase().includes('adagio');

        // Build the bid checking array and compute the adunit status
        let paramsCheckingArray = [];
        if (bidderAdagioDetected)
            buildParamsCheckingArray(bid, paramsCheckingArray, apiRecordsItems);
        // Extract all the status values (first element of each array) from paramsCheckingArray
        const extractedStatus = paramsCheckingArray.map((item) => item[0]);
        const status = bidderAdagioDetected
            ? computeAdUnitStatus(extractedStatus)
            : chkr_badges.na;

        // Store the computed status for the adunit
        if (bidderAdagioDetected) {
            if (!processedAdUnitCodes.includes(adUnitCode)) {
                computedAdunitsStatus.push(status);
                processedAdUnitCodes.push(adUnitCode);
            }
        }

        // Create the row
        const newRow = overlayFrameDoc.createElement('tr');
        newRow.classList.add(`${bidderId.replace(' ', '-')}-bid`);
        // hides the row if adagio detected
        if (adagioId !== '' && adagioId !== bidderId) {
            newRow.style.display = 'none';
        }

        // Create the cells
        const statusCell = overlayFrameDoc.createElement('td');
        const viewabilityCell = overlayFrameDoc.createElement('td');
        const codeCell = overlayFrameDoc.createElement('td');
        const mediatypesCell = overlayFrameDoc.createElement('td');
        const bidderIdCell = overlayFrameDoc.createElement('td');
        const bidderParamButton = overlayFrameDoc.createElement('kbd');
        bidderParamButton.addEventListener('click', () =>
            createBidderParamsModal(
                bid,
                paramsCheckingArray,
                bidderAdagioDetected,
            ),
        );
        bidderParamButton.style.cursor = 'pointer';

        // Compute viewability cell value
        let viewabilityIcon = '❓';
        if (ADAGIO.ckrViewability) {
            const entry = ADAGIO.ckrViewability[adUnitCode] || null;
            if (entry && entry.isMeasured) {
                viewabilityIcon = '👁️';
            } else viewabilityIcon = '❌';
        }

        statusCell.innerHTML = status;
        viewabilityCell.innerHTML = viewabilityIcon;
        codeCell.innerHTML = `<code>${adUnitCode}</code>`;
        for (const mediaType in mediaTypes) {
            if (mediaTypes[mediaType]?.context)
                mediatypesCell.innerHTML += `<code>${mediaTypes[mediaType].context}</code> `;
            else mediatypesCell.innerHTML += `<code>${mediaType}</code> `;
        }
        bidderParamButton.innerHTML = `🔎 ${bidderId}`;

        // Add the cells
        newRow.appendChild(statusCell);
        newRow.appendChild(viewabilityCell);
        newRow.appendChild(codeCell);
        newRow.appendChild(mediatypesCell);
        newRow.appendChild(bidderIdCell);
        bidderIdCell.appendChild(bidderParamButton);
        tableBody.appendChild(newRow);
    });

    // fill the filter dropdown list
    const bidderFilter = overlayFrameDoc.getElementById('bidderFilter');

    prebidBidders.forEach((bidder) => {
        const libidder = overlayFrameDoc.createElement('li');
        const labbidder = overlayFrameDoc.createElement('label');
        const inputbidder = overlayFrameDoc.createElement('input');
        inputbidder.setAttribute('type', 'checkbox');
        inputbidder.setAttribute('id', `${bidder.replace(' ', '-')}-bidder`);
        bidderFilter.appendChild(libidder);
        libidder.appendChild(labbidder);
        labbidder.appendChild(inputbidder);
        labbidder.innerHTML += `<code>${bidder}</code>`;

        const newInput = overlayFrameDoc.getElementById(
            `${bidder.replace(' ', '-')}-bidder`,
        );
        if (adagioId !== '' && adagioId !== bidder) newInput.checked = false;
        else newInput.checked = true;
        newInput.addEventListener('click', function () {
            toggleBidRow(newInput, bidder);
        });
    });

    // return the computed status for each adunit
    return computedAdunitsStatus;
}

/*************************************************************************************************************************************************************************************************************************************
 * Helper functions
 ************************************************************************************************************************************************************************************************************************************/

function buildNavBar() {
    // create navigation element
    const nav = overlayFrameDoc.createElement('nav');
    nav.classList.add('container-fluid');
    nav.setAttribute('id', 'adagio-nav');
    nav.style.zIndex = '99';
    nav.style.position = 'fixed';
    nav.style.top = '0';
    nav.style.right = '0';
    nav.style.left = '0';
    nav.style.padding = '0 var(--spacing)';
    nav.style.backgroundColor = 'var(--card-background-color)';
    nav.style.boxShadow = 'var(--card-box-shadow)';
    return nav;
}

function buildAdagioLogo() {
    // create first unordered list inside navigation
    const ul = overlayFrameDoc.createElement('ul');
    const li = overlayFrameDoc.createElement('li');
    const a = overlayFrameDoc.createElement('a');
    a.setAttribute('href', 'https://app.adagio.io/');
    a.setAttribute('target', '_blank');
    a.innerHTML = chkr_svg.logo;
    li.appendChild(a);
    ul.appendChild(li);
    return ul;
}

function buildTabButton(name, svg, isactive) {
    const tabName = name.toLowerCase().replace(' ', '-');
    const li = overlayFrameDoc.createElement('li');
    const tabButton = overlayFrameDoc.createElement('button');
    tabButton.setAttribute('id', `${tabName}-button`);
    tabButton.innerHTML = svg;
    tabButton.innerHTML += ` ${name} `;
    tabButton.addEventListener('click', () => switchTab(tabName));
    if (!isactive) tabButton.classList.add('outline');
    else activeTab = tabName;
    tabButton.style.padding = '0.3em';
    tabButton.style.textTransform = 'uppercase';
    tabButton.style.fontSize = '0.85em';
    li.appendChild(tabButton);
    return li;
}

function buildWrappersDropdownSelector() {
    // Get the number of wrappers detected
    const nbWrappers = prebidWrappers.length;

    // Container
    const li = overlayFrameDoc.createElement('li');
    li.style.position = 'relative';

    // If not wrappers detected, skip building the selector
    if (!nbWrappers) {
        return li;
    }

    // Badge (shows number of wrappers when >1)
    const badge = overlayFrameDoc.createElement('span');
    badge.style.position = 'absolute';
    badge.style.top = '3px';
    badge.style.right = '-3px';
    badge.style.padding = '0.5em 0.9em';
    badge.style.borderRadius = '50%';
    badge.style.fontSize = '0.6em';
    badge.style.background = chkr_colors.red_bkg;
    badge.style.color = chkr_colors.red_txt;
    badge.innerHTML = nbWrappers;
    if (nbWrappers < 2) badge.style.display = 'none';

    // Select dropdown
    const select = overlayFrameDoc.createElement('select');
    select.style.paddingTop = '0.3em';
    select.style.paddingBottom = '0.3em';
    select.style.fontSize = '0.85em';
    select.style.minWidth = '10rem';
    select.style.cursor = 'pointer';

    // Default placeholder option
    const placeholder = overlayFrameDoc.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = 'Select a wrapper';
    select.appendChild(placeholder);

    // Fill options with detected wrappers
    for (let i = 0; i < nbWrappers; i++) {
        const _prebidWrapper = prebidWrappers[i];
        const _name = _prebidWrapper[0];
        const _win = _prebidWrapper[1];
        const _obj = _win[_name];
        const opt = overlayFrameDoc.createElement('option');
        opt.value = String(i);
        opt.textContent = `${_name} (v${getPrebidVersion(_obj)})`;

        // Mark current wrapper as selected
        if (prebidWrapper[0] === _name && Object.is(prebidWrapper[1], _win)) {
            opt.selected = true;
            placeholder.selected = false;
        }

        select.appendChild(opt);
    }

    // On change, switch to the selected wrapper
    select.addEventListener('change', function () {
        if (this.value !== '') {
            switchToSelectedPrebidWrapper([this.value]);
        }
    });

    li.appendChild(badge);
    li.appendChild(select);

    return li;
}

function buildDebuggingButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement('li');
    const button = overlayFrameDoc.createElement('button');
    button.setAttribute('title', name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener('click', () => loadDebuggingMode());
    button.classList.add('outline');
    button.style.borderColor = 'transparent';
    button.style.padding = '0.3em';
    li.appendChild(button);
    return li;
}

function buildRefreshButton(name, svg, isactive) {
    const li = overlayFrameDoc.createElement('li');
    const button = overlayFrameDoc.createElement('button');
    button.setAttribute('title', name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener('click', () => refreshChecker());
    button.classList.add('outline');
    button.style.borderColor = 'transparent';
    button.style.padding = '0.3em';
    li.appendChild(button);
    return li;
}

function buildParamsCheckingArray(bid, paramsCheckingArray, apiRecordsItems) {
    const params = getParamsFromBidRequestedEvent(bid);

    // Check the adagio bidder params (orgId and site in params)
    let paramOrganizationId = params.organizationId != null ? String(params.organizationId) : null;
    let paramSite = params.site != null ? String(params.site) : null;

    // Since Prebid 9, placement and divId should be in ortb2Imp
    let paramPlacement = params.placement || null;
    let paramAdUnitElementId = params.adUnitElementId || null;
    let ortb2ImpPlacement = bid.ortb2Imp.ext.data.placement || null;
    let ortb2ImpDivId = bid.ortb2Imp.ext.data.divId || null;

    // Check if there's a regs.ext.gdpr param (= 1) and a user.ext.consent param (consent string)
    let ortbGdpr = bid.ortb2.regs.ext.gdpr || null;
    let ortbConsent = bid.ortb2.user.ext.consent || null;

    // Since Prebid 9.39, Adagio supports interstitial and rewarded
    let ortb2ImpInterstitial = bid.ortb2Imp.instl || null;
    let ortb2ImpRewarded = bid.ortb2Imp.rwdd || null;
    let deepOrtb2ImpInterstitial = findParam(bid, 'instl') || null;
    let deepOrtb2ImpRewarded = findParam(bid, 'rwdd') || null;

    // Check the organizationId
    if (paramOrganizationId === undefined)
        paramsCheckingArray.push([
            chkr_badges.ko,
            `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
            'Parameter not detected.',
        ]);
    else {
        if (
            typeof paramOrganizationId === 'string' &&
            !/^\d{4}$/.test(paramOrganizationId)
        ) {
            paramsCheckingArray.push([
                chkr_badges.check,
                `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
                'Should be a 4-digit integer or string (e.g., 1000 or \'1000\').',
            ]);
        } else {
            paramsCheckingArray.push([
                chkr_badges.ok,
                `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`,
                '',
            ]);
        }
    }

    // Check the site name
    if (paramSite === undefined)
        paramsCheckingArray.push([
            chkr_badges.ko,
            `<code>params.site</code>: <code>${paramSite}</code>`,
            'Parameter not detected.',
        ]);
    else {
        if (paramSite.trim() !== paramSite)
            paramsCheckingArray.push([
                chkr_badges.ko,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                'Space character detected.',
            ]);
        else if (apiRecordsItems.size)
            paramsCheckingArray.push([
                chkr_badges.ok,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                '',
            ]);
        else
            paramsCheckingArray.push([
                chkr_badges.ko,
                `<code>params.site</code>: <code>${paramSite}</code>`,
                'No manager inventory matched.',
            ]);
    }

    // AdUnitElementId (1/3): Depending on the Prebid version, we don't expect the same param
    let divIdStatus = '';
    let divIdSetup = '';
    let divIdRes = '';
    let divIdDetails = '';
    // AdUnitElementId (2/3): First checks if a value is detected
    if (prebidVersionDetected >= 9) {
        if (ortb2ImpDivId !== undefined) {
            divIdStatus = chkr_badges.ok;
            divIdSetup = 'ortb2Imp.ext.data.divId';
            divIdRes = ortb2ImpDivId;
            divIdDetails = '';
        } else if (paramAdUnitElementId !== undefined) {
            divIdStatus = chkr_badges.info; // STATUSBADGES.UPDATE;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = paramAdUnitElementId;
            divIdDetails =
                'Recommendation: Setup the new divId param in ortb2Imp.';
        } else {
            divIdStatus = chkr_badges.check;
            divIdSetup = 'ortb2Imp.ext.data.divId';
            divIdRes = undefined;
            divIdDetails = '';
        }
    } else {
        if (paramAdUnitElementId !== undefined) {
            divIdStatus = chkr_badges.ok;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = paramAdUnitElementId;
            divIdDetails = '';
        } else {
            divIdStatus = chkr_badges.check;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = undefined;
            divIdDetails = '';
        }
    }
    // AdUnitElementId (3/3): Then ensure the value is correct
    if (divIdRes === undefined)
        paramsCheckingArray.push([
            divIdStatus,
            `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
            'Not defined in the adUnit configuration.',
        ]);
    else {
        const htlmDiv = document.getElementById(divIdRes);
        if (divIdRes.trim() !== divIdRes)
            paramsCheckingArray.push([
                chkr_badges.check,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                'Space character detected.',
            ]);
        else if (htlmDiv === null)
            paramsCheckingArray.push([
                chkr_badges.check,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                'Div id not detected in the page.',
            ]);
        else
            paramsCheckingArray.push([
                divIdStatus,
                `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`,
                divIdDetails,
            ]);
    }

    // Placement (1/3): Depending on the Prebid version, we don't expect the same param
    let placementStatus = '';
    let placementSetup = '';
    let placementRes = '';
    let placementDetails = '';
    // Placement (2/3): First checks if a value is detected - preference for params.placement
    if (paramPlacement !== undefined) {
        placementStatus = chkr_badges.ok;
        placementSetup = 'params.placement';
        placementRes = paramPlacement;
        placementDetails = '';
    } else if (ortb2ImpPlacement !== undefined && prebidVersionDetected >= 9) {
        placementStatus = chkr_badges.info;
        placementSetup = 'ortb2Imp.ext.data.placement';
        placementRes = ortb2ImpPlacement;
        placementDetails =
            'Recommendation: Setup placement in <code>bids.params.placement</code> instead.</code>.';
    } else if (ortb2ImpPlacement !== undefined && prebidVersionDetected < 9) {
        placementStatus = chkr_badges.ko;
        placementSetup = 'ortb2Imp.ext.data.placement';
        placementRes = ortb2ImpPlacement;
        placementDetails =
            '<code>ortb2Imp</code> is not supported before Prebid 9. Recommendation: Setup placement in <code>bids.params.placement</code>.';
    } else {
        placementStatus = chkr_badges.ko;
        placementSetup = 'params.placement';
        placementRes = undefined;
        placementDetails =
            'Not found: Setup <code>bids.params.placement</code>.';
    }
    // Placement (3/3): Then ensure the value is correct
    if (placementStatus === chkr_badges.ko)
        paramsCheckingArray.push([
            placementStatus,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            placementDetails,
        ]);
    else if (placementRes.trim() !== placementRes)
        paramsCheckingArray.push([
            chkr_badges.check,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            'Space character detected.',
        ]);
    else if (
        /mobile/i.test(placementRes) ||
        /desktop/i.test(placementRes) ||
        /tablet/i.test(placementRes)
    )
        paramsCheckingArray.push([
            chkr_badges.check,
            `<code>${placementSetup}</code>: <code>${placementRes}</code>`,
            'Recommendation: Do not not include reference to an environment or size.',
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
            chkr_badges.ko,
            `<code>mediaTypes</code>: <code>${JSON.stringify(bid.mediaTypes)}</code>`,
            'No mediatype detected.',
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
                    [1800, 1000],
                ];
                let commonArrays = [];
                supportedSizes.forEach((ss) => {
                    mediatypeBannerSizes.forEach((mbs) => {
                        if (JSON.stringify(ss) === JSON.stringify(mbs))
                            commonArrays.push(ss);
                    });
                });
                if (commonArrays.length)
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(commonArrays)}</code>`,
                        '',
                    ]);
                else
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`,
                        'No supported size detected.',
                    ]);
            } else
                paramsCheckingArray.push([
                    chkr_badges.ko,
                    `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`,
                    'No parameter detected.',
                ]);
        }

        if (mediatypeVideo !== undefined) {
            // Required for both instream and outstream
            let mediatypeVideoContext = mediatypeVideo?.context;
            let mediatypeVideoApi = mediatypeVideo?.api;
            let mediatypeVideoPlayerSize = mediatypeVideo?.playerSize;
            // Required for instream only
            let mediatypeVideoMimes = mediatypeVideo?.mimes;
            let mediatypeVideoPlcmt =
                mediatypeVideo?.plcmt || mediatypeVideo?.placement; // placement is deprecated, plcmt is the new one
            // Highly recommended for instream and outstream
            let mediatypeVideoPlaybackMethod = mediatypeVideo?.playbackmethod;
            // Highly recommended for instream only
            let mediatypeVideoStartDelay = mediatypeVideo?.startdelay;
            let mediatypeVideoStartProtocols = mediatypeVideo?.protocols;

            // For checking purpose
            let hasOutstreamContext = mediatypeVideoContext === 'outstream';
            let hasInstreamContext = mediatypeVideoContext === 'instream';
            let videoApiSupported = [1, 2, 3, 4, 5];
            let mimesExpected = [
                'video/mp4',
                'video/ogg',
                'video/webm',
                'application/javascript',
            ];
            let expectedInstreamPlcmt = 1;
            let protocolsExpected = [3, 6, 7, 8];

            // Check the video context: instream or outstream
            if (hasOutstreamContext || hasInstreamContext) {
                paramsCheckingArray.push([
                    chkr_badges.ok,
                    `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`,
                    '',
                ]);
            } else {
                paramsCheckingArray.push([
                    chkr_badges.ko,
                    `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`,
                    'No supported context detected.',
                ]);
                // If no context detected, we should not check params furthermore
                return;
            }

            // Check the video api: [1, 2, 3, 4, 5]
            if (mediatypeVideoApi !== undefined) {
                if (hasOutstreamContext && !mediatypeVideoApi.includes(2))
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        'Must support api <code>2</code>\'',
                    ]);
                else if (
                    !videoApiSupported.some((i) =>
                        mediatypeVideoApi.includes(i),
                    ) &&
                    hasInstreamContext
                )
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        `Must support at least one of <code>${JSON.stringify(videoApiSupported)}</code>`,
                    ]);
                else
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        '',
                    ]);
            } else
                paramsCheckingArray.push([
                    chkr_badges.ko,
                    `<code>mediaTypes.video.api</code>: <code>${mediatypeVideoApi}</code>`,
                    'No video api detected.',
                ]);

            // Check the player size
            if (
                mediatypeVideoPlayerSize &&
                Array.isArray(mediatypeVideoPlayerSize) &&
                mediatypeVideoPlayerSize.every(
                    (subArr) =>
                        Array.isArray(subArr) &&
                        subArr.length === 2 &&
                        subArr.every(Number.isInteger),
                )
            ) {
                paramsCheckingArray.push([
                    chkr_badges.ok,
                    `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`,
                    '',
                ]);
            } else {
                paramsCheckingArray.push([
                    chkr_badges.ko,
                    `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`,
                    'Wrong format or not size detected.',
                ]);
            }

            // Check the video mimes: ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'] (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoMimes === undefined) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        'No mimes detected.',
                    ]);
                } else if (
                    !mimesExpected.every((i) => mediatypeVideoMimes.includes(i))
                ) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        `Missing mimes: <code>${JSON.stringify(mimesExpected.filter((i) => !mediatypeVideoMimes.includes(i)))}</code>`,
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        '',
                    ]);
                }
            }

            // Check the placement
            if (hasInstreamContext) {
                if (
                    mediatypeVideoPlcmt === undefined ||
                    expectedInstreamPlcmt !== mediatypeVideoPlcmt
                ) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        `Must be <code>${JSON.stringify(expectedInstreamPlcmt)}</code> for instream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).`,
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        '',
                    ]);
                }
            } else if (hasOutstreamContext) {
                if (
                    mediatypeVideoPlcmt === undefined ||
                    mediatypeVideoPlcmt === expectedInstreamPlcmt
                ) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        'Must be set for outstream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).',
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        '',
                    ]);
                }
            }

            // Check the video playbackmethod
            if (mediatypeVideoPlaybackMethod !== undefined) {
                const expectedMethod = hasInstreamContext
                    ? 2
                    : hasOutstreamContext
                        ? 6
                        : null;

                if (
                    expectedMethod &&
                    !mediatypeVideoPlaybackMethod.includes(expectedMethod)
                ) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        `Recommended playback method is: [${expectedMethod}].`,
                    ]);
                } else if (!expectedMethod) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        'No playback method detected or context not available.',
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        '',
                    ]);
                }
            } else {
                paramsCheckingArray.push([
                    chkr_badges.check,
                    `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                    'No playback method detected.',
                ]);
            }

            // Check the startdelay (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartDelay !== undefined) {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`,
                        '',
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`,
                        'No start delay detected.',
                    ]);
                }
            }

            // Check the protocols (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartProtocols !== undefined) {
                    if (
                        protocolsExpected.every((i) =>
                            mediatypeVideoStartProtocols.includes(i),
                        )
                    ) {
                        paramsCheckingArray.push([
                            chkr_badges.ok,
                            `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                            '',
                        ]);
                    } else {
                        paramsCheckingArray.push([
                            chkr_badges.check,
                            `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                            `Missing protocols: <code>${JSON.stringify(protocolsExpected.filter((i) => !mediatypeVideoStartProtocols.includes(i)))}</code>`,
                        ]);
                    }
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                        'No protocol detected.',
                    ]);
                }
            }
        }

        // GDPR - Should be in ortb2.regs.ext.gdpr and user.ext.consent
        if (detectedCountryCodeIso3 === null) {
            console.error(
                'No country code detected, cannot check GDPR params.',
            );
        } else {
            // List of EEA countries (ISO 3166-1 alpha-3)
            const EEACountries = [
                'ALA',
                'AUT',
                'BEL',
                'BGR',
                'HRV',
                'CYP',
                'CZE',
                'DNK',
                'EST',
                'FIN',
                'FRA',
                'GUF',
                'DEU',
                'GIB',
                'GRC',
                'GLP',
                'GGY',
                'HUN',
                'ISL',
                'IRL',
                'IMN',
                'ITA',
                'JEY',
                'LVA',
                'LIE',
                'LTU',
                'LUX',
                'MLT',
                'MTQ',
                'MYT',
                'NLD',
                'NOR',
                'POL',
                'PRT',
                'REU',
                'ROU',
                'BLM',
                'MAF',
                'SPM',
                'SVK',
                'SVN',
                'ESP',
                'SWE',
                'GBR',
            ];

            // Check if the user is in the EEA, only then check the GDPR params
            if (EEACountries.includes(detectedCountryCodeIso3)) {
                // User is in the EEA
                if (ortbGdpr !== 1) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`,
                        'Should be set to <code>1</code> for users in the EEA.',
                    ]);
                } else {
                    paramsCheckingArray.push([
                        chkr_badges.ok,
                        `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`,
                        '',
                    ]);
                }

                // Check the consent string
                let decodedConsent =
                    ortbConsent !== undefined
                        ? TCString.decode(ortbConsent)
                        : null;
                if (decodedConsent === null) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent}</code>`,
                        'No consent string detected, should be a valid TCFv2 string for users in the EEA.',
                    ]);
                } else {
                    const cmpAdagioBidders = {
                        58: '33Across',
                        779: 'Adtarget Teknoloji A.S.',
                        138: 'ConnectAd Demand GmbH',
                        90: 'E-Planning (Teroa)',
                        285: 'Freewheel (Comcast)',
                        149: 'Illumin / ADman Interactive SLU',
                        253: 'Improve Digital',
                        36: 'Nexxen (Unruly)',
                        617: 'Onfocus (Adagio)',
                        241: 'OneTag',
                        69: 'OpenX',
                        76: 'Pubmatic',
                        16: 'RTB House',
                        52: 'Rubicon',
                        45: 'Smart Adserver (Equativ)',
                        13: 'Sovrn',
                        28: 'TripleLift',
                    };
                    const missingBidders = [];
                    let adagioMissing = false;
                    for (const key in cmpAdagioBidders) {
                        if (!decodedConsent.vendorConsents.has(Number(key))) {
                            missingBidders.push(
                                `${cmpAdagioBidders[key]} (${key})`,
                            );
                            if (Number(key) === 617) {
                                adagioMissing = true;
                            }
                        }
                    }
                    if (adagioMissing) {
                        paramsCheckingArray.push([
                            chkr_badges.ko,
                            '<code>ortb2.user.ext.consent</code>',
                            `Missing consent for: ${missingBidders.join(', ')}`,
                        ]);
                    } else if (missingBidders.length) {
                        paramsCheckingArray.push([
                            chkr_badges.check,
                            '<code>ortb2.user.ext.consent</code>',
                            `Missing consent for: ${missingBidders.join(', ')}`,
                        ]);
                    } else {
                        paramsCheckingArray.push([
                            chkr_badges.ok,
                            `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent.substring(0, 20)}...</code>`,
                            'All Adagio partners present',
                        ]);
                    }
                }
            }
        }

        // Interstitial - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpInterstitial !== undefined) {
            if (prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([
                    chkr_badges.info,
                    `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`,
                    'Not supported before Prebid 9.39.',
                ]);
            } else {
                paramsCheckingArray.push([
                    chkr_badges.ok,
                    `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`,
                    '',
                ]);
            }
        } else if (deepOrtb2ImpInterstitial !== null) {
            paramsCheckingArray.push([
                prebidVersionDetected < 9.39
                    ? chkr_badges.info
                    : chkr_badges.info,
                `<code>${deepOrtb2ImpInterstitial.path}</code>: <code>${deepOrtb2ImpInterstitial.value}</code>`,
                'Misplaced, should be in <code>ortb2Imp.instl',
            ]);
        } else {
            paramsCheckingArray.push([
                prebidVersionDetected < 9.39
                    ? chkr_badges.info
                    : chkr_badges.info,
                '<code>ortb2Imp.instl</code>: <code>undefined</code>',
                'No interstitial parameter detected.',
            ]);
        }

        // Rewarded - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpRewarded !== undefined) {
            if (prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([
                    chkr_badges.info,
                    `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`,
                    'Not supported before Prebid 9.39.',
                ]);
            } else {
                paramsCheckingArray.push([
                    chkr_badges.ok,
                    `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`,
                    '',
                ]);
            }
        } else if (deepOrtb2ImpRewarded !== null) {
            paramsCheckingArray.push([
                prebidVersionDetected < 9.39
                    ? chkr_badges.info
                    : chkr_badges.info,
                `<code>${deepOrtb2ImpRewarded.path}</code>: <code>${deepOrtb2ImpRewarded.value}</code>`,
                'Misplaced, should be in <code>ortb2Imp.rwdd</code>',
            ]);
        } else {
            paramsCheckingArray.push([
                prebidVersionDetected < 9.39
                    ? chkr_badges.info
                    : chkr_badges.info,
                '<code>ortb2Imp.rwdd</code>: <code>undefined</code>',
                'No rewarded parameter detected.',
            ]);
        }

        if (mediatypeNative !== undefined) {
            // TODO
        }
    }
}

function findParam(obj, param, path = []) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
        targetTabButton.classList.remove('outline');
        activeTabButton.classList.add('outline');
        targetTabContainer.style.display = '';
        activeTabContainer.style.display = 'none';
        activeTab = tabName;
    }
}

function goTopPage() {
    overlayFrameDoc.body.scrollTop = 0;
}

function createBidderParamsModal(
    bid,
    paramsCheckingArray,
    bidderAdagioDetected,
) {
    // Create a dialog window showing the params of the bidrequest.
    const dialog = overlayFrameDoc.createElement('dialog');
    dialog.setAttribute('open', true);

    const bidder = bid.bidder || '_null';
    const adUnitCode = bid.adUnitCode || '_null';
    const mediaTypes = bid.mediaTypes || {};

    const article = overlayFrameDoc.createElement('article');
    article.style.maxWidth = '100%';
    const header = overlayFrameDoc.createElement('header');
    header.innerHTML = `<code>${bidder}</code>: <code>${adUnitCode} (${Object.keys(mediaTypes)})</code>`;
    header.style.marginBottom = '0px';
    const closeLink = overlayFrameDoc.createElement('a');
    closeLink.setAttribute('aria-label', 'Close');
    closeLink.classList.add('close');
    closeLink.addEventListener('click', () => {
        dialog.remove();
    });

    article.appendChild(header);
    header.appendChild(closeLink);

    // If the bidder is Adagio, we display the params checking
    if (bidderAdagioDetected) {
        const parametersCheckTable = overlayFrameDoc.createElement('p');
        createParametersCheckTable(parametersCheckTable, paramsCheckingArray);
        article.appendChild(parametersCheckTable);
    }

    // Display the bidrequest json from pbjs.getEvents()
    const paragraph = overlayFrameDoc.createElement('p');
    paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(bid, null, 2)}</code></pre>`;

    article.appendChild(paragraph);
    dialog.appendChild(article);
    overlayFrameDoc.body.appendChild(dialog);
}

function createParametersCheckTable(paragraph, paramsCheckingArray) {
    // Create the alert text
    // create the alert article
    const alertContainer = overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    // Create the parameter checker table
    const table = overlayFrameDoc.createElement('table');
    const thead = overlayFrameDoc.createElement('thead');
    const tr = overlayFrameDoc.createElement('tr');
    const th1 = overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Status';
    const th2 = overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Parameter';
    const th3 = overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Details';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = overlayFrameDoc.createElement('tbody');
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
    const newRow = overlayFrameDoc.createElement('tr');
    // Create the cells
    const statusCell = overlayFrameDoc.createElement('td');
    const parameterCell = overlayFrameDoc.createElement('td');
    const detailsCell = overlayFrameDoc.createElement('td');
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

export async function refreshChecker() {
    // First remove the existing overlay
    const overlayFrameElement = document.getElementById('adagio-overlay-frame');
    if (overlayFrameElement) {
        overlayFrameElement.remove();
    }
    // Then re-run the checker
    await main();
}

function toggleBidRow(inputbidder, bidder) {
    // Depending on checkbox, hide or show bidrequested for the bidder
    const bidderRows = overlayFrameDoc.getElementsByClassName(
        `${bidder.replace(' ', '-')}-bid`,
    );
    for (const bidderRow of bidderRows) {
        if (inputbidder.checked === false) {
            bidderRow.style.display = 'none';
        } else {
            bidderRow.style.display = '';
        }
    }
}
