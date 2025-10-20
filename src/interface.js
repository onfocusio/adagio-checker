import { chkr_ovrl, chkr_wrp, chkr_api, chkr_vars } from './variables.js';
import { chkr_svg, chkr_tabs, chkr_colors, chkr_badges } from './enums.js';
import { runApp } from './main.js';
import * as utils from './utils.js';
import { TCString } from '@iabtcf/core';

/*************************************************************************************************************************************************************************************************************************************
 * Main
 ************************************************************************************************************************************************************************************************************************************/

export async function buildInterface() {
    // Get the Prebid wrappers
    utils.getPrebidWrappers();

    // Build the interface
    createOverlay();
    buildOverlayHtml();
    createCheckerDiv();
    createAdUnitsDiv();
    makeIframeDraggable();
}

/*************************************************************************************************************************************************************************************************************************************
 * Exported function
 ************************************************************************************************************************************************************************************************************************************/

export function createOverlay() {
    // create a new iframe element
    chkr_ovrl.overlayFrame = window.document.createElement('iframe');
    chkr_ovrl.overlayFrame.classList.add('adagio-overlay');
    chkr_ovrl.overlayFrame.style.position = 'fixed';
    chkr_ovrl.overlayFrame.style.top = '10px';
    chkr_ovrl.overlayFrame.style.left = '10px';
    chkr_ovrl.overlayFrame.style.width = '1000px';
    chkr_ovrl.overlayFrame.style.height = '95%';
    chkr_ovrl.overlayFrame.style.zIndex = '2147483647';
    chkr_ovrl.overlayFrame.style.backgroundColor = 'transparent';
    chkr_ovrl.overlayFrame.style.border = 'none';
    chkr_ovrl.overlayFrame.style.borderRadius = '10px';
    chkr_ovrl.overlayFrame.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
    chkr_ovrl.overlayFrame.style.resize = 'both';
    chkr_ovrl.overlayFrame.style.display = 'block';
    window.document.body.appendChild(chkr_ovrl.overlayFrame);

    // get the iframe document objects
    chkr_ovrl.overlayFrameDoc = chkr_ovrl.overlayFrame.contentDocument || chkr_ovrl.overlayFrame.contentWindow.document;
}

export function buildOverlayHtml() {
    // append pico style
    const picoStyle = chkr_ovrl.overlayFrameDoc.createElement('link');
    picoStyle.setAttribute('rel', 'stylesheet');
    picoStyle.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.7/css/pico.min.css');

    // create navigation element
    const nav = buildNavBar();
    nav.appendChild(buildAdagioLogo());

    // create second unordered list inside navigation
    const ul = chkr_ovrl.overlayFrameDoc.createElement('ul');
    ul.appendChild(buildTabButton(chkr_tabs.checker, chkr_svg.checker, true));
    ul.appendChild(buildTabButton(chkr_tabs.adunits, chkr_svg.adunits, false));
    ul.appendChild(buildApiButton('API status', chkr_svg.api_grey, true));
    ul.appendChild(buildPrebidButton('Prebid versions detected', chkr_svg.prebid, true));
    ul.appendChild(buildDebuggingButton('Enable debbug mode and reload page', chkr_svg.debbuging, true));
    ul.appendChild(buildRefreshButton('Refresh', chkr_svg.refresh, true));

    // append unordered lists to navigation
    nav.appendChild(ul);

    // append main containers to iframeDoc body
    chkr_ovrl.overlayFrameDoc.head.appendChild(picoStyle);
    chkr_ovrl.overlayFrameDoc.body.appendChild(nav);
}

export function createCheckerDiv() {
    // build id name
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');

    // create main container element
    const mainContainer = chkr_ovrl.overlayFrameDoc.createElement('main');
    mainContainer.classList.add('container-fluid');
    mainContainer.setAttribute('id', `${tabName}-container`);
    mainContainer.style.paddingTop = '5rem';
    mainContainer.style.paddingBottom = '0';

    // create headings container
    const headings = chkr_ovrl.overlayFrameDoc.createElement('div');
    headings.classList.add('headings');

    const h2 = chkr_ovrl.overlayFrameDoc.createElement('h2');
    h2.textContent = 'Integration checker';
    const h3 = chkr_ovrl.overlayFrameDoc.createElement('h3');
    h3.textContent = 'Expectations for a proper Adagio integration';
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article and text
    const alertContainer = chkr_ovrl.overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    const alertTextDiv = chkr_ovrl.overlayFrameDoc.createElement('div');
    alertTextDiv.setAttribute('id', `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create table element
    const table = chkr_ovrl.overlayFrameDoc.createElement('table');
    const thead = chkr_ovrl.overlayFrameDoc.createElement('thead');
    const tr = chkr_ovrl.overlayFrameDoc.createElement('tr');
    const th1 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Status';
    const th2 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Name';
    const th3 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Details';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    const tbody = chkr_ovrl.overlayFrameDoc.createElement('tbody');
    tbody.setAttribute('id', `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);
    mainContainer.appendChild(table);

    // append the container to the body
    chkr_ovrl.overlayFrameDoc.body.appendChild(mainContainer);
}

