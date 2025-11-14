// Legacy: src/utils.js
// This copy saved to src/_legacy during cleanup.

import { chkr_badges } from '../enums.js';
import { appendHomeContainer } from '../app.js';

export let detectedCountryCodeIso3;

export async function fetchPublishersFromOrgIds(orgIds) {
    if (orgIds.length) {
        try {
            const response = await fetch('https://adagio.io/sellers.json');
            let adagioSellersJson = await response.json();
            const orgHtmlList = [];
            for (const orgId of orgIds) {
                const matched = adagioSellersJson?.sellers.filter((e) => e.seller_id === orgId);
                const org = matched && matched[0] ? matched[0] : { name: orgId, seller_id: orgId, seller_type: 'unknown' };
                orgHtmlList.push(`<code>${org.name} (${org.seller_id}) - ${org.seller_type}</code>`);
            }
            let strBuilder = `${orgHtmlList.length > 1 ? 'Organizations' : 'Organization'}: ${orgHtmlList.join(', ')}`;
            appendHomeContainer(strBuilder);
        } catch (error) {
            console.error('Error fetching Adagio sellers.json:', error);
        }
    }
}

export async function fetchCurrentLocationData() {
    detectedCountryCodeIso3 = null;
    await fetch('https://ipapi.co/json/')
        .then((response) => response.json())
        .then((data) => {
            const countryCode = data.country_code;
            const countryName = data.country_name;
            detectedCountryCodeIso3 = data.country_code_iso3;
            const countryEmoji = getFlagEmoji(countryCode);
            if (countryName !== 'France') {
                appendHomeContainer(`Current location detected: <code>${countryName}</code> (${countryEmoji})`);
            }
        })
        .catch((error) => console.error('Error fetching country data:', error));

    function getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }
}

export function computeAdUnitStatus(paramsCheckingArray) {
    if (paramsCheckingArray.includes(chkr_badges.ko)) return chkr_badges.ko;
    else if (paramsCheckingArray.includes(chkr_badges.check)) return chkr_badges.check;
    else if (paramsCheckingArray.includes(chkr_badges.update)) return chkr_badges.update;
    else return chkr_badges.ok;
}

export function loadDebuggingMode() {
    window.localStorage.setItem('ADAGIO_DEV_DEBUG', true);
    const url = window.location.href.indexOf('?pbjs_debug=true') ? window.location.href + '?pbjs_debug=true' : window.location.href;
    window.location.href = url;
}

export function getPrebidVersion(prebidObject) {
    return prebidObject.version.replace('v', '').split('-')[0].split('.').slice(0, 2).join('.');
}

export function computeBadgeToDisplay(prebidVersionDetected, isError, minVersion, maxVersion) {
    const min = minVersion === null ? -Infinity : minVersion;
    const max = maxVersion === null ? Infinity : maxVersion;

    if (isError === 'warn') {
        if (prebidVersionDetected >= min && prebidVersionDetected <= max) {
            return chkr_badges.check;
        }
        return chkr_badges.info;
    } else if (isError) {
        if (prebidVersionDetected >= min && prebidVersionDetected <= max) {
            return chkr_badges.ko;
        }
        return chkr_badges.info;
    } else {
        return chkr_badges.ok;
    }
}
