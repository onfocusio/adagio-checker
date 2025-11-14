// Legacy: src/ui/tables.js
// This copy saved to src/_legacy during cleanup.

import { chkr_tabs } from '../enums.js';
import { overlayFrameDoc } from '../app.js';

/**
 * Module: ui/tables (legacy)
 *
 * Backup of the original `src/ui/tables.js` file saved to `src/_legacy`.
 */

export function appendCheckerRow(status, name, details) {
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const tableBody = overlayFrameDoc.getElementById(`${tabName}-tbody`);
    const newRow = overlayFrameDoc.createElement('tr');
    const statusCell = overlayFrameDoc.createElement('td');
    const nameCell = overlayFrameDoc.createElement('td');
    nameCell.style.whiteSpace = 'nowrap';
    const detailsCell = overlayFrameDoc.createElement('td');
    statusCell.innerHTML = status;
    nameCell.innerHTML = name;
    detailsCell.innerHTML = details;
    tableBody.appendChild(newRow);
    newRow.appendChild(statusCell);
    newRow.appendChild(nameCell);
    newRow.appendChild(detailsCell);
}

export function appendHomeContainer(htmlContent) {
    const tabName = chkr_tabs.checker.toLowerCase().replace(' ', '-');
    const alertTextDiv = overlayFrameDoc.getElementById(`${tabName}-alert`);
    alertTextDiv.innerHTML += `<small>• ${htmlContent}</small><br>`;
}

export default { appendCheckerRow, appendHomeContainer };