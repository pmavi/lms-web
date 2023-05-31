import * as PropTypes from 'prop-types';
import React from 'react';
import Grid from '../../../fhg/components/Grid';
import TableFHG from '../../../fhg/components/table/TableFHG';

export default function LoanAnalysisTable({name, classes, data, columns, onSelect}) {

   const tableData = data || [{}];
   return <Grid name={name+' table'} item xs={12}>
      <div className={classes.frameStyle}>
         <TableFHG name={'Loan Analysis ' + name} data={tableData}
                   columns={columns} classes={{
            root: classes.root,
            tableHeadRoot: classes.tableHeadRoot,
            tableHeadStyle: classes.tableHeadStyle,
            headerStyle: classes.headerStyle,
         }} hasShadow={false} stickyHeader={false} totalPath={undefined} stickyExternal={false}
                   onSelect={onSelect}/>
      </div>
   </Grid>;
}

LoanAnalysisTable.propTypes = {
   className: PropTypes.any,
   data: PropTypes.any,
   columns: PropTypes.any,
   root: PropTypes.any,
   tableHeadStyle: PropTypes.any,
   headerStyle: PropTypes.any,
   onSelect: PropTypes.any
};
