import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import map from 'lodash/map';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {CURRENCY_FULL_EXCEL} from '../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {METRICS_LOGO} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
import {createTable} from '../../fhg/utils/DataUtil';
import {getBase64FromUrl} from '../../fhg/utils/Utils';

/**
 * The hook to export liabilities to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useLiabilitiesExcelExport(titleDocument, titleWorksheet) {
   /**
    * Set the columns and the data for the table.
    * @param liabilities The liabilities contained in the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size: number, color: {argb: string}, name: string}}}, null], liabilityList}}
    */
   let setupTableData = function (liabilities) {
      const columns = [
         {name: 'Category', width: 32, style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Bank', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Description', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Interest Rate', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Payment', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Payment Due Date', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {name: 'Payment Maturity Date', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {
            name: 'Bank Debt',
            totalsRowLabel: 'Total',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Amount',
            totalsRowFunction: 'sum',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
      ];

      const liabilityList = map(liabilities, (liability) => ({
         category: liability?.liabilityCategory?.name,
         bank: liability?.bank?.name,
         description: liability?.description,
         interestRate: liability?.interestRate,
         payment: liability?.payment,
         paymentDueDate: liability?.paymentDueDate,
         paymentMaturityDate: liability?.paymentMaturityDate,
         collateralString: liability?.collateralString,
         amount: liability?.amount,
      }));
      return {columns, liabilityList};
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;
      worksheet.getColumn(columnIndex++).width = 1; // Margin - A
      worksheet.getColumn(columnIndex++).width = 22; // Category - B
      worksheet.getColumn(columnIndex++).width = 18; // Bank - C
      worksheet.getColumn(columnIndex++).width = 26; // Description - D
      worksheet.getColumn(columnIndex++).width = 10; // Interest Rate - E
      const paymentCell = worksheet.getColumn(columnIndex++); // Payment - F
      paymentCell.width = 11; // Payment
      paymentCell.numFmt = '"$"#,##0'; // Payment
      worksheet.getColumn(columnIndex++).width = 10; // Payment Due Date - G
      worksheet.getColumn(columnIndex++).width = 20; // Payment Maturity Date - H
      worksheet.getColumn(columnIndex++).width = 11; // Collateral - I
      const amountCell = worksheet.getColumn(columnIndex++); // Amount - J
      amountCell.width = 19; // Amount
      amountCell.numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn(columnIndex++).width = 1; // Margin - K
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
         row.alignment = {vertical: 'middle', wrapText: true};
      });
      //Header row
      worksheet.getRow(startingRow).height = 30;
      worksheet.getRow(startingRow + rowCount + 1).font = {
         name: 'Tahoma',
         size: 12,
         bold: true,
         color: {argb: '00707070'},
      };

      const totalRow = worksheet.getRow(startingRow + rowCount + 1);
      totalRow.height = 20;
      totalRow.alignment = {vertical: 'middle'};
      totalRow.font = {name: 'Tahoma', size: 12, bold: true, color: {argb: '00707070'}};

      worksheet.getColumn('H').alignment = {vertical: 'middle', horizontal: 'right'};
   };

   return async (liabilities = [], total = 0, entityName = '') => {
      const tableStartingRow = 11;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            orientation: 'landscape',
            margins: {
               left: 0.1,
               right: 0.1,
               top: 0.75,
               bottom: 0.75,
               header: 0.3,
               footer: 0.3,
            },
         },
      });
      //Add the table header and footer rows.
      worksheet.pageSetup.printArea = `A1:J${tableStartingRow + 2 + liabilities.length}`;
      worksheet.properties.defaultColWidth = 12;

      // Add the title at top left.
      worksheet.mergeCells('B2:C4');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Schedule of Liabilities';
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 20, bold: true};
      titleCell.alignment = {vertical: 'middle', horizontal: 'left'};

      // Add the logo in the upper right
      const myBase64Image = await getBase64FromUrl(METRICS_LOGO);
      const imageId2 = workbook.addImage({
         base64: myBase64Image,
         extension: 'png',
      });
      worksheet.addImage(imageId2, 'E2:H4');

      // Add the entity name and date
      titleCell = worksheet.getCell('B6');
      titleCell.value = entityName || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B7');
      titleCell.value = moment().format('MMMM D, YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      worksheet.mergeCells('B9:E9');
      titleCell = worksheet.getCell('B9');
      titleCell.value = `Total Liabilities ${numberFormatter(CURRENCY_FULL_FORMAT, total)}`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      setColumnWidths(worksheet);
      const {columns, liabilityList} = setupTableData(liabilities);
      setTableStyles(worksheet, tableStartingRow, liabilityList.length);
      createTable('Liabilities', worksheet, columns, liabilityList, `B${tableStartingRow}`);

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${titleDocument}_${moment().format(DATE_DB_FORMAT)}.xlsx`);
   };
}
