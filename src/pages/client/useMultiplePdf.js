import {Document} from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {TableOfContents, TableOfContentsProvider} from '../../components/pdf/TableOfContents';
import TitlePage from '../../components/pdf/TitlePage';
import {DATE_DB_FORMAT} from '../../Constants';
import {TAXABLE_INCOME_INDEX} from '../../Constants';
import {
   ASSET_INDEX,
   ACCOUNTABILITY_CHART_INDEX,
   CASH_FLOW_INDEX,
   BALANCE_SHEET_INDEX,
   LOAN_ANALYSIS_INDEX,
   CONTRACTS_INDEX,
   LIABILITY_INDEX,
} from '../../Constants';
import useAccountabilityChartPdf from './accountability/useAccountabilityChartPdf';
import useAssetPdf from './assets/useAssetPdf';
import useBalanceSheetPdf from './balanceSheet/useBalanceSheetPdf';
import useContractsPdf from './contracts/useContractsPdf';
import useLoanAnalysisPdf from './loanAnalysisComponents/useLoanAnalysisPdf';
import useCashFlowPdf from './cashFlow/useCashFlowPdf';
import useTaxableIncomePdf from './tableIncome/useTaxableIncomePdf';
import useLiabilitiesPdf from './useLiabilitiesPdf';

/**
 */
/**
 * Hook to return all the PDF document types.
 *
 * Reviewed:
 *
 * @param intl The localization object.
 * @param orientation The orientation of all the PDF pages.
 * @param clientId The client ID of the client for all the PDF documents
 * @param entityIds The entity ID(s) of the entities for the PDF documents.
 * @param historyDate The date used for Assets, Liabilities and the other reports.
 * @param itemsKey The property key for the item in the tree for the accountability charts.
 * @return {function(*, *, *, *): Promise<*>}
 */
export default function useMultiplePdf(intl, orientation, clientId, entityIds, historyDate, itemsKey) {
   const historyDateString = moment(historyDate).format(DATE_DB_FORMAT);
   const getAssetDocument = useAssetPdf(intl, orientation, entityIds, historyDateString);
   const getLiabilityDocument = useLiabilitiesPdf(intl, orientation, entityIds, historyDateString);
   const getContractDocument = useContractsPdf(intl, orientation, entityIds, historyDateString);
   const getLoanAnaysisDocument = useLoanAnalysisPdf(intl, orientation, entityIds, historyDateString);
   const getBalanceSheetDocument = useBalanceSheetPdf(intl, orientation, entityIds, historyDateString);
   const getCashFlowDocument = useCashFlowPdf(intl, orientation, clientId, entityIds, historyDateString);
   const getTaxableDocument = useTaxableIncomePdf(intl, orientation, clientId, entityIds, historyDateString);
   const getAccountabilityChart = useAccountabilityChartPdf(
      intl,
      orientation,
      clientId,
      entityIds,
      historyDateString,
      itemsKey
   );

   return useCallback(
      async (types, title, entityNames, clientData) => (
         <Document title={title}>
            <TitlePage
               intl={intl}
               orientation={'landscape'}
               types={types}
               entityNames={entityNames}
               clientData={clientData}
            />
            <TableOfContentsProvider>
               <TableOfContents intl={intl} orientation={'landscape'} />
               {types[ACCOUNTABILITY_CHART_INDEX] && (await getAccountabilityChart(entityNames))}
               {types[LOAN_ANALYSIS_INDEX] && (await getLoanAnaysisDocument(entityNames))}
               {types[ASSET_INDEX] && (await getAssetDocument(entityNames))}
               {types[LIABILITY_INDEX] && (await getLiabilityDocument(entityNames))}
               {types[BALANCE_SHEET_INDEX] && (await getBalanceSheetDocument(entityNames))}
               {types[CASH_FLOW_INDEX] && (await getCashFlowDocument(entityNames))}
               {types[CONTRACTS_INDEX] && (await getContractDocument(entityNames))}
               {types[TAXABLE_INCOME_INDEX] && (await getTaxableDocument(entityNames))}
            </TableOfContentsProvider>
         </Document>
      ),
      [
         intl,
         getAssetDocument,
         getBalanceSheetDocument,
         getCashFlowDocument,
         getContractDocument,
         getLiabilityDocument,
         getLoanAnaysisDocument,
         getAccountabilityChart,
         getTaxableDocument,
      ]
   );
}
