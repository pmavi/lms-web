// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import {sumBy} from 'lodash';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {useEffect} from 'react';
import {formatMessage} from '../../../fhg/utils/Utils';

function numberStyle(value = 0) {
   return {
      color: value < 0 ? '#AA0B06' : '#6b9241',
      fontSize: 14,
      flexGrow: 0,
      flexShrink: 0,
   };
}

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 18,
      paddingTop: 36,
      paddingBottom: 36,
      paddingRight: 18,
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
      fontSize: 14,
      flexGrow: 0,
      flexShrink: 0,
   },
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      // marginBottom: 'auto',
   },
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 8,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   totalRowStyle: {
      display: 'flex',
      fontSize: 12,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'flex-end',
      marginBottom: 8,
      marginTop: 'auto',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'montserrat',
      fontSize: 14,
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function BalanceSheetMainPdf({intl, orientation = 'portrait', data, entityNames = '', reportDate}) {
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

   // Create the asset columns for the table.
   const assetColumns = useMemo(() => {
      return [
         {
            id: 'currentAssets',
            Header: formatMessage(intl, 'balance.currentAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the intermediate assets table.
   const assetIntermediateColumns = useMemo(() => {
      return [
         {
            id: 'intermediate',
            Header: formatMessage(intl, 'balance.intermediateTermAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the long term assets table.
   const assetLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTerm',
            Header: formatMessage(intl, 'balance.longTermAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the asset columns for the table.
   const liabilityColumns = useMemo(() => {
      return [
         {
            id: 'currentLiabilities',
            Header: formatMessage(intl, 'balance.currentLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the intermediate liabilities table.
   const liabilityIntermediateColumns = useMemo(() => {
      return [
         {
            id: 'intermediateLiabilities',
            Header: formatMessage(intl, 'balance.intermediateLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the long term liabilities table.
   const liabilityLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTermLiabilities',
            Header: formatMessage(intl, 'balance.longTermLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   const assetsCurrent = data?.assets?.current?.categories || [{}];
   const assetsIntermediate = data?.assets?.intermediate?.categories || [{}];
   const assetsLongTerm = data?.assets?.longTerm?.categories || [{}];
   const liabilitiesCurrent = data?.liabilities?.current?.categories || [{}];
   const liabilitiesIntermediate = data?.liabilities?.intermediate?.categories || [{}];
   const liabilitiesLongTerm = data?.liabilities?.longTerm?.categories || [{}];
   const totalCurrentAssets = sumBy(assetsCurrent, 'total');
   const totalIntermediateAssets = sumBy(assetsIntermediate, 'total');
   const totalLongTermAssets = sumBy(assetsLongTerm, 'total');
   const totalCurrentLiabilities = sumBy(liabilitiesCurrent, 'total');
   const totalIntermediateLiabilities = sumBy(liabilitiesIntermediate, 'total');
   const totalLongTermLiabilities = sumBy(liabilitiesLongTerm, 'total');

   const {workingCapital, currentRatio, totalEquity, totalLiabilities, totalAssets, equityAssetPercentage} = data || {};

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.columnSection}>
               <View style={styles.headerStyle}>
                  <Title style={styles.titleStyle}>Balance Sheet</Title>
                  <Text style={styles.entityNameStyle}>{entityNames}</Text>
                  <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM YYYY')}</Text>
               </View>
               <View style={styles.imageViewStyle}>
                  <Image src={METRICS_LOGO} style={styles.imageStyle} />
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16}]}>
            <View style={styles.column50SectionColumn}>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Assets</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAssets)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Equity</Text>
                  <Text style={numberStyle(totalEquity)}>{numberFormatter(CURRENCY_FULL_FORMAT, totalEquity)}</Text>
               </View>
            </View>
            <View style={styles.column50SectionColumn}>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyle}>Current Ratio</Text>
                  <Text style={numberStyle(currentRatio)}>{numberFormatter('##0.0#', currentRatio)}</Text>
               </View>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyle}>Working Capital</Text>
                  <Text style={numberStyle(workingCapital)}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, workingCapital)}
                  </Text>
               </View>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyle}>Equity/Asset %</Text>
                  <Text style={numberStyle(equityAssetPercentage)}>
                     {numberFormatter('##0.0#%', equityAssetPercentage)}
                  </Text>
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
               <Text style={styles.columnHeader}>Assets</Text>
               <TableToPdf data={assetsCurrent} columns={assetColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalCurrentAssets)}</Text>
               </View>
            </View>
            <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
               <Text style={styles.columnHeader}>Liabilities</Text>
               <TableToPdf data={liabilitiesCurrent} columns={liabilityColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalCurrentLiabilities)}
                  </Text>
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
               <TableToPdf data={assetsIntermediate} columns={assetIntermediateColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediateAssets)}
                  </Text>
               </View>
            </View>
            <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
               <TableToPdf data={liabilitiesIntermediate} columns={liabilityIntermediateColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediateLiabilities)}
                  </Text>
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
               <TableToPdf data={assetsLongTerm} columns={assetLongTermColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLongTermAssets)}</Text>
               </View>
            </View>
            <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
               <TableToPdf data={liabilitiesLongTerm} columns={liabilityLongTermColumns} />
               <View style={styles.totalRowStyle}>
                  <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                  <Text style={styles.labelStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalLongTermLiabilities)}
                  </Text>
               </View>
            </View>
         </View>
      </Page>
   );
}
