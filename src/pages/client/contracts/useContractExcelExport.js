import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import {formatMessage} from '../../../fhg/utils/Utils';
import useCashContractExcelExport from './useCashContractExcelExport';
import useFutureContractExcelExport from './useFutureContractExcelExport';
import useHedgeContractExcelExport from './useHedgeContractExcelExport';

/**
 * The hook to export the contracts workbook to excel. Each type of contract is in a separate worksheet.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useContractExcelExport(intl, titleDocument) {
   const exportCashContractWorksheet = useCashContractExcelExport(
      intl,
      formatMessage(intl, 'contract.cashContracts.label', 'Cash Contracts')
   );
   const exportFutureContractWorksheet = useFutureContractExcelExport(
      intl,
      formatMessage(intl, 'contract.futures.label', 'Futures Contracts')
   );
   const exportHedgeContractWorksheet = useHedgeContractExcelExport(
      intl,
      formatMessage(intl, 'contract.hedges.label', 'Hedges Contracts')
   );

   return async (cashContracts, futureContracts, hedgeContracts, reportDate, entityName = '') => {
      const workbook = new ExcelJS.Workbook();
      await exportCashContractWorksheet(workbook, cashContracts, reportDate, entityName);
      await exportFutureContractWorksheet(workbook, futureContracts, reportDate, entityName);
      await exportHedgeContractWorksheet(workbook, hedgeContracts, reportDate, entityName);

      const buf = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buf]), `${titleDocument}.xlsx`);
   };
}
