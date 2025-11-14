import { chkr_tabs, chkr_colors } from '../enums.js';

/**
 * Module: ui/overlay
 *
 * Functions that create and manage the iframe overlay used by the checker.
 * These functions return the iframe/document pair and provide lightweight
 * helpers to render the checker and adunit containers inside the overlay.
 *
 * @module ui/overlay
 */

/**
 * Create an iframe overlay and return the iframe element and its document.
 *
 * The returned `doc` should be used for all DOM operations inside the overlay.
 *
 * @returns {{frame:HTMLIFrameElement, doc:Document}}
 */
export function createOverlay() {
  // create a new iframe element
  const frame = window.document.createElement('iframe');
  frame.id = 'adagio-overlay-frame';
  frame.style.position = 'fixed';
  frame.style.top = '10px';
  frame.style.left = '10px';
  frame.style.width = '1000px';
  frame.style.height = '95%';
  frame.style.zIndex = '2147483647';
  frame.style.backgroundColor = 'transparent';
  frame.style.border = 'none';
  frame.style.borderRadius = '10px';
  frame.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
  frame.style.resize = 'both';
  frame.style.display = 'block';
  window.document.body.appendChild(frame);

  // get the iframe document objects
  const doc = frame.contentDocument || frame.contentWindow.document;
  return { frame, doc };
}

/**
 * Create the main checker container structure inside the given overlay document.
 *
 * @param {Document} overlayDoc The iframe document where DOM nodes will be created.
 * @returns {void}
 */
export function createCheckerDiv(overlayDoc) {
  const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
  const mainContainer = overlayDoc.createElement('main');
  mainContainer.classList.add('container-fluid');
  mainContainer.setAttribute('id', `${tabName}-container`);
  mainContainer.style.paddingTop = '5rem';
  mainContainer.style.paddingBottom = '0';

  const headings = overlayDoc.createElement('div');
  headings.classList.add('headings');

  const h2 = overlayDoc.createElement('h2');
  h2.textContent = 'Integration checker';
  const h3 = overlayDoc.createElement('h3');
  h3.textContent = 'Expectations for a proper Adagio integration';
  headings.appendChild(h2);
  headings.appendChild(h3);

  const alertContainer = overlayDoc.createElement('article');
  alertContainer.style.padding = '1em';
  alertContainer.style.marginTop = '1em';
  alertContainer.style.marginBottom = '1em';
  alertContainer.style.color = chkr_colors.yellow_txt;
  alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;

  const alertTextDiv = overlayDoc.createElement('div');
  alertTextDiv.setAttribute('id', `${tabName}-alert`);
  alertContainer.appendChild(alertTextDiv);

  const table = overlayDoc.createElement('table');
  const thead = overlayDoc.createElement('thead');
  const tr = overlayDoc.createElement('tr');
  const th1 = overlayDoc.createElement('th');
  th1.setAttribute('scope', 'col');
  th1.textContent = 'Status';
  const th2 = overlayDoc.createElement('th');
  th2.setAttribute('scope', 'col');
  th2.textContent = 'Name';
  const th3 = overlayDoc.createElement('th');
  th3.setAttribute('scope', 'col');
  th3.textContent = 'Details';
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  thead.appendChild(tr);
  const tbody = overlayDoc.createElement('tbody');
  tbody.setAttribute('id', `${tabName}-tbody`);
  table.appendChild(thead);
  table.appendChild(tbody);

  mainContainer.appendChild(headings);
  mainContainer.appendChild(alertContainer);
  mainContainer.appendChild(table);

  overlayDoc.body.appendChild(mainContainer);
}

/**
 * Create the ad units container structure inside the given overlay document.
 *
 * @param {Document} overlayDoc The iframe document where DOM nodes will be created.
 * @returns {void}
 */
