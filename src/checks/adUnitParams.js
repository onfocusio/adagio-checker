import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow, appendAdUnitsRow } from '../app.js';
import { computeAdUnitStatus } from '../utils.js';

/**
 * Module: checks/adUnitParams
 *
 * Validate that Adagio bid requests include the expected ad unit parameters
 * and report aggregate status for ad units. Uses `appendAdUnitsRow` to render
 * the ad units table and inspects the results to compute a summary status.
 *
 * @module checks/adUnitParams
 */

/**
 * Inspect ad unit bid requests and append a checker row summarizing the results.
 *
 * @param {Array<Object>} prebidBidRequested All Prebid bidRequested entries.
 * @param {Array<Object>} prebidAdagioBidRequested Subset of bids for Adagio bidder.
 * @param {Set} apiRecordsItems Matching API records used to validate params.site.
 * @returns {void}
 */
export function checkAdagioAdUnitParams(prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems) {
    // Gets list of unique bidders out of Prebid bidrequests events
    const prebidBidders = [...new Set(prebidBidRequested.map((e) => e.bidder))].sort();

    // Get the list of unique adUnitCodes from Prebid bidRequested events
    const prebidAdUnitsCodes = [...new Set(prebidBidRequested.map((e) => e.adUnitCode))];

    // Get the list of unique adUnitCodes from Adagio bids
    const prebidAdagioAdUnitsCodes = [...new Set(prebidAdagioBidRequested.map((e) => e.adUnitCode))];

    // Count total adUnits codes from Prebid and Adagio bids
    const totalPrebidAdUnitsCodes = prebidAdUnitsCodes.length;
    const totalPrebidAdagioAdUnitsCode = prebidAdagioAdUnitsCodes.length;

    // Fill the Adunits table with all the requested bids
    const computedAdunitsStatus = appendAdUnitsRow(prebidBidders, prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems);

    // Compute the final adunits status (KO, CHECK, OK)
    const finalComputedAdunitsStatus = computeAdUnitStatus(computedAdunitsStatus);

    // Compute the adunits counting status (KO, CHECK, OK)
    let adagioAdunitsStatus = chkr_badges.ok;
    if (totalPrebidAdUnitsCodes === 0) adagioAdunitsStatus = chkr_badges.ko;
    else if (totalPrebidAdagioAdUnitsCode === 0) adagioAdunitsStatus = chkr_badges.ko;
    else if (totalPrebidAdUnitsCodes > totalPrebidAdagioAdUnitsCode) adagioAdunitsStatus = chkr_badges.check;

    // Count occurrences of each unique status in computedAdunitsStatus
    const statusCounts = computedAdunitsStatus.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Build a summary string for status counts
    const statusSummary = Object.entries(statusCounts)
        .map(([status, count]) => `${status} (${count})`)
        .join(', ');

    // Compile the status and display the infos.
    const resultStatus = computeAdUnitStatus([finalComputedAdunitsStatus, adagioAdunitsStatus]);
    if (totalPrebidAdUnitsCodes === 0) {
        appendCheckerRow(chkr_badges.ko, chkr_titles.adunits, `<code>${totalPrebidAdUnitsCodes}</code> adUnits(s) detected.`);
    } else {
        let details = `
                • Adagio called for <code>${totalPrebidAdagioAdUnitsCode}</code> adUnit(s) out of <code>${totalPrebidAdUnitsCodes}</code> adUnits(s) detected.<br>
            `;
        if (totalPrebidAdagioAdUnitsCode > 0) {
            details += `• Params status: ${statusSummary}<br>`;
        }
        appendCheckerRow(resultStatus, chkr_titles.adunits, details);
    }
}
