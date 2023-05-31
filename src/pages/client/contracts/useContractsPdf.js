import {castArray} from 'lodash';

// noinspection ES6CheckImport
import filter from 'lodash/filter';
import moment from 'moment';
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {HEDGE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {FUTURE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import ContractMainPdf from './ContractMainPdf';

/**
 * Hook to return the pages for the contracts in a PDF document. All of the data is queried.
 *
 * Reviewed:
 */
export default function useContractsPdf(intl, orientation, entityId, historyDate) {
   const [cashContractsQuery] = useLazyQueryFHG(CASH_CONTRACTS_ENTITY_QUERY);
   const [futureContractsQuery] = useLazyQueryFHG(FUTURE_CONTRACTS_ENTITY_QUERY);
   const [hedgeContractsQuery] = useLazyQueryFHG(HEDGE_CONTRACTS_ENTITY_QUERY);

   return useCallback(
      async (entityNames = '') => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);
         const entityIdList = castArray(entityId);
         const cashContractsData = await cashContractsQuery({variables: {entityId, historyDate: reportDate}});
         const cashContracts = filter(cashContractsData?.data?.cashContracts || [], {isRemoved: false});

         const futureContractsData = await futureContractsQuery({variables: {entityId, historyDate: reportDate}});
         const futureContracts = filter(futureContractsData?.data?.futureContracts || [], {isRemoved: false});

         const hedgeContractsData = await hedgeContractsQuery({variables: {entityId, historyDate: reportDate}});
         const hedgeContracts = filter(hedgeContractsData?.data?.hedgeContracts || [], {isRemoved: false});

         return (
            <ContractMainPdf
               intl={intl}
               orientation={orientation}
               cashContracts={cashContracts}
               futureContracts={futureContracts}
               hedgeContracts={hedgeContracts}
               entityNames={entityNames}
               reportDate={historyDate}
               isEntityList={entityIdList?.length > 1}
            />
         );
      },
      [cashContractsQuery, entityId, futureContractsQuery, hedgeContractsQuery, historyDate, intl, orientation]
   );
}
