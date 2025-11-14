/**
 * Deprecated compatibility barrel `src/api.js`.
 *
 * This module has been moved to `src/api/index.js`. The original file
 * has been retained as a small compatibility layer but you should update
 * imports to use `src/api/index.js` directly. A legacy copy has been
 * saved to `src/_legacy/api.js`.
 *
 * @deprecated Use `src/api/index.js` instead.
 */
console.warn('Deprecated: import from "src/api/index.js" instead of "src/api.js". See src/_legacy for the original file.');
export { fetchApiInventoryRecords, runAdagioApiQuery } from './api/index.js';
