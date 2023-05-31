import useTheme from '@material-ui/core/styles/useTheme';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';

import TypographyFHG from '../../../fhg/components/Typography';
import LoanAnalysisTable from './LoanAnalysisTable';

export default function CurrentAssets({classes, data, onRowSelect}) {
   const theme = useTheme();

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: <TypographyFHG id={'loan.current.column'}/>,
               accessor: 'categoryName',
               Footer: <TypographyFHG className={classes.footerStyle} color={'primary'} variant={'h6'} id={'loan.currentLoanValue.column'}/>,
            }, {
               Header: <TypographyFHG id={'loan.marketValue.column'}/>,
               accessor: 'marketValue',
               Cell: ({row}) => <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT,
                  row.values?.marketValue)}</div>,
               Footer: (
                  <div className={classes.footerStyle} style={{
                     textAlign: 'right',
                     color: (data?.marketValue || 0) >= 0 ? undefined :
                        theme.palette.error.main
                  }}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, data?.marketValue || 0)}
                  </div>
               ),
            }, {
               Header: <TypographyFHG id={'loan.loanToValue.column'}/>,
               accessor: 'loanToValue',
               Cell: ({row}) => <div style={{textAlign: 'right'}}>{numberFormatter('#0.0#%',
                  row.values?.loanToValue)}</div>,
            }, {
               Header: <TypographyFHG id={'loan.bankLoanValue.column'}/>,
               accessor: 'bankLoanValue',
               Cell: ({row}) => <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT,
                  row.values?.bankLoanValue)}</div>,
               Footer: (
                  <div className={classes.footerStyle} style={{
                     textAlign: 'right',
                     color: (data?.bankLoanValue || 0) >= 0 ? undefined :
                        theme.palette.error.main
                  }}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, data?.bankLoanValue || 0)}
                  </div>
               ),
            },
         ]
      }, [data, theme.palette.error.main, classes.footerStyle]
   );

   return (
      <LoanAnalysisTable name={'Current Assets'} classes={classes} data={data?.categories} columns={columns} onSelect={onRowSelect}/>
   );
}

