import * as React from 'react';
import {useMemo} from 'react';
import TableRow from './TableRow';

/**
 * This component displays the data as {@see TableRow}s.
 */
export default function TableBody ({data:dataRows = [], hasLeftBorder = true, hasBottomBorder = true, hasRightBorder = true, border, striped=false, children, ...props}) {
   const rowCells = useMemo(() => React.Children.toArray(children), [children]);

   return (
      (dataRows).map((data, rowIndex) => (
         <TableRow
            {...props}
            key={rowIndex}
            data={data}
            hasLeftBorder={hasLeftBorder}
            hasBottomBorder={hasBottomBorder}
            hasRightBorder={hasRightBorder}
            hasTopBorder={false}
            border={border}
            darker={striped && (rowIndex % 2)}
         >
            {rowCells}
         </TableRow>
      ))
   );
}
