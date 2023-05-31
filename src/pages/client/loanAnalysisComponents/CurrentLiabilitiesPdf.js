import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';

export default function CurrentLiabilitiesPdf({intl, data, tableStyle}) {
   const liabilitiesCurrent = data?.liabilities?.current;

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: formatMessage(intl, 'loan.current.column'),
               accessor: 'categoryName',
               Footer: formatMessage(intl, 'loan.currentLiabilities.label'),
            }, {
               Header: formatMessage(intl, 'loan.balance.column'),
               accessor: 'currentBalance',
               align: 'right',
               format: value => numberFormatter(CURRENCY_FULL_FORMAT, value),
               Footer: liabilitiesCurrent?.subtotalLiabilities || 0,
            },
         ]
      }, [intl, liabilitiesCurrent?.subtotalLiabilities]
   );

   return (
      <TableToPdf data={liabilitiesCurrent?.categories} columns={columns} hasFooter tableStyle={tableStyle}/>
   );
}

