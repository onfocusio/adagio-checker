/**
 * Checks and validation helpers for ad unit parameters and mediaTypes.
 *
 * This module analyzes bid objects to ensure Adagio-specific parameters
 * (organizationId, site, placement, divId, mediaTypes, GDPR consent, etc.)
 * are present and correctly formatted. Results are appended to a
 * `paramsCheckingArray` which is later rendered by the UI.
 *
 * @module checks/adUnits
 */
import { chkr_badges } from '../enums.js';
import { prebidVersionDetected } from '../prebid/wrapper.js';
import { detectedCountryCodeIso3 } from '../utils.js';
import { TCString } from '@iabtcf/core';

/**
 * Recursively search an object for the first occurrence of a property name.
 *
 * This performs a depth-first traversal and returns the path and value
 * for the first matching property name.
 *
 * @param {object} obj - Object to search.
 * @param {string} param - Property name to find.
 * @param {Array<string>} [path=[]] - Internal recursion path (do not set).
 * @returns {{path: string, value: any}|null} An object with `path` and
 *  `value` when found, otherwise `null`.
 */
export function findParam(obj, param, path = []) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const currentPath = [...path, key];
            if (key === param) {
                return { path: currentPath.join('.'), value: obj[key] };
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                const result = findParam(obj[key], param, currentPath);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}

/**
 * Analyze a bid's parameters and push human-friendly check rows into the
 * provided `paramsCheckingArray`.
 *
 * The function inspects Adagio-specific parameters (organizationId, site,
 * placement/divId, mediaTypes, GDPR fields, video settings, etc.) and
 * appends tuples describing badge status, the inspected field, and a
 * human-readable message.
 *
 * @param {object} bid - The bid object to analyze (from Prebid).
 * @param {Array<Array<any>>} paramsCheckingArray - Mutable array where
 *  check rows will be appended; each row is expected to be
 *  [badge, descriptionHtml, details].
 * @param {Map|Set|object} apiRecordsItems - Collection of API inventory
 *  records; used to validate `params.site`. The collection must expose
 *  `.size` if applicable.
 * @returns {void}
 */
