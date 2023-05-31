import {forOwn} from 'lodash';

export const PAGE_SIZES = {
   '4A0': [4767.87, 6740.79],
   '2A0': [3370.39, 4767.87],
   A0: [2383.94, 3370.39],
   A1: [1683.78, 2383.94],
   A2: [1190.55, 1683.78],
   A3: [841.89, 1190.55],
   B0: [2834.65, 4008.19],
   B1: [2004.09, 2834.65],
   B2: [1417.32, 2004.09],
   B3: [1000.63, 1417.32],
   B4: [708.66, 1000.63],
   C0: [2599.37, 3676.54],
   C1: [1836.85, 2599.37],
   C2: [1298.27, 1836.85],
   C3: [918.43, 1298.27],
   C4: [649.13, 918.43],
   RA0: [2437.8, 3458.27],
   RA1: [1729.13, 2437.8],
   RA2: [1218.9, 1729.13],
   RA3: [864.57, 1218.9],
   SRA0: [2551.18, 3628.35],
   SRA1: [1814.17, 2551.18],
   SRA2: [1275.59, 1814.17],
   SRA3: [907.09, 1275.59],
   SRA4: [637.8, 907.09],
   FOLIO: [612.0, 936.0],
   LEGAL: [612.0, 1008.0],
   LETTER: [612.0, 792.0],
   TABLOID: [792.0, 1224.0],
};

export const getPageSize = ({width, height, orientation = 'portrait'}) => {
   const WIDTH_INDEX = orientation === 'portrait' ? 0 : 1;
   const HEIGHT_INDEX = orientation === 'portrait' ? 1 : 0;
   let selectedSize;
   let selectedName;

   forOwn(PAGE_SIZES, (value, key) => {
      if (value[WIDTH_INDEX] >= width && value[WIDTH_INDEX] >= height) {
         if (
            !selectedSize ||
            (value[WIDTH_INDEX] < selectedSize[WIDTH_INDEX] && value[HEIGHT_INDEX] < selectedSize[HEIGHT_INDEX])
         ) {
            selectedName = key;
            selectedSize = value;
         }
      }
   });
   return selectedName;
};
