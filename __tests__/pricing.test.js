jest.mock('../src/app.js', () => ({ appendCheckerRow: jest.fn() }));
jest.mock('../src/prebid/wrapper.js', () => ({ prebidWrapper: ['pbjs'], prebidObject: { getConfig: jest.fn() } }));

import { checkCurrencyModule, checkFloorPriceModule } from '../src/checks/pricing.js';
import { appendCheckerRow } from '../src/app.js';
import { prebidObject } from '../src/prebid/wrapper.js';

describe('pricing checks', () => {
  beforeEach(() => jest.clearAllMocks());

  test('checkCurrencyModule displays config when present', () => {
    prebidObject.getConfig = jest.fn(() => ({ some: 'config' }));
    checkCurrencyModule();
    expect(appendCheckerRow).toHaveBeenCalled();
  });

  test('checkFloorPriceModule displays config when present', () => {
    prebidObject.getConfig = jest.fn(() => ({ floors: [] }));
    checkFloorPriceModule();
    expect(appendCheckerRow).toHaveBeenCalled();
  });
});