export function buildParamsCheckingArray(bid, paramsCheckingArray, apiRecordsItems) {
    // Check the adagio bidder params (orgId and site in params)
    let paramOrganizationId = bid?.params?.organizationId;
    if (paramOrganizationId !== undefined) paramOrganizationId = paramOrganizationId.toString();
    let paramSite = bid?.params?.site;

    // Since Prebid 9, placement and divId should be in ortb2Imp
    let paramPlacement = bid?.params?.placement;
    let paramAdUnitElementId = bid?.params?.adUnitElementId;
    let ortb2ImpPlacement = bid?.ortb2Imp?.ext?.data?.placement;
    let ortb2ImpDivId = bid?.ortb2Imp?.ext?.data?.divId;

    // Check if there's a regs.ext.gdpr param (= 1) and a user.ext.consent param (consent string)
    let ortbGdpr = bid?.ortb2?.regs?.ext?.gdpr;
    let ortbConsent = bid?.ortb2?.user?.ext?.consent;

    // Since Prebid 9.39, Adagio supports interstitial and rewarded
    let ortb2ImpInterstitial = bid?.ortb2Imp?.instl;
    let ortb2ImpRewarded = bid?.ortb2Imp?.rwdd;
    let deepOrtb2ImpInterstitial = findParam(bid, 'instl') || null;
    let deepOrtb2ImpRewarded = findParam(bid, 'rwdd') || null;

    // Check the organizationId
    if (paramOrganizationId === undefined) paramsCheckingArray.push([chkr_badges.ko, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, `Parameter not detected.`]);
    else {
        if (typeof paramOrganizationId === 'string' && !/^\d{4}$/.test(paramOrganizationId)) {
            paramsCheckingArray.push([chkr_badges.check, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, `Should be a 4-digit integer or string (e.g., 1000 or '1000').`]);
        } else {
            paramsCheckingArray.push([chkr_badges.ok, `<code>params.organizationId</code>: <code>${paramOrganizationId}</code>`, ``]);
        }
    }

    // Check the site name
    if (paramSite === undefined) paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, 'Parameter not detected.']);
    else {
        if (paramSite.trim() !== paramSite) paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, `Space character detected.`]);
        else if (apiRecordsItems.size) paramsCheckingArray.push([chkr_badges.ok, `<code>params.site</code>: <code>${paramSite}</code>`, ``]);
        else paramsCheckingArray.push([chkr_badges.ko, `<code>params.site</code>: <code>${paramSite}</code>`, `No manager inventory matched.`]);
    }

    // AdUnitElementId (1/3): Depending on the Prebid version, we don't expect the same param
    let divIdStatus = '';
    let divIdSetup = '';
    let divIdRes = '';
    let divIdDetails = '';
    // AdUnitElementId (2/3): First checks if a value is detected
    if (prebidVersionDetected >= 9) {
        if (ortb2ImpDivId !== undefined) {
            divIdStatus = chkr_badges.ok;
            divIdSetup = 'ortb2Imp.ext.data.divId';
            divIdRes = ortb2ImpDivId;
            divIdDetails = '';
        } else if (paramAdUnitElementId !== undefined) {
            divIdStatus = chkr_badges.info; // STATUSBADGES.UPDATE;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = paramAdUnitElementId;
            divIdDetails = 'Recommendation: Setup the new divId param in ortb2Imp.';
        } else {
            divIdStatus = chkr_badges.check;
            divIdSetup = 'ortb2Imp.ext.data.divId';
            divIdRes = undefined;
            divIdDetails = '';
        }
    } else {
        if (paramAdUnitElementId !== undefined) {
            divIdStatus = chkr_badges.ok;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = paramAdUnitElementId;
            divIdDetails = '';
        } else {
            divIdStatus = chkr_badges.check;
            divIdSetup = 'params.adUnitElementId';
            divIdRes = undefined;
            divIdDetails = '';
        }
    }
    // AdUnitElementId (3/3): Then ensure the value is correct
    if (divIdRes === undefined) paramsCheckingArray.push([divIdStatus, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Not defined in the adUnit configuration.`]);
    else {
        const htlmDiv = document.getElementById(divIdRes);
        if (divIdRes.trim() !== divIdRes) paramsCheckingArray.push([chkr_badges.check, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Space character detected.`]);
        else if (htlmDiv === null) paramsCheckingArray.push([chkr_badges.check, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, `Div id not detected in the page.`]);
        else paramsCheckingArray.push([divIdStatus, `<code>${divIdSetup}</code>: <code>${divIdRes}</code>`, divIdDetails]);
    }

    // Placement (1/3): Depending on the Prebid version, we don't expect the same param
    let placementStatus = '';
    let placementSetup = '';
    let placementRes = '';
    let placementDetails = '';
    // Placement (2/3): First checks if a value is detected - preference for params.placement
    if (paramPlacement !== undefined) {
        placementStatus = chkr_badges.ok;
        placementSetup = 'params.placement';
        placementRes = paramPlacement;
        placementDetails = '';
    } else if (ortb2ImpPlacement !== undefined && prebidVersionDetected >= 9) {
        placementStatus = chkr_badges.info;
        placementSetup = 'ortb2Imp.ext.data.placement';
        placementRes = ortb2ImpPlacement;
        placementDetails = 'Recommendation: Setup placement in <code>bids.params.placement</code> instead.</code>.';
    } else if (ortb2ImpPlacement !== undefined && prebidVersionDetected < 9) {
        placementStatus = chkr_badges.ko;
        placementSetup = 'ortb2Imp.ext.data.placement';
        placementRes = ortb2ImpPlacement;
        placementDetails = '<code>ortb2Imp</code> is not supported before Prebid 9. Recommendation: Setup placement in <code>bids.params.placement</code>.';
    } else {
        placementStatus = chkr_badges.ko;
        placementSetup = 'params.placement';
        placementRes = undefined;
        placementDetails = 'Not found: Setup <code>bids.params.placement</code>.';
    }
    // Placement (3/3): Then ensure the value is correct
    if (placementStatus === chkr_badges.ko) paramsCheckingArray.push([placementStatus, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, placementDetails]);
    else if (placementRes.trim() !== placementRes) paramsCheckingArray.push([chkr_badges.check, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, `Space character detected.`]);
    else if (/mobile/i.test(placementRes) || /desktop/i.test(placementRes) || /tablet/i.test(placementRes)) paramsCheckingArray.push([chkr_badges.check, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, `Recommendation: Do not not include reference to an environment or size.`]);
    else paramsCheckingArray.push([placementStatus, `<code>${placementSetup}</code>: <code>${placementRes}</code>`, placementDetails]);

    // Check the mediatypes parameters
    let mediatypeBanner = bid.mediaTypes?.banner;
    let mediatypeVideo = bid.mediaTypes?.video;
    let mediatypeNative = bid.mediaTypes?.native;

    if (mediatypeBanner === undefined && mediatypeVideo === undefined && mediatypeNative === undefined) paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes</code>: <code>${JSON.stringify(bid.mediaTypes)}</code>`, `No mediatype detected.`]);
    else {
        if (mediatypeBanner !== undefined) {
            let mediatypeBannerSizes = mediatypeBanner?.sizes;

            // Check the banner sizes
            if (mediatypeBannerSizes !== undefined) {
                let supportedSizes = [
                    [120, 600],
                    [160, 600],
                    [250, 250],
                    [300, 50],
                    [300, 100],
                    [300, 250],
                    [300, 300],
                    [300, 600],
                    [320, 50],
                    [320, 100],
                    [320, 160],
                    [320, 320],
                    [320, 480],
                    [336, 280],
                    [728, 90],
                    [800, 250],
                    [930, 180],
                    [970, 90],
                    [970, 250],
                    [1800, 1000],
                ];
                let commonArrays = [];
                supportedSizes.forEach((ss) => {
                    mediatypeBannerSizes.forEach((mbs) => {
                        if (JSON.stringify(ss) === JSON.stringify(mbs)) commonArrays.push(ss);
                    });
                });
                if (commonArrays.length) paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(commonArrays)}</code>`, ``]);
                else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`, `No supported size detected.`]);
            } else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.banner.sizes</code>: <code>${JSON.stringify(mediatypeBannerSizes)}</code>`, `No parameter detected.`]);
        }

        if (mediatypeVideo !== undefined) {
            // Required for both instream and outstream
            let mediatypeVideoContext = mediatypeVideo?.context;
            let mediatypeVideoApi = mediatypeVideo?.api;
            let mediatypeVideoPlayerSize = mediatypeVideo?.playerSize;
            // Required for instream only
            let mediatypeVideoMimes = mediatypeVideo?.mimes;
            let mediatypeVideoPlcmt = mediatypeVideo?.plcmt || mediatypeVideo?.placement; // placement is deprecated, plcmt is the new one
            // Highly recommended for instream and outstream
            let mediatypeVideoPlaybackMethod = mediatypeVideo?.playbackmethod;
            // Highly recommended for instream only
            let mediatypeVideoStartDelay = mediatypeVideo?.startdelay;
            let mediatypeVideoStartProtocols = mediatypeVideo?.protocols;

            // For checking purpose
            let hasOutstreamContext = mediatypeVideoContext === 'outstream';
            let hasInstreamContext = mediatypeVideoContext === 'instream';
            let videoApiSupported = [1, 2, 3, 4, 5];
            let mimesExpected = ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'];
            let expectedInstreamPlcmt = 1;
            let protocolsExpected = [3, 6, 7, 8];

            // Check the video context: instream or outstream
                    if (hasOutstreamContext || hasInstreamContext) {
                paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`, ``]);
            } else {
                paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.context</code>: <code>${mediatypeVideoContext}</code>`, `No supported context detected.`]);
                // If no context detected, we should not check params furthermore
                return;
            }

            // Check the video api: [1, 2, 3, 4, 5]
            if (mediatypeVideoApi !== undefined) {
                if (hasOutstreamContext && !mediatypeVideoApi.includes(2)) paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`, `Must support api <code>2</code>'`]);
                else if (!videoApiSupported.some((i) => mediatypeVideoApi.includes(i)) && hasInstreamContext) paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`, `Must support at least one of <code>${JSON.stringify(videoApiSupported)}</code>`]);
                else paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.api</code>: <code>${JSON.stringify(mediatypeVideoApi)}</code>`, ``]);
            } else paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.api</code>: <code>${mediatypeVideoApi}</code>`, `No video api detected.`]);

            // Check the player size
            if (mediatypeVideoPlayerSize && Array.isArray(mediatypeVideoPlayerSize) && mediatypeVideoPlayerSize.every((subArr) => Array.isArray(subArr) && subArr.length === 2 && subArr.every(Number.isInteger))) {
                paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`, ``]);
            } else {
                paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.playerSize</code>: <code>${JSON.stringify(mediatypeVideoPlayerSize)}</code>`, `Wrong format or not size detected.`]);
            }

            // Check the video mimes: ['video/mp4', 'video/ogg', 'video/webm', 'application/javascript'] (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoMimes === undefined) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`, `No mimes detected.`]);
                } else if (!mimesExpected.every((i) => mediatypeVideoMimes.includes(i))) {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`, `Missing mimes: <code>${JSON.stringify(mimesExpected.filter((i) => !mediatypeVideoMimes.includes(i)))}</code>`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.mimes</code>: <code>${JSON.stringify(mediatypeVideoMimes)}</code>`, ``]);
                }
            }

            // Check the placement
            if (hasInstreamContext) {
                    if (mediatypeVideoPlcmt === undefined || expectedInstreamPlcmt !== mediatypeVideoPlcmt) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, `Must be <code>${JSON.stringify(expectedInstreamPlcmt)}</code> for instream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, ``]);
                }
            } else if (hasOutstreamContext) {
                if (mediatypeVideoPlcmt === undefined || mediatypeVideoPlcmt === expectedInstreamPlcmt) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, `Must be set for outstream context (<a href="https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md#list--plcmt-subtypes---video-" target="_blank">iab</a>).`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.plcmt</code>: <code>${mediatypeVideoPlcmt}</code>`, ``]);
                }
            }

            // Check the video playbackmethod
            if (mediatypeVideoPlaybackMethod !== undefined) {
                const expectedMethod = hasInstreamContext ? 2 : hasOutstreamContext ? 6 : null;

                if (expectedMethod && !mediatypeVideoPlaybackMethod.includes(expectedMethod)) {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`, `Recommended playback method is: [${expectedMethod}].`]);
                } else if (!expectedMethod) {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`, `No playback method detected or context not available.`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`, ``]);
                }
            } else {
                paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.playbackmethod</code>: <code>${JSON.stringify(mediatypeVideoPlaybackMethod)}</code>`, `No playback method detected.`]);
            }

            // Check the startdelay (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartDelay !== undefined) {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`, ``]);
                } else {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.startdelay</code>: <code>${mediatypeVideoStartDelay}</code>`, `No start delay detected.`]);
                }
            }

            // Check the protocols (for instream only)
            if (hasInstreamContext) {
                if (mediatypeVideoStartProtocols !== undefined) {
                    if (protocolsExpected.every((i) => mediatypeVideoStartProtocols.includes(i))) {
                        paramsCheckingArray.push([chkr_badges.ok, `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`, ``]);
                    } else {
                        paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`, `Missing protocols: <code>${JSON.stringify(protocolsExpected.filter((i) => !mediatypeVideoStartProtocols.includes(i)))}</code>`]);
                    }
                } else {
                    paramsCheckingArray.push([chkr_badges.check, `<code>mediaTypes.video.protocols</code>: <code>${mediatypeVideoStartProtocols}</code>`, `No protocol detected.`]);
                }
            }
        }

        // GDPR - Should be in ortb2.regs.ext.gdpr and user.ext.consent
        if (detectedCountryCodeIso3 === null) {
            console.error('No country code detected, cannot check GDPR params.');
        } else {
            // List of EEA countries (ISO 3166-1 alpha-3)
            const EEACountries = ['ALA', 'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'GUF', 'DEU', 'GIB', 'GRC', 'GLP', 'GGY', 'HUN', 'ISL', 'IRL', 'IMN', 'ITA', 'JEY', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MTQ', 'MYT', 'NLD', 'NOR', 'POL', 'PRT', 'REU', 'ROU', 'BLM', 'MAF', 'SPM', 'SVK', 'SVN', 'ESP', 'SWE', 'GBR'];

            // Check if the user is in the EEA, only then check the GDPR params
            if (EEACountries.includes(detectedCountryCodeIso3)) {
                // User is in the EEA
                if (ortbGdpr !== 1) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`, `Should be set to <code>1</code> for users in the EEA.`]);
                } else {
                    paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2.regs.ext.gdpr</code>: <code>${ortbGdpr}</code>`, ``]);
                }

                // Check the consent string
                let decodedConsent = ortbConsent !== undefined ? TCString.decode(ortbConsent) : null;
                if (decodedConsent === null) {
                    paramsCheckingArray.push([chkr_badges.ko, `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent}</code>`, `No consent string detected, should be a valid TCFv2 string for users in the EEA.`]);
                } else {
                    const cmpAdagioBidders = {
                        58: '33Across',
                        779: 'Adtarget Teknoloji A.S.',
                        138: 'ConnectAd Demand GmbH',
                        90: 'E-Planning (Teroa)',
                        285: 'Freewheel (Comcast)',
                        149: 'Illumin / ADman Interactive SLU',
                        253: 'Improve Digital',
                        36: 'Nexxen (Unruly)',
                        617: 'Onfocus (Adagio)',
                        241: 'OneTag',
                        69: 'OpenX',
                        76: 'Pubmatic',
                        16: 'RTB House',
                        52: 'Rubicon',
                        45: 'Smart Adserver (Equativ)',
                        13: 'Sovrn',
                        28: 'TripleLift',
                    };
                    const missingBidders = [];
                    let adagioMissing = false;
                    for (const key in cmpAdagioBidders) {
                        if (!decodedConsent.vendorConsents.has(Number(key))) {
                            missingBidders.push(`${cmpAdagioBidders[key]} (${key})`);
                            if (Number(key) === 617) {
                                adagioMissing = true;
                            }
                        }
                    }
                    if (adagioMissing) {
                        paramsCheckingArray.push([chkr_badges.ko, `<code>ortb2.user.ext.consent</code>`, `Missing consent for: ${missingBidders.join(', ')}`]);
                    } else if (missingBidders.length) {
                        paramsCheckingArray.push([chkr_badges.check, `<code>ortb2.user.ext.consent</code>`, `Missing consent for: ${missingBidders.join(', ')}`]);
                    } else {
                        paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2.user.ext.consent</code>: <code>${ortbConsent.substring(0, 20)}...</code>`, `All Adagio partners present`]);
                    }
                }
            }
        }

        // Interstitial - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpInterstitial !== undefined) {
            if (prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([chkr_badges.info, `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`, 'Not supported before Prebid 9.39.']);
            } else {
                paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2Imp.instl</code>: <code>${ortb2ImpInterstitial}</code>`, '']);
            }
        } else if (deepOrtb2ImpInterstitial !== null) {
            paramsCheckingArray.push([prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info, `<code>${deepOrtb2ImpInterstitial.path}</code>: <code>${deepOrtb2ImpInterstitial.value}</code>`, 'Misplaced, should be in <code>ortb2Imp.instl']);
        } else {
            paramsCheckingArray.push([prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info, `<code>ortb2Imp.instl</code>: <code>undefined</code>`, 'No interstitial parameter detected.']);
        }

        // Rewarded - Supported since Prebid 9.39, should be in ortb2Imp.
        if (ortb2ImpRewarded !== undefined) {
            if (prebidVersionDetected < 9.39) {
                paramsCheckingArray.push([chkr_badges.info, `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`, 'Not supported before Prebid 9.39.']);
            } else {
                paramsCheckingArray.push([chkr_badges.ok, `<code>ortb2Imp.rwdd</code>: <code>${ortb2ImpRewarded}</code>`, '']);
            }
        } else if (deepOrtb2ImpRewarded !== null) {
            paramsCheckingArray.push([prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info, `<code>${deepOrtb2ImpRewarded.path}</code>: <code>${deepOrtb2ImpRewarded.value}</code>`, 'Misplaced, should be in <code>ortb2Imp.rwdd</code>']);
        } else {
            paramsCheckingArray.push([prebidVersionDetected < 9.39 ? chkr_badges.info : chkr_badges.info, `<code>ortb2Imp.rwdd</code>: <code>undefined</code>`, 'No rewarded parameter detected.']);
        }

        if (mediatypeNative !== undefined) {
            // TODO
        }
    }
}
