import {castArray} from 'lodash';
import max from 'lodash/max';
import {useCallback} from 'react';
import {SPACING_DEFAULT_PDF} from '../../../Constants';
import {getPageSize} from '../../../fhg/components/pdf/tree/PDFConstants';
import {CARD_HEIGHT} from '../../../fhg/components/pdf/tree/TreeItemPdf';
import {CARD_WIDTH} from '../../../fhg/components/pdf/tree/TreeItemPdf';

/**
 * Hook to get a function to calculate PDF page sizes based on the height and width of the tree.
 * @return {function(*, *): *[]}  The function to return the array of page sizes.
 */
export default function useGetPageSize() {
   return useCallback((roots, itemsKey) => {
      function calculateDepthAndBreadth(item, level, levelCounts, itemsKey) {
         const count = item?.[itemsKey]?.length || 0;
         const existingCount = levelCounts[level] || 0;
         levelCounts[level] = existingCount + count;

         if (count > 0) {
            for (const itemChild of item[itemsKey]) {
               calculateDepthAndBreadth(itemChild, level + 1, levelCounts, itemsKey);
            }
         }
      }

      let pageSizes = [];
      const rootList = castArray(roots);

      for (const [i, root] of rootList.entries()) {
         if (root) {
            const levelCounts = [1];
            calculateDepthAndBreadth(root, 1, levelCounts, itemsKey);

            // Width is the maximum cards wide from the levelsCount array * card width and spacing for each card.
            const width = max(levelCounts) * (CARD_WIDTH + SPACING_DEFAULT_PDF * 4);
            // Height is the number of levels of cards from the levelsCount array * card height and spacing for each card.
            const height = (levelCounts.length - 1) * (CARD_HEIGHT + 20);

            // From the height and width of the tree + the margins, calculate the page size.
            pageSizes[i] = getPageSize({width: width + 40, height: height + 40});
         }
      }

      return pageSizes;
   }, []);
}
