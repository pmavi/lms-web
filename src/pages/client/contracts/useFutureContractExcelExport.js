import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {formatMessage} from '../../../fhg/utils/Utils';
import useContractBaseExcelExport from './useContractBaseExcelExport';

/**
 * The hook to export the Futures Contracts sheet to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useFutureContractExcelExport(intl, titleWorksheet) {
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
         accessor: 'monthYear',
         name: formatMessage(intl, 'contract.monthYear.column'),
         width: 20,
         value: (data) => `${data?.month}/${data?.year}`,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'futuresPrice',
         name: formatMessage(intl, 'contract.futurePrice.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'estimatedBasis',
         name: formatMessage(intl, 'contract.estimatedBasis.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'cashPrice',
         name: formatMessage(intl, 'contract.cashPrice.column'),
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
         accessor: 'deliveryLocation',
         name: formatMessage(intl, 'contract.deliveryLocation.column'),
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

   const exportContract = useContractBaseExcelExport(intl, titleWorksheet, columns);

   return async (workbook, contracts, reportDate, entityName) => {
      const worksheet = await exportContract(workbook, contracts, reportDate, entityName, 7, 'C', 'G', 'J');
      worksheet.getColumn('E').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('F').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('G').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('J').numFmt = CURRENCY_FULL_EXCEL;
   };
}
