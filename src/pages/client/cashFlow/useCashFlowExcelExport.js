import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import {difference} from 'lodash';
import {pick} from 'lodash';
import get from 'lodash/get';
import map from 'lodash/map';
import values from 'lodash/values';
import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {MONTHS_CONVERT} from '../../../Constants';
import {MONTHS} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import {createTableLx} from '../../../fhg/utils/DataUtil';
import {setRowStyles} from '../../../fhg/utils/excelUtils';
import {getCellLocation} from '../../../fhg/utils/excelUtils';
import {setTotalRowStyles} from '../../../fhg/utils/excelUtils';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';

/**
 * The hook to export the balance sheetassetsCurrent to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useCashFlowExcelExport(titleDocument, titleWorksheet) {
   /**
    * Set the columns and the data for the table.
    * @param name The name of the table.
    * @param monthOrder The months in order based on fiscal year.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name:
    *    string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string,
    *    style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, null], assetList}}
    */
   let setupTableData = function (name, monthOrder) {
      const columns = [
         {
            name,
            accessor: 'typeName',
            totalsRowLabel: `Total ${name}`,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
      ];

      let index = 0;
      for (const month of monthOrder) {
         columns.push(
            {
               name: 'Projected' + index++,
               getAccessor: `${month}.expected`,
               noteAccessor: `${month}.noteExpected`,
               accessor: `${month}Expected`,
               totalsRowFunction: 'sum',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            },
            {
               name: 'Actual' + index++,
               getAccessor: `${month}.actual`,
               noteAccessor: `${month}.noteActual`,
               accessor: `${month}Actual`,
               totalsRowFunction: 'sum',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            }
         );
      }

      return columns;
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      worksheet.getColumn(1).width = 2; // Margin
      worksheet.getColumn(2).width = 25; // typeName
      worksheet.getColumn(29).width = 2; // Margin

      for (let i = 3; i < 29; i++) {
         const column = worksheet.getColumn(i);
         column.numFmt = CURRENCY_FULL_EXCEL; // Amount
         column.width = 19; // Amount
      }
   };

   const addMonthHeaderRow = function (worksheet, tableStartingRow, startingColumn, monthOrder) {
      const rowIndex = tableStartingRow;
      const row = worksheet.getRow(rowIndex);
      let column = startingColumn;

      let titleCell = row.getCell(column++);
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14, bold: true};
      titleCell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
      titleCell.border = {
         left: {style: 'thin', color: {argb: '00000000'}},
         top: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      for (const monthItem of monthOrder) {
         const month = MONTHS_CONVERT[monthItem];
         let titleCell = row.getCell(column);
         //row, column, row, column
         worksheet.mergeCells(rowIndex, column, rowIndex, column + 1);
         titleCell.value = month;
         titleCell.font = {name: 'Tahoma', size: 14, bold: true};
         titleCell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
         titleCell.alignment = {vertical: 'middle', horizontal: 'center'};
         titleCell.border = {
            top: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}},
         };
         column += 2;
      }
   };

   const addHeaderRow = function (name, worksheet, tableStartingRow, startingColumn) {
      const row = worksheet.getRow(tableStartingRow);
      let column = startingColumn;

      let titleCell = row.getCell(column++);
      titleCell.font = {name: 'Tahoma', size: 12, color: {argb: '00707070'}, bold: true};
      titleCell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
      titleCell.border = {
         left: {style: 'thin', color: {argb: '00000000'}},
         top: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };
      titleCell.value = name;

      for (let i = 0; i < MONTHS.length; i++) {
         let cell = row.getCell(column++);

         cell.value = 'Projected';
         cell.font = {name: 'Tahoma', size: 12, color: {argb: '00707070'}, bold: true};
         cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
         cell.border = {
            top: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}},
         };

         cell = row.getCell(column++);
         cell.value = 'Actual';
         cell.font = {name: 'Tahoma', size: 12, color: {argb: '00707070'}};
         cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
         cell.border = {
            top: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'medium', color: {argb: '00000000'}},
         };
      }
   };

   const addNetRow = function (worksheet, startColumn, totalRow, incomeTotalRow, expenseTotalRow) {
      const row = worksheet.getRow(totalRow);

      let cell = row.getCell(startColumn - 1);
      cell.value = 'Net Cash Flow';
      cell.alignment = {vertical: 'middle'};
      cell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
      cell.border = {
         left: {style: 'thin', color: {argb: '00000000'}},
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      row.getCell(startColumn).value = {
         formula: `${getCellLocation(startColumn, incomeTotalRow)}-${getCellLocation(startColumn, expenseTotalRow)}`,
      };
      row.getCell(startColumn).alignment = {vertical: 'middle'};
      row.getCell(startColumn).font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
      row.getCell(startColumn).border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      const formulaCellLocation = getCellLocation(startColumn, totalRow);

      for (let i = startColumn + 1; i < 29; i++) {
         const cell = row.getCell(i);
         cell.value = {sharedFormula: formulaCellLocation};
         cell.value = {sharedFormula: formulaCellLocation};
         cell.alignment = {vertical: 'middle'};
         cell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
         cell.border = {
            left: {style: 'thin', color: {argb: '00000000'}},
            bottom: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}},
         };
      }
   };

   const addRowFormula = function (worksheet, title, startColumn, totalRow, endColumn = 29, formula, columnOffset) {
      const row = worksheet.getRow(totalRow);

      let columnIndex = startColumn;
      if (title) {
         let cell = row.getCell(columnIndex++);
         cell.value = title;
         cell.alignment = {vertical: 'middle'};
         cell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
         cell.border = {
            left: {style: 'thin', color: {argb: '00000000'}},
            bottom: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}},
         };
      }

      const cell2 = row.getCell(columnIndex);
      cell2.value = {formula};
      cell2.alignment = {vertical: 'middle'};
      cell2.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
      cell2.border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      const formulaCellLocation = getCellLocation(columnIndex, totalRow);

      copyRowFormula(row, formulaCellLocation, columnIndex + columnOffset, endColumn, columnOffset);
   };

   const copyRowFormula = function (row, formulaLocation, startColumn, endColumn = 29, columnOffset = 1) {
      for (let i = startColumn; i < endColumn; i += columnOffset) {
         const cell = row.getCell(i);
         cell.value = {sharedFormula: formulaLocation};
         cell.value = {sharedFormula: formulaLocation};
         cell.alignment = {vertical: 'middle'};
         cell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 12};
         cell.border = {
            left: {style: 'thin', color: {argb: '00000000'}},
            bottom: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}},
         };
      }
   };

   const setThickBorder = (worksheet, startingRow, rowCount, startingColumn) => {
      for (let column = startingColumn; column < startingColumn + 28; column += 2) {
         setRowStyles(worksheet, startingRow, 1, column, 1, {
            border: {
               top: {style: 'thin', color: {argb: '00000000'}},
               left: {style: 'thin', color: {argb: '00000000'}},
               right: {style: 'medium', color: {argb: 'FF505050'}},
            },
         });
         setRowStyles(worksheet, startingRow + 1, 1, column, 1, {
            border: {
               top: {style: 'thin', color: {argb: '00000000'}},
               left: {style: 'thin', color: {argb: '00000000'}},
               right: {style: 'medium', color: {argb: 'FF505050'}},
            },
         });

         setRowStyles(worksheet, startingRow + 2, rowCount - 1, column, 1, {
            border: {right: {style: 'medium', color: {argb: 'FF505050'}}},
         });
      }
   };

   let addColumnStripes = function (worksheet, tableStartingRow, rowCount = 0) {
      for (let column = 4; column < 29; column += 2) {
         setRowStyles(worksheet, tableStartingRow + 3, rowCount, column, 1, {
            font: {name: 'Tahoma', bold: true, size: 12},
         });
      }
   };

   const createNoteTableLx = ({
      worksheet,
      columns,
      data,
      style,
      properties,
      tableRow,
      columnIndex,
      rowIndex,
      headerRow,
      ...tableProps
   }) => {
      let useRowIndex = tableRow;

      let rows = map(data, (item) => {
         let noteFound = false;
         let modifiedItem = {};
         let useColumnIndex = columnIndex;

         for (const column of columns) {
            if (column.noteAccessor) {
               const value = get(item, column.noteAccessor);
               noteFound = noteFound || !!value;
               modifiedItem[column.noteAccessor] = noteFound
                  ? {
                       formula: `HYPERLINK("#${titleWorksheet}!${getCellLocation(
                          useColumnIndex,
                          useRowIndex
                       )}","${value}")`,
                       result: value,
                    }
                  : '';
            } else {
               const useAccessor = column.getAccessor || column.accessor;
               const value = get(item, useAccessor);
               modifiedItem[useAccessor] = value === undefined || value === null ? '' : value;
            }
            useColumnIndex++;
         }
         useRowIndex++;
         return noteFound ? values(modifiedItem) : null;
      });
      let notesArray = difference(rows, [null]);
      let useColumns = map(columns, (column) => pick(column, ['name']));
      useColumns = map(useColumns, (column) => ({name: column.name + '-note'}));
      const ref = getCellLocation(columnIndex, rowIndex);
      useColumns[0].name = 'Notes';

      if (notesArray?.length > 0) {
         worksheet.addTable({
            ...tableProps,
            totalsRow: false,
            // headerRow,       // HeaderRow false causes errors in Excel.
            ref,
            style: {
               theme: 'TableStyleLight15',
               showRowStripes: true,
               // ...style,
            },
            columns: useColumns,
            rows: notesArray,
         });
         if (headerRow === false) {
            worksheet.getRow(rowIndex).hidden = true;
         }
      }

      return notesArray.length;
   };

   // let rowIndex = row;
   //
   // for (const item of data) {
   //    debugger;
   // }
   // const cellLocation = getCellLocation(column, row);
   // worksheet.getCell(cellLocation);
   // debugger;
   // let rows = map(data, item => {
   //    if (data?.noteActual || data?.noteExpected) {
   //
   //    }
   //    let modifiedItem = {};
   //    for (const column of columns) {
   //       const value = get(item, column.getAccessor || column.accessor);
   //       modifiedItem[column.accessor] = value === undefined || value=== null? '' : value;
   //    }
   //    return values(modifiedItem);
   // });
   // }

   return async (
      cashFlowData = {},
      reportDate,
      entityNames = '',
      actualOperatingLoanBalance = 0,
      operatingLoanLimit = 0,
      yearToDateActualLOCBalance,
      yearToDateProjectedLOCBalance,
      targetIncome,
      carryoverIncome
   ) => {
      let tableStartingRow = 12;
      let tableStartingRow2 = tableStartingRow + (cashFlowData?.cashFlow?.income?.length || 0) + 5;
      const lastRow = tableStartingRow2 + (cashFlowData?.cashFlow?.expenses?.length || 0) + 3;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
            horizontalCentered: true,
            margins: {
               left: 0.15,
               right: 0.1,
               top: 0.75,
               bottom: 0.75,
               header: 0.3,
               footer: 0.3,
            },
         },
      });
      //Add the table header and footer rows.
      worksheet.pageSetup.printArea = `A1:AE${lastRow}`;
      worksheet.properties.defaultColWidth = 22;
      worksheet.properties.defaultRowHeight = 20;

      // Add conditional formatting to make

      // Add the title at top left.
      worksheet.mergeCells('B2:C3');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Cash Flow';
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 20, bold: true};
      titleCell.alignment = {vertical: 'middle', horizontal: 'left'};

      // Add the logo in the upper right
      worksheet.getCell('E2').alignment = {vertical: 'top', horizontal: 'right'};
      const myBase64Image = await getBase64FromUrl(METRICS_LOGO);
      const imageId2 = workbook.addImage({
         base64: myBase64Image,
         extension: 'png',
      });
      worksheet.addImage(imageId2, {
         tl: {col: 6, row: 1},
         ext: {width: 400, height: 70},
      });
      // Add the entity name and date
      titleCell = worksheet.getCell('B5');
      titleCell.value = entityNames || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B6');
      titleCell.value = reportDate?.toString();
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      titleCell = worksheet.getCell('B8');
      worksheet.mergeCells('B8:C8');
      titleCell.value = `Actual YTD Cashflow`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('D8');
      worksheet.mergeCells('D8:E8');
      titleCell.value = cashFlowData?.cashFlow?.actualYTDCashFlow || 0;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B9');
      worksheet.mergeCells('B9:C9');
      titleCell.value = `Projected YTD Cashflow`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('D9');
      worksheet.mergeCells('D9:E9');
      titleCell.value = cashFlowData?.cashFlow?.expectedYTDCashFlow || 0;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('G8');
      worksheet.mergeCells('G8:I8');
      titleCell.value = `Operating Loan Limit`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('J8');
      worksheet.mergeCells('J8:K8');
      titleCell.value = operatingLoanLimit;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '00707070'}, size: 14};

      titleCell = worksheet.getCell('G9');
      worksheet.mergeCells('G9:I9');
      titleCell.value = `Year-end Actual LOC Balance`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('J9');
      worksheet.mergeCells('J9:K9');
      titleCell.value = yearToDateActualLOCBalance > 0 ? yearToDateActualLOCBalance : 0;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};

      titleCell = worksheet.getCell('G10');
      worksheet.mergeCells('G10:I10');
      titleCell.value = `Year-end Projected LOC Balance`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('J10');
      worksheet.mergeCells('J10:K10');
      titleCell.value = yearToDateProjectedLOCBalance > 0 ? yearToDateProjectedLOCBalance : 0;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};

      // User entered values.
      titleCell = worksheet.getCell('M8');
      worksheet.mergeCells('M8:N8');
      titleCell.value = `LOC January 1st Balance`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('O8');
      worksheet.mergeCells('O8:P8');
      titleCell.value = actualOperatingLoanBalance;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '00707070'}, size: 14};

      titleCell = worksheet.getCell('M9');
      worksheet.mergeCells('M9:N9');
      titleCell.value = `Target Income`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('O9');
      worksheet.mergeCells('O9:P9');
      titleCell.value = targetIncome;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '00707070'}, size: 14};

      titleCell = worksheet.getCell('M10');
      worksheet.mergeCells('M10:N10');
      titleCell.value = `Carryover Income`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('O10');
      worksheet.mergeCells('O10:P10');
      titleCell.value = carryoverIncome;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '00707070'}, size: 14};

      setColumnWidths(worksheet);
      const useMonthOrder = [...cashFlowData?.cashFlow?.monthOrder, 'annual'];
      const columns = setupTableData('Income', useMonthOrder);
      const expensesColumns = setupTableData('Expense', useMonthOrder);

      addMonthHeaderRow(worksheet, tableStartingRow, 2, useMonthOrder);
      addHeaderRow('Income', worksheet, tableStartingRow + 1, 2);

      createTableLx({
         name: 'Income',
         worksheet,
         columns,
         data: cashFlowData?.cashFlow?.income,
         ref: `B${tableStartingRow + 2}`,
         totalsRow: true,
      });
      const totalIncomeRow = tableStartingRow + (cashFlowData?.cashFlow?.income?.length || 0) + 3;
      setTotalRowStyles(
         worksheet,
         tableStartingRow + 2,
         cashFlowData?.cashFlow?.income?.length || 0,
         2,
         columns?.length
      );

      worksheet.getRow(tableStartingRow + 2).hidden = true;
      setThickBorder(worksheet, tableStartingRow, (cashFlowData?.cashFlow?.income?.length || 0) + 3, 2);

      addColumnStripes(worksheet, tableStartingRow, cashFlowData?.cashFlow?.income?.length);

      titleCell = worksheet.getCell(getCellLocation(2, tableStartingRow2));
      titleCell.value = `Notes`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 12};

      const tableRows = createNoteTableLx({
         name: 'IncomeNotes',
         worksheet,
         columns,
         data: cashFlowData?.cashFlow?.income,
         columnIndex: 2,
         rowIndex: tableStartingRow2 + 1,
         headerRow: false,
         totalsRow: false,
         tableRow: tableStartingRow + 3, //table start + 3 for two header rows and a hidden row.
      });

      tableStartingRow2 += tableRows + 4; // Add 3 for header, and 2 rows spacing.

      // const row = worksheet.getRow(tableStartingRow+1);
      // row.alignment = {vertical: 'middle', horizontal: 'center'};

      addMonthHeaderRow(worksheet, tableStartingRow2, 2, useMonthOrder);
      addHeaderRow('Expense', worksheet, tableStartingRow2 + 1, 2);
      createTableLx({
         name: 'Expenses',
         worksheet,
         columns: expensesColumns,
         data: cashFlowData?.cashFlow?.expenses,
         ref: `B${tableStartingRow2 + 2}`,
         totalsRow: true,
      });

      setTotalRowStyles(
         worksheet,
         tableStartingRow2 + 2,
         cashFlowData?.cashFlow?.expenses?.length || 0,
         2,
         expensesColumns?.length
      );

      worksheet.getRow(tableStartingRow2 + 2).hidden = true;

      // Add one for top header, second header and footer.
      const netTotalRow = tableStartingRow2 + (cashFlowData?.cashFlow?.expenses?.length || 0) + 4;
      const operatingLoanBalanceRow = netTotalRow + 1;
      addNetRow(worksheet, 3, netTotalRow, totalIncomeRow, netTotalRow - 1);
      // O10 or ($15$10) is the Projected Beginning Balance - January Projected Net Cash Flow
      addRowFormula(
         worksheet,
         'Operating Loan Balance',
         2,
         operatingLoanBalanceRow,
         3,
         `${getCellLocation(15, 8)}-${getCellLocation(3, netTotalRow)}`
      );
      addRowFormula(
         worksheet,
         undefined,
         5,
         operatingLoanBalanceRow,
         27,
         `${getCellLocation(3, operatingLoanBalanceRow)}-${getCellLocation(5, netTotalRow)}`,
         2
      );

      addRowFormula(
         worksheet,
         undefined,
         4,
         operatingLoanBalanceRow,
         4,
         `${getCellLocation(15, 9)}-${getCellLocation(4, netTotalRow)}`
      );
      addRowFormula(
         worksheet,
         undefined,
         6,
         operatingLoanBalanceRow,
         27,
         `${getCellLocation(4, operatingLoanBalanceRow)}-${getCellLocation(6, netTotalRow)}`,
         2
      );

      setThickBorder(worksheet, tableStartingRow2, (cashFlowData?.cashFlow?.expenses?.length || 0) + 5, 2);
      addColumnStripes(worksheet, tableStartingRow2, cashFlowData?.cashFlow?.expenses?.length + 3);

      const row = worksheet.getRow(operatingLoanBalanceRow);
      row.getCell(27).border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };
      row.getCell(28).border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      const condition = {
         ref: `${getCellLocation(3, netTotalRow)}:${getCellLocation(28, operatingLoanBalanceRow)}`,
         rules: [
            {
               type: 'cellIs',
               operator: 'lessThan',
               formulae: [0],
               style: {font: {name: 'Tahoma', bold: true, color: {argb: '00AA0B06'}, size: 12}},
               // style: {fill: {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFAA0B06'}}},
            },
         ],
      };
      worksheet.addConditionalFormatting(condition);

      titleCell = worksheet.getCell(getCellLocation(2, operatingLoanBalanceRow + 2));
      titleCell.value = `Notes`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 12};

      createNoteTableLx({
         name: 'ExpenseNotes',
         worksheet,
         columns,
         data: cashFlowData?.cashFlow?.expenses,
         columnIndex: 2,
         rowIndex: operatingLoanBalanceRow + 3,
         headerRow: false,
         totalsRow: false,
         tableRow: tableStartingRow2 + 3, //table start + 3 for the two header rows and a hidden row.
      });

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${entityNames}-CashFlow_${reportDate}.xlsx`);
   };
}
