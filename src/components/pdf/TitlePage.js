import {Page, Text, View, Image, StyleSheet} from '@react-pdf/renderer';
import {join} from 'lodash';
import moment from 'moment';
import React from 'react';
import {TAXABLE_INCOME_INDEX} from '../../Constants';
import {
   ASSET_INDEX,
   ACCOUNTABILITY_CHART_INDEX,
   CONTRACTS_INDEX,
   CASH_FLOW_INDEX,
   BALANCE_SHEET_INDEX,
   LOAN_ANALYSIS_INDEX,
   LIABILITY_INDEX,
} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {LOGO_LARGEST} from '../../Constants';
import {formatMessage} from '../../fhg/utils/Utils';

const styles = StyleSheet.create({
   section: {
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: 'merriweather',
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
      '@media orientation portrait': {
         height: '60%',
      },
   },
   logo: {
      '@media orientation portrait': {
         marginBottom: 30,
         width: 300,
      },
      '@media orientation: landscape': {
         marginLeft: 'auto',
         marginRight: 'auto',
         marginBottom: 10,
         width: 400,
      },
   },
   titleStyle: {
      fontSize: 20,
      textAlign: 'center',
      paddingLeft: 20,
      paddingRight: 20,
      '@media orientation portrait': {
         marginBottom: 23,
      },
      '@media orientation: landscape': {
         marginBottom: 10,
      },
   },
   timeStyle: {
      fontSize: 13,
      textAlign: 'center',
   },
   clientStyle: {
      textAlign: 'left',
      marginLeft: 20,
      fontSize: 10,
   },
});

/**
 * Title page for PDF documents.
 *
 * @param intl The intl object for localization.
 * @param orientation The orientation for the PDF page.
 * @param types The PDF document types selected to be exported.
 * @param historyDate The date used for the document.
 * @param entityNames The name of the entities selected for the PDF documents.
 * @param clientData The client information needed for the title page.
 * @return {JSX.Element} The Title Page component.
 * @constructor
 */
export default function TitlePage({intl, orientation, types, historyDate, entityNames, clientData}) {
   /**
    * Combine the selected PDF document types to be displayed.
    * @return {string} The type title.
    */
   const getTypeTitle = () => {
      let titles = [];

      if (types[ACCOUNTABILITY_CHART_INDEX]) {
         titles.push(formatMessage(intl, 'export.accountabilityChart.title'));
      }
      if (types[ASSET_INDEX]) {
         titles.push(formatMessage(intl, 'export.asset.title'));
      }
      if (types[BALANCE_SHEET_INDEX]) {
         titles.push(formatMessage(intl, 'export.balanceSheet.title'));
      }
      if (types[CASH_FLOW_INDEX]) {
         titles.push(formatMessage(intl, 'export.cashFlow.title'));
      }
      if (types[CONTRACTS_INDEX]) {
         titles.push(formatMessage(intl, 'export.contracts.title'));
      }
      if (types[LIABILITY_INDEX]) {
         titles.push(formatMessage(intl, 'export.liability.title'));
      }
      if (types[LOAN_ANALYSIS_INDEX]) {
         titles.push(formatMessage(intl, 'export.loanAnalysis.title'));
      }
      if (types[TAXABLE_INCOME_INDEX]) {
         titles.push(formatMessage(intl, 'export.taxableIncome.title'));
      }

      return join(titles, ', ');
   };

   return (
      <Page size='LETTER' orientation={orientation} style={styles.section} wrap={false}>
         <View
            style={{
               marginLeft: 20,
               flex: '0 0 auto',
               width: 30,
               borderRight: '20px solid rgb(107,146,65)',
               height: '100%',
            }}
         ></View>
         <View style={{flex: '1 1 100%', display: 'flex', justifyContent: 'space-around'}}>
            <Image style={styles.logo} src={LOGO_LARGEST} />
            <View
               style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
               }}
            >
               <Text style={styles.titleStyle}>{getTypeTitle()}</Text>
               <Text style={styles.titleStyle}>{entityNames}</Text>
               <Text style={styles.timeStyle}>{moment(historyDate).format(MONTH_FORMAT)}</Text>
            </View>
            <View
               style={{
                  marginTop: '25%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
               }}
            >
               <Text style={[styles.clientStyle]}>{clientData?.name}</Text>
               <Text style={[styles.clientStyle]}>{clientData?.addressLineOne}</Text>
               <Text style={[styles.clientStyle]}>{clientData?.addressLineTwo}</Text>
               <Text style={[styles.clientStyle]}>
                  {clientData?.city?.name}, {clientData?.state?.name} {clientData?.zipCode}
               </Text>
            </View>
         </View>
         <View
            style={{
               marginRight: 20,
               borderLeft: '40px solid #F1F4ED',
               flex: '0 0 auto',
               width: 25,
               height: '100%',
            }}
         ></View>
      </Page>
   );
}
