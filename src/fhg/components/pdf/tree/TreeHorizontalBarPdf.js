import React from 'react';
import {View} from '@react-pdf/renderer';
import {PRIMARY_COLOR} from '../../../../Constants';

/**
 * Component to show the horizontal bar in the tree. For single node: does not display. For left node show middle of
 * node to the right. For right node, from the middle of node to the left. For the middle node the whole width.
 *
 * Reviewed: 8/22/2022
 *
 * @param count The total number of child nodes.
 * @param index the index of the current node.
 * @param size The height of the line.
 * @param color The color of the line.
 * @return {JSX.Element|null}
 * @constructor
 */
export default function TreeHorizontalBarPdf({count, index, size = 2, color = PRIMARY_COLOR}) {
   // Nothing to display for the only node.
   if (count <= 1) {
      return null;
   }
   // If left node, show from middle to the right. The left View doesn't display but fills half of the space.
   if (index === 0) {
      return (
         <View style={{display: 'flex', flex: '1 1 auto', flexDirection: 'row', height: size, width: '100%'}}>
            <View style={{flex: '1 1'}}></View>
            <View style={{flex: '1 1', height: size, backgroundColor: color}} />
         </View>
      );
      // If right node, show from middle to the left. The right View doesn't display but fills half of the space.
   } else if (index === count - 1) {
      return (
         <View style={{display: 'flex', flexDirection: 'row', flex: '1 1 auto', height: size, width: '100%'}}>
            <View style={{flex: '1 1 auto', height: size, backgroundColor: color}} />
            <View style={{flex: '1 1 auto'}}></View>
         </View>
      );
   }
   // If middle node, the Views both display.
   return (
      <View style={{display: 'flex', flexDirection: 'row', flex: '1 1 auto', height: size, width: '100%'}}>
         <View style={{flex: '1 1 auto', height: size, backgroundColor: color}} />
         <View style={{flex: '1 1 auto', height: size, backgroundColor: color}} />
      </View>
   );
}
