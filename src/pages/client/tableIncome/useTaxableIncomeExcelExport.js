import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import {createTableLx} from '../../../fhg/utils/DataUtil';
import {getCellLocation} from '../../../fhg/utils/excelUtils';
import {setTotalRowStyles} from '../../../fhg/utils/excelUtils';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';

function insertProjectedForMissingActuals(incomeOrExpense) {
   const incomeOrExpenseList = [];

   for (const incomeOrExpenseElement of incomeOrExpense) {
      const item = {...incomeOrExpenseElement};
      let sum = 0;

      for (const month of DEFAULT_MONTH_ORDER) {
         if (item[month].actual === 0) {
            item[month].actual = item[month].expected;
         }
         sum += item[month].actual;
      }
      item.annual.actual = sum;
      incomeOrExpenseList.push(item);
   }

   return incomeOrExpenseList;
}

/**
 * The hook to export the Taxable Income to Excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useTaxableIncomeExcelExport(titleWorksheet) {
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
         columns.push({
            name: 'Actual' + index++,
            getAccessor: `${month}.actual`,
            accessor: `${month}Actual`,
            totalsRowFunction: 'sum',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         });
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
      worksheet.getColumn(3).width = 19; // typeName
      worksheet.getColumn(4).width = 2; // Margin
      worksheet.getColumn(5).width = 25; // typeName
      worksheet.getColumn(6).width = 25; // typeName
   };

   const addHeaderRow = function (name, worksheet, tableStartingRow, startingColumn, months) {
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

      for (let i = 0; i < months.length; i++) {
         let cell = row.getCell(column++);

         cell.value = 'Actual Taxable Total';
         cell.font = {name: 'Tahoma', size: 12, color: {argb: '00707070'}};
         cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEDF1E7'}};
         cell.border = {
            top: {style: 'thin', color: {argb: '00000000'}},
            right: {style: 'medium', color: {argb: '00000000'}},
         };
      }
   };

   const addTaxableIncomeRow = function (worksheet, startColumn, totalRow, incomeTotalRow, expenseTotalRow) {
      const row = worksheet.getRow(totalRow);

      let cell = row.getCell(startColumn - 1);
      cell.value = 'Taxable Income';
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

      for (let i = startColumn + 1; i < 4; i++) {
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

   return async (titleDocument, cashFlowData = {}, reportDate, entityNames = '') => {
      let tableStartingRow = 8;
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
               right: 3.1,
               top: 0.75,
               bottom: 0.75,
               header: 0.3,
               footer: 0.3,
            },
         },
      });
      //Add the table header and footer rows.
      worksheet.pageSetup.printArea = `A1:D${lastRow}`;
      worksheet.properties.defaultColWidth = 22;
      worksheet.properties.defaultRowHeight = 20;

      const income = insertProjectedForMissingActuals(cashFlowData?.cashFlow?.income);
      const expenses = insertProjectedForMissingActuals(cashFlowData?.cashFlow?.expenses);

      // Add the title at top left.
      worksheet.mergeCells('B2:C3');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Taxable Income';
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
         tl: {col: 3, row: 1},
         ext: {width: 400, height: 70},
      });
      // Add the entity name and date
      titleCell = worksheet.getCell('B5');
      titleCell.value = entityNames || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B6');
      titleCell.value = reportDate?.toString();
      titleCell.font = {name: 'Tahoma', size: 12};

      // User entered values.

      setColumnWidths(worksheet);
      const useMonthOrder = ['annual'];
      const columns = setupTableData('Income', useMonthOrder);
      const expensesColumns = setupTableData('Expense', useMonthOrder);

      addHeaderRow('Income', worksheet, tableStartingRow + 1, 2, useMonthOrder);

      createTableLx({
         name: 'Income',
         worksheet,
         columns,
         data: income,
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

      addHeaderRow('Expense', worksheet, tableStartingRow2 + 1, 2, useMonthOrder);
      createTableLx({
         name: 'Expenses',
         worksheet,
         columns: expensesColumns,
         data: expenses,
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
      addTaxableIncomeRow(worksheet, 3, netTotalRow, totalIncomeRow, netTotalRow - 1);

      const condition = {
         ref: `${getCellLocation(3, netTotalRow)}:${getCellLocation(3, operatingLoanBalanceRow)}`,
         rules: [
            {
               type: 'cellIs',
               operator: 'lessThan',
               formulae: [0],
               style: {font: {name: 'Tahoma', bold: true, color: {argb: '00AA0B06'}, size: 12}},
            },
         ],
      };
      worksheet.addConditionalFormatting(condition);

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${entityNames}-CashFlow_${reportDate}.xlsx`);
   };
}
