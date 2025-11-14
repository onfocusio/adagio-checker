import { appendCheckerRow } from '../app.js';
import { fetchApiInventoryRecords } from '../api/index.js';
import { chkr_badges } from '../enums.js';
import { prebidObject, prebidWrapper } from '../prebid/wrapper.js';

/**
 * Module: checks/rtd
 *
 * Real-Time Data (RTD) related checks: verify the presence of the RTD module,
 * the Adagio RTD provider and that the RTD configuration is valid for the
 * detected org/site pair.
 *
 * @module checks/rtd
 */

/**
 * Check whether the Prebid RTD module is installed.
 *
 * @returns {void}
 */
export function checkRealTimeDataModule() {
  const sectionTitle = '9️⃣ RTD module';
  const hasRtdModule = prebidObject.installedModules.includes('rtdModule') || false;
  const _hasRtd = typeof ADAGIO !== 'undefined' ? ADAGIO.hasRtd : false;

  if (!hasRtdModule && !_hasRtd)
    appendCheckerRow(chkr_badges.ko, sectionTitle, 'RTD module is not installed.');
  else appendCheckerRow(chkr_badges.ok, sectionTitle, 'RTD module is installed.');
}

/**
 * Check whether the Adagio RTD provider is available in the Prebid installation.
 *
 * @returns {void}
 */
export function checkAdagioRealTimeDataProviderModule() {
  const sectionTitle = '9️⃣ Adagio RTD provider';
  const hasAdagioRtdProvider = prebidObject.installedModules.includes('adagioRtdProvider') || false;
  const _hasRtd = typeof ADAGIO !== 'undefined' ? ADAGIO.hasRtd : false;

  if (!hasAdagioRtdProvider && !_hasRtd)
    appendCheckerRow(chkr_badges.ko, sectionTitle, 'Adagio RTD provider is not installed.');
  else appendCheckerRow(chkr_badges.ok, sectionTitle, 'Adagio RTD provider module is installed.');
}

/**
 * Validate Adagio RTD provider configuration and ensure it matches manager inventory.
 *
 * @param {Array<{organizationId:string,site:string}>} orgSitePairs Organization/site pairs detected in bids.
 * @returns {Promise<void>} Resolves when checks complete.
 */
export async function checkRealTimeDataConfig(orgSitePairs) {
  const sectionTitle = '9️⃣ Adagio RTD params';

  // Ensure that the rtd module exists in the wrapper configuration
  const adgRealTimeDataConfig =
    prebidObject.getConfig('realTimeData')?.dataProviders.find((p) => p.name === 'adagio') || null;

  if (!adgRealTimeDataConfig) {
    appendCheckerRow(
      chkr_badges.ko,
      sectionTitle,
      `Adagio is not configured in <code>${prebidWrapper[0]}.getConfig('realTimeData')</code>`
    );
    return;
  }

  const paramsOrgId = adgRealTimeDataConfig?.params?.organizationId?.toString();
  const paramsSite = adgRealTimeDataConfig?.params?.site?.toString();

  // If orgId or site is missing, throw a ko status
  if (!paramsOrgId || !paramsSite) {
    appendCheckerRow(
      chkr_badges.ko,
      sectionTitle,
      `Missing parameter(s) in RTD config: <code>${JSON.stringify(adgRealTimeDataConfig)}</code>`
    );
    return;
  }

  // Make a dedicated API call to check if the organizationId / siteName pair exists
  const apiRecordsItems = await fetchApiInventoryRecords([
    { organizationId: paramsOrgId, site: paramsSite },
  ]);

  // If no orgSitePairs detected, but paramsOrgId and paramsSite are defined, we can consider it as OK
  if (!apiRecordsItems.size) {
    appendCheckerRow(
      chkr_badges.ok,
      sectionTitle,
      `RTD params doesn't match with manager inventory: <code>${JSON.stringify(adgRealTimeDataConfig)}</code>`
    );
    return;
  }

  // Check if the orgId and site from RTD config matches at least one of the orgSitePairs detected in bidrequests
  if (
    orgSitePairs.length &&
    !orgSitePairs.some((p) => p.organizationId === paramsOrgId && p.site === paramsSite)
  ) {
    appendCheckerRow(
      chkr_badges.check,
      sectionTitle,
      `RTD params are not matching with bids.params: <code>${JSON.stringify(adgRealTimeDataConfig)}</code>`
    );
    return;
  }

  // All tests passed, mark as OK
  appendCheckerRow(
    chkr_badges.ok,
    sectionTitle,
    `RTD config is valid: <code>${JSON.stringify(adgRealTimeDataConfig)}</code>`
  );
}