export function createAdUnitsDiv(overlayDoc) {
  const tabName = chkr_tabs.adunits.toLowerCase().replace(' ', '-');
  const mainContainer = overlayDoc.createElement('main');
  mainContainer.classList.add('container-fluid');
  mainContainer.setAttribute('id', `${tabName}-container`);
  mainContainer.style.display = 'none';
  mainContainer.style.paddingTop = '5rem';
  mainContainer.style.paddingBottom = '0';

  const headings = overlayDoc.createElement('div');
  headings.classList.add('headings');
  const h2 = overlayDoc.createElement('h2');
  h2.textContent = 'AdUnits';
  const h3 = overlayDoc.createElement('h3');
  h3.textContent = 'Bid requested for each adUnit and by bidders';
  headings.appendChild(h2);
  headings.appendChild(h3);

  const alertContainer = overlayDoc.createElement('article');
  alertContainer.style.padding = '1em';
  alertContainer.style.marginTop = '1em';
  alertContainer.style.marginBottom = '1em';
  alertContainer.style.color = chkr_colors.yellow_txt;
  alertContainer.style.backgroundColor = chkr_colors.yellow_bkg;
  const alertTextDiv = overlayDoc.createElement('div');
  alertTextDiv.setAttribute('id', `${tabName}-alert`);
  alertContainer.appendChild(alertTextDiv);

  const bidderFilter = overlayDoc.createElement('details');
  bidderFilter.setAttribute('role', 'list');
  const selectFilter = overlayDoc.createElement('summary');
  selectFilter.setAttribute('aria-haspopup', 'listbox');
  selectFilter.textContent = 'Filter requested bids by bidders';
  const ulFilter = overlayDoc.createElement('ul');
  ulFilter.setAttribute('role', 'listbox');
  ulFilter.setAttribute('id', 'bidderFilter');
  bidderFilter.appendChild(selectFilter);
  bidderFilter.appendChild(ulFilter);

  const table = overlayDoc.createElement('table');
  const thead = overlayDoc.createElement('thead');
  const tr = overlayDoc.createElement('tr');
  const th0 = overlayDoc.createElement('th');
  th0.setAttribute('scope', 'col');
  th0.textContent = 'Status';
  const th1 = overlayDoc.createElement('th');
  th1.setAttribute('scope', 'col');
  th1.textContent = 'Code';
  const th2 = overlayDoc.createElement('th');
  th2.setAttribute('scope', 'col');
  th2.textContent = 'Mediatypes';
  const th3 = overlayDoc.createElement('th');
  th3.setAttribute('scope', 'col');
  th3.textContent = '🔎 Bidder params';
  tr.appendChild(th0);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  thead.appendChild(tr);

  const tbody = overlayDoc.createElement('tbody');
  tbody.setAttribute('id', `${tabName}-tbody`);
  table.appendChild(thead);
  table.appendChild(tbody);

  mainContainer.appendChild(headings);
  mainContainer.appendChild(alertContainer);
  mainContainer.appendChild(bidderFilter);
  mainContainer.appendChild(table);

  overlayDoc.body.appendChild(mainContainer);
}

/**
 * Attach drag handlers to make the overlay iframe draggable via its navbar.
 *
 * @param {HTMLElement} overlayFrameRef The iframe DOM element reference.
 * @param {Document} overlayDocRef The iframe document reference.
 * @returns {void}
 */
export function makeIframeDraggable(overlayFrameRef, overlayDocRef) {
  const navbar = overlayDocRef.getElementById('adagio-nav');
  let isDragged = false;
  let startX = 0;
  let startY = 0;

  navbar.addEventListener('mousedown', startDragging);
  navbar.addEventListener('mouseup', stopDragging);
  navbar.addEventListener('mouseover', updateCursor);
  overlayFrameRef.addEventListener('mouseup', stopDragging);

  function updateCursor(e) {
    const targetElement = e.target.tagName;
    if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
      navbar.style.cursor = 'grab';
    } else navbar.style.cursor = 'default';
  }

  function startDragging(e) {
    const targetElement = e.target.tagName;
    if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
      isDragged = true;
      navbar.style.cursor = 'grabbing';
      overlayFrameRef.style.opacity = '0.4';
      startX = e.clientX;
      startY = e.clientY;
    }
  }

  function stopDragging() {
    isDragged = false;
    navbar.style.cursor = 'grab';
    overlayFrameRef.style.opacity = '';
  }

  overlayDocRef.addEventListener('mousemove', function (e) {
    if (!isDragged) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const iframeRect = overlayFrameRef.getBoundingClientRect();
    const iframeX = iframeRect.left;
    const iframeY = iframeRect.top;
    overlayFrameRef.style.left = iframeX + deltaX + 'px';
    overlayFrameRef.style.top = iframeY + deltaY + 'px';
  });
}
