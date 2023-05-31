import * as React from 'react';
import TableCell from './TableCell';
import get from 'lodash/get';

export const DATA_FIELD = 'Data';

/**
 * This component is used to display data in the {@see TableRow} component.
 */
export default function TableDataCell({data, getContent, column, ...props}) {
   const value = column?.accessor ? get(data, column.accessor) : getContent ? getContent(data) : data;
   const content = column?.format ? column.format(value, data, DATA_FIELD) : value;

   return (
      <TableCell {...props} weighting={column.weighting} width={column.width} textAlignment={column.align || 'left'}>
         {content}
      </TableCell>
   );
}
