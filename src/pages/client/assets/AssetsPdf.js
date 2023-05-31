// noinspection ES6CheckImport
import {Document, Font} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {useEffect} from 'react';
import {formatMessage} from '../../../fhg/utils/Utils';
import AssetsPdfTable from './AssetsPdfTable';

/**
 * Asset List component to display  all the current user Assets.
 *
 * Reviewed:
 */
export default function AssetsPdf({
   intl,
   assets = [],
   totalCurrent = 0,
   totalIntermediate = 0,
   totalLong = 0,
   entityName = '',
}) {
   /**
    * Register the fonts needed for the PDF file.
    * CAVEAT: Only register the fonts once or there will be an error in @react-pdf/renderer.
    */
   useEffect(() => {
      // Can only be called once.
      if (indexOf(Font.getRegisteredFontFamilies(), 'montserrat') < 0) {
         try {
            Font.register({
               family: 'montserrat',
               fonts: [
                  {src: '/fonts/montserrat-regular-webfont.ttf'}, // font-style: normal, font-weight: normal
                  {src: '/fonts/montserrat-bold-webfont.ttf', fontWeight: 700},
               ],
            });
         } catch (e) {
            console.log(e);
         }
      }
   }, []);

   // Create the columns for the asset table in the PDF file.
   const columns = useMemo(() => {
      return [
         {
            id: 'name',
            Header: formatMessage(intl, 'assets.category.column'),
            weighting: 130,
            accessor: 'assetCategory.name',
         },
         {
            id: 'description',
            Header: formatMessage(intl, 'assets.description.column'),
            accessor: 'description',
            weighting: 150,
         },
         {
            id: 'details',
            Header: formatMessage(intl, 'assets.details.column'),
            accessor: 'details',
            weighting: 150,
         },
         {
            id: 'collateralString',
            Header: formatMessage(intl, 'asset.collateral.column'),
            accessor: 'collateralString',
            weighting: 45,
         },
         {
            id: 'amount',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'amount',
            weighting: 60,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // If everything needed is loaded create the document.
   if (assets?.length > 0 && columns?.length > 0) {
      return (
         <Document title={`${entityName}-Assets_${moment().format(DATE_DB_FORMAT)}`}>
            <AssetsPdfTable
               assets={assets}
               columns={columns}
               totalCurrent={totalCurrent}
               totalIntermediate={totalIntermediate}
               totalLong={totalLong}
               entityName={entityName}
            />
         </Document>
      );
   } else {
      return null;
   }
}
