import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';

export default function IntermediateLiabilitiesPdf({intl, data, tableStyle}) {
   const liabilitiesIntermediate = data?.liabilities?.intermediate;

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: formatMessage(intl, 'loan.intermediate.column'),
               accessor: 'categoryName',
               Footer: formatMessage(intl, 'loan.intermediateLiabilities.label'),
            }, {
               Header: formatMessage(intl, 'loan.balance.column'),
               accessor: 'currentBalance',
               align: 'right',
               format: value => numberFormatter(CURRENCY_FULL_FORMAT, value),
               Footer: liabilitiesIntermediate?.subtotalLiabilities || 0,
            },
         ]
      }, [intl, liabilitiesIntermediate?.subtotalLiabilities]
   );

   return (
      <TableToPdf data={liabilitiesIntermediate?.categories} columns={columns} hasFooter tableStyle={tableStyle}/>
   );
}

