/**
 * Set the table styles. Stripe the rows, set alignment and set cell font.
 *
 * @param worksheet The worksheet containing the table.
 * @param startingRow The row index of the starting row of the table.
 * @param rowCount The number of rows in the table.
 * @param startingColumn The index of the column (e.g. A = 1, B = 2, etc.)
 * @param columnCount The number of columns
 */
export const setTotalRowStyles = function (worksheet, startingRow, rowCount, startingColumn, columnCount) {
   const totalRowIndex = startingRow + rowCount + 1;
   const totalRow = worksheet.getRow(totalRowIndex);

   if (startingColumn && columnCount) {
      for (let column = startingColumn; column < startingColumn + columnCount; column++) {
         const cell = totalRow.getCell(column);
         cell.alignment = {vertical: 'middle'};
         cell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
      }
   } else {
      totalRow.font = {name: 'Tahoma', size: 12, bold: true, color: {argb: '006b9241'}};
   }
};

/**
 * Set the column and row styles.
 *
 * @param worksheet The worksheet containing the table.
 * @param startingRow The row index of the starting row of the table.
 * @param rowCount The number of rows in the table.
 * @param startingColumn The index of the column (e.g. A = 1, B = 2, etc.)
 * @param columnCount The number of columns
 * @param style The style to set.
 */
export const setRowStyles = function (worksheet, startingRow, rowCount, startingColumn, columnCount, style) {
   if (startingColumn && columnCount) {
      for (let row = startingRow; row < startingRow + rowCount; row++) {
         const totalRow = worksheet.getRow(row);

         for (let column = startingColumn; column < startingColumn + columnCount; column++) {
            const cell = totalRow.getCell(column);
            for (const styleKey in style) {
               if (style.hasOwnProperty(styleKey)) {
                  cell[styleKey] = {...cell[styleKey], ...style[styleKey]};
               }
            }
         }
      }
   }
};

// A - 1, so that column 1 is A, column 2 is B, etc.
const ASCII_START = 64;

export function getCellLocation(column, row) {
   if (column > 26) {
      const col1 = Math.floor(column / 26);
      const col = column % 26;
      return `${String.fromCharCode(ASCII_START + col1)}${String.fromCharCode(ASCII_START + col)}${row}`;
   }
   return `${String.fromCharCode(ASCII_START + column)}${row}`;
}
