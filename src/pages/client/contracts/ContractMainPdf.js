// noinspection ES6CheckImport
import {Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';
import {Title} from '../../../components/pdf/TableOfContents';

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 10,
      paddingTop: 36,
      paddingBottom: 50,
      paddingRight: 10,
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
   },
   imageStyle: {
      marginLeft: 'auto',
      width: 310,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'montserrat',
      fontSize: 14,
   },
});

/**
 * Contracts PDF component to display all the contracts.
 *
 * Reviewed:
 */
export default function ContractMainPdf({
   intl,
   orientation = 'landscape',
   cashContracts,
   futureContracts,
   hedgeContracts,
   entityNames = '',
   reportDate,
   isEntityList = false,
}) {
   /**
    * Create the columns for the contracts table.
    */
   const cashColumns = useMemo(() => {
      const columns = [
         {
            accessor: 'crop',
            Header: formatMessage(intl, 'contract.crop.column'),
            weighting: 20,
         },
         {
            accessor: 'isNew',
            Header: formatMessage(intl, 'contract.new.column'),
            weighting: 5,
            format: (isNew) => (isNew ? 'Yes' : 'No'),
         },
         {
            accessor: 'bushelsSold',
            Header: formatMessage(intl, 'contract.bushelsSold.column'),
            align: 'right',
            weighting: 15,
         },
         {
            accessor: 'price',
            Header: formatMessage(intl, 'contract.price.column'),
            weighting: 8,
            align: 'right',
            format: (price) => numberFormatter(CURRENCY_FULL_FORMAT, price),
         },
         {
            accessor: 'deliveryMonth',
            Header: formatMessage(intl, 'contract.deliveryMonth.column'),
            weighting: 10,
            format: (deliveryMonth) => (deliveryMonth ? moment(deliveryMonth, 'M').format('MMM') : 'N/A'),
         },
         {
            accessor: 'deliveryLocation',
            Header: formatMessage(intl, 'contract.deliveryLocation.column'),
            weighting: 8,
         },
         {
            accessor: 'contractNumber',
            Header: formatMessage(intl, 'contract.contractNumber.column'),
            weighting: 10,
         },
         {
            accessor: 'isDelivered',
            Header: formatMessage(intl, 'contract.delivered.column'),
            weighting: 10,
            format: (isDelivered) => (isDelivered ? 'Yes' : 'No'),
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'contract.value.column'),
            weighting: 10,
            align: 'right',
            format: (data) => {
               const sum = (data?.bushelsSold || 0) * (data?.price || 0);
               return numberFormatter(CURRENCY_FULL_FORMAT, sum);
            },
         },
      ];

      if (isEntityList) {
         columns.push({
            id: 'entity',
            Header: formatMessage(intl, 'asset.entity.column'),
            accessor: 'entity.name',
            weighting: 60,
         });
      }

      return columns;
   }, [intl, isEntityList]);

   /**
    * Create the columns for the futures contracts table.
    */
   const futureColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: formatMessage(intl, 'contract.crop.column'),
            weighting: 10,
         },
         {
            accessor: 'bushels',
            Header: formatMessage(intl, 'contract.bushels.column'),
            align: 'right',
            weighting: 8,
         },
         {
            id: 'monthYear',
            Header: formatMessage(intl, 'contract.monthYear.column'),
            weighting: 10,
            format: (data) => `${data?.month}/${data?.year}`,
         },
         {
            accessor: 'futuresPrice',
            Header: formatMessage(intl, 'contract.futurePrice.column'),
            weighting: 8,
            align: 'right',
            format: (futuresPrice) => numberFormatter(CURRENCY_FULL_FORMAT, futuresPrice),
         },
         {
            accessor: 'estimatedBasis',
            Header: formatMessage(intl, 'contract.estimatedBasis.column'),
            weighting: 8,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
         {
            accessor: 'cashPrice',
            Header: formatMessage(intl, 'contract.cashPrice.column'),
            weighting: 8,
            align: 'right',
            format: (cashPrice) => numberFormatter(CURRENCY_FULL_FORMAT, cashPrice),
         },
         {
            accessor: 'contractNumber',
            Header: formatMessage(intl, 'contract.contractNumber.column'),
            weighting: 8,
         },
         {
            accessor: 'deliveryLocation',
            Header: formatMessage(intl, 'contract.deliveryLocation.column'),
            weighting: 7,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'contract.value.column'),
            weighting: 10,
            format: (data) => {
               const sum = (data?.bushels || 0) * (data?.cashPrice || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, [intl]);

   /**
    * Create the columns for the hedges contracts table.
    */
   const hedgeColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: formatMessage(intl, 'contract.crop.column'),
            weighting: 15,
         },
         {
            accessor: 'bushels',
            Header: formatMessage(intl, 'contract.bushels.column'),
            align: 'right',
            weighting: 10,
         },
         {
            accessor: 'strikePrice',
            Header: formatMessage(intl, 'contract.strikePrice.column'),
            weighting: 10,
            align: 'right',
            format: (strikePrice) => numberFormatter(CURRENCY_FULL_FORMAT, strikePrice),
         },
         {
            accessor: 'strikeCost',
            Header: formatMessage(intl, 'contract.strikeCost.column'),
            weighting: 10,
            align: 'right',
            format: (strikeCost) => numberFormatter(CURRENCY_FULL_FORMAT, strikeCost),
         },
         {
            id: 'futuresMonth',
            Header: formatMessage(intl, 'contract.futureMonth.column'),
            weighting: 10,
            format: (data) => `${data?.month}/${data?.year}`,
         },
         {
            accessor: 'currentMarketValue',
            Header: formatMessage(intl, 'contract.currentMarketValue.column'),
            weighting: 8,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
         {
            accessor: 'contractNumber',
            Header: formatMessage(intl, 'contract.contractNumber.column'),
            weighting: 10,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'contract.value.column'),
            weighting: 10,
            format: (data) => {
               const sum = (data?.bushels || 0) * (data?.currentMarketValue || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, [intl]);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.columnSection}>
               <View style={styles.headerStyle}>
                  <Title style={styles.titleStyle}>Contracts</Title>
                  <Text style={styles.entityNameStyle}>{entityNames}</Text>
                  <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM YYYY')}</Text>
               </View>
               <View style={styles.imageViewStyle}>
                  <Image src={METRICS_LOGO} style={styles.imageStyle} />
               </View>
            </View>
         </View>
         <View style={{marginBottom: 16}} bookmark={'Cash Contracts'}>
            <Title fixed style={styles.columnHeader}>
               {formatMessage(intl, 'contract.cashContracts.label', 'Cash Contracts')}
            </Title>
            <TableToPdf data={cashContracts} columns={cashColumns} />
         </View>
         <View style={{marginBottom: 16}} bookmark={'Futures Contracts'}>
            <Title style={styles.columnHeader}>
               {formatMessage(intl, 'contract.futures.label', 'Futures Contracts')}
            </Title>
            <TableToPdf data={futureContracts} columns={futureColumns} />
         </View>
         <View bookmark={'Hedges Contracts'}>
            <Title style={styles.columnHeader}>
               {formatMessage(intl, 'contract.hedges.label', 'Hedges Contracts')}
            </Title>
            <TableToPdf data={hedgeContracts} columns={hedgeColumns} />
         </View>
      </Page>
   );
}
