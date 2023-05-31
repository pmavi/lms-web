import {StyleSheet} from '@react-pdf/renderer';
import React from 'react';
import {View} from '@react-pdf/renderer';
import {PRIMARY_COLOR} from '../../../../Constants';

const styles = StyleSheet.create({
   verticalStyle: {
      height: 20,
      marginLeft: 'auto',
      marginRight: 'auto',
   },
   horizontalStyle: {
      display: 'flex',
      width: '100%',
   },
});

/**
 * Component Divider in PDF files. Can show both horizontal or vertical.
 *
 * Reviewed: 8/22/2022
 *
 * @param orientation 'horizontal' or 'vertical'.
 * @param size The thickness of the line.
 * @param color The color of the line.
 * @param isOverlapTop Indicate if the vertical line should be adjusted to up to overlap the horizontal line for the
 *          tree nodes.
 * @return {JSX.Element}
 * @constructor
 */
export default function DividerPdf({orientation, size = 2, color = PRIMARY_COLOR, isOverlapTop = false}) {
   if (orientation === 'vertical') {
      return (
         <View
            style={[styles.verticalStyle, {marginTop: isOverlapTop ? -2 : 0, width: size, backgroundColor: color}]}
         />
      );
   } else {
      return <View style={[styles.horizontalStyle, {height: size, backgroundColor: color}]}></View>;
   }
}
