import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';

/**
 * Module: checks/duplication
 *
 * Detect duplicated ad requests (same adUnit + mediatype) in collected
 * Prebid events and report a KO status if any duplication is found.
 *
 * @module checks/duplication
 */

/**
 * Check for ad call duplication inside Prebid events and append a status row.
 *
 * @param {Array<Object>} prebidEvents Array of Prebid event objects.
 * @returns {void}
 */
export function checkAdCallsDuplication(prebidEvents) {
    // An adrequest with the same adUnitCode present multiple times with the same mediatype is considered as duplication
    const duplicates = [];

    // Build a map of adUnitCode::mediatype => count
    const map = new Map();
    prebidEvents.forEach((event) => {
        const adUnitCode = event.adUnitCode;
        const mediaTypes = event.mediaTypes || {};
        // For each media type present, increment a key
        Object.keys(mediaTypes).forEach((mt) => {
            const key = `${adUnitCode}::${mt}`;
            map.set(key, (map.get(key) || 0) + 1);
        });
    });

    // Collect duplicates
    map.forEach((count, key) => {
        if (count > 1) duplicates.push(key);
    });

    if (duplicates.length) {
        // Format output: code (mediatype)
        const formatted = duplicates
            .map((str) => {
                const [code, type] = str.split('::');
                return `<code>${code}</code> (<code>${type}</code>)`;
            })
            .join(', ');
        appendCheckerRow(chkr_badges.ko, chkr_titles.duplicated, `Duplication detected: ${formatted}.`);
    } else {
        appendCheckerRow(chkr_badges.ok, chkr_titles.duplicated, `No duplication detected.`);
    }
}
