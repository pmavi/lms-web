import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import moment from 'moment';
import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import {createTable} from '../../../fhg/utils/DataUtil';
import {setRowStyles} from '../../../fhg/utils/excelUtils';
import {getCellLocation} from '../../../fhg/utils/excelUtils';
import {setTotalRowStyles} from '../../../fhg/utils/excelUtils';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';
import cloneDeep from 'lodash/cloneDeep';

/**
 * The hook to export the balance Current to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useLoanAnalysisExcelExport(titleDocument, titleWorksheet) {
   /**
    * Set the columns and the data for the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name:
    *    string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string,
    *    style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, null], assetList}}
    */
   let setupTableData = function () {
      return [
         {
            name: 'Current',
            accessor: 'categoryName',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
         {
            name: 'Asset Value',
            accessor: 'marketValue',
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
         {
            name: 'Loan-to-Value',
            accessor: 'loanToValue',
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
         {
            name: 'Available Borrowing Power',
            accessor: 'bankLoanValue',
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
      ];
   };

   let setupDebtTableData = function () {
      return [
         {
            name: 'Current',
            accessor: 'categoryName',
            totalsRowLabel: 'Current Liabilities',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
         {
            name: 'Current Balance',
            accessor: 'currentBalance',
            totalsRowFunction: 'sum',
            style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
         },
      ];
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;
      worksheet.getColumn(columnIndex++).width = 2; // Margin
      worksheet.getColumn(columnIndex++).width = 28; // Current
      worksheet.getColumn(columnIndex++).width = 19; // Asset Value
      worksheet.getColumn(columnIndex++).width = 17; // Loan-to-Value
      worksheet.getColumn(columnIndex++).width = 27; // Available Borrowing Power
      worksheet.getColumn(columnIndex++).width = 2; // gutter
      worksheet.getColumn(columnIndex++).width = 40; // Current
      worksheet.getColumn(columnIndex++).width = 40; // Current Balance
      worksheet.getColumn(columnIndex++).width = 2; // gutter
   };

   const addTotalRow = function (worksheet, title, tableStartingRow, tableLength, startingColumn) {
      const rowIndex = tableStartingRow + tableLength + 1;
      const row = worksheet.getRow(rowIndex);
      let column = startingColumn;

      let titleCell = row.getCell(column++);
      titleCell.value = title;

      titleCell.border = {
         left: {style: 'thin', color: {argb: '00000000'}},
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      titleCell = row.getCell(column++);
      titleCell.value = {formula: `SUM(C${tableStartingRow + 1}:C${rowIndex - 1})`};
      titleCell.border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      titleCell = row.getCell(column++);
      titleCell.value = ''; //{formula: `E${rowIndex}/C${rowIndex} * 100`}
      titleCell.border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };

      titleCell = row.getCell(column++);
      titleCell.value = {formula: `SUM(E${tableStartingRow + 1}:E${rowIndex - 1})`};
      titleCell.border = {
         bottom: {style: 'thin', color: {argb: '00000000'}},
         right: {style: 'thin', color: {argb: '00000000'}},
      };
   };

   return async (loanAnalysis = {}, reportDate, entityNames = '') => {
      const currentLiabilitiesData = loanAnalysis?.liabilities?.current?.categories;
      const intermediateLiabilitiesData = loanAnalysis?.liabilities?.intermediate?.categories;
      const longTermLiabilitiesData = loanAnalysis?.liabilities?.longTerm?.categories;
      const currentAssetsData = loanAnalysis?.assets?.current?.categories;
      const intermediateAssetsData = loanAnalysis?.assets?.intermediate?.categories;
      const longTermAssetsData = loanAnalysis?.assets?.longTerm?.categories;
      const totalAssets = loanAnalysis?.assets?.totalAssets || 0;

      const currentBankLoanValue = loanAnalysis?.assets?.current?.bankLoanValue || 0;
      const intermediateBankLoanValue = loanAnalysis?.assets?.intermediate?.bankLoanValue || 0;
      const longTermBankLoanValue = loanAnalysis?.assets?.longTerm?.bankLoanValue || 0;

      const totalAvailable = currentBankLoanValue + intermediateBankLoanValue + longTermBankLoanValue;
      const clientLeverage = loanAnalysis?.clientLeverage || 0;
      const totalBankSafetyNet = loanAnalysis?.totalBankSafetyNet || 0;
      const totalLiabilities = loanAnalysis?.liabilities?.totalLiabilities || 0;

      const currentLeveragePosition =
         currentBankLoanValue - (loanAnalysis?.liabilities?.current?.subtotalLiabilities || 0);
      const intermediateLeveragePosition =
         intermediateBankLoanValue - (loanAnalysis?.liabilities?.intermediate?.subtotalLiabilities || 0);
      const longTermLeveragePosition =
         longTermBankLoanValue - (loanAnalysis?.liabilities?.longTerm?.subtotalLiabilities || 0);

      let tableStartingRow = 13;

      const currentMaxLength = Math.max(currentLiabilitiesData?.length || 0, currentAssetsData?.length || 0);
      const intermediateMaxLength = Math.max(
         intermediateLiabilitiesData?.length || 0,
         intermediateAssetsData?.length || 0
      );
      const longTermMaxLength = Math.max(longTermLiabilitiesData?.length || 0, longTermAssetsData?.length || 0);

      // Add a header row, a footer row and a row in between.
      let tableStartingRow2 = tableStartingRow + currentMaxLength + 6;
      let tableStartingRow3 = tableStartingRow2 + intermediateMaxLength + 6;
      let lastRow = tableStartingRow3 + longTermMaxLength + 7;

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
      worksheet.pageSetup.printArea = `B1:H${lastRow}`;
      worksheet.properties.defaultColWidth = 12;
      worksheet.properties.defaultRowHeight = 20;

      // Add the title at top left.
      worksheet.mergeCells('B2:C3');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Loan Analysis';
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
         tl: {col: 6.9, row: 1},
         ext: {width: 400, height: 70},
      });

      worksheet.getColumn('C').numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn('D').numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn('E').numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn('H').numFmt = CURRENCY_FULL_EXCEL; // Amount

      // Add the entity name and date
      titleCell = worksheet.getCell('B5');
      titleCell.value = entityNames || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B6');
      titleCell.value = moment(reportDate).format('MMMM YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      titleCell = worksheet.getCell('B8');
      worksheet.mergeCells('B8:C8');
      titleCell.value = `Total Available Borrowing Power`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('D8');
      worksheet.mergeCells('D8:E8');
      titleCell.value = totalAvailable;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B9');
      worksheet.mergeCells('B9:C9');
      titleCell.value = `Total Liabilities`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('D9');
      worksheet.mergeCells('D9:E9');
      titleCell.value = totalLiabilities;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B10');
      worksheet.mergeCells('B10:C10');
      titleCell.value = `Total Borrowing Power`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('D10');
      worksheet.mergeCells('D10:E10');
      titleCell.value = clientLeverage;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('G8');
      titleCell.value = `Total Assets`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('H8');
      titleCell.value = totalAssets;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('G9');
      titleCell.value = `Total Liabilities`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('H9');
      titleCell.value = totalLiabilities;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('G10');
      titleCell.value = `Total Bank Safety Net`;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 14};
      titleCell = worksheet.getCell('H10');
      titleCell.value = totalBankSafetyNet;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '00707070'}, size: 14};

      titleCell = worksheet.getCell('B12');
      titleCell.value = `Asset Position`;
      titleCell.font = {name: 'Tahoma', size: 14};

      titleCell = worksheet.getCell('G12');
      titleCell.value = `Debt Position`;
      titleCell.font = {name: 'Tahoma', size: 14};

      setColumnWidths(worksheet);
      const columns = setupTableData();
      const debtColumns = setupDebtTableData();

      setTotalRowStyles(worksheet, tableStartingRow, currentAssetsData?.length || 0, 2, columns?.length);
      createTable(
         'ACurrent',
         worksheet,
         columns,
         currentAssetsData,
         `B${tableStartingRow}`,
         true,
         undefined,
         undefined,
         true,
         false
      );
      addTotalRow(worksheet, 'Current Loan to Value', tableStartingRow, currentAssetsData?.length, 2);
      setTotalRowStyles(worksheet, tableStartingRow, currentAssetsData?.length || 0, 2, columns?.length);

      setTotalRowStyles(worksheet, tableStartingRow, currentLiabilitiesData?.length || 0, 7, debtColumns?.length);
      createTable(
         'DCurrent',
         worksheet,
         debtColumns,
         currentLiabilitiesData,
         `G${tableStartingRow}`,
         true,
         undefined,
         undefined,
         true,
         true
      );

      let cell = getCellLocation(2, tableStartingRow2 - 3);
      let cell2 = getCellLocation(3, tableStartingRow2 - 3);
      let cell3 = getCellLocation(8, tableStartingRow2 - 3);
      titleCell = worksheet.getCell(cell);
      worksheet.mergeCells(`${cell}:${cell2}`);
      titleCell.value = `Current Borrowing Power`;
      titleCell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 14};
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         left: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };

      titleCell = worksheet.getCell(cell3);
      titleCell.value = currentLeveragePosition;
      titleCell.font = {
         name: 'Tahoma',
         bold: true,
         color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'},
         size: 14,
      };
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         right: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };
      setRowStyles(worksheet, tableStartingRow2 - 3, 1, 2, 7, {
         border: {
            top: {style: 'thin', color: {argb: '006b9241'}},
            bottom: {style: 'thin', color: {argb: '006b9241'}},
         },
      });

      //WARNING The original columns cannot be used or Excel will have a problem reading the file!
      const intermediateColumns = cloneDeep(columns);
      const intermediateDebtColumns = cloneDeep(debtColumns);
      //////

      intermediateColumns[0].name = 'Intermediate';
      intermediateDebtColumns[0].name = 'Intermediate';
      intermediateDebtColumns[0].totalsRowLabel = 'Intermediate Liabilities';

      setTotalRowStyles(
         worksheet,
         tableStartingRow2,
         intermediateAssetsData?.length || 0,
         2,
         intermediateColumns?.length
      );

      createTable(
         'Intermediate',
         worksheet,
         intermediateColumns,
         intermediateAssetsData,
         `B${tableStartingRow2}`,
         true,
         undefined,
         undefined,
         true,
         false
      );
      addTotalRow(worksheet, 'Intermediate Loan to Value', tableStartingRow2, intermediateAssetsData?.length, 2);

      cell = getCellLocation(2, tableStartingRow3 - 3);
      cell2 = getCellLocation(3, tableStartingRow3 - 3);
      cell3 = getCellLocation(8, tableStartingRow3 - 3);
      titleCell = worksheet.getCell(cell);
      worksheet.mergeCells(`${cell}:${cell2}`);
      titleCell.value = `Intermediate Borrowing Power`;
      titleCell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 14};
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         left: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };

      titleCell = worksheet.getCell(cell3);
      titleCell.value = intermediateLeveragePosition;
      titleCell.font = {
         name: 'Tahoma',
         bold: true,
         color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'},
         size: 14,
      };
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         right: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };

      setRowStyles(worksheet, tableStartingRow3 - 3, 1, 2, 7, {
         border: {
            top: {style: 'thin', color: {argb: '006b9241'}},
            bottom: {style: 'thin', color: {argb: '006b9241'}},
         },
      });

      createTable(
         'DebtIntermediate',
         worksheet,
         intermediateDebtColumns,
         intermediateLiabilitiesData,
         `G${tableStartingRow2}`,
         true,
         undefined,
         undefined,
         true
      );
      setTotalRowStyles(
         worksheet,
         tableStartingRow2,
         intermediateLiabilitiesData?.length || 0,
         7,
         intermediateDebtColumns?.length
      );

      cell = getCellLocation(2, lastRow - 4);
      cell2 = getCellLocation(3, lastRow - 4);
      cell3 = getCellLocation(8, lastRow - 4);
      titleCell = worksheet.getCell(cell);
      worksheet.mergeCells(`${cell}:${cell2}`);
      titleCell.value = `Long Term Borrowing Power`;
      titleCell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 14};
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         left: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };

      titleCell = worksheet.getCell(cell3);
      titleCell.value = longTermLeveragePosition;
      titleCell.font = {
         name: 'Tahoma',
         bold: true,
         color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'},
         size: 14,
      };
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         right: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };
      setRowStyles(worksheet, lastRow - 4, 1, 2, 7, {
         border: {
            top: {style: 'thin', color: {argb: '006b9241'}},
            bottom: {style: 'thin', color: {argb: '006b9241'}},
         },
      });

      //WARNING The original columns cannot be used or Excel will have a problem reading the file!
      const longTermColumns = cloneDeep(columns);
      const longTermDebtColumns = cloneDeep(debtColumns);
      //////

      longTermColumns[0].name = 'Long Term';
      longTermDebtColumns[0].name = 'Long Term';
      longTermDebtColumns[0].totalsRowLabel = 'Long Term Liabilities';
      createTable(
         'AssetsLongTerm',
         worksheet,
         longTermColumns,
         longTermAssetsData,
         `B${tableStartingRow3}`,
         true,
         undefined,
         undefined,
         true,
         false
      );
      addTotalRow(worksheet, 'Long Term Loan to Value', tableStartingRow3, longTermAssetsData?.length, 2);
      setTotalRowStyles(worksheet, tableStartingRow3, longTermAssetsData?.length || 0, 2, longTermColumns?.length);

      createTable(
         'LiabilitiesLongTerm',
         worksheet,
         longTermDebtColumns,
         longTermLiabilitiesData,
         `G${tableStartingRow3}`,
         true,
         undefined,
         undefined,
         true,
         true
      );
      setTotalRowStyles(
         worksheet,
         tableStartingRow3,
         longTermLiabilitiesData?.length || 0,
         7,
         longTermDebtColumns?.length
      );

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${entityNames}-LoanAnalysis_${moment(reportDate).format('MMMM_YYYY')}.xlsx`);
   };
}