export function createAdUnitsDiv() {
    // build id name
    const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');

    // create main container element
    const mainContainer = chkr_ovrl.overlayFrameDoc.createElement('main');
    mainContainer.classList.add('container-fluid');
    mainContainer.setAttribute('id', `${tabName}-container`);
    mainContainer.style.display = 'none';
    mainContainer.style.paddingTop = '5rem';
    mainContainer.style.paddingBottom = '0';

    // create headings container
    const headings = chkr_ovrl.overlayFrameDoc.createElement('div');
    headings.classList.add('headings');
    const h2 = chkr_ovrl.overlayFrameDoc.createElement('h2');
    h2.textContent = 'AdUnits';
    const h3 = chkr_ovrl.overlayFrameDoc.createElement('h3');
    h3.textContent = 'Bid requested for each adUnit and by bidders';
    headings.appendChild(h2);
    headings.appendChild(h3);

    // create the alert article
    const alertContainer = chkr_ovrl.overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    const alertTextDiv = chkr_ovrl.overlayFrameDoc.createElement('div');
    alertTextDiv.setAttribute('id', `${tabName}-alert`);
    alertContainer.appendChild(alertTextDiv);

    // create bidder filter
    const bidderFilter = chkr_ovrl.overlayFrameDoc.createElement('details');
    bidderFilter.setAttribute('role', 'list');
    const selectFilter = chkr_ovrl.overlayFrameDoc.createElement('summary');
    selectFilter.setAttribute('aria-haspopup', 'listbox');
    selectFilter.textContent = 'Filter requested bids by bidders';
    const ulFilter = chkr_ovrl.overlayFrameDoc.createElement('ul');
    ulFilter.setAttribute('role', 'listbox');
    ulFilter.setAttribute('id', 'bidderFilter');
    bidderFilter.appendChild(selectFilter);
    bidderFilter.appendChild(ulFilter);

    // create table element
    const table = chkr_ovrl.overlayFrameDoc.createElement('table');
    const thead = chkr_ovrl.overlayFrameDoc.createElement('thead');
    const tr = chkr_ovrl.overlayFrameDoc.createElement('tr');
    const th0 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th0.setAttribute('scope', 'col');
    th0.textContent = 'Status';
    const th1 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Code';
    const th2 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Mediatypes';
    const th3 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = '🔎 Bidder params';
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = chkr_ovrl.overlayFrameDoc.createElement('tbody');
    tbody.setAttribute('id', `${tabName}-tbody`);
    table.appendChild(thead);
    table.appendChild(tbody);

    // append navigation, headings, and table to main container
    mainContainer.appendChild(headings);
    mainContainer.appendChild(alertContainer);
    mainContainer.appendChild(bidderFilter);
    mainContainer.appendChild(table);

    // append the container to the body
    chkr_ovrl.overlayFrameDoc.body.appendChild(mainContainer);
}

export function makeIframeDraggable() {
    // Gets elements IDs
    const navbar = chkr_ovrl.overlayFrameDoc.getElementById('adagio-nav');
    let targetElement = undefined;

    // Set up start x, y
    let startX = 0;
    let startY = 0;

    navbar.addEventListener('mousedown', startDragging);
    navbar.addEventListener('mouseup', stopDragging);
    navbar.addEventListener('mouseover', updateCursor);
    chkr_ovrl.overlayFrame.addEventListener('mouseup', stopDragging);

    function updateCursor(e) {
        targetElement = e.target.tagName;
        if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
            navbar.style.cursor = 'grab';
        } else navbar.style.cursor = 'default';
    }

    function startDragging(e) {
        targetElement = e.target.tagName;
        if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
            chkr_ovrl.isDragged = true;
            navbar.style.cursor = 'grabbing';
            chkr_ovrl.overlayFrame.style.opacity = '0.4';
            startX = e.clientX;
            startY = e.clientY;
        }
    }

    function stopDragging() {
        chkr_ovrl.isDragged = false;
        navbar.style.cursor = 'grab';
        chkr_ovrl.overlayFrame.style.opacity = '';
    }

    chkr_ovrl.overlayFrameDoc.addEventListener('mousemove', function (e) {
        if (!chkr_ovrl.isDragged) {
            return;
        }
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const iframeRect = chkr_ovrl.overlayFrame.getBoundingClientRect();
        const iframeX = iframeRect.left;
        const iframeY = iframeRect.top;
        chkr_ovrl.overlayFrame.style.left = iframeX + deltaX + 'px';
        chkr_ovrl.overlayFrame.style.top = iframeY + deltaY + 'px';
    });
}

