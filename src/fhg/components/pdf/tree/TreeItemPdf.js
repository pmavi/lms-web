import React from 'react';
import {StyleSheet, View} from '@react-pdf/renderer';
import {SPACING_DEFAULT_PDF} from '../../../../Constants';
import CardPdf from './CardPdf';
import TreeHorizontalBarPdf from './TreeHorizontalBarPdf';
import DividerPdf from './DividerPdf';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 180;
const BOTTOM_MARGIN = SPACING_DEFAULT_PDF * 4;

const styles = StyleSheet.create({
   borderStyle: {
      border: '1 solid #e0e0e0',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      marginLeft: 'auto',
      marginRight: 'auto',
      backgroundColor: '#FFFFFF',
   },
   frameStyle: {
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      justifyItems: 'center',
      flexDirection: 'column',
      borderRadius: 4,
   },
   childStyle: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      overflow: 'hidden',
      alignItems: 'flex-start',
      marginBottom: BOTTOM_MARGIN,
   },
   childAllFrameStyle: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      paddingLeft: SPACING_DEFAULT_PDF / 2,
      paddingRight: SPACING_DEFAULT_PDF / 2,
      marginLeft: 'auto',
      marginRight: 'auto',
   },
   childSpacingStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 2,
      marginRight: SPACING_DEFAULT_PDF * 2,
   },
});

/**
 * Component representing a tree node in the PDF file.
 *
 * Reviewed: 8/22/2022
 *
 * @param item The item (node) for this level in the tree.
 * @param itemsKey The child items key in the item.
 * @param labelKey The key for the property to display for the title of the node.
 * @param users The list of users associated with the item.
 * @return {JSX.Element}
 * @constructor
 */
export default function TreeItemPdf({item, itemsKey, labelKey, users}) {
   const childItems = item?.[itemsKey] || [];

   return (
      <View style={styles.frameStyle}>
         <View style={styles.borderStyle}>
            <CardPdf item={item} labelKey={labelKey} users={users} />
         </View>
         {childItems?.length > 0 && <DividerPdf orientation={'vertical'} />}
         <View style={styles.childAllFrameStyle}>
            {childItems?.map((child, index) => (
               <View key={index} style={styles.childStyle}>
                  <TreeHorizontalBarPdf count={childItems?.length} index={index} />
                  <DividerPdf orientation={'vertical'} isOverlapTop />
                  <View style={styles.childSpacingStyle}>
                     <TreeItemPdf item={child} itemsKey={itemsKey} labelKey={labelKey} users={users} />
                  </View>
               </View>
            ))}
         </View>
      </View>
   );
}
