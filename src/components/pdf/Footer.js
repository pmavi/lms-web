import moment from 'moment';
import React from 'react';
import {Text, View, Image, StyleSheet} from '@react-pdf/renderer';
import {SMALL_LOGO} from '../../Constants';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';

const styles = StyleSheet.create({
   footerFrame: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: 'center',
   },
   logo: {
      marginLeft: 16,
      width: 120,
   },
});

/**
 * Component for the footer in the PDF documents. Displays the logo - page number - date.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function Footer() {
   return (
      <View
         style={[
            styles.footerFrame,
            {
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               flexDirection: 'row',
               marginRight: 16,
            },
         ]}
         fixed
      >
         <Image style={styles.logo} src={SMALL_LOGO} />
         <Text render={({pageNumber, totalPages}) => `${pageNumber} / ${totalPages}`} fixed />
         <Text>{moment().format(DATE_FORMAT_KEYBOARD)}</Text>
      </View>
   );
}
