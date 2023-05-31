import {YEAR_CATEGORY3} from '../../../components/assets/AssetEdit';
import {YEAR_CATEGORY2} from '../../../components/assets/AssetEdit';
import {YEAR_CATEGORY1} from '../../../components/assets/AssetEdit';
import {QUANTITY_CATEGORY2} from '../../../components/assets/AssetEdit';
import {QUANTITY_CATEGORY1} from '../../../components/assets/AssetEdit';
import {ACRES_CATEGORY_NAME} from '../../../components/assets/AssetEdit';
import {REAL_ESTATE_CATEGORY_NAME} from '../../../components/assets/AssetEdit';
import {BREEDER_LIVESTOCK_CATEGORY_NAME} from '../../../components/assets/AssetEdit';
import {LIVESTOCK_CATEGORY_NAME} from '../../../components/assets/AssetEdit';

/**
 * Get Asset Details for the assets table.
 *
 * @param asset The asset from which to get the details.
 * @return {string|string} The details for the Asset.
 */
export const getAssetDetails = (asset) => {
   if (asset) {
      switch (asset?.assetCategory?.name) {
         case LIVESTOCK_CATEGORY_NAME:
            return asset?.price ? `Head: ${asset?.head}, Weight: ${asset?.weight}, Price: ${asset?.price}` : '';
         case BREEDER_LIVESTOCK_CATEGORY_NAME:
            return asset?.price ? `Head: ${asset?.head}, Price: ${asset?.price}` : '';
         case REAL_ESTATE_CATEGORY_NAME:
         case ACRES_CATEGORY_NAME:
            return asset?.price ? `Acres: ${asset?.acres}, Price: ${asset?.price}` : '';
         case QUANTITY_CATEGORY1:
         case QUANTITY_CATEGORY2:
            return asset?.price ? `Units: ${asset?.quantity}, Price: ${asset?.price}` : '';
         case YEAR_CATEGORY1:
         case YEAR_CATEGORY2:
         case YEAR_CATEGORY3:
            return `Year: ${asset?.year || 'N/A'}`;
         default:
            return '';
      }
   } else {
      return '';
   }
};
