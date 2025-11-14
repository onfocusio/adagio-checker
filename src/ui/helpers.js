import { chkr_colors } from '../enums.js';
import { getPrebidVersion } from '../utils.js';

/**
 * Module: ui/helpers
 *
 * Small factory helpers used to build parts of the overlay navbar and
 * parameter inspection UI. These helpers accept a `Document` instance so
 * they can be rendered inside the overlay iframe.
 *
 * @module ui/helpers
 */

/**
 * Create a logo element linking to Adagio app for inclusion in the navbar.
 *
 * @param {Document} doc Overlay document to create elements in.
 * @param {{logo:string}} chkr_svg SVG assets object containing `logo` markup.
 * @returns {HTMLElement} An unordered list element containing the logo link.
 */
export function buildAdagioLogo(doc, chkr_svg) {
    const ul = doc.createElement('ul');
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.setAttribute('href', 'https://app.adagio.io/');
    a.setAttribute('target', '_blank');
    a.innerHTML = chkr_svg.logo;
    li.appendChild(a);
    ul.appendChild(li);
    return ul;
}

/**
 * Build a navigation tab button for the overlay navbar.
 *
 * @param {Document} doc Overlay document to create elements in.
 * @param {string} name Tab display name.
 * @param {string} svg SVG markup to include in the button.
 * @param {boolean} isactive Whether the tab is currently active.
 * @param {(tabName:string)=>void} switchTabCallback Callback invoked when clicked.
 * @returns {HTMLElement} A list item containing the tab button.
 */
export function buildTabButton(doc, name, svg, isactive, switchTabCallback) {
    const tabName = name.toLowerCase().replace(' ', '-');
    const li = doc.createElement('li');
    const tabButton = doc.createElement('button');
    tabButton.setAttribute('id', `${tabName}-button`);
    tabButton.innerHTML = svg;
    tabButton.innerHTML += ` ${name} `;
    tabButton.addEventListener('click', () => switchTabCallback(tabName));
    if (!isactive) tabButton.classList.add('outline');
    tabButton.style.padding = '0.3em';
    tabButton.style.textTransform = 'uppercase';
    tabButton.style.fontSize = '0.85em';
    li.appendChild(tabButton);
    return li;
}

/**
 * Build a dropdown selector listing detected Prebid wrappers and their versions.
 *
 * @param {Document} doc Overlay document to create elements in.
 * @param {Array} prebidWrappers Array of available wrappers.
 * @param {Array} prebidWrapper Currently selected wrapper tuple.
 * @param {(value:number)=>void} switchToSelectedPrebidWrapperCallback Callback to select a different wrapper.
 * @returns {HTMLElement} A list item containing the wrapper selector.
 */
export function buildWrappersDropdownSelector(doc, prebidWrappers, prebidWrapper, switchToSelectedPrebidWrapperCallback) {
    const nbWrappers = prebidWrappers.length;
    if (!nbWrappers) return doc.createElement('span');

    const li = doc.createElement('li');
    li.style.position = 'relative';

    const badge = doc.createElement('span');
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

    const select = doc.createElement('select');
    select.style.paddingTop = '0.3em';
    select.style.paddingBottom = '0.3em';
    select.style.fontSize = '0.85em';
    select.style.minWidth = '10rem';
    select.style.cursor = 'pointer';

    const placeholder = doc.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = 'Select a wrapper';
    select.appendChild(placeholder);

    for (let i = 0; i < nbWrappers; i++) {
        const _prebidWrapper = prebidWrappers[i];
        const _name = _prebidWrapper[0];
        const _win = _prebidWrapper[1];
        const _obj = _win[_name];
        const opt = doc.createElement('option');
        opt.value = String(i);
        opt.textContent = `${_name} (v${getPrebidVersion(_obj)})`;
        if (prebidWrapper[0] === _name && Object.is(prebidWrapper[1], _win)) {
            opt.selected = true;
            placeholder.selected = false;
        }
        select.appendChild(opt);
    }

    select.addEventListener('change', function () {
        if (this.value !== '') {
            switchToSelectedPrebidWrapperCallback([this.value]);
        }
    });

    li.appendChild(badge);
    li.appendChild(select);
    return li;
}

/**
 * Build a debugging button that triggers `loadDebuggingMode` when clicked.
 *
 * @param {Document} doc Overlay document.
 * @param {string} name Button title.
 * @param {string} svg SVG markup for the button.
 * @param {boolean} isactive Whether the button is enabled.
 * @param {Function} loadDebuggingMode Callback to enable debug mode.
 * @returns {HTMLElement} A list item containing the debugging button.
 */
