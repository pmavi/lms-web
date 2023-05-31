import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';

import TypographyFHG from '../../../fhg/components/Typography';
import LoanAnalysisTable from './LoanAnalysisTable';


export default function CurrentLiabilities({classes, data, onRowSelect}) {

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: <TypographyFHG id={'loan.current.column'}/>,
               accessor: 'categoryName',
               Footer: <TypographyFHG color={'primary'} variant={'h6'} id={'loan.currentLiabilities.label'}/>,
            }, {
               Header: <TypographyFHG id={'loan.balance.column'}/>,
               accessor: 'currentBalance',
               Cell: ({row}) => <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT,
                  row.values?.currentBalance)}</div>,
               Footer: (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT,
                        data?.subtotalLiabilities || 0)}
                  </div>
               ),
            },
         ]
      }, [data, classes.footerStyle]
   );

   return (
      <LoanAnalysisTable name={'Current Liabilities'} classes={classes} data={data?.categories} columns={columns} onSelect={onRowSelect}/>
   );
}

