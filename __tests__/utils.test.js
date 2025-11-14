import { computeAdUnitStatus, getPrebidVersion, computeBadgeToDisplay } from '../src/utils.js';
import { chkr_badges } from '../src/enums.js';

describe('utils', () => {
  test('getPrebidVersion extracts major.minor from version', () => {
    const prebid = { version: 'v1.2.3-beta' };
    expect(getPrebidVersion(prebid)).toBe('1.2');
  });

  test('computeAdUnitStatus prefers KO over others', () => {
    const arr = [chkr_badges.ok, chkr_badges.ko];
    expect(computeAdUnitStatus(arr)).toBe(chkr_badges.ko);
  });

  test('computeBadgeToDisplay returns correct badge for warn and range', () => {
    const res = computeBadgeToDisplay(9, 'warn', 8, null);
    expect(res).toBe(chkr_badges.check);
  });
});
