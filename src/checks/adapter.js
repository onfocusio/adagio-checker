import { chkr_badges } from '../enums.js';
import { appendCheckerRow } from '../app.js';

/**
 * Module: checks/adapter
 *
 * Check that the Adagio bidder adapter module is present on the page.
 *
 * @module checks/adapter
 */

/**
 * Verify presence of the Adagio bidder adapter and append a status row.
 *
 * @returns {void}
 */
export function checkAdagioBidderAdapterModule() {
  let badge = chkr_badges.ko;
  const title = 'Adagio adapter';
  let message = 'Adagio bidder adapter module is not installed.';

  // If window.ADAGIO is defined, the Adagio bidder adapter module is installed
  if (typeof ADAGIO !== 'undefined') {
    badge = chkr_badges.ok;
    message = 'Adagio bidder adapter detected.';
  }
  appendCheckerRow(badge, title, message);
}

export default checkAdagioBidderAdapterModule;
