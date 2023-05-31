import {castArray} from 'lodash';

// noinspection ES6CheckImport
import {map} from 'lodash';
import filter from 'lodash/filter';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {ASSETS_ENTITY_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import {formatMessage} from '../../../fhg/utils/Utils';
import AssetsPdfTable from './AssetsPdfTable';
import {getAssetDetails} from './AsssetUtil';

/**
 * Asset List component to display  all the current user Assets.
 *
 * Reviewed:
 */
export default function useAssetPdf(intl, orientation, entityId, historyDate) {
   const [assetsQuery] = useLazyQueryFHG(ASSETS_ENTITY_QUERY);
   return useCallback(
      async (entityName = '', assetProps) => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);
         const entityIdList = castArray(entityId);
         async function getAssets() {
            const assetData = assetProps || (await assetsQuery({variables: {entityId, historyDate: reportDate}}));
            const useAssets = filter(assetData?.data?.assets || [], {isRemoved: false});

            const tableAssets = map(useAssets, (asset) => ({
               ...asset,
               collateralString: asset.isCollateral ? 'Yes' : 'No',
               details: getAssetDetails(asset),
            }));
            return sortBy(tableAssets, ['assetCategory.name']);
         }

         const columns = [
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

         if (entityIdList?.length > 1) {
            columns.push({
               id: 'entity',
               Header: formatMessage(intl, 'asset.entity.column'),
               accessor: 'entity.name',
               weighting: 60,
            });
         }

         const assets = await getAssets();
         const assetGroups = groupBy(assets, 'assetCategory.term');
         const totalCurrent = assetGroups?.current
            ? sumBy(filter(assetGroups?.current, {isRemoved: false}), 'amount')
            : 0;
         const totalIntermediate = assetGroups?.intermediate
            ? sumBy(filter(assetGroups?.intermediate, {isRemoved: false}), 'amount')
            : 0;
         const totalLong = assetGroups?.long ? sumBy(filter(assetGroups?.long, {isRemoved: false}), 'amount') : 0;

         return (
            <AssetsPdfTable
               assets={assets}
               columns={columns}
               totalCurrent={totalCurrent}
               totalIntermediate={totalIntermediate}
               totalLong={totalLong}
               entityName={entityName}
               historyDate={reportDate}
            />
         );
      },
      [assetsQuery, entityId, historyDate, intl]
   );
}
