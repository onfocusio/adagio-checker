import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidObject, prebidWrapper } from '../prebid/wrapper.js';

/**
 * Module: checks/userIds
 *
 * Verify installed user ID modules and report which providers are present.
 *
 * @module checks/userIds
 */

/**
 * Check user ID configuration and append an informational checker row.
 *
 * @returns {void}
 */
export function checkUserIds() {
  // Check if Get User IDs function is enabled
  if (typeof prebidObject.getUserIdsAsEids !== 'function') {
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.userids,
      `<code>${prebidWrapper[0]}.getUserIdsAsEids()</code>: <code>undefined</code>`
    );
    return;
  }

  // Count the total installed user IDs
  const userIds = prebidObject.getUserIdsAsEids();
  const totalInstalledUserIds = userIds.length;
  const presentUserIds = userIds.filter((userId) => userId.uids.length);

  if (presentUserIds.length) {
    // Count the present user IDs
    const presentUserIdsCount = presentUserIds.length;

    // Get the names of present user IDs
    const presentUserIdsNames = presentUserIds.map((userId) => userId.source);

    // Calculate the percentage of present user IDs
    const percentagePresent = (presentUserIdsCount / totalInstalledUserIds) * 100;

    // Display the information
    appendCheckerRow(
      chkr_badges.info,
      chkr_titles.userids,
      `
                • Installed / present: <code>${totalInstalledUserIds}/${presentUserIdsCount} (${percentagePresent.toFixed(2)}%)</code><br>
                • Uids: <code>${presentUserIdsNames.join(', ')}</code>
            `
    );
  } else {
    // Indicate that no user IDs are present
    appendCheckerRow(chkr_badges.info, chkr_titles.userids, 'No User IDs present.');
  }
}
