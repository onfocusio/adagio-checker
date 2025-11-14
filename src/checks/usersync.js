import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidObject } from '../prebid/wrapper.js';

/**
 * Module: checks/usersync
 *
 * Verify that Prebid userSync is configured to allow Adagio user syncing
 * (recommended via iframe). Appends a status row describing the configuration.
 *
 * @module checks/usersync
 */

/**
 * Check Adagio user sync configuration and append the appropriate checker row.
 *
 * @returns {void}
 */
export function checkAdagioUserSync() {
  // Adagio strongly recommends enabling user syncing through iFrames.
  // This functionality improves DSP user match rates and increases the bid rate and bid price.
  const prebidUserSync = prebidObject.getConfig('userSync');

  // Check if userSync config is defined
  if (prebidUserSync) {
    // Sync can be done via iframe or all
    const prebidUserSyncIframe = prebidUserSync?.filterSettings?.iframe;
    const prebidUserSyncAll = prebidUserSync?.filterSettings?.all;

    // Check for the two possible valid configurations
    const validIframeConfig =
      prebidUserSyncIframe &&
      (prebidUserSyncIframe?.bidders?.includes('*') ||
        (Array.isArray(prebidUserSyncIframe?.bidders) &&
          prebidUserSyncIframe?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) &&
      prebidUserSyncIframe.filter === 'include';
    const validAllConfig =
      prebidUserSyncAll &&
      (prebidUserSyncAll?.bidders?.includes('*') ||
        (Array.isArray(prebidUserSyncAll?.bidders) &&
          prebidUserSyncAll?.bidders.some((item) => item?.toLowerCase()?.includes('adagio')))) &&
      prebidUserSyncAll.filter === 'include';

    // Display the appropriate checker row based on the configuration validity
    if (validIframeConfig)
      appendCheckerRow(
        chkr_badges.ok,
        chkr_titles.usersync,
        `<code>${JSON.stringify(prebidUserSyncIframe)}</code>`
      );
    else if (validAllConfig)
      appendCheckerRow(
        chkr_badges.ok,
        chkr_titles.usersync,
        `<code>${JSON.stringify(prebidUserSyncAll)}</code>`
      );
  } else {
    appendCheckerRow(
      chkr_badges.ko,
      chkr_titles.usersync,
      `Usersync won't work for Adagio: <code>${JSON.stringify(prebidUserSync)}</code>`
    );
  }
}
