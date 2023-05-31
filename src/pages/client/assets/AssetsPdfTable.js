// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
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
      marginBottom: 30,
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
   imageViewStyle: {
      display: 'flex',
      flexGrow: 0,
      flexShrink: 0,
      // width: '50%',
   },
   imageStyle: {
      marginLeft: 'auto',
      width: 310,
   },
   headerTitleStyle1: {
      color: '#6b9241',
      fontSize: 14,
      fontWeight: 'bold',
   },
   headerTitleStyle: {
      color: '#707070',
      fontSize: 12,
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function AssetsPdfTable({
   assets,
   orientation = 'landscape',
   columns,
   totalCurrent,
   totalIntermediate,
   totalLong,
   entityName = '',
   historyDate,
}) {
   /**
    * Register the fonts needed for the PDF file.
    * CAVEAT: Only register the fonts once or there will be an error in @react-pdf/renderer.
    */
   useEffect(() => {
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
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1} wrap>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.headerStyle}>
               <Title style={styles.titleStyle}>Schedule of Assets</Title>
               <Text style={styles.entityNameStyle}>{entityName}</Text>
               <Text style={styles.dateStyle}>{moment(historyDate).format('MMMM D, YYYY')}</Text>
               <Text style={styles.headerTitleStyle}>
                  Total Current Assets {numberFormatter(CURRENCY_FULL_FORMAT, totalCurrent)}
               </Text>
               <Text style={styles.headerTitleStyle}>
                  Total Intermediate Assets {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediate)}
               </Text>
               <Text style={styles.headerTitleStyle}>
                  Total Long Term Assets {numberFormatter(CURRENCY_FULL_FORMAT, totalLong)}
               </Text>
               <Text style={styles.headerTitleStyle1}>
                  Total Assets {numberFormatter(CURRENCY_FULL_FORMAT, totalLong + totalIntermediate + totalCurrent)}
               </Text>
            </View>
            <View style={styles.imageViewStyle}>
               <Image src={METRICS_LOGO} style={styles.imageStyle} />
            </View>
         </View>
         <TableToPdf data={assets} columns={columns} />
      </Page>
   );
}