export function appendCheckerRow(status, name, details) {
    // build id name
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    // get the tbody element
    const tableBody = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-tbody`);
    // Create the row
    const newRow = chkr_ovrl.overlayFrameDoc.createElement('tr');
    // Create the cells
    const statusCell = chkr_ovrl.overlayFrameDoc.createElement('td');
    const nameCell = chkr_ovrl.overlayFrameDoc.createElement('td');
    const detailsCell = chkr_ovrl.overlayFrameDoc.createElement('td');
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

export function appendAdUnitsRow(bidders, bids) {
    // check if Adagio is detected and get bidder name
    let adagioId = '';
    if (chkr_vars.prebidAdagioBidsRequested.length > 0) adagioId = chkr_vars.prebidAdagioBidsRequested[0].bidder;

    // build id name
    const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');
    // gets working element element
    const tableBody = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-tbody`);
    const alertTextDiv = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-alert`);

    // fill the article section
    alertTextDiv.innerHTML = '<small>Adunit(s) found:</small> ';
    if (chkr_vars.prebidAdUnitsCodes !== undefined && chkr_vars.totalPrebidAdUnitsCodes > 0) {
        for (const adUnitCode of chkr_vars.prebidAdUnitsCodes) {
            alertTextDiv.innerHTML += `<small> <code>${adUnitCode}</code>;</small>`;
        }
    } else alertTextDiv.innerHTML += `<small><kbd> 0</kbd></small>`;

    // will hold the computed status for each adunit
    const computedAdunitsStatus = []

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
        // Extract all the status values (first element of each array) from paramsCheckingArray
        const extractedStatus = paramsCheckingArray.map(item => item[0]);
        const status = bidderAdagioDetected ? utils.computeAdUnitStatus(extractedStatus) : chkr_badges.na;

        // Store the computed status for the adunit
        if (bidderAdagioDetected) computedAdunitsStatus.push(status);

        // Create the row
        const newRow = chkr_ovrl.overlayFrameDoc.createElement('tr');
        newRow.classList.add(`${bidderId.replace(' ', '-')}-bid`);
        // hides the row if adagio found
        if (adagioId !== '' && adagioId !== bidderId) {
            newRow.style.display = 'none';
        }

        // Create the cells
        const statusCell = chkr_ovrl.overlayFrameDoc.createElement('td');
        const codeCell = chkr_ovrl.overlayFrameDoc.createElement('td');
        const mediatypesCell = chkr_ovrl.overlayFrameDoc.createElement('td');
        const bidderIdCell = chkr_ovrl.overlayFrameDoc.createElement('td');
        const bidderParamButton = chkr_ovrl.overlayFrameDoc.createElement('kbd');
        bidderParamButton.addEventListener('click', () => createBidderParamsModal(bid, paramsCheckingArray, bidderAdagioDetected));
        bidderParamButton.style.cursor = 'pointer';

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
    const bidderFilter = chkr_ovrl.overlayFrameDoc.getElementById('bidderFilter');

    bidders.forEach((bidder) => {
        const libidder = chkr_ovrl.overlayFrameDoc.createElement('li');
        const labbidder = chkr_ovrl.overlayFrameDoc.createElement('label');
        const inputbidder = chkr_ovrl.overlayFrameDoc.createElement('input');
        inputbidder.setAttribute('type', 'checkbox');
        inputbidder.setAttribute('id', `${bidder.replace(' ', '-')}-bidder`);
        bidderFilter.appendChild(libidder);
        libidder.appendChild(labbidder);
        labbidder.appendChild(inputbidder);
        labbidder.innerHTML += `<code>${bidder}</code>`;

        const newInput = chkr_ovrl.overlayFrameDoc.getElementById(`${bidder.replace(' ', '-')}-bidder`);
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
    const nav = chkr_ovrl.overlayFrameDoc.createElement('nav');
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
    const ul = chkr_ovrl.overlayFrameDoc.createElement('ul');
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const a = chkr_ovrl.overlayFrameDoc.createElement('a');
    a.setAttribute('href', 'https://app.adagio.io/');
    a.setAttribute('target', '_blank');
    a.innerHTML = chkr_svg.logo;
    li.appendChild(a);
    ul.appendChild(li);
    return ul;
}

function buildTabButton(name, svg, isactive) {
    const tabName = name.toLowerCase().replace(' ', '-');
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const tabButton = chkr_ovrl.overlayFrameDoc.createElement('button');
    tabButton.setAttribute('id', `${tabName}-button`);
    tabButton.innerHTML = svg;
    tabButton.innerHTML += ` ${name} `;
    tabButton.addEventListener('click', () => switchTab(tabName));
    if (!isactive) tabButton.classList.add('outline');
    else chkr_ovrl.activeTab = tabName;
    tabButton.style.padding = '0.3em';
    tabButton.style.textTransform = 'uppercase';
    tabButton.style.fontSize = '0.85em';
    li.appendChild(tabButton);
    return li;
}

function buildApiButton(name, svg, isactive) {
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const button = chkr_ovrl.overlayFrameDoc.createElement('button');
    button.setAttribute('id', 'apiButton');
    button.setAttribute('title', name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.classList.add('outline');
    button.style.borderColor = 'transparent';
    button.style.padding = '0.3em';
    li.appendChild(button);
    return li;
}

function buildPrebidButton(name, svg, isactive) {
    // Get the number of wrapper found
    let nbWrappers = chkr_wrp.prebidWrappers.length;

    // As website can use different wrapper for Prebid, this button allows to switch between them
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const button = chkr_ovrl.overlayFrameDoc.createElement('button');
    button.setAttribute('title', name);
    // Disabled button if no wrapper found
    if (!isactive || nbWrappers === 0) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener('click', () => displayAdunits(button));
    button.classList.add('outline');
    button.style.borderColor = 'transparent';
    button.style.position = 'relative';
    button.style.display = 'inline-block';
    button.style.padding = '0.3em';

    // If more than one wrapper, display a badge with the number of wrappers found
    const badge = chkr_ovrl.overlayFrameDoc.createElement('span');
    badge.style.position = 'absolute';
    badge.style.top = '-10px';
    badge.style.right = '-10px';
    badge.style.padding = '0.5em 0.9em';
    badge.style.borderRadius = '50%';
    badge.style.fontSize = '0.6em';
    badge.style.background = chkr_colors.red_bkg;
    badge.style.color = chkr_colors.red_txt;
    badge.innerHTML = nbWrappers;
    // Shows number if more than 1
    if (nbWrappers < 2) badge.style.display = 'none';

    // On click, a modal appears to select the wrapper and work on the according Prebid object
    const dialog = chkr_ovrl.overlayFrameDoc.createElement('dialog');
    dialog.setAttribute('open', false);
    const article = chkr_ovrl.overlayFrameDoc.createElement('article');
    const header = chkr_ovrl.overlayFrameDoc.createElement('header');
    const closeLink = chkr_ovrl.overlayFrameDoc.createElement('a');
    closeLink.setAttribute('aria-label', 'Close');
    closeLink.classList.add('close');
    header.innerHTML = 'Prebid wrappers detected';
    const paragraph = chkr_ovrl.overlayFrameDoc.createElement('p');

    // Add eventlistner to show and hide the modal
    closeLink.addEventListener('click', () => {
        dialog.setAttribute('open', false);
    });
    button.addEventListener('click', () => {
        dialog.setAttribute('open', true);
    });

    // Append elements
    li.appendChild(button);
    button.appendChild(badge);
    chkr_ovrl.overlayFrameDoc.body.appendChild(dialog);
    dialog.appendChild(article);
    article.appendChild(header);
    header.appendChild(closeLink);
    article.appendChild(paragraph);

    // Fill the modal with the list Prebid wrappers found
    for (let i = 0; i < nbWrappers; i++) {
        // Create the radio button for the current wrapper item
        const item = chkr_wrp.prebidWrappers[i];

        const wrapperItem = chkr_ovrl.overlayFrameDoc.createElement('div');
        const itemInput = chkr_ovrl.overlayFrameDoc.createElement('input');
        itemInput.setAttribute('type', 'radio');
        itemInput.setAttribute('value', i);
        itemInput.setAttribute('name', 'radio-group'); // added the 'name' attribute
        // itemInput.setAttribute('id', `${item.replace(' ', '-')}-wrapper`)
        const itemLabel = chkr_ovrl.overlayFrameDoc.createElement('label');
        itemLabel.setAttribute('for', i);
        itemLabel.innerHTML = item[0];
        if (chkr_wrp.prebidWrappers[i][1] !== window) itemLabel.innerHTML += ' (iframe)';

        // If current wrapper is the used one at the moment, check the radio
        if (chkr_wrp.prebidWrapper[0] === item[0] && Object.is(chkr_wrp.prebidWrapper[1], item[1])) {
            itemInput.checked = true;
        }

        itemInput.addEventListener('click', function () {
            if (itemInput.checked) {
                chkr_wrp.prebidWrapper = chkr_wrp.prebidWrappers[itemInput.value];
                chkr_wrp.prebidObject = chkr_wrp.prebidWrapper[1][chkr_wrp.prebidWrapper[0]];
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

function buildDebuggingButton(name, svg, isactive) {
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const button = chkr_ovrl.overlayFrameDoc.createElement('button');
    button.setAttribute('title', name);
    if (!isactive) button.disabled = true;
    button.innerHTML = svg;
    button.addEventListener('click', () => utils.loadDebuggingMode());
    button.classList.add('outline');
    button.style.borderColor = 'transparent';
    button.style.padding = '0.3em';
    li.appendChild(button);
    return li;
}

function buildRefreshButton(name, svg, isactive) {
    const li = chkr_ovrl.overlayFrameDoc.createElement('li');
    const button = chkr_ovrl.overlayFrameDoc.createElement('button');
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

function buildParamsCheckingArray(bid, paramsCheckingArray) {
    // Check the adagio bidder params (orgId and site in params)
    let paramOrganizationId = bid?.params?.organizationId;
    if (paramOrganizationId !== undefined) paramOrganizationId = paramOrganizationId.toString();
    let paramSite = bid?.params?.site;

    // Since Prebid 9, placement and divId should be in ortb2Imp
    let paramPlacement = bid?.params?.placement;
    let paramAdUnitElementId = bid?.params?.adUnitElementId;
    let ortb2ImpPlacement = bid?.ortb2Imp?.ext?.data?.placement;
    let ortb2ImpDivId = bid?.ortb2Imp?.ext?.data?.divId;

    // Check if there's a regs.ext.gdpr param (= 1) and a user.ext.consent param (consent string)
    let ortbGdpr = bid?.ortb2?.regs?.ext?.gdpr;
    let ortbConsent = bid?.ortb2?.user?.ext?.consent;

    // Since Prebid 9.39, Adagio supports interstitial and rewarded
    let ortb2ImpInterstitial = bid?.ortb2Imp?.instl;
    let ortb2ImpRewarded = bid?.ortb2Imp?.rwdd;
    let deepOrtb2ImpInterstitial = findParam(bid, 'instl') || null;
    let deepOrtb2ImpRewarded = findParam(bid, 'rwdd') || null;

    // Check the organizationId
    if (paramOrganizationId === undefined) paramsCheckingArray.push([chkr_badges.ko, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, `Parameter not found.`]);
    else {
        if (typeof paramOrganizationId === 'string' && !/^\d{4}$/.test(paramOrganizationId)) {
            paramsCheckingArray.push([chkr_badges.check, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, `Should be a 4-digit integer or string (e.g., 1000 or '1000').`]);
        } else {
            paramsCheckingArray.push([chkr_badges.ok, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, ``]);
        }
    }

    // Check the site name
    if (paramSite === undefined) paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, 'Parameter not found.']);
    else {
        if (paramSite.trim() !== paramSite) paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, `Space character detected.`]);
        else if (chkr_api.apiKeyDetected && chkr_api.successRecordItems !== null) paramsCheckingArray.push([chkr_badges.ok, `<code>params.site</code>: <code>${paramSite}</code>`, ``]);
        else if (chkr_api.apiKeyDetected && chkr_api.successRecordItems === null)
            paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, `No API record found, check logs.`]);
        else paramsCheckingArray.push([chkr_badges.info, `<code>params.site</code>: <code>${paramSite}</code>`, 'No API loaded for checking.']);
    }

    // AdUnitElementId (1/3): Depending on the Prebid version, we don't expect the same param
    let divIdStatus = '';
    let divIdSetup = '';
    let divIdRes = '';
    let divIdDetails = '';
    // AdUnitElementId (2/3): First checks if a value is found
    if (chkr_wrp.prebidVersionDetected >= 9) {
        if (ortb2ImpDivId !== undefined) {
            divIdStatus = chkr_badges.ok;
            divIdSetup = 'ortb2Imp.ext.data.divId';
            divIdRes = ortb2ImpDivId;
            divIdDetails = '';
        } else if (paramAdUnitElementId !== undefined) {
            divIdStatus = chkr_badges.info; // STATUSBADGES.UPDATE;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = paramAdUnitElementId;
            divIdDetails = 'Recommendation: Setup the new divId param in ortb2Imp.';
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
    if (divIdRes === undefined) paramsCheckingArray.push([divIdStatus, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Not defined in the adUnit configuration.`]);
    else {
        const htlmDiv = document.getElementById(divIdRes);
        if (divIdRes.trim() !== divIdRes) paramsCheckingArray.push([chkr_badges.check, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Space character detected.`]);
        else if (htlmDiv === null) paramsCheckingArray.push([chkr_badges.check, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Div id not found in the page.`]);
        else paramsCheckingArray.push([divIdStatus, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, divIdDetails]);
    }

    // Placement (1/3): Depending on the Prebid version, we don't expect the same param
    let placementStatus = '';
    let placementSetup = '';
    let placementRes = '';
    let placementDetails = '';
    // Placement (2/3): First checks if a value is found
    if (chkr_wrp.prebidVersionDetected >= 10) {
        if (paramPlacement !== undefined) {
            placementStatus = chkr_badges.ok;
            placementSetup = 'params.placement';
            placementRes = paramPlacement;
            placementDetails = '';
        } else if (ortb2ImpPlacement !== undefined) {
            placementStatus = chkr_badges.info;
            placementSetup = 'ortb2Imp.ext.data.placement';
            placementRes = ortb2ImpPlacement;
            placementDetails = 'Fallback: placement found in ortb2Imp, but should be in params.placement for Prebid 10+.';
        } else {
            placementStatus = chkr_badges.ko;
            placementSetup = 'params.placement';
            placementRes = undefined;
            placementDetails = '';
        }
    } else if (chkr_wrp.prebidVersionDetected >= 9) {
        if (ortb2ImpPlacement !== undefined) {
            placementStatus = chkr_badges.ok;
            placementSetup = 'ortb2Imp.ext.data.placement';
            placementRes = ortb2ImpPlacement;
            placementDetails = '';
        } else if (paramPlacement !== undefined) {
            placementStatus = chkr_badges.info;
            placementSetup = 'params.placement';
            placementRes = paramPlacement;
            placementDetails = 'Fallback: placement found in params, but should be in ortb2Imp.ext.data.placement for Prebid 9.x.';
        } else {
            placementStatus = chkr_badges.ko;
            placementSetup = 'ortb2Imp.ext.data.placement';
            placementRes = undefined;
            placementDetails = '';
        }
    } else {
        if (paramPlacement !== undefined) {
            placementStatus = chkr_badges.ok;
            placementSetup = 'params.placement';
            placementRes = paramPlacement;
            placementDetails = '';
        } else {
            placementStatus = chkr_badges.ko;
            placementSetup = 'params.placement';
            placementRes = undefined;
            placementDetails = '';
        }
    }
    // Placement (3/3): Then ensure the value is correct
    if (placementRes === undefined) paramsCheckingArray.push([placementStatus, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, `Not defined in the adUnit configuration.`]);
    else if (placementRes.trim() !== placementRes) paramsCheckingArray.push([chkr_badges.check, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, `Space character detected.`]);
    else if (/mobile/i.test(placementRes) || /desktop/i.test(placementRes) || /tablet/i.test(placementRes))
        paramsCheckingArray.push([chkr_badges.check, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, `Should not include reference to an environment`]);
    else paramsCheckingArray.push([placementStatus, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, placementDetails]);

    // Check the mediatypes parameters
    let mediatypeBanner = bid.mediaTypes?.banner;
    let mediatypeVideo = bid.mediaTypes?.video;
    let mediatypeNative = bid.mediaTypes?.native;

    if (mediatypeBanner === undefined && mediatypeVideo === undefined && mediatypeNative === undefined)
        paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes</code>: <code>${JSON.stringify(bid.mediaTypes)}</code>`, `No mediatype detected.`]);
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
                        if (JSON.stringify(ss) === JSON.stringify(mbs)) commonArrays.push(ss);
                    });
                });
                if (commonArrays.length > 0) paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(commonArrays)}</code>`, ``]);
                else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`, `No supported size detected.`]);
            } else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`, `No parameter found.`]);
        }

        if (mediatypeVideo !== undefined) {
            // Required for both instream and outstream
            let mediatypeVideoContext = mediatypeVideo?.context;
            let mediatypeVideoApi = mediatypeVideo?.api;
            let mediatypeVideoPlayerSize = mediatypeVideo?.playerSize;
            // Required for instream only
            let mediatypeVideoMimes = mediatypeVideo?.mimes;
            let mediatypeVideoPlcmt = mediatypeVideo?.plcmt || mediatypeVideo?.placement; // placement is deprecated, plcmt is the new one
            // Highly recommended for instream and outstream
            let mediatypeVideoPlaybackMethod = mediatypeVideo?.playbackmethod;
            // Highly recommended for instream only
            let mediatypeVideoStartDelay = mediatypeVideo?.startdelay;
            let mediatypeVideoStartProtocols = mediatypeVideo?.protocols;

            // For checking purpose
            let hasOutstreamContext = mediatypeVideoContext === 'outstream';
            let hasInstreamContext = mediatypeVideoContext === 'instream';
            let videoApiSupported = [1, 2, 3, 4, 5];
            let mimesExpected = ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'];
            let expectedInstreamPlcmt = 1;
            let protocolsExpected = [3, 6, 7, 8];

            // Check the video context: instream or outstream
            if (hasOutstreamContext || hasInstreamContext) {
                paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`, ``]);
            } else {
                paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`, `No supported context found.`]);
                // If no context found, we should not check params furthermore
                return;
            }

            // Check the video api: [1, 2, 3, 4, 5]
            if (mediatypeVideoApi !== undefined) {
                if (hasOutstreamContext && !mediatypeVideoApi.includes(2))
                    paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`, `Must support api <code>2</code>'`]);
                else if (!videoApiSupported.some((i) => mediatypeVideoApi.includes(i)) && hasInstreamContext)
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`,
                        `Must support at least one of <code>${JSON.stringify(videoApiSupported)}</code>`,
                    ]);
                else paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`, ``]);
            } else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.api</code>: <code>${mediatypeVideoApi}</code>`, `No video api detected.`]);

            // Check the player size
            if (
                mediatypeVideoPlayerSize &&
                Array.isArray(mediatypeVideoPlayerSize) &&
                mediatypeVideoPlayerSize.every((subArr) => Array.isArray(subArr) && subArr.length === 2 && subArr.every(Number.isInteger))
            ) {
                paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`, ``]);
            } else {
                paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`, `Wrong format or not size detected.`]);
            }

            // Check the video mimes: ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'] (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoMimes === undefined) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`, `No mimes detected.`]);
                } else if (!mimesExpected.every((i) => mediatypeVideoMimes.includes(i))) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`,
                        `Missing mimes: <code>${JSON.stringify(mimesExpected.filter((i) => !mediatypeVideoMimes.includes(i)))}</code>`,
                    ]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`, ``]);
                }
            }

            // Check the placement
            if (hasInstreamContext) {
                if (mediatypeVideoPlcmt === undefined || expectedInstreamPlcmt !== mediatypeVideoPlcmt) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        `Must be <code>${JSON.stringify(
                            expectedInstreamPlcmt
                        )}</code> for instream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).`,
                    ]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, ``]);
                }
            } else if (hasOutstreamContext) {
                if (mediatypeVideoPlcmt === undefined || mediatypeVideoPlcmt === expectedInstreamPlcmt) {
                    paramsCheckingArray.push([
                        chkr_badges.ko,
                        `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`,
                        `Must be set for outstream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).`,
                    ]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, ``]);
                }
            }

            // Check the video playbackmethod
            if (mediatypeVideoPlaybackMethod !== undefined) {
                const expectedMethod = hasInstreamContext ? 2 : hasOutstreamContext ? 6 : null;

                if (expectedMethod && !mediatypeVideoPlaybackMethod.includes(expectedMethod)) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        `Recommended playback method is: [${expectedMethod}].`,
                    ]);
                } else if (!expectedMethod) {
                    paramsCheckingArray.push([
                        chkr_badges.check,
                        `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                        `No playback method detected or context not available.`,
                    ]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`, ``]);
                }
            } else {
                paramsCheckingArray.push([
                    chkr_badges.check,
                    `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`,
                    `No playback method detected.`,
                ]);
            }

            // Check the startdelay (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartDelay !== undefined) {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`, ``]);
                } else {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`, `No start delay detected.`]);
                }
            }

            // Check the protocols (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartProtocols !== undefined) {
                    if (protocolsExpected.every((i) => mediatypeVideoStartProtocols.includes(i))) {
                        paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`, ``]);
                    } else {
                        paramsCheckingArray.push([
                            chkr_badges.check,
                            `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`,
                            `Missing protocols: <code>${JSON.stringify(protocolsExpected.filter((i) => !mediatypeVideoStartProtocols.includes(i)))}</code>`,
                        ]);
                    }
                } else {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`, `No protocol detected.`]);
                }
            }
        }

        // GDPR - Should be in ortb2.regs.ext.gdpr and user.ext.consent
        if (chkr_api.detectedCountryCodeIso3 === null) {
            console.error('No country code detected, cannot check GDPR params.');
        }
        else {
            // List of EEA countries (ISO 3166-1 alpha-3)
            const EEACountries = [
                'ALA', 'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'GUF', 'DEU', 'GIB', 'GRC', 'GLP', 'GGY', 'HUN', 'ISL', 'IRL', 'IMN', 'ITA', 'JEY', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MTQ', 'MYT', 'NLD', 'NOR', 'POL', 'PRT', 'REU', 'ROU', 'BLM', 'MAF', 'SPM', 'SVK', 'SVN', 'ESP', 'SWE', 'GBR'
            ];

            // Check if the user is in the EEA, only then check the GDPR params
            if (EEACountries.includes(chkr_api.detectedCountryCodeIso3)) {
                // User is in the EEA
                if (ortbGdpr !== 1) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`, `Should be set to <code>1</code> for users in the EEA.`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`, ``]);
                }

                // Check the consent string
                let decodedConsent = ortbConsent !== undefined ? TCString.decode(ortbConsent) : null;
                if (decodedConsent === null) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent}</code>`, `No consent string detected, should be a valid TCFv2 string for users in the EEA.`]);
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
                            missingBidders.push(`${cmpAdagioBidders[key]} (${key})`);
                            if (Number(key) === 617) {
                                adagioMissing = true;
                            }
                        }
                    }
                    if (adagioMissing) {
                        paramsCheckingArray.push([
                            chkr_badges.ko,
                            `<code>ortb2.user.ext.consent</code>`,
                            `Missing consent for: ${missingBidders.join(', ')}`
                        ]);
                    } else if (missingBidders.length > 0) {
                        paramsCheckingArray.push([
                            chkr_badges.check,
                            `<code>ortb2.user.ext.consent</code>`,
                            `Missing consent for: ${missingBidders.join(', ')}`
                        ]);
                    } else {
                        paramsCheckingArray.push([
                            chkr_badges.ok,
                            `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent.substring(0, 20)}...</code>`,
                            `All Adagio partners present`
                        ]);
                    }
                }
            }
        }

        // Interstitial - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpInterstitial !== undefined) {
            if (chkr_wrp.prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([chkr_badges.info, `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`, 'Not supported before Prebid 9.39.']);
            } else {
                paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`, '']);
            }
        } else if (deepOrtb2ImpInterstitial !== null) {
            paramsCheckingArray.push([
                chkr_wrp.prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info,
                `<code>${deepOrtb2ImpInterstitial.path}</code>: <code>${deepOrtb2ImpInterstitial.value}</code>`,
                'Misplaced, should be in <code>ortb2Imp.instl</code>.',
            ]);
        } else {
            paramsCheckingArray.push([
                chkr_wrp.prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info,
                `<code>ortb2Imp.instl</code>: <code>undefined</code>`,
                'No interstitial parameter detected.',
            ]);
        }

        // Rewarded - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpRewarded !== undefined) {
            if (chkr_wrp.prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([chkr_badges.info, `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`, 'Not supported before Prebid 9.39.']);
            } else {
                paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`, '']);
            }
        } else if (deepOrtb2ImpRewarded !== null) {
            paramsCheckingArray.push([
                chkr_wrp.prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.check,
                `<code>${deepOrtb2ImpRewarded.path}</code>: <code>${deepOrtb2ImpRewarded.value}</code>`,
                'Misplaced, should be in <code>ortb2Imp.rwdd</code>',
            ]);
        } else {
            paramsCheckingArray.push([chkr_wrp.prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.check, `<code>ortb2Imp.rwdd</code>: <code>undefined</code>`, 'No rewarded parameter detected.']);
        }

        if (mediatypeNative !== undefined) {
            // TODO
        }
    }
}

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

