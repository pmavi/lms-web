import * as React from 'react';
import {resultOf} from '../../utils/Utils';
import TableCell from './TableCell';
import get from 'lodash/get';

/**
 * This component is used to display footer in the {@see TableRow} component.
 * Content is from column.Footer and can be a function or value.
 */
export default function TableFooterCell({dataProp, getContent, column, style, field = 'Footer', ...props}) {
   const type = typeof column[field];
   const value =
      type === 'function'
         ? column[field](column.accessor, dataProp)
         : type === 'object'
         ? get(column[field], column.accessor)
         : column[field];
   const content = column?.format ? column.format(value, dataProp, field) : value;
   const useStyle = resultOf(style, value);

   return (
      <TableCell
         {...props}
         style={useStyle}
         weighting={column.weighting}
         width={column.width}
         textAlignment={column.align || 'left'}
      >
         {content}
      </TableCell>
   );
}
