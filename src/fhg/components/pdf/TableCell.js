import {Text} from '@react-pdf/renderer';
import {useMemo} from 'react';
import * as React from 'react';

/**
 * This component displays the associated content of its children.
 */
export default function TableCell({
   isHeader,
   weighting = 1,
   width,
   style = {},
   border = '1pt solid black',
   textAlignment,
   fontSize,
   hasLeftBorder = false,
   hasRightBorder = true,
   children,
   debug,
   ...viewProps
}) {
   let content = useMemo(() => {
      const textStyles = {
         fontSize: fontSize ?? (style.fontSize ? style.fontSize : isHeader === true ? 14 : 12),
         textAlign: textAlignment,
         wordWrap: 'break-word',
         backgroundColor: style.backgroundColor,
      };
      let content;

      if (typeof children === 'string') {
         content = <Text style={textStyles}>{children}</Text>;
      } else if (typeof children === 'number') {
         content = <Text style={textStyles}>{children.toString()}</Text>;
      } else {
         content = children;
      }
      return content;
   }, [children, fontSize, isHeader, style, textAlignment]);

   const mergedStyles = {
      // @ts-ignore
      justifyContent: 'stretch',
      textAlign: textAlignment,
      fontSize: fontSize ?? (isHeader === true ? 14 : 12),
      borderLeft: hasLeftBorder && border,
      borderRight: hasRightBorder && border,
      wordWrap: 'break-word',
      // whiteSpace: 'pre-wrap',
      ...style,
   };

   if (width) {
      mergedStyles.width = width;
   } else {
      mergedStyles.flex = weighting;
   }
   return (
      <Text style={mergedStyles} wrap={false} debug={debug} {...viewProps}>
         {content}
      </Text>
   );
}