function switchTab(tabName) {
    // switch visible div and button outline
    if (tabName !== chkr_ovrl.activeTab) {
        goTopPage();
        const activeTabButton = chkr_ovrl.overlayFrameDoc.getElementById(`${chkr_ovrl.activeTab}-button`);
        const activeTabContainer = chkr_ovrl.overlayFrameDoc.getElementById(`${chkr_ovrl.activeTab}-container`);
        const targetTabButton = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-button`);
        const targetTabContainer = chkr_ovrl.overlayFrameDoc.getElementById(`${tabName}-container`);
        targetTabButton.classList.remove('outline');
        activeTabButton.classList.add('outline');
        targetTabContainer.style.display = '';
        activeTabContainer.style.display = 'none';
        chkr_ovrl.activeTab = tabName;
    }
}

function goTopPage() {
    chkr_ovrl.overlayFrameDoc.body.scrollTop = 0;
}

function createBidderParamsModal(bid, paramsCheckingArray, bidderAdagioDetected) {
    // Create a dialog window showing the params of the bidrequest.
    const dialog = chkr_ovrl.overlayFrameDoc.createElement('dialog');
    dialog.setAttribute('open', true);

    const article = chkr_ovrl.overlayFrameDoc.createElement('article');
    article.style.maxWidth = '100%';
    const header = chkr_ovrl.overlayFrameDoc.createElement('header');
    header.innerHTML = `<code>${bid.bidder}</code>: <code>${bid.adUnitCode} (${Object.keys(bid.mediaTypes)})</code>`;
    header.style.marginBottom = '0px';
    const closeLink = chkr_ovrl.overlayFrameDoc.createElement('a');
    closeLink.setAttribute('aria-label', 'Close');
    closeLink.classList.add('close');
    closeLink.addEventListener('click', () => {
        dialog.remove();
    });

    article.appendChild(header);
    header.appendChild(closeLink);

    // If the bidder is Adagio, we display the params checking
    if (bidderAdagioDetected) {
        const parametersCheckTable = chkr_ovrl.overlayFrameDoc.createElement('p');
        createParametersCheckTable(parametersCheckTable, paramsCheckingArray);
        article.appendChild(parametersCheckTable);
    }

    // Display the bidrequest json from pbjs.getEvents()
    const paragraph = chkr_ovrl.overlayFrameDoc.createElement('p');
    paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(bid, null, 2)}</code></pre>`;

    article.appendChild(paragraph);
    dialog.appendChild(article);
    chkr_ovrl.overlayFrameDoc.body.appendChild(dialog);
}

function createParametersCheckTable(paragraph, paramsCheckingArray) {
    // Create the alert text
    // create the alert article
    const alertContainer = chkr_ovrl.overlayFrameDoc.createElement('article');
    alertContainer.style.padding = '1em';
    alertContainer.style.marginLeft = '';
    alertContainer.style.marginRight = '';
    alertContainer.style.marginTop = '1em';
    alertContainer.style.marginBottom = '1em';
    alertContainer.style.color = chkr_colors.yellow_txt;
    alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

    // Create the parameter checker table
    const table = chkr_ovrl.overlayFrameDoc.createElement('table');
    const thead = chkr_ovrl.overlayFrameDoc.createElement('thead');
    const tr = chkr_ovrl.overlayFrameDoc.createElement('tr');
    const th1 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Status';
    const th2 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Parameter';
    const th3 = chkr_ovrl.overlayFrameDoc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Details';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = chkr_ovrl.overlayFrameDoc.createElement('tbody');
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
    const newRow = chkr_ovrl.overlayFrameDoc.createElement('tr');
    // Create the cells
    const statusCell = chkr_ovrl.overlayFrameDoc.createElement('td');
    const parameterCell = chkr_ovrl.overlayFrameDoc.createElement('td');
    const detailsCell = chkr_ovrl.overlayFrameDoc.createElement('td');
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

function displayAdunits(eyeButton) {
    /*
     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L14.032 8.55382C13.4365 8.20193 12.7418 8 12 8C9.79086 8 8 9.79086 8 12C8 12.7418 8.20193 13.4365 8.55382 14.032L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L9.96803 15.4462C10.5635 15.7981 11.2582 16 12 16C14.2091 16 16 14.2091 16 12C16 11.2582 15.7981 10.5635 15.4462 9.96803L19.7071 5.70711ZM12.518 10.0677C12.3528 10.0236 12.1792 10 12 10C10.8954 10 10 10.8954 10 12C10 12.1792 10.0236 12.3528 10.0677 12.518L12.518 10.0677ZM11.482 13.9323L13.9323 11.482C13.9764 11.6472 14 11.8208 14 12C14 13.1046 13.1046 14 12 14C11.8208 14 11.6472 13.9764 11.482 13.9323ZM15.7651 4.8207C14.6287 4.32049 13.3675 4 12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C1.92276 13.7326 2.86706 15.0637 4.21194 16.3739L5.62626 14.9596C4.4555 13.8229 3.61144 12.6531 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C12.7719 6 13.5135 6.13385 14.2193 6.36658L15.7651 4.8207ZM12 18C11.2282 18 10.4866 17.8661 9.78083 17.6334L8.23496 19.1793C9.37136 19.6795 10.6326 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C22.0773 10.2674 21.133 8.93627 19.7881 7.62611L18.3738 9.04043C19.5446 10.1771 20.3887 11.3469 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18Z" fill="#000000"></path> </g></svg>
    */
    chkr_vars.adagioPbjsAdUnitsCode.forEach((adagioAdUnit) => {
        for (const bid in adagioAdUnit.bids) {
            const adUnitElementId = adagioAdUnit.bids[bid].params['adUnitElementId'];
            const originalDiv = window.document.getElementById(adUnitElementId);
            // Create a new div element
            const newDiv = window.document.createElement('div');
            newDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            // Add the new div as a parent of the original div
            originalDiv.parentNode.insertBefore(newDiv, originalDiv);
            newDiv.appendChild(originalDiv);
        }
    });
}

async function refreshChecker() {
    // First remove the existing overlay
    const overlayFrameElement = document.getElementById('adagio-overlay-frame');
    if (overlayFrameElement) {
        overlayFrameElement.remove();
    }
    // Then re-run the checker
    await runApp();
}