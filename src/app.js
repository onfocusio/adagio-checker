import { chkr_svg } from './enums.js';
import { main } from './main.js';
import {
	createOverlay as uiCreateOverlay,
	createCheckerDiv as uiCreateCheckerDiv,
	createAdUnitsDiv as uiCreateAdUnitsDiv,
	makeIframeDraggable as uiMakeIframeDraggable,
	appendCheckerRow as uiAppendCheckerRow,
	appendHomeContainer as uiAppendHomeContainer,
	appendAdUnitsRow as uiAppendAdUnitsRow,
	buildAdagioLogo as uiBuildAdagioLogo,
} from './ui/index.js';

/**
 * Module: app
 *
 * UI glue that constructs the overlay iframe and exposes helper functions
 * used by the checker to render rows and ad unit information. This file
 * delegates rendering to `src/ui/*` modules and manages the overlay frame
 * lifecycle.
 *
 * @module app
 */
export let overlayFrame = undefined;     // HTML iframe element for the overlay
export let overlayFrameDoc = undefined;  // Document object for the overlay iframe
let isDragged = false;                   // Is the iframe being dragged

/**
 * Build the application overlay and initialize UI containers.
 *
 * Creates the iframe overlay, stores `overlayFrame` and `overlayFrameDoc`,
 * constructs checker/adunits containers and enables dragging behavior.
 *
 * @returns {Promise<void>} Resolves once the overlay has been initialized.
 */
export async function buildApp() {
	// Build the check app overlay
	const { frame, doc } = uiCreateOverlay();
	overlayFrame = frame;
	overlayFrameDoc = doc;
	buildInterface();
	uiCreateCheckerDiv(overlayFrameDoc);
	uiCreateAdUnitsDiv(overlayFrameDoc);
	uiMakeIframeDraggable(overlayFrame, overlayFrameDoc);
}

/**
 * Create and return the overlay iframe and its document object.
 *
 * @returns {{frame:HTMLIFrameElement, doc:Document}} The created iframe element and its document reference.
 */
export function createOverlay() {
	const { frame, doc } = uiCreateOverlay();
	overlayFrame = frame;
	overlayFrameDoc = doc;
	return { frame, doc };
}

/**
 * Create the main 'checker' container inside the overlay document.
 *
 * @returns {Element} The created checker container element.
 */
export function createCheckerDiv() {
	return uiCreateCheckerDiv(overlayFrameDoc);
}

/**
 * Create the 'adunits' container inside the overlay document.
 *
 * @returns {Element} The created adunits container element.
 */
export function createAdUnitsDiv() {
	return uiCreateAdUnitsDiv(overlayFrameDoc);
}

/**
 * Enable draggable behavior on the overlay iframe's navigation bar.
 *
 * Attaches mouse event listeners and moves the iframe according to pointer deltas.
 */
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
		if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
			navbar.style.cursor = 'grab';
		} else navbar.style.cursor = 'default';
	}

	function startDragging(e) {
		targetElement = e.target.tagName;
		if (targetElement === 'NAV' || targetElement === 'UL' || targetElement === 'LI') {
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
	return uiAppendCheckerRow(status, name, details);
}

export function appendHomeContainer(htmlContent) {
	return uiAppendHomeContainer(htmlContent);
}

export function appendAdUnitsRow(prebidBidders, prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems) {
	return uiAppendAdUnitsRow(overlayFrameDoc, prebidBidders, prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems);
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

function buildInterface() {
	const nav = buildNavBar();
	const logo = buildAdagioLogo();
	nav.appendChild(logo);
	// Basic setup: append the navbar to the overlay document body
	if (overlayFrameDoc && overlayFrameDoc.body) overlayFrameDoc.body.appendChild(nav);
}
function buildAdagioLogo() {
	return uiBuildAdagioLogo(overlayFrameDoc, chkr_svg);
}
// Tab switching and parameter modal helpers were removed during modularization.

export async function refreshChecker() {
	// First remove the existing overlay
	const overlayFrameElement = document.getElementById('adagio-overlay-frame');
	if (overlayFrameElement) {
		overlayFrameElement.remove();
	}
	// Then re-run the checker
	await main();
}
