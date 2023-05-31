import {darken} from '@material-ui/core';
import {View} from '@react-pdf/renderer';
import * as React from 'react';
import {useMemo} from 'react';
import get from 'lodash/get';

/**
 * This component describes how to display a row.
 */
export default function TableRow({
   data,
   weighting,
   width,
   style = {},
   fontSize,
   textAlign,
   children,
   border = '1pt solid black',
   hasLeftBorder = true,
   hasBottomBorder = true,
   hasRightBorder = true,
   hasTopBorder = true,
   contentProps,
   darker = false,
   ...props
}) {
   const rowCells = useMemo(() => React.Children.toArray(children), [children]);

   const weightingsPerNotSpecified = useMemo(() => {
      let remainingWeighting = 1;
      let numberOfWeightingsDefined = 0;
      rowCells.forEach((i) => {
         if (i.props.weighting !== undefined) {
            remainingWeighting -= i.props.weighting;
            numberOfWeightingsDefined++;
         }
      });
      return Math.ceil(remainingWeighting / (rowCells.length - numberOfWeightingsDefined));
   }, [rowCells]);

   const content = contentProps && get(data, contentProps);

   if (!contentProps || content) {
      return (
         <View
            // @ts-ignore
            style={{
               borderBottom: hasBottomBorder && border,
               borderTop: hasTopBorder && border,
               width: '100%',
               display: 'flex',
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'stretch',
               ...style,
               backgroundColor: darker
                  ? style.backgroundColor
                     ? darken(style.backgroundColor, 0.1)
                     : style.backgroundColor
                  : undefined,
            }}
            {...props}
         >
            {rowCells.map((rc, columnIndex) =>
               React.cloneElement(rc, {
                  weighting: rc.props.weighting ?? weightingsPerNotSpecified,
                  width: rc.props.width,
                  data: contentProps ? content : data,
                  key: columnIndex,
                  fontSize: fontSize,
                  textAlign: textAlign,
                  hasLeftBorder: hasLeftBorder && columnIndex === 0,
                  hasRightBorder: hasRightBorder,
                  border,
                  ...rc.props,
               })
            )}
         </View>
      );
   } else {
      return null;
   }
}
