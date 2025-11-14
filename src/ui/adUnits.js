import { chkr_tabs, chkr_badges } from '../enums.js';
import { computeAdUnitStatus } from '../utils.js';
import { buildParamsCheckingArray } from '../checks/adUnits.js';

/**
 * Module: ui/adUnits
 *
 * Functions to render ad unit rows and bidder parameter inspection UI inside
 * the overlay iframe. These helpers accept the overlay `Document` instance
 * to avoid referencing global DOM state.
 *
 * @module ui/adUnits
 */

/**
 * Append rows to the AdUnits table showing bid requests and bidder parameters.
 *
 * @param {Document} doc Overlay document where rows will be appended.
 * @param {Array<string>} prebidBidders List of bidder names detected.
 * @param {Array<Object>} prebidBidRequested All bidRequested entries from Prebid.
 * @param {Array<Object>} prebidAdagioBidRequested Bid entries specific to Adagio.
 * @param {Set} apiRecordsItems Matching API records used to validate params.site.
 * @returns {Array<string>} Computed statuses for displayed ad units.
 */
export function appendAdUnitsRow(
  doc,
  prebidBidders,
  prebidBidRequested,
  prebidAdagioBidRequested,
  apiRecordsItems
) {
  // check if Adagio is detected and get bidder name
  let adagioId = '';
  if (prebidAdagioBidRequested.length) adagioId = prebidAdagioBidRequested[0].bidder;

  // build id name
  const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');
  // gets working element element
  const tableBody = doc.getElementById(`${tabName}-tbody`);
  const alertTextDiv = doc.getElementById(`${tabName}-alert`);

  // Get unique adUnit codes (filter out falsy values)
  const prebidAdUnitsCodes = Array.isArray(prebidBidRequested)
    ? [...new Set(prebidBidRequested.map((b) => b?.adUnitCode).filter(Boolean))]
    : [];

  // Display adunits detected
  const codesHtml = prebidAdUnitsCodes
    .map((code) => `<small> <code>${code}</code>;</small>`)
    .join(' ');
  alertTextDiv.innerHTML += `<small>Adunit(s):</small> ${codesHtml ? ' ' + codesHtml : '<small><code>0</code></small>'}<br>`;

  // Will hold the computed status for each adunit
  const computedAdunitsStatus = [];

  // Will hold the list of processed adunit codes to avoid duplicates
  const processedAdUnitCodes = [];

  // Fill the table section
  prebidBidRequested.forEach((bid) => {
    // Gather the initial info: code, type, bidder
    const adUnitCode = bid.adUnitCode;
    const mediaTypes = bid.mediaTypes;
    const bidderId = bid.bidder;

    // Checks if the concerned bidder is Adagio
    const bidderAdagioDetected = bidderId.toLowerCase().includes('adagio');

    // Build the bid checking array and compute the adunit status
    const paramsCheckingArray = [];
    if (bidderAdagioDetected) buildParamsCheckingArray(bid, paramsCheckingArray, apiRecordsItems);
    // Extract all the status values (first element of each array) from paramsCheckingArray
    const extractedStatus = paramsCheckingArray.map((item) => item[0]);
    const status = bidderAdagioDetected ? computeAdUnitStatus(extractedStatus) : chkr_badges.na;

    // Store the computed status for the adunit
    if (bidderAdagioDetected) {
      if (!processedAdUnitCodes.includes(adUnitCode)) {
        computedAdunitsStatus.push(status);
        processedAdUnitCodes.push(adUnitCode);
      }
    }

    // Create the row
    const newRow = doc.createElement('tr');
    newRow.classList.add(`${bidderId.replace(' ', '-')}-bid`);
    // hides the row if adagio detected
    if (adagioId !== '' && adagioId !== bidderId) {
      newRow.style.display = 'none';
    }

    // Create the cells
    const statusCell = doc.createElement('td');
    const codeCell = doc.createElement('td');
    const mediatypesCell = doc.createElement('td');
    const bidderIdCell = doc.createElement('td');
    const bidderParamButton = doc.createElement('kbd');
    bidderParamButton.addEventListener('click', () =>
      createBidderParamsModal(doc, bid, paramsCheckingArray, bidderAdagioDetected)
    );
    bidderParamButton.style.cursor = 'pointer';

    statusCell.innerHTML = status;
    codeCell.innerHTML = `<code>${adUnitCode}</code>`;
    for (const mediaType in mediaTypes) {
      if (mediaTypes[mediaType]?.context)
        mediatypesCell.innerHTML += `<code>${mediaTypes[mediaType].context}</code> `;
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
  const bidderFilter = doc.getElementById('bidderFilter');

  prebidBidders.forEach((bidder) => {
    const libidder = doc.createElement('li');
    const labbidder = doc.createElement('label');
    const inputbidder = doc.createElement('input');
    inputbidder.setAttribute('type', 'checkbox');
    inputbidder.setAttribute('id', `${bidder.replace(' ', '-')}-bidder`);
    bidderFilter.appendChild(libidder);
    libidder.appendChild(labbidder);
    labbidder.appendChild(inputbidder);
    labbidder.innerHTML += `<code>${bidder}</code>`;

    const newInput = doc.getElementById(`${bidder.replace(' ', '-')}-bidder`);
    if (adagioId !== '' && adagioId !== bidder) newInput.checked = false;
    else newInput.checked = true;
    newInput.addEventListener('click', function () {
      toggleBidRow(doc, newInput, bidder);
    });
  });

  // return the computed status for each adunit
  return computedAdunitsStatus;
}

/**
 * Toggle display of bid rows corresponding to a specific bidder.
 *
 * @param {Document} doc Overlay document.
 * @param {HTMLInputElement} input The checkbox input controlling visibility.
 * @param {string} bidder Bidder name whose rows will be toggled.
 */
function toggleBidRow(doc, input, bidder) {
  const className = `${bidder.replace(' ', '-')}-bid`;
  const rows = doc.querySelectorAll(`.${className}`);
  rows.forEach((r) => {
    r.style.display = input.checked ? '' : 'none';
  });
}

/**
 * Create and display a modal dialog with bidder parameters and the bid JSON.
 *
 * @param {Document} doc Overlay document.
 * @param {Object} bid Bid object to display.
 * @param {Array} paramsCheckingArray Array of parameter-check tuples.
 * @param {boolean} bidderAdagioDetected Whether the bidder is Adagio.
 */
function createBidderParamsModal(doc, bid, paramsCheckingArray, bidderAdagioDetected) {
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
  closeLink.addEventListener('click', () => {
    dialog.remove();
  });

  article.appendChild(header);
  header.appendChild(closeLink);

  // If the bidder is Adagio, we display the params checking
  if (bidderAdagioDetected) {
    const parametersCheckTable = doc.createElement('p');
    createParametersCheckTable(doc, parametersCheckTable, paramsCheckingArray);
    article.appendChild(parametersCheckTable);
  }

  // Display the bidrequest json
  const paragraph = doc.createElement('p');
  paragraph.innerHTML = `<pre><code class="language-json">${JSON.stringify(bid, null, 2)}</code></pre>`;

  article.appendChild(paragraph);
  dialog.appendChild(article);
  doc.body.appendChild(dialog);
}
/**
 * Create and display a modal dialog with bidder parameters and the bid JSON.
 *
 * @param {Document} doc Overlay document.
 * @param {Object} bid Bid object to display.
 * @param {Array} paramsCheckingArray Array of parameter-check tuples.
 * @param {boolean} bidderAdagioDetected Whether the bidder is Adagio.
 * @returns {void}
 */

/**
 * Create a parameters check table and append it to the provided paragraph element.
 *
 * @param {Document} doc Overlay document.
 * @param {Element} paragraph Container element to append the table to.
 * @param {Array} paramsCheckingArray Array of [status, parameter, details].
 */
function createParametersCheckTable(doc, paragraph, paramsCheckingArray) {
  const alertContainer = doc.createElement('article');
  alertContainer.style.padding = '1em';
  alertContainer.style.marginLeft = '';
  alertContainer.style.marginRight = '';
  alertContainer.style.marginTop = '1em';
  alertContainer.style.marginBottom = '1em';

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
  table.appendChild(thead);

  const tbody = doc.createElement('tbody');
  paramsCheckingArray.forEach((r) => {
    const rtr = doc.createElement('tr');
    const td1 = doc.createElement('td');
    const td2 = doc.createElement('td');
    const td3 = doc.createElement('td');
    td1.innerHTML = r[0];
    td2.innerHTML = r[1];
    td3.innerHTML = r[2];
    rtr.appendChild(td1);
    rtr.appendChild(td2);
    rtr.appendChild(td3);
    tbody.appendChild(rtr);
  });
  table.appendChild(tbody);
  paragraph.appendChild(alertContainer);
  paragraph.appendChild(table);
}

/**
 * Create a parameters check table and append it to the provided paragraph element.
 *
 * @param {Document} doc Overlay document.
 * @param {Element} paragraph Container element to append the table to.
 * @param {Array} paramsCheckingArray Array of [status, parameter, details].
 * @returns {void}
 */
