/**
 * Checks for Adagio analytics integration and configuration.
 *
 * Validates that the analytics adapter is available and that required
 * options (organizationId, site) are provided when Prebid requires them.
 * Results are reported through `appendCheckerRow`.
 *
 * @module checks/analytics
 */
import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidWrapper, prebidVersionDetected } from '../prebid/wrapper.js';

/**
 * Verify Adagio analytics module readiness and configuration.
 *
 * - Ensures `ADAGIO` is present.
 * - Checks Prebid version compatibility for analytics support.
 * - Validates presence of `ADAGIO.options.organizationId` and `ADAGIO.options.site` when required.
 * - Appends checker rows via `appendCheckerRow` to indicate status.
 *
 * @returns {void}
 */
export function checkAdagioAnalyticsModule() {
    // The wrapper object never references information related to the analytics, we can only rely on the ADAGIO object information
    if (typeof ADAGIO === 'undefined') {
        appendCheckerRow(chkr_badges.ko, chkr_titles.analytics, `<code>window.ADAGIO</code>: <code>${ADAGIO}</code>`);
        return;
    }

    // Prebid Analytics is ready to use since Prebid 8.14
    // And additional 'options' parameters are required since Prebid 9
    let hasEligibleVersion = prebidVersionDetected > 8.14;
    let hasPrebidNineVersion = prebidVersionDetected > 9;
    let hasEnabledAnalytics = ADAGIO.versions?.adagioAnalyticsAdapter;

    if (!hasEligibleVersion) appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>${prebidWrapper[0]}.version</code>: <code>${prebidVersionDetected}</code>`);
    else if (!hasEnabledAnalytics) appendCheckerRow(chkr_badges.info, chkr_titles.analytics, `<code>ADAGIO.versions.adagioAnalyticsAdapter</code>: <code>${hasEnabledAnalytics}</code>`);
    else if (!hasPrebidNineVersion) appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Prebid version: <code>${prebidVersionDetected}</code> / Analytics: <code>${hasEnabledAnalytics}</code>`);
    else {
        // Try to retrieve the 'options' from the analytics wrapper configuration
        let paramOrganizationId = ADAGIO?.options?.organizationId;
        let paramSitename = ADAGIO?.options?.site;

        // Options are necessary for Adagio to get the analytics even if the Adagio bidder adapter is not loaded
        if (!paramOrganizationId || !paramSitename) {
            appendCheckerRow(chkr_badges.check, chkr_titles.analytics, `Missing parameters: <code>${prebidWrapper[0]}.enableAnalytics.options</code> should contain <code>organizationId</code> and <code>site</code>`);
        } else {
            appendCheckerRow(chkr_badges.ok, chkr_titles.analytics, `Options: <code>${ADAGIO?.options}</code>`);
        }
    }
}
