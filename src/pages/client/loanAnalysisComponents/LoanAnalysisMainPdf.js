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
import {useEffect} from 'react';
import {formatMessage} from '../../../fhg/utils/Utils';
import CurrentAssetsPdf from './CurrentAssetsPdf';
import CurrentLiabilitiesPdf from './CurrentLiabilitiesPdf';
import IntermediateAssetsPdf from './IntermediateAssetsPdf';
import IntermediateLiabilitiesPdf from './IntermediateLiabilitiesPdf';
import LongTermAssetsPdf from './LongTermAssetsPdf';
import LongTermLiabilitiesPdf from './LongTermLiabilitiesPdf';

function numberStyle(value, defaultStyle, defaultColor = '#6b9241') {
   return {
      ...defaultStyle,
      color: value < 0 ? '#AA0B06' : defaultColor,
   };
}

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 8,
      paddingTop: 36,
      paddingBottom: 36,
      marginBottom: 50,
      paddingRight: 8,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   fullWidthHeader: {
      flexDirection: 'column',
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
   labelStyle: {
      color: '#6b9241',
      fontSize: 12,
      flexGrow: 0,
      flexShrink: 0,
   },
   labelBoldStyle: {
      color: '#6b9241',
      fontSize: 12,
      fontWeight: 'bold',
      flexGrow: 0,
      flexShrink: 0,
   },
   labelStyleDim: {
      color: '#707070',
      fontSize: 12,
      flexGrow: 0,
      flexShrink: 0,
   },
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      // marginBottom: 'auto',
   },
   column60SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '60%',
      // marginBottom: 'auto',
   },
   column40SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '40%',
      // marginBottom: 'auto',
   },
   column55SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '55%',
      // marginBottom: 'auto',
   },
   column45SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '45%',
      // marginBottom: 'auto',
   },
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 32,
   },
   columnSectionRight: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 32,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   borderBottom: {
      borderColor: '#6b9241',
      borderWidth: 1,
   },
   totalRowStyle: {
      display: 'flex',
      fontSize: 10,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'flex-end',
      marginBottom: 8,
      marginTop: 'auto',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'montserrat',
      fontSize: 12,
   },
});

const tableStyle = StyleSheet.create({
   headerCellStyle: {
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 10,
      // fontWeight: 'bold',
      marginTop: 'auto',
      marginBottom: 'auto',
   },
   footerCellStyle: {
      color: '#6b9241',
      fontFamily: 'montserrat',
      fontSize: 11,
      borderRightColor: '#e0e0e0',
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function LoanAnalysisMainPdf({intl, orientation = 'landscape', data, entityNames = '', reportDate}) {
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

   const clientLeverage = data?.clientLeverage || 0;
   const totalBankSafetyNet = data?.totalBankSafetyNet || 0;
   const totalLiabilities = data?.liabilities?.totalLiabilities || 0;
   const totalAssets = data?.assets?.totalAssets || 0;

   const currentAssetData = data?.assets?.current;
   const currentLiabilityData = data?.liabilities.current;
   const intermediateAssetData = data?.assets?.intermediate;
   const intermediateLiabilityData = data?.liabilities.intermediate;
   const longTermAssetData = data?.assets?.longTerm;
   const longTermLiabilityData = data?.liabilities.longTerm;

   const currentBankLoanValue = currentAssetData?.bankLoanValue || 0;
   const intermediateBankLoanValue = intermediateAssetData?.bankLoanValue || 0;
   const longTermBankLoanValue = longTermAssetData?.bankLoanValue || 0;

   const totalAvailable = currentBankLoanValue + intermediateBankLoanValue + longTermBankLoanValue;

   const currentLeveragePosition =
      (currentAssetData?.bankLoanValue || 0) - (currentLiabilityData?.subtotalLiabilities || 0);
   const intermediateLeveragePosition =
      (intermediateAssetData?.bankLoanValue || 0) - (intermediateLiabilityData?.subtotalLiabilities || 0);
   const longTermLeveragePosition =
      (longTermAssetData?.bankLoanValue || 0) - (longTermLiabilityData?.subtotalLiabilities || 0);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.columnSection}>
               <View style={styles.headerStyle}>
                  <Title style={styles.titleStyle}>Loan Analysis</Title>
                  <Text style={styles.entityNameStyle}>{entityNames}</Text>
                  <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM YYYY')}</Text>
               </View>
               <View style={styles.imageViewStyle}>
                  <Image src={METRICS_LOGO} style={styles.imageStyle} />
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16}]}>
            <View style={styles.column55SectionColumn}>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Available Borrowing Power</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAvailable)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Borrowing Power</Text>
                  <Text style={numberStyle(clientLeverage, styles.labelStyle)}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, clientLeverage)}
                  </Text>
               </View>
            </View>
            <View style={styles.column45SectionColumn}>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelStyle}>Total Assets</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAssets)}</Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelStyleDim}>Total Bank Safety Net</Text>
                  <Text style={numberStyle(totalBankSafetyNet, styles.labelStyleDim, '#707070')}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalBankSafetyNet)}
                  </Text>
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]} wrap={false}>
            <View style={[styles.column55SectionColumn, {marginRight: 4}]}>
               <Text style={styles.columnHeader}>Asset Position</Text>
               <CurrentAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
            </View>
            <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
               <Text style={styles.columnHeader}>Debt Position</Text>
               <CurrentLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16}, styles.borderBottom]}>
            <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.currentBorrowingPower.label')}</Text>
            <Text style={numberStyle(currentLeveragePosition, styles.labelBoldStyle)}>
               {numberFormatter(CURRENCY_FULL_FORMAT, currentLeveragePosition)}
            </Text>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]} wrap={false}>
            <View style={[styles.column55SectionColumn, {marginRight: 4}]} wrap={false}>
               <IntermediateAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
            </View>
            <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
               <IntermediateLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16}, styles.borderBottom]}>
            <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.intermediateBorrowingPower.label')}</Text>
            <Text style={numberStyle(intermediateLeveragePosition, styles.labelBoldStyle)}>
               {numberFormatter(CURRENCY_FULL_FORMAT, intermediateLeveragePosition)}
            </Text>
         </View>
         <View wrap={false}>
            <View style={[styles.columnSection, {marginBottom: 8}]}>
               <View style={[styles.column55SectionColumn, {marginRight: 4}]}>
                  <LongTermAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
               <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
                  <LongTermLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
            </View>
            <View style={[styles.columnSection, {marginBottom: 16}, styles.borderBottom]} wrap={false}>
               <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.longTermBorrowingPower.label')}</Text>
               <Text style={numberStyle(longTermLeveragePosition, styles.labelBoldStyle)}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, longTermLeveragePosition)}
               </Text>
            </View>
         </View>
      </Page>
   );
}
