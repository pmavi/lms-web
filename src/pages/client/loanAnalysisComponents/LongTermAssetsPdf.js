import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';

import {formatMessage} from '../../../fhg/utils/Utils';

export default function LongTermAssetsPdf({intl, data, tableStyle}) {
   const longTermData = data?.assets?.longTerm;

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: formatMessage(intl, 'loan.longTerm.column'),
               accessor: 'categoryName',
               Footer: formatMessage(intl, 'loan.longTermLoanValue.column'),
               weighting: 37,
            }, {
               Header: formatMessage(intl, 'loan.marketValue.column'),
               accessor: 'marketValue',
               align: 'right',
               format: value => numberFormatter(CURRENCY_FULL_FORMAT, value),
               weighting: 20,
               Footer: longTermData?.marketValue || 0,
            }, {
               Header: formatMessage(intl, 'loan.loanToValue.column'),
               accessor: 'loanToValue',
               align: 'right',
               format: value => value && numberFormatter('#0.0#%', value),
               weighting: 18,
               Footer: '',
            }, {
               Header: formatMessage(intl, 'loan.bankLoanValue.column'),
               accessor: 'bankLoanValue',
               align: 'right',
               format: value => numberFormatter(CURRENCY_FULL_FORMAT, value),
               weighting: 24,
               Footer: longTermData?.bankLoanValue || 0,
            },
         ]
      }, [intl, longTermData?.bankLoanValue, longTermData?.marketValue]
   );

   return (
      <TableToPdf data={longTermData?.categories} columns={columns} hasFooter tableStyle={tableStyle}/>
   );
}

