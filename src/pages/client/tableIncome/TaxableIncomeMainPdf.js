// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import moment from 'moment/moment';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import {useEffect} from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import {DATA_FIELD} from '../../../fhg/components/pdf/TableDataCell';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';
import useTaxableIncomeTotals from './useTaxableIncomeTotals';

const CATEGORY_COLUMN_WIDTH = 240;
const CELL_WIDTH = 145;
const TABLE_WIDTH = CATEGORY_COLUMN_WIDTH + CELL_WIDTH;

function footerCellStyle2(value = 0) {
   return {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      fontWeight: 'bold',
      padding: '2 2',
      color: value >= 0 ? '#527928' : '#AA0B06',
   };
}

const tableStyle = StyleSheet.create({
   cellStyle: {
      // backgroundColor: 'rgba(223,235,209,0.35)',
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: '#707070',
   },
   cellStyle2: {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: '#707070',
      borderRightWidth: 2,
   },
   cellStyleActual: {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: '#707070',
      fontWeight: 'bold',
      borderRightWidth: 2,
   },
   headerCellStyle: {
      backgroundColor: '#F0F5EA',
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
   },
   headerCellStyle2: {
      // backgroundColor: '#F0F5EA',
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
      borderRightWidth: 2,
   },
});
const tableStyle2 = StyleSheet.create({
   headerCellStyleDoubleBorder: {
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontWeight: 'bold',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
      borderRightWidth: 2,
      backgroundColor: '#F0F5EA',
      // borderLeftWidth: 1,
   },
   headerCellSingleBorder: {
      color: '#707070',
      backgroundColor: '#F0F5EA',
      opacity: 1,
      fontFamily: 'montserrat',
      fontWeight: 'bold',
      fontSize: 12,
      padding: '2 2',
      borderRightColor: '#e0e0e0',
      borderRightWidth: 1,
   },
});

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 18,
      paddingTop: 36,
      paddingBottom: 36,
      marginBottom: 8,
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
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      // marginBottom: 'auto',
   },
   column33SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
      // width: '33%',
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
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 8,
   },
   columnSectionMiddle: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 8,
      paddingRight: 8,
   },
   columnSectionRight: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 8,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      maxWidth: '100%',
      minWidth: '50%',
      // width: 'auto',
      justifyContent: 'space-between',
   },
   tableHeaderStyle: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      color: '#707070',
      backgroundColor: '#F0F5EA',
      // justifyContent: 'space-between',
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
      fontSize: 12,
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function TaxableIncomeMainPdf({
   intl,
   orientation = 'landscape',
   cashFlowData,
   entityNames = '',
   reportDate,
}) {
   const incomeAnnualActualTotals = useTaxableIncomeTotals(cashFlowData?.cashFlow?.income);
   const expenseAnnualActualTotals = useTaxableIncomeTotals(cashFlowData?.cashFlow?.expenses);

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

   // Create the columns for the income table.
   const columns = useMemo(() => {
      const columns = [
         {
            Header: formatMessage(intl, 'cashFlow.income.column'),
            headerStyle: tableStyle2.headerCellSingleBorder,
            accessor: 'typeName',
            width: CATEGORY_COLUMN_WIDTH,
            Footer: 'Total Income',
         },
      ];

      columns.push({
         Header: formatMessage(intl, 'taxable.actual.column'),
         headerStyle: tableStyle.headerCellStyle,
         accessor: `annual.actual`,
         width: CELL_WIDTH,
         align: 'right',
         // format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         format: (value, data, field) => {
            const total = data && field === DATA_FIELD ? incomeAnnualActualTotals[data.typeName] || 0 : value;
            return (
               <Text style={{fontWeight: 'bold'}} wrap={false}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, total)}
               </Text>
            );
         },
         Footer: () => incomeAnnualActualTotals.total,
      });

      return columns;
   }, [incomeAnnualActualTotals, intl]);

   // Create the columns for the expense table.
   const expenseColumns = useMemo(() => {
      const columns = [
         {
            Header: formatMessage(intl, 'cashFlow.expense.column'),
            headerStyle: tableStyle2.headerCellSingleBorder,
            accessor: 'typeName',
            width: CATEGORY_COLUMN_WIDTH,
            Footer: 'Total Expense',
            Footer2: 'Taxable Income',
         },
      ];

      columns.push({
         Header: formatMessage(intl, 'taxable.actual.column'),
         headerStyle: tableStyle.headerCellStyle,
         accessor: `annual.actual`,
         width: CELL_WIDTH,
         align: 'right',
         format: (value, data, field) => {
            const total = data && field === DATA_FIELD ? expenseAnnualActualTotals[data.typeName] || 0 : value;
            return (
               <Text style={{fontWeight: 'bold'}} wrap={false}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, total)}
               </Text>
            );
         },
         // format: (value) => (value !== ' ' ? numberFormatter(CURRENCY_FULL_FORMAT, value) : ''),
         footerStyle: footerCellStyle2,
         // Footer: cashFlowData?.cashFlow?.expenseGlobal,
         Footer: () => expenseAnnualActualTotals.total,
         Footer2: () => incomeAnnualActualTotals.total - expenseAnnualActualTotals.total,
      });

      return columns;
   }, [expenseAnnualActualTotals, incomeAnnualActualTotals.total, intl]);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.headerStyle}>
               <Title style={styles.titleStyle}>Taxable Income</Title>
               <Text style={styles.entityNameStyle}>{entityNames}</Text>
               <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM, YYYY')}</Text>
            </View>
            <View style={styles.imageViewStyle}>
               <Image src={METRICS_LOGO} style={styles.imageStyle} />
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16, width: TABLE_WIDTH}]}>
            <TableToPdf
               data={cashFlowData?.cashFlow?.income}
               tableStyle={{tableHeaderStyle: styles.tableHeaderStyle}}
               columns={columns}
               hasFooter
               headerRightBorder
               headerLeftBorder
            />
         </View>
         <View style={[styles.columnSection, {width: TABLE_WIDTH}]}>
            <TableToPdf
               data={cashFlowData?.cashFlow?.expenses}
               columns={expenseColumns}
               hasFooter
               headerRightBorder
               headerLeftBorder
               hasFooter2
            />
         </View>
      </Page>
   );
}
