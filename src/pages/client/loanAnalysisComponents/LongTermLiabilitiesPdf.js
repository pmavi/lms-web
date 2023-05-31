import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';

export default function LongTermLiabilitiesPdf({intl, data, tableStyle}) {
   const liabilitiesLongTerm = data?.liabilities?.longTerm;

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: formatMessage(intl, 'loan.longTerm.column'),
               accessor: 'categoryName',
               Footer: formatMessage(intl, 'loan.longTermLiabilities.label'),
            }, {
               Header: formatMessage(intl, 'loan.balance.column'),
               accessor: 'currentBalance',
               align: 'right',
               format: value => numberFormatter(CURRENCY_FULL_FORMAT, value),
               Footer: liabilitiesLongTerm?.subtotalLiabilities || 0,
            },
         ]
      }, [intl, liabilitiesLongTerm?.subtotalLiabilities]
   );

   return (
      <TableToPdf data={liabilitiesLongTerm?.categories} columns={columns} hasFooter tableStyle={tableStyle}/>
   );
}

