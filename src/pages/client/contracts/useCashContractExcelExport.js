import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {formatMessage} from '../../../fhg/utils/Utils';
import useContractBaseExcelExport from './useContractBaseExcelExport';

/**
 * The hook to export the Cash Contracts sheet to Excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useCashContractExcelExport(intl, titleWorksheet) {
   const columns = [
      {
         accessor: 'crop',
         name: formatMessage(intl, 'contract.crop.column'),
         width: 20,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'isNew',
         name: formatMessage(intl, 'contract.new.column'),
         width: 10,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'bushelsSold',
         name: formatMessage(intl, 'contract.bushelsSold.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'price',
         name: formatMessage(intl, 'contract.price.column'),
         width: 15,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'deliveryMonth',
         name: formatMessage(intl, 'contract.deliveryMonth.column'),
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
         accessor: 'contractNumber',
         name: formatMessage(intl, 'contract.contractNumber.column'),
         width: 20,
         style: {font: {name: 'Tahoma', size: 12}, color: {argb: '00707070'}},
      },
      {
         accessor: 'isDelivered',
         name: formatMessage(intl, 'contract.delivered.column'),
         width: 13,
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
      const worksheet = await exportContract(workbook, contracts, reportDate, entityName, 6.7);
      worksheet.getColumn('E').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('J').numFmt = CURRENCY_FULL_EXCEL;
   };
}
