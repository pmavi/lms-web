import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {formatMessage} from '../../../fhg/utils/Utils';
import useContractBaseExcelExport from './useContractBaseExcelExport';

/**
 * The hook to export the Hedges Contracts sheet to Excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useHedgeContractExcelExport(intl, titleWorksheet) {
   const columns = [
      {
         accessor: 'crop',
         name: formatMessage(intl, 'contract.crop.column'),
         width: 20,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'bushels',
         name: formatMessage(intl, 'contract.bushels.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'strikePrice',
         name: formatMessage(intl, 'contract.strikePrice.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'strikeCost',
         name: formatMessage(intl, 'contract.strikeCost.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'futuresMonth',
         name: formatMessage(intl, 'contract.futureMonth.column'),
         width: 15,
         value: (data) => `${data?.month}/${data?.year}`,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'currentMarketValue',
         name: formatMessage(intl, 'contract.currentMarketValue.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'contractNumber',
         name: formatMessage(intl, 'contract.contractNumber.column'),
         width: 20,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'value',
         name: formatMessage(intl, 'contract.value.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
   ];

   const exportContract = useContractBaseExcelExport(intl, titleWorksheet, columns, 'J');

   return async (workbook, contracts, reportDate, entityName) => {
      const worksheet = await exportContract(workbook, contracts, reportDate, entityName, 5.5, 'C', 'G', 'I');
      worksheet.getColumn('D').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('E').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('G').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('I').numFmt = CURRENCY_FULL_EXCEL;
   };
}
