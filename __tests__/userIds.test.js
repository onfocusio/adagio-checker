jest.mock('../src/app.js', () => ({ appendCheckerRow: jest.fn() }));
jest.mock('../src/prebid/wrapper.js', () => ({ prebidWrapper: ['pbjs'], prebidObject: { getUserIdsAsEids: jest.fn() } }));

import { checkUserIds } from '../src/checks/userIds.js';
import { appendCheckerRow } from '../src/app.js';
import { prebidObject, prebidWrapper } from '../src/prebid/wrapper.js';

describe('checkUserIds', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('handles missing getUserIdsAsEids function', () => {
    const original = prebidObject.getUserIdsAsEids;
    prebidObject.getUserIdsAsEids = undefined;
    checkUserIds();
    expect(appendCheckerRow).toHaveBeenCalled();
    prebidObject.getUserIdsAsEids = original;
  });

  test('displays present user ids', () => {
    prebidObject.getUserIdsAsEids = jest.fn(() => [
      { source: 'a', uids: [{ id: '1' }] },
      { source: 'b', uids: [] }
    ]);
    checkUserIds();
    expect(appendCheckerRow).toHaveBeenCalled();
  });
});
