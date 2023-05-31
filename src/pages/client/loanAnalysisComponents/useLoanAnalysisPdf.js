import moment from 'moment/moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOAN_ANALYSIS_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import LoanAnalysisMainPdf from './LoanAnalysisMainPdf';

/**
 * Hook to return the pages for the Loan Analysis in a PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useLoanAnalysisPdf(intl, orientation, entityId, date) {
   const [loanAnalysisQuery] = useLazyQueryFHG(LOAN_ANALYSIS_QUERY, {
      fetchPolicy: 'network-only',
   });

   return useCallback(
      async (entityNames = '') => {
         let reportDate = moment(date).format(DATE_DB_FORMAT);
         if (reportDate === 'Invalid date') {
            reportDate = moment(date, MONTH_FORMAT).format(DATE_DB_FORMAT);
         }

         const loanAnalysisData = await loanAnalysisQuery({variables: {entityId, date: reportDate}});

         return (
            <LoanAnalysisMainPdf
               intl={intl}
               orientation={orientation}
               data={loanAnalysisData?.data?.loanAnalysis}
               entityNames={entityNames}
               reportDate={reportDate}
            />
         );
      },
      [date, entityId, intl, loanAnalysisQuery, orientation]
   );
}
