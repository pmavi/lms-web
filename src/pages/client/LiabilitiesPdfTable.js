// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React from 'react';
import Footer from '../../components/pdf/Footer';
import {Title} from '../../components/pdf/TableOfContents';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {METRICS_LOGO} from '../../Constants';
import TableToPdf from '../../fhg/components/pdf/TableToPdf';
import {useEffect} from 'react';

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 18,
      paddingTop: 36,
      paddingBottom: 50,
      paddingRight: 18,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   fullWidthHeader: {
      flexDirection: 'row',
      display: 'flex',
      width: '100%',
   },
   titleStyle: {
      color: '#6b9241',
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 16,
      // marginBottom: 1,
   },
   dateStyle: {
      fontSize: 12,
      marginBottom: 16,
   },
   entityNameStyle: {
      fontSize: 12,
   },
   headerStyle: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
   },
   imageStyle: {
      display: 'flex',
      flexGrow: 0,
      flexShrink: 0,
      // width: '50%',
   },
   headerTitleStyle1: {
      color: '#6b9241',
      fontSize: 14,
      fontWeight: 'bold',
   },
});

/**
 * Liabilities table component to display all the current user Liabilities.
 *
 * Reviewed: 5/28/21
 */
export default function LiabilitiesPdfTable({
   liabilities,
   orientation = 'landscape',
   columns,
   total,
   entityName = '',
   historyDate,
}) {
   /**
    * Register the fonts needed for the PDF file.
    * CAVEAT: Only register the fonts once or there will be an error in @react-pdf/renderer.
    */
   useEffect(() => {
      // Can only be called once.
      if (indexOf(Font.getRegisteredFontFamilies(), 'montserrat') < 0) {
         Font.register({
            family: 'montserrat',
            fonts: [
               {src: '/fonts/montserrat-regular-webfont.ttf'}, // font-style: normal, font-weight: normal
               {src: '/fonts/montserrat-bold-webfont.ttf', fontWeight: 700},
            ],
         });
      }
   }, []);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.headerStyle}>
               <Title style={styles.titleStyle}>Schedule of Liabilities</Title>
               <Text style={styles.entityNameStyle}>{entityName}</Text>
               <Text style={styles.dateStyle}>{moment(historyDate).format('MMMM, YYYY')}</Text>
               <Text style={styles.headerTitleStyle1}>
                  Total Liabilities {numberFormatter(CURRENCY_FULL_FORMAT, total)}
               </Text>
            </View>
            <View style={styles.imageStyle}>
               <Image src={METRICS_LOGO} style={{marginLeft: 'auto', width: 310}} />
            </View>
         </View>
         <TableToPdf data={liabilities} columns={columns} />
      </Page>
   );
}
