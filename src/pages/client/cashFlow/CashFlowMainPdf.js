// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {PERCENT_FORMAT} from '../../../Constants';
import {MONTHS_CONVERT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {useEffect} from 'react';
import {formatMessage} from '../../../fhg/utils/Utils';
import get from 'lodash/get';

const CATEGORY_COLUMN_WIDTH = 240;
const CELL_WIDTH = 145;
const PERCENT_COLUMN_WIDTH = 60;

function numberColor(value = 0, currentColor = '#6b9241') {
   return value >= 0 ? currentColor : '#AA0B06';
}

function footerCellStyle(value = 0) {
   return {
      backgroundColor: 'rgba(223,235,209,0.35)',
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: value >= 0 ? '#6b9241' : '#AA0B06',
   };
}

function footerCellStyle2(value = 0) {
   return {
      fontFamily: 'montserrat',
      borderRightColor: '#e0e0e0',
      fontSize: 12,
      padding: '2 2',
      color: value >= 0 ? '#6b9241' : '#AA0B06',
      borderRightWidth: 2,
   };
}

const tableStyle = StyleSheet.create({
   cellStyle: {
      backgroundColor: 'rgba(223,235,209,0.35)',
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
   headerCellStyle: {
      backgroundColor: '#EDF1E7',
      color: '#707070',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
   },
   headerCellStyle2: {
      // backgroundColor: '#EDF1E7',
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
      color: '#6b9241',
      opacity: 1,
      fontFamily: 'montserrat',
      fontSize: 12,
      padding: '2 2',
      borderColor: '#e0e0e0',
      borderRightWidth: 2,
      // borderLeftWidth: 1,
   },
   headerCellSingleBorder: {
      color: '#6b9241',
      opacity: 1,
      fontFamily: 'montserrat',
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
      width: 1710,
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
      width: '100%',
      justifyContent: 'space-between',
   },
   tableHeaderStyle: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
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
export default function CashFlowMainPdf({
   intl,
   orientation = 'landscape',
   cashFlowData,
   entityNames = '',
   reportDate,
   operatingLoanLimit,
   actualOperatingLoanBalance,
   yearEndActualBalance,
   yearEndProjectedBalance,
   targetIncome,
   carryoverIncome,
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

   // Create the columns for the income table.
   const monthColumns = useMemo(() => {
      const monthColumns = [
         {
            Header: '',
            width: CATEGORY_COLUMN_WIDTH,
            headerStyle: tableStyle2.headerCellSingleBorder,
         },
      ];

      const monthOrder = cashFlowData?.cashFlow?.monthOrder;
      for (const month of monthOrder) {
         monthColumns.push({
            Header: MONTHS_CONVERT[month],
            width: CELL_WIDTH * 2,
            align: 'center',
            headerStyle: tableStyle2.headerCellStyleDoubleBorder,
         });
      }
      monthColumns.push({
         Header: MONTHS_CONVERT['annual'],
         width: (CELL_WIDTH + PERCENT_COLUMN_WIDTH) * 2,
         align: 'center',
      });
      return monthColumns;
   }, [cashFlowData?.cashFlow?.monthOrder]);

   // Create the columns for the income table.
   const columns = useMemo(() => {
      const cellDefaultExpected = {
         width: CELL_WIDTH,
         align: 'right',
         style: tableStyle.cellStyle,
         headerStyle: tableStyle.headerCellStyle,
         footerStyle: footerCellStyle,
         format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
      };

      const cellDefaultActual = {
         width: CELL_WIDTH,
         align: 'right',
         style: tableStyle.cellStyle2,
         headerStyle: tableStyle.headerCellStyle2,
         footerStyle: footerCellStyle2,
         format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
      };

      const columns = [
         {
            Header: formatMessage(intl, 'cashFlow.income.column'),
            accessor: 'typeName',
            width: CATEGORY_COLUMN_WIDTH,
            Footer: 'Total Income',
         },
      ];

      const monthOrder = cashFlowData?.cashFlow?.monthOrder;
      for (const month of monthOrder) {
         columns.push(
            {
               Header: formatMessage(intl, 'cashFlow.projected.column'),
               accessor: `${month}.expected`,
               ...cellDefaultExpected,
               Footer: cashFlowData?.cashFlow?.incomeGlobal,
            },
            {
               Header: formatMessage(intl, 'cashFlow.actual.column'),
               accessor: `${month}.actual`,
               ...cellDefaultActual,
               Footer: cashFlowData?.cashFlow?.incomeGlobal,
            }
         );
      }

      columns.push(
         {
            Header: formatMessage(intl, 'cashFlow.projected.column'),
            accessor: `annual.expected`,
            width: CELL_WIDTH,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
            style: tableStyle.cellStyle,
            headerStyle: tableStyle.headerCellStyle,
            footerStyle: footerCellStyle,
            Footer: cashFlowData?.cashFlow?.incomeGlobal,
         },
         {
            Header: formatMessage(intl, 'cashFlow.percent.column'),
            accessor: `annual.expectedPercent`,
            width: PERCENT_COLUMN_WIDTH,
            align: 'right',
            style: tableStyle.cellStyle,
            headerStyle: tableStyle.headerCellStyle,
            footerStyle: tableStyle.cellStyle,
            Footer: '100%',
         },
         {
            Header: formatMessage(intl, 'cashFlow.actual.column'),
            accessor: `annual.actual`,
            width: CELL_WIDTH,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
            Footer: cashFlowData?.cashFlow?.incomeGlobal,
         },
         {
            Header: formatMessage(intl, 'cashFlow.percent.column'),
            accessor: `annual.actualPercent`,
            width: PERCENT_COLUMN_WIDTH,
            align: 'right',
            Footer: '100%',
         }
      );

      return columns;
   }, [cashFlowData?.cashFlow?.incomeGlobal, cashFlowData?.cashFlow?.monthOrder, intl]);

   // Create the columns for the expense table.
   const expenseColumns = useMemo(() => {
      const cellDefaultExpected = {
         width: CELL_WIDTH,
         align: 'right',
         style: tableStyle.cellStyle,
         headerStyle: tableStyle.headerCellStyle,
         footerStyle: footerCellStyle,
         format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
      };
      const cellDefaultActual = {
         width: CELL_WIDTH,
         align: 'right',
         style: tableStyle.cellStyle2,
         headerStyle: tableStyle.headerCellStyle2,
         footerStyle: footerCellStyle2,
         format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
      };

      const columns = [
         {
            Header: formatMessage(intl, 'cashFlow.expense.column'),
            accessor: 'typeName',
            width: CATEGORY_COLUMN_WIDTH,
            Footer: 'Total Expense',
            Footer2: 'Net Cash Flow',
            Footer3: 'Operating Loan Balance',
         },
      ];

      const monthOrder = cashFlowData?.cashFlow?.monthOrder;
      for (const month of monthOrder) {
         columns.push(
            {
               Header: formatMessage(intl, 'cashFlow.projected.column'),
               accessor: `${month}.expected`,
               ...cellDefaultExpected,
               Footer: cashFlowData?.cashFlow?.expenseGlobal,
               Footer2: cashFlowData?.cashFlow?.netCashFlow,
               Footer3: (accessor) => {
                  const item = get(cashFlowData?.cashFlow?.operatingLoanBalance, accessor);
                  return item > 0 ? item : 0;
               },
            },
            {
               Header: formatMessage(intl, 'cashFlow.actual.column'),
               accessor: `${month}.actual`,
               ...cellDefaultActual,
               Footer: cashFlowData?.cashFlow?.expenseGlobal,
               Footer2: cashFlowData?.cashFlow?.netCashFlow,
               Footer3: (accessor) => {
                  const item = get(cashFlowData?.cashFlow?.operatingLoanBalance, accessor);
                  return item > 0 ? item : 0;
               },
            }
         );
      }

      columns.push(
         {
            Header: formatMessage(intl, 'cashFlow.projected.column'),
            accessor: `annual.expected`,
            width: CELL_WIDTH,
            align: 'right',
            format: (value) => (value !== ' ' ? numberFormatter(CURRENCY_FULL_FORMAT, value) : ''),
            style: tableStyle.cellStyle,
            headerStyle: tableStyle.headerCellStyle,
            footerStyle: footerCellStyle,
            Footer: cashFlowData?.cashFlow?.expenseGlobal,
            Footer2: cashFlowData?.cashFlow?.netCashFlow,
            Footer3: ' ',
         },
         {
            Header: formatMessage(intl, 'cashFlow.percent.column'),
            accessor: `annual.expected`,
            width: PERCENT_COLUMN_WIDTH,
            align: 'right',
            format: (value) =>
               value !== ' '
                  ? numberFormatter(
                       PERCENT_FORMAT,
                       (value / cashFlowData?.cashFlow?.incomeGlobal.annual.expected) * 100
                    )
                  : '',
            style: tableStyle.cellStyle,
            headerStyle: tableStyle.headerCellStyle,
            footerStyle: tableStyle.cellStyle,
            Footer: cashFlowData?.cashFlow?.expenseGlobal,
            Footer2: ' ',
            Footer3: ' ',
         },
         {
            Header: formatMessage(intl, 'cashFlow.actual.column'),
            accessor: `annual.actual`,
            width: CELL_WIDTH,
            align: 'right',
            format: (value) => (value !== ' ' ? numberFormatter(CURRENCY_FULL_FORMAT, value) : ''),
            footerStyle: footerCellStyle2,
            Footer: cashFlowData?.cashFlow?.expenseGlobal,
            Footer2: cashFlowData?.cashFlow?.netCashFlow,
            Footer3: ' ',
         },
         {
            Header: formatMessage(intl, 'cashFlow.percent.column'),
            accessor: `annual.actual`,
            width: PERCENT_COLUMN_WIDTH,
            format: (value) =>
               value !== ' '
                  ? numberFormatter(PERCENT_FORMAT, (value / cashFlowData?.cashFlow.incomeGlobal.annual.actual) * 100)
                  : '',
            align: 'right',
            Footer: cashFlowData?.cashFlow?.expenseGlobal,
            Footer2: ' ',
            Footer3: ' ',
         }
      );

      return columns;
   }, [
      cashFlowData?.cashFlow?.expenseGlobal,
      cashFlowData?.cashFlow.incomeGlobal.annual.actual,
      cashFlowData?.cashFlow.incomeGlobal.annual.expected,
      cashFlowData?.cashFlow?.monthOrder,
      cashFlowData?.cashFlow?.netCashFlow,
      cashFlowData?.cashFlow?.operatingLoanBalance,
      intl,
   ]);

   return (
      <Page size='A0' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={[styles.columnSection, {width: '50%'}]}>
               <View style={styles.headerStyle}>
                  <Title style={styles.titleStyle}>Cash Flow</Title>
                  <Text style={styles.entityNameStyle}>{entityNames}</Text>
                  <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM, YYYY')}</Text>
               </View>
               <View style={styles.imageViewStyle}>
                  <Image src={METRICS_LOGO} style={styles.imageStyle} />
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {width: '50%', marginBottom: 16}]}>
            <View style={styles.column33SectionColumn}>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Actual YTD Cashflow</Text>
                  <Text
                     style={[
                        styles.labelStyle,
                        {color: numberColor(cashFlowData?.cashFlow?.actualYTDCashFlow, '#6b9241')},
                     ]}
                  >
                     {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow?.actualYTDCashFlow || 0)}
                  </Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Projected YTD Cashflow</Text>
                  <Text
                     style={[
                        styles.labelStyle,
                        {color: numberColor(cashFlowData?.cashFlow?.expectedYTDCashFlow, '#6b9241')},
                     ]}
                  >
                     {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow?.expectedYTDCashFlow || 0)}
                  </Text>
               </View>
            </View>
            <View style={styles.column33SectionColumn}>
               <View style={styles.columnSectionMiddle}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>Operating Loan Limit</Text>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, operatingLoanLimit)}
                  </Text>
               </View>
               <View style={styles.columnSectionMiddle}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>Year-end Actual LOC Balance</Text>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>
                     {yearEndActualBalance > 0 ? numberFormatter(CURRENCY_FULL_FORMAT, yearEndActualBalance) : 0}
                  </Text>
               </View>
               <View style={styles.columnSectionMiddle}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>Year-end Projected LOC Balance</Text>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>
                     {yearEndProjectedBalance > 0 ? numberFormatter(CURRENCY_FULL_FORMAT, yearEndProjectedBalance) : 0}
                  </Text>
               </View>
            </View>
            <View style={styles.column33SectionColumn}>
               <View style={styles.columnSectionRight}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>LOC January 1st Balance</Text>
                  <Text style={[styles.labelStyle, {color: numberColor(actualOperatingLoanBalance, '#707070')}]}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, actualOperatingLoanBalance)}
                  </Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>Target Income</Text>
                  <Text style={[styles.labelStyle, {color: numberColor(targetIncome, '#707070')}]}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, targetIncome)}
                  </Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={[styles.labelStyle, {color: '#707070'}]}>Carryover Income</Text>
                  <Text style={[styles.labelStyle, {color: numberColor(carryoverIncome, '#707070')}]}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, carryoverIncome)}
                  </Text>
               </View>
            </View>
         </View>
         <View
            style={[
               styles.columnSection,
               {borderBottom: '1pt solid #e0e0e0', borderLeft: '1pt solid #e0e0e0', borderRight: '1pt solid #e0e0e0'},
            ]}
         >
            <TableToPdf
               data={[]}
               columns={monthColumns}
               headerBottomBorder={false}
               headerLeftBorder={false}
               headerRightBorder={false}
               headerTopBorder
            />
         </View>
         <View style={[styles.columnSection, {marginBottom: 16}]}>
            <TableToPdf
               data={cashFlowData?.cashFlow?.income}
               columns={columns}
               hasFooter
               headerRightBorder
               headerLeftBorder
            />
         </View>
         <View style={[styles.columnSection, {borderBottom: '1pt solid #e0e0e0'}]}>
            <TableToPdf
               data={[]}
               columns={monthColumns}
               headerBottomBorder={false}
               headerLeftBorder={false}
               headerRightBorder={false}
               headerTopBorder
            />
         </View>
         <View style={[styles.columnSection]}>
            <TableToPdf
               data={cashFlowData?.cashFlow?.expenses}
               columns={expenseColumns}
               hasFooter
               headerRightBorder
               headerLeftBorder
               hasFooter2
               hasFooter3
            />
         </View>
      </Page>
   );
}
