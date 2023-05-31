import {castArray} from 'lodash';
import sumBy from 'lodash/sumBy';
import moment from 'moment/moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import {MONTH_FORMAT} from '../../../Constants';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import {convertYearToNumber} from './CashFlow';
import CashFlowMainPdf from './CashFlowMainPdf';

const MINIMUM_YEAR = '01-01-1901';

/**
 * Hook to return the pages for the Loan Analysis in a PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useCashFlowPdf(intl, orientation, clientId, entityId, reportDate) {
   const [cashFlowDataLazy] = useLazyQueryFHG(CASH_FLOW_QUERY, {fetchPolicy: 'no-cache'}, 'cashFlow.type');
   const [clientQuery] = useLazyQueryFHG(CLIENT_BY_ID_QUERY, {fetchPolicy: 'no-cache'}, 'client.type');

   const [entityCashFlowQuery] = useLazyQueryFHG(
      ENTITY_CASH_FLOW_ALL_WHERE_QUERY,
      {fetchPolicy: 'network-only'},
      'entity.type'
   );

   return useCallback(
      async (entityNames = '') => {
         const entityIdList = castArray(entityId);
         const clientData = await clientQuery({variables: {clientId}});
         let searchYear = sessionStorage.filterDate ? moment(sessionStorage.filterDate, MONTH_FORMAT) : undefined;
         let fiscalYear;
         const startMonth = clientData?.data?.client.startMonth || 'jan';

         if (startMonth) {
            const fiscalYearStart = moment(`${moment().get('year')}-${startMonth}`, 'YYYY-MMM');
            fiscalYear = moment().isBefore(fiscalYearStart, 'month')
               ? fiscalYearStart.subtract(1, 'year').year()
               : fiscalYearStart.year();
         } else {
            fiscalYear = undefined;
         }
         let year;

         if (!searchYear || !searchYear?.isValid() || searchYear?.isBefore(MINIMUM_YEAR, 'year')) {
            year = fiscalYear || moment().year();
         } else {
            year = searchYear.year();
         }

         let theReportDate = moment(reportDate, MONTH_FORMAT);
         if (!theReportDate.isValid()) {
            theReportDate = moment(reportDate);
         }

         const entityCashFlowData = await entityCashFlowQuery({
            variables: {entityId, year: convertYearToNumber(year)},
         });

         const result = await cashFlowDataLazy({variables: {entityId, year}});

         let actualOperatingLoanBalance;
         let operatingLoanLimit;
         let targetIncome;
         let carryoverIncome;

         if (entityIdList?.length > 1 && entityCashFlowData?.data?.entityCashFlow?.length > 1) {
            const array = entityCashFlowData?.data?.entityCashFlow;
            actualOperatingLoanBalance = sumBy(array, 'actualOperatingLoanBalance');
            operatingLoanLimit = sumBy(array, 'operatingLoanLimit');
            targetIncome = sumBy(array, 'targetIncome');
            carryoverIncome = sumBy(array, 'carryoverIncome');
         } else {
            const entityCashFlow = entityCashFlowData?.data?.entityCashFlow?.[0];
            actualOperatingLoanBalance = entityCashFlow?.actualOperatingLoanBalance;
            operatingLoanLimit = entityCashFlow?.operatingLoanLimit;
            targetIncome = entityCashFlow?.targetIncome;
            carryoverIncome = entityCashFlow?.carryoverIncome;
         }

         const yearEndActualBalance = result?.data?.cashFlow?.actualOperatingLoanBalanceEnd;
         const yearEndProjectedBalance = result?.data?.cashFlow?.expectedOperatingLoanBalanceEnd;

         return (
            <CashFlowMainPdf
               intl={intl}
               orientation={orientation}
               cashFlowData={result.data}
               entityNames={entityNames}
               reportDate={theReportDate}
               actualOperatingLoanBalance={actualOperatingLoanBalance}
               operatingLoanLimit={operatingLoanLimit}
               yearEndActualBalance={yearEndActualBalance}
               yearEndProjectedBalance={yearEndProjectedBalance}
               targetIncome={targetIncome}
               carryoverIncome={carryoverIncome}
            />
         );
      },
      [cashFlowDataLazy, clientId, clientQuery, entityCashFlowQuery, entityId, intl, orientation, reportDate]
   );
}
