/**
 * Checks for DSA (Data Sharing Agreement) configuration inside Prebid's ortb2.
 *
 * Validates `regs.ext.dsa` presence and required fields and reports the
 * status via `appendCheckerRow`.
 *
 * @module checks/dsa
 */
import { chkr_badges, chkr_titles } from '../enums.js';
import { appendCheckerRow } from '../app.js';
import { prebidObject, prebidWrapper } from '../prebid/wrapper.js';

/**
 * Check DSA (Data Sharing Agreement) transparency configuration in Prebid's ortb2 config.
 *
 * Reads `prebidObject.getConfig('ortb2')` and inspects `regs.ext.dsa` fields.
 * Appends status rows using `appendCheckerRow` with appropriate badges.
 *
 * @returns {void}
 */
export function checkDsaTransparency() {
    const prebidOrtb2 = prebidObject.getConfig('ortb2');
    if (prebidOrtb2 !== undefined) {
        let dsa = prebidOrtb2?.regs?.ext?.dsa;
        let dsarequired = prebidOrtb2?.regs?.ext?.dsa?.dsarequired;
        let pubrender = prebidOrtb2?.regs?.ext?.dsa?.pubrender;
        let datatopub = prebidOrtb2?.regs?.ext?.dsa?.datatopub;
        let transparency = prebidOrtb2?.regs?.ext?.dsa?.transparency;

        if (dsa === undefined) appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
        else {
            if (dsarequired === undefined || pubrender === undefined || datatopub === undefined || transparency === undefined) appendCheckerRow(chkr_badges.ko, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
            else appendCheckerRow(chkr_badges.ok, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2').regs.ext.dsa</code>: <code>${JSON.stringify(dsa)}</code>`);
        }
    } else {
        appendCheckerRow(chkr_badges.info, chkr_titles.dsa, `<code>${prebidWrapper[0]}.getConfig('ortb2')</code>: <code>${JSON.stringify(prebidOrtb2)}</code>`);
    }
}
