import {sum} from 'lodash';
import {useMemo} from 'react';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';

export default function useTaxableIncomeTotals(list) {
   return useMemo(() => {
      const totals = {};

      if (list?.length > 0) {
         for (const item of list) {
            let total = 0;
            for (const month of DEFAULT_MONTH_ORDER) {
               total += item[month].actual || item[month].expected;
            }
            totals[item.typeName] = total;
         }
         totals.total = sum(Object.values(totals));
      }
      return totals;
   }, [list]);
}
