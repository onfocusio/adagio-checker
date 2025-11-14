/**
 * Deprecated stub for `src/ui/tables.js`.
 *
 * The original implementation was removed and a backup was saved to
 * `src/_legacy/tables.js`. Keep this module as a compatibility bridge
 * which re-exports the functions from the new UI barrel.
 *
 * @deprecated Use `src/ui/index.js` exports instead.
 */
console.warn('Deprecated: src/ui/tables.js has been removed. Use `src/ui/index.js` instead.');

import * as ui from './index.js';

export const appendCheckerRow = ui.appendCheckerRow;
export const appendHomeContainer = ui.appendHomeContainer;

export default { appendCheckerRow, appendHomeContainer };
