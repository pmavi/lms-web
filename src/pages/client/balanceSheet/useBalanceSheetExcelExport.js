import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import moment from 'moment';
import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import {createTable} from '../../../fhg/utils/DataUtil';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';

/**
 * The hook to export the balance sheet to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useBalanceSheetExcelExport(titleDocument, titleWorksheet) {
   /**
    * Set the columns and the data for the table.
    * @param name The name of the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name:
    *    string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string,
    *    style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size:
    *    number, color: {argb: string}, name: string}}}, null], assetList}}
    */
   let setupTableData = function (name) {
      return [
         {
            name: name,
            totalsRowLabel: 'Total',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Amount',
            totalsRowFunction: 'sum',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
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
      worksheet.getColumn(columnIndex++).width = 31; // Asset Category
      worksheet.getColumn(columnIndex++).width = 35; // Asset Amount
      worksheet.getColumn(columnIndex++).width = 2; // gutter
      worksheet.getColumn(columnIndex++).width = 31; // Liability Category
      worksheet.getColumn(columnIndex++).width = 35; // Liability  Amount
   };

   /**
    * Set the table styles. Stripe the rows, set alignment and set cell font.
    *
    * @param worksheet The worksheet containing the table.
    * @param startingRow The row index of the starting row of the table.
    * @param rowCount The number of rows in the table.
    */
   let setTableStyles = function (worksheet, startingRow, rowCount) {
      worksheet.getRows(startingRow, rowCount + 1).forEach((row) => {
         row.height = 20;
      });
      worksheet.getRow(startingRow + rowCount + 1).font = {
         name: 'Tahoma',
         size: 12,
         bold: true,
         color: {argb: '00707070'},
      };

      const totalRow = worksheet.getRow(startingRow + rowCount + 1);
      totalRow.height = 20;
      totalRow.alignment = {vertical: 'middle'};
      totalRow.font = {name: 'Tahoma', size: 12, bold: true, color: {argb: '006b9241'}};
   };

   return async (balanceSheet = {}, reportDate, entityNames = '') => {
      const {workingCapital, currentRatio, totalEquity, totalLiabilities, totalAssets, equityAssetPercentage} =
         balanceSheet || {};

      const assetsCurrent = balanceSheet?.assets?.current?.categories || [{}];
      const assetsIntermediate = balanceSheet?.assets?.intermediate?.categories || [{}];
      const assetsLongTerm = balanceSheet?.assets?.longTerm?.categories || [{}];
      const liabilitiesCurrent = balanceSheet?.liabilities?.current?.categories || [{}];
      const liabilitiesIntermediate = balanceSheet?.liabilities?.intermediate?.categories || [{}];
      const liabilitiesLongTerm = balanceSheet?.liabilities?.longTerm?.categories || [{}];

      let tableStartingRow = 13;

      // Add a header row, a footer row and a row in between.
      let tableStartingRow2 =
         tableStartingRow + Math.max(assetsCurrent?.length || 0, liabilitiesCurrent?.length || 0) + 3;
      let tableStartingRow3 =
         tableStartingRow2 + Math.max(assetsIntermediate?.length || 0, liabilitiesIntermediate?.length || 0) + 3;
      let lastRow = tableStartingRow3 + Math.max(assetsLongTerm?.length || 0, liabilitiesLongTerm?.length || 0) + 2;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            orientation: 'portrait',
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
      worksheet.pageSetup.printArea = `A1:H${lastRow}`;
      worksheet.properties.defaultColWidth = 12;
      worksheet.properties.defaultRowHeight = 20;

      // Add the title at top left.
      worksheet.mergeCells('B2:C3');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Balance Sheet';
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 20, bold: true};
      titleCell.alignment = {vertical: 'middle', horizontal: 'left'};

      // Add the logo in the upper right
      worksheet.getCell('E2').alignment = {vertical: 'top', horizontal: 'right'};
      const myBase64Image = await getBase64FromUrl(METRICS_LOGO);
      const imageId2 = workbook.addImage({
         base64: myBase64Image,
         extension: 'png',
      });
      // worksheet.addImage(imageId2, "E2:F3");
      worksheet.addImage(imageId2, {
         tl: {col: 4.5, row: 1},
         ext: {width: 400, height: 70},
      });

      worksheet.getColumn('C').numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn('F').numFmt = CURRENCY_FULL_EXCEL; // Amount

      // Add the entity name and date
      titleCell = worksheet.getCell('B5');
      titleCell.value = entityNames || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B6');
      titleCell.value = moment(reportDate).format('MMMM YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      titleCell = worksheet.getCell('B8');
      titleCell.value = `Total Assets`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('C8');
      titleCell.value = totalAssets;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B9');
      titleCell.value = `Total Liabilities`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('C9');
      titleCell.value = totalLiabilities;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B10');
      titleCell.value = `Total Equity`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('C10');
      titleCell.value = totalEquity;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('E8');
      titleCell.value = `Current Ratio`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('F8');
      titleCell.value = currentRatio;
      titleCell.numFmt = '##0.0#';
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('E9');
      titleCell.value = `Working Capital`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('F9');
      titleCell.value = workingCapital;
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('E10');
      titleCell.value = `Equity/Asset %`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};
      titleCell = worksheet.getCell('F10');
      titleCell.value = equityAssetPercentage;
      titleCell.numFmt = '##0.0#%';
      titleCell.font = {name: 'Tahoma', color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'}, size: 14};

      titleCell = worksheet.getCell('B12');
      titleCell.value = `Assets`;
      titleCell.font = {name: 'Tahoma', size: 14};

      titleCell = worksheet.getCell('E12');
      titleCell.value = `Liabilities`;
      titleCell.font = {name: 'Tahoma', size: 14};

      setColumnWidths(worksheet);
      setTableStyles(worksheet, tableStartingRow, assetsCurrent.length);

      const columnsCurrentAssets = setupTableData('Current Assets');
      createTable(
         'AssetsCurrent',
         worksheet,
         columnsCurrentAssets,
         assetsCurrent,
         `B${tableStartingRow}`,
         true,
         undefined,
         ['categoryName', 'total']
      );
      const columnsCurrentLiabilities = setupTableData('CurrentLiabilities');
      createTable(
         'LiabilitiesCurrent',
         worksheet,
         columnsCurrentLiabilities,
         liabilitiesCurrent,
         `E${tableStartingRow}`,
         true,
         undefined,
         ['categoryName', 'total']
      );

      const columnsAssetsIntermediate = setupTableData('Intermediate Assets');
      createTable(
         'AssetsIntermediate',
         worksheet,
         columnsAssetsIntermediate,
         assetsIntermediate,
         `B${tableStartingRow2}`,
         true,
         undefined,
         ['categoryName', 'total']
      );
      const columnsLiabilitiesIntermediate = setupTableData('Intermediate Liabilities');
      createTable(
         'LiabilitiesIntermediate',
         worksheet,
         columnsLiabilitiesIntermediate,
         liabilitiesIntermediate,
         `E${tableStartingRow2}`,
         true,
         undefined,
         ['categoryName', 'total']
      );

      const columnsAssetsLongTerm = setupTableData('Long Term Assets');
      createTable(
         'AssetsLongTerm',
         worksheet,
         columnsAssetsLongTerm,
         assetsLongTerm,
         `B${tableStartingRow3}`,
         true,
         undefined,
         ['categoryName', 'total']
      );
      const columnsLiabilitiesLongTerm = setupTableData('Long Term Liabilities');
      createTable(
         'LiabilitiesLongTerm',
         worksheet,
         columnsLiabilitiesLongTerm,
         liabilitiesLongTerm,
         `E${tableStartingRow3}`,
         true,
         undefined,
         ['categoryName', 'total']
      );

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${entityNames}-BalanceSheet_${moment(reportDate).format('MMMM_YYYY')}.xlsx`);
   };
}
