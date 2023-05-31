import React, {useMemo} from 'react';
import TableRow from './TableRow';

TableHeader.propTypes = {};

export default function TableHeader({fontSize, textAlign, border = '1pt solid black', hasLeftBorder=true, hasBottomBorder=true, hasRightBorder=true, hasTopBorder=true, children, ...props}) {
   const rowCells = useMemo(() => React.Children.toArray(children), [children]);

   return (
      <TableRow
         {...props}
         key={'header'}
         hasLeftBorder={hasLeftBorder}
         hasBottomBorder={hasBottomBorder}
         hasRightBorder={hasRightBorder}
         hasTopBorder={hasTopBorder}
         border={border}
      >
         {
            rowCells.map((rc, columnIndex) => React.cloneElement(rc, {
               key: columnIndex,
               isHeader: true,
               fontSize,
               textAlign,
               hasLeftBorder: hasLeftBorder && (columnIndex === 0),
               hasRightBorder: hasRightBorder && (columnIndex !== (rowCells.length - 1))
            }))
         }
      </TableRow>
   );
}
