import {castArray} from 'lodash';

// noinspection ES6CheckImport
import {map} from 'lodash';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../Constants';
import {CURRENCY_FORMAT} from '../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {LIABILITIES_ENTITY_QUERY} from '../../data/QueriesGL';
import useLazyQueryFHG from '../../fhg/hooks/data/useLazyQueryFHG';
import {formatMessage} from '../../fhg/utils/Utils';
import LiabilitiesPdfTable from './LiabilitiesPdfTable';

/**
 * Liability List component to display  all the current user Liabilities.
 *
 * Reviewed:
 */
export default function useLiabilitiesPdf(intl, orientation, entityIds, historyDate) {
   const [liabilityQuery] = useLazyQueryFHG(LIABILITIES_ENTITY_QUERY);

   return useCallback(
      async (entityName = '') => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);
         const entityIdList = castArray(entityIds);
         async function getLiabilities() {
            const liabilityData = await liabilityQuery({variables: {entityId: entityIds, historyDate: reportDate}});
            const useLiabilities = filter(liabilityData?.data?.liabilities || [], {isRemoved: false});

            const tableLiabilities = map(useLiabilities, (liability) => ({
               ...liability,
               collateralString: liability.isCollateral ? 'Yes' : 'No',
            }));
            return sortBy(tableLiabilities, ['liabilityCategory.name', 'createdDateTime']);
         }

         // Create the columns for the liabilities table.
         const columns = [
            {
               id: 'name',
               Header: formatMessage(intl, 'liability.category.column'),
               weighting: 130,
               accessor: 'liabilityCategory.name',
            },
            {
               id: 'bank',
               Header: formatMessage(intl, 'liability.bank.column'),
               accessor: 'bank.name',
               weighting: 50,
            },
            {
               id: 'description',
               Header: formatMessage(intl, 'liability.description.column'),
               accessor: 'description',
               weighting: 150,
            },
            {
               id: 'interestRate',
               Header: formatMessage(intl, 'liability.interestRate.column'),
               accessor: 'interestRate',
               weighting: 50,
            },
            {
               id: 'payment',
               Header: formatMessage(intl, 'liability.payment.column'),
               accessor: 'payment',
               weighting: 50,
               align: 'right',
               format: (value) => numberFormatter(CURRENCY_FORMAT, value),
            },
            {
               id: 'paymentDueDate',
               Header: formatMessage(intl, 'liability.paymentDueDate.column'),
               accessor: 'paymentDueDate',
               weighting: 50,
            },
            {
               id: 'paymentMaturityDate',
               Header: formatMessage(intl, 'liability.paymentMaturityDate.column'),
               accessor: 'paymentMaturityDate',
               weighting: 50,
            },
            {
               id: 'collateralString',
               Header: formatMessage(intl, 'liability.collateral.column'),
               accessor: 'collateralString',
               weighting: 45,
            },
            {
               id: 'amount',
               Header: formatMessage(intl, 'liability.amount.column'),
               accessor: 'amount',
               weighting: 60,
               align: 'right',
               format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
            },
         ];

         if (entityIdList?.length > 1) {
            columns.push({
               id: 'entity',
               Header: formatMessage(intl, 'asset.entity.column'),
               accessor: 'entity.name',
               weighting: 60,
            });
         }

         const liabilities = await getLiabilities();
         const total = liabilities?.length > 0 ? sumBy(liabilities, 'amount') : 0;

         return (
            <LiabilitiesPdfTable
               orientation={orientation}
               liabilities={liabilities}
               columns={columns}
               total={total}
               entityName={entityName}
               historyDate={reportDate}
            />
         );
      },
      [entityIds, historyDate, intl, liabilityQuery, orientation]
   );
}
