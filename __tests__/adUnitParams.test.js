jest.mock('../src/app.js', () => ({ appendCheckerRow: jest.fn(), appendAdUnitsRow: jest.fn(() => ["ok"]) }));
jest.mock('../src/utils.js', () => ({ computeAdUnitStatus: jest.fn(() => 'ok') }));

import { checkAdagioAdUnitParams } from '../src/checks/adUnitParams.js';
import { appendCheckerRow, appendAdUnitsRow } from '../src/app.js';

describe('ad unit params check', () => {
  beforeEach(() => jest.clearAllMocks());

  test('appends adunits info when none detected', () => {
    const prebidBidRequested = [];
    const prebidAdagioBidRequested = [];
    const apiRecordsItems = [];
    checkAdagioAdUnitParams(prebidBidRequested, prebidAdagioBidRequested, apiRecordsItems);
    expect(appendCheckerRow).toHaveBeenCalled();
  });
});
