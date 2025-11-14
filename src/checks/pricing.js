import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidObject, prebidWrapper } from '../prebid/wrapper.js';

/**
 * Module: checks/pricing
 *
 * Checks related to pricing modules: currency and floors (floor price module).
 * These functions surface any defined configs to help diagnose pricing-related
 * integration issues.
 *
 * @module checks/pricing
 */

/**
 * Report detected Prebid currency configuration.
 *
 * @returns {void}
 */
export function checkCurrencyModule() {
  // Currency module allow to bid regardless of the adServer currency. It's mandatory when the adServer currency isn't USD
  const prebidCurrency = prebidObject.getConfig('currency');
  if (prebidCurrency !== undefined) {
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.currency,
      `<code>${JSON.stringify(prebidCurrency)}</code>`
    );
  } else {
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.currency,
      `<code>${prebidWrapper[0]}.getConfig('currency')</code>: <code>${prebidCurrency}</code>`
    );
  }
}

/**
 * Report detected Prebid floor price configuration.
 *
 * @returns {void}
 */
export function checkFloorPriceModule() {
  // Floor price module allow to share the lower price acceptable for an adUnit with the bidders
  const prebidFloorPrice = prebidObject.getConfig('floors');
  if (prebidFloorPrice !== undefined) {
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.floors,
      `<code>${JSON.stringify(prebidFloorPrice)}</code>`
    );
  } else {
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.floors,
      `<code>${prebidWrapper[0]}.getConfig('floors')</code>: <code>${prebidFloorPrice}</code>`
    );
  }
}
