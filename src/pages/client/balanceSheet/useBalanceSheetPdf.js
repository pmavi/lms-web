import moment from 'moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {BALANCE_SHEET_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import BalanceSheetMainPdf from './BalanceSheetMainPdf';

/**
 * Hook to return the pages for the Balance Sheet in a PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useBalanceSheetPdf(intl, orientation, entityId, date) {
   const [balanceSheetQuery] = useLazyQueryFHG(BALANCE_SHEET_QUERY);

   return useCallback(
      async (entityNames = '') => {
         let reportDate = moment(date).format(DATE_DB_FORMAT);
         if (reportDate === 'Invalid date') {
            reportDate = moment(date, MONTH_FORMAT).format(DATE_DB_FORMAT);
         }
         const balanceSheetData = await balanceSheetQuery({variables: {entityId, date: reportDate}});

         return (
            <BalanceSheetMainPdf
               intl={intl}
               orientation={orientation}
               data={balanceSheetData?.data?.balanceSheet}
               entityNames={entityNames}
               reportDate={reportDate}
            />
         );
      },
      [balanceSheetQuery, date, entityId, intl, orientation]
   );
}
