import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidObject, prebidWrapper } from '../prebid/wrapper.js';

/**
 * Module: checks/localstorage
 *
 * Verify local storage configuration required by Adagio (html5 storage in
 * bidderSettings). Appends an OK or KO row depending on the configuration.
 *
 * @module checks/localstorage
 */

/**
 * Check Adagio localStorage configuration and append a checker row.
 *
 * @returns {void}
 */
export function checkAdagioLocalStorage() {
    // Is local storage enabled?
    const localStorage = prebidObject.bidderSettings;

    // Internal function to check if storageAllowed is correctly configured
    function isStorageAllowed(value) {
        if (typeof value === 'boolean') return value === true;
        if (Array.isArray(value)) return value.includes('html5');
        return false;
    }

    // Localstorage can be configured either in 'standard' or 'adagio' bidderSettings
    const localStorageStandard = localStorage.standard?.storageAllowed;
    const localStorageAdagio = localStorage.adagio?.storageAllowed;

    // Check the local storage configuration
    if (isStorageAllowed(localStorageStandard)) appendCheckerRow(chkr_badges.ok, chkr_titles.localstorage, `<code>${prebidWrapper[0]}.bidderSettings.standard.storageAllowed</code>: <code>${JSON.stringify(localStorageStandard)}</code>`);
    else if (isStorageAllowed(localStorageAdagio)) appendCheckerRow(chkr_badges.ok, chkr_titles.localstorage, `<code>${prebidWrapper[0]}.bidderSettings.adagio.storageAllowed</code>: <code>${JSON.stringify(localStorageAdagio)}</code>`);
    else appendCheckerRow(chkr_badges.ko, chkr_titles.localstorage, `Localstorage won't work for Adagio: <code>${JSON.stringify(localStorage)}</code>`);
}