export function buildDebuggingButton(doc, name, svg, isactive, loadDebuggingMode) {
    const li = doc.createElement('li');
    const button = doc.createElement('button');
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

/**
 * Build a refresh button which calls the provided `refreshChecker` callback.
 *
 * @param {Document} doc Overlay document.
 * @param {string} name Button title.
 * @param {string} svg SVG markup for the button.
 * @param {boolean} isactive Whether the button is enabled.
 * @param {Function} refreshChecker Callback invoked when clicking the button.
 * @returns {HTMLElement} A list item containing the refresh button.
 */
export function buildRefreshButton(doc, name, svg, isactive, refreshChecker) {
    const li = doc.createElement('li');
    const button = doc.createElement('button');
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

/**
 * Create an HTML table listing parameter checks and use the provided
 * `appendRowCallback` to render each row.
 *
 * @param {Document} doc Overlay document.
 * @param {Array<Array>} paramsCheckingArray Array of parameter-check tuples.
 * @param {(tbody:Element, status:string, parameter:string, details:string)=>void} appendRowCallback
 * @returns {HTMLTableElement} Constructed table element.
 */
export function createParametersCheckTable(doc, paramsCheckingArray, appendRowCallback) {
    const table = doc.createElement('table');
    const thead = doc.createElement('thead');
    const tr = doc.createElement('tr');
    const th1 = doc.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Status';
    const th2 = doc.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Parameter';
    const th3 = doc.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Details';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);

    const tbody = doc.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    for (let item of paramsCheckingArray) {
        const status = item[0];
        const parameter = item[1];
        const details = item[2];
        appendRowCallback(tbody, status, parameter, details);
    }

    return table;
}

/**
 * Append a row to a parameters-checking table body.
 *
 * @param {Document} doc Overlay document.
 * @param {Element} tbody Table body element where the row will be appended.
 * @param {string} status HTML badge string for status.
 * @param {string} parameter Parameter description/html.
 * @param {string} details Detail text/html for the parameter.
 * @returns {void}
 */
export function appendParametersCheckerTableRow(doc, tbody, status, parameter, details) {
    const newRow = doc.createElement('tr');
    const statusCell = doc.createElement('td');
    const parameterCell = doc.createElement('td');
    const detailsCell = doc.createElement('td');
    statusCell.innerHTML = status;
    parameterCell.innerHTML = parameter;
    detailsCell.innerHTML = details;
    tbody.appendChild(newRow);
    newRow.appendChild(statusCell);
    newRow.appendChild(parameterCell);
    newRow.appendChild(detailsCell);
}

/**
 * Create and append a modal dialog showing bidder parameters and raw bid JSON.
 *
 * @param {Document} doc Overlay document.
 * @param {Object} bid Bid object to display.
 * @param {Array} paramsCheckingArray Array of parameter-check tuples.
 * @param {boolean} bidderAdagioDetected Whether the bidder is Adagio.
 * @param {(doc:Document, params:Array, cb:Function)=>Element} createParametersCheckTableCallback Function that builds the parameters table.
 * @returns {void}
 */
export function createBidderParamsModal(doc, bid, paramsCheckingArray, bidderAdagioDetected, createParametersCheckTableCallback) {
    const dialog = doc.createElement('dialog');
    dialog.setAttribute('open', true);
    const article = doc.createElement('article');
    article.style.maxWidth = '100%';
    const header = doc.createElement('header');
    header.innerHTML = `<code>${bid.bidder}</code>: <code>${bid.adUnitCode} (${Object.keys(bid.mediaTypes)})</code>`;
    header.style.marginBottom = '0px';
    const closeLink = doc.createElement('a');
    closeLink.setAttribute('aria-label', 'Close');
    closeLink.classList.add('close');
    closeLink.addEventListener('click', () => dialog.remove());
    article.appendChild(header);
    header.appendChild(closeLink);
    if (bidderAdagioDetected) {
        const parametersCheckTable = doc.createElement('p');
        const table = createParametersCheckTableCallback(doc, paramsCheckingArray, (tbody, s, p, d) => appendParametersCheckerTableRow(doc, tbody, s, p, d));
        parametersCheckTable.appendChild(table);
        article.appendChild(parametersCheckTable);
    }
    const paragraph = doc.createElement('p');
    paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(bid, null, 2)}</code></pre>`;
    article.appendChild(paragraph);
    dialog.appendChild(article);
    doc.body.appendChild(dialog);
}
