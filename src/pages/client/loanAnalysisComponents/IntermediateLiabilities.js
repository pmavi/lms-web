import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';

import TypographyFHG from '../../../fhg/components/Typography';
import LoanAnalysisTable from './LoanAnalysisTable';

export default function IntermediateLiabilities({classes, data, onRowSelect}) {

   /**
    * Create the liability columns for the table.
    */
   const columns = useMemo(
      () => {
         return [
            {
               Header: <TypographyFHG id={'loan.intermediate.column'}/>,
               accessor: 'categoryName',
               Footer: <TypographyFHG className={classes.footerStyle} color={'primary'} variant={'h6'} id={'loan.intermediateLiabilities.label'}/>,
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
      <LoanAnalysisTable name={'Intermediate Liabilities'} classes={classes} data={data?.categories} columns={columns} onSelect={onRowSelect}/>
   );
}

