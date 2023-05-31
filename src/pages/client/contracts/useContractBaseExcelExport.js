import moment from 'moment';
import {METRICS_LOGO} from '../../../Constants';
import {createTableLx} from '../../../fhg/utils/DataUtil';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';

/**
 * The hook to export the base contract sheet to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useContractBaseExcelExport(intl, titleWorksheet, columns, lastColumn = 'K') {
   /**
    * Set the column widths for all columns based on the width in the columns list. The column before and after are set small for the margin.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;

      worksheet.getColumn(columnIndex++).width = 2; // Margin
      for (const column of columns) {
         worksheet.getColumn(columnIndex++).width = column.width;
      }
      worksheet.getColumn(columnIndex).width = 2; // Margin
   };

   return async (
      workbook,
      contracts,
      reportDate,
      entityName,
      imageColumn,
      priceColumn = 'E',
      bushelsColumn = 'D',
      valueColumn = 'J'
   ) => {
      let tableStartingRow = 8;
      let lastRow = tableStartingRow + (contracts?.length || 0) + 2;

      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            fitToPage: true,
            fitToWidth: 1,
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
      worksheet.pageSetup.printArea = `A1:${lastColumn}${lastRow}`;
      worksheet.properties.defaultColWidth = 20;
      worksheet.properties.defaultRowHeight = 20;

      // Add the title at top left.
      worksheet.mergeCells('B2:C3');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = titleWorksheet;
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
         tl: {col: imageColumn, row: 1},
         ext: {width: 400, height: 70},
      });

      // Add the entity name and date
      titleCell = worksheet.getCell('B5');
      titleCell.value = entityName || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B6');
      titleCell.value = moment(reportDate).format('MMMM YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      worksheet.getRow(tableStartingRow).alignment = {vertical: 'middle', horizontal: 'center', wrapText: true};
      worksheet.getRow(tableStartingRow).height = 30;
      setColumnWidths(worksheet);
      const formulaStart = tableStartingRow + 1;

      createTableLx({
         name: titleWorksheet,
         worksheet,
         columns,
         data: contracts,
         ref: `B${tableStartingRow}`,
         totalsRow: false,
      });

      // Multiply bushels * price and place in the last column (i.e Values).
      worksheet.fillFormula(
         `${valueColumn}${formulaStart}:${valueColumn}${contracts?.length + formulaStart - 1}`,
         `${bushelsColumn}${formulaStart}*${priceColumn}${formulaStart}`
      );
      return worksheet;
   };
}
