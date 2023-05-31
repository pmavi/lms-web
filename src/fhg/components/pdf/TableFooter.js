import React, {useMemo} from 'react';
import TableRow from './TableRow';

TableFooter.propTypes = {};

export default function TableFooter({
   fontSize,
   textAlign,
   border = '1pt solid black',
   hasLeftBorder = true,
   hasBottomBorder = true,
   hasRightBorder = true,
   hasTopBorder = true,
   children,
   ...props
}) {
   const rowCells = useMemo(() => React.Children.toArray(children), [children]);

   return (
      <TableRow
         {...props}
         key={'footer'}
         hasLeftBorder={hasLeftBorder}
         hasBottomBorder={hasBottomBorder}
         hasRightBorder={hasRightBorder}
         hasTopBorder={hasTopBorder}
         border={border}
      >
         {rowCells.map((rc, columnIndex) =>
            React.cloneElement(rc, {
               ...rc.props,
               isHeader: true,
               fontSize,
               textAlign,
               hasLeftBorder: hasLeftBorder && columnIndex === 0,
               hasRightBorder: hasRightBorder && columnIndex !== rowCells.length - 1,
            })
         )}
      </TableRow>
   );
}
