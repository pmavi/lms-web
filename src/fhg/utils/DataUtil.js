import {camelCase} from 'lodash';
import {forEach} from 'lodash';
import {forOwn} from 'lodash';
import {pick} from 'lodash';
import get from 'lodash/get';
import values from 'lodash/values';
import castArray from 'lodash/castArray';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import {resultOf} from './Utils';
import {removeOne} from './Utils';

/**
 * Update the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param queryList the list of queries to update. (e.g. {query, variables, queryPath})
 * @param id of the item to update.
 * @param mutationPathProp Property name for the property to update coming back from the mutation.
 * @return {function: void} The function for update.
 */
export const cacheUpdate = (queryList, id, mutationPathProp) => {
   const useQueryList = castArray(queryList);

   if (id !== undefined) {
      return (proxy, {data}) => {
         for (const queryItem of useQueryList) {
            const {query, variables, queryPath = mutationPathProp, mutationPath = mutationPathProp} = queryItem;
            const resultData = get(data, mutationPath);
            try {
               const cachedData = proxy.readQuery({query, variables});
               const itemIndex = findIndex(cachedData[queryPath], {id});
               let arr;

               if (itemIndex >= 0) {
                  arr = [...cachedData[queryPath]];
                  arr[itemIndex] = resultData;
               } else {
                  arr = [...(cachedData[queryPath] || []), resultData];
               }
               proxy.writeQuery({query, variables, data: {...cachedData, [queryPath]: arr}});
            } catch (e) {
               if (process.env.NODE_ENV !== 'production') {
                  console.log('Failed to update cache.', e);
               }
            }
         }
      };
   } else {
      return cacheAdd(useQueryList, mutationPathProp);
   }
};

/**
 * Add the new item to the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param queryList the list of queries to add the result item. (e.g. {query, variables, queryPath})
 * @param mutationPath Property name resulting object being updated.
 * @return {function: void} The function for the update.
 */
export const cacheAdd = (queryList, mutationPath) => {
   const useQueryList = castArray(queryList);

   return (proxy, {data}) => {
      for (const queryItem of useQueryList) {
         const {query, variables, queryPath = mutationPath} = queryItem;

         const resultData = get(data, mutationPath);
         // Read the data from our cache for this query.
         const cachedData = proxy.readQuery({query, variables});
         // Write our data back to the cache with the new comment in it
         const newArray = [...(cachedData[queryPath] || []), resultData];
         const newData = {...cachedData, [queryPath]: newArray};
         proxy.writeQuery({query, variables, data: newData});
      }
   };
};

/**
 * Delete the item add the id from the cache for the list of queries. The query list will have the query, the
 * variables, and the queryPath(optional). If the queryPath isn't specified, the path will be used.
 *
 * @param queryList the list of queries to delete the item at id. (e.g. {query, variables, queryPath})
 * @param id The id of the item to delete in the cache.
 * @param [path] Property name resulting object being updated.
 * @return {function: void} Function for update.
 */
export const cacheDelete = (queryList, id, path) => {
   const useQueryList = castArray(queryList);

   return (proxy) => {
      for (const queryItem of useQueryList) {
         const {query, variables, queryPath = path} = queryItem;

         const cachedData = proxy.readQuery({query, variables});
         const itemIndex = findIndex(cachedData[queryPath], {id});
         if (itemIndex >= 0) {
            const modifiedList = removeOne([...cachedData[queryPath]], itemIndex);
            proxy.writeQuery({
               query,
               variables,
               data: {...cachedData, [queryPath]: modifiedList.length > 0 ? modifiedList : null},
            });
         }
      }
   };
};

/**
 * A table for an Excel spreadsheet.
 *
 * @param name The name of the table.
 * @param worksheet The worksheet of the spreadsheet.
 * @param columns The columns for the table.
 * @param data The data properties must match the columns in order. For example the first column will be the first
 *        property in the object
 * @param location The location of the cell (e.g. 'A1').
 * @param showRowStripes Indicates if the stripes should be used in the table.
 * @param style
 * @param properties Optional properties of the data to be shown in the table
 * @param isAccessor Indicates if 'accessor' property is used to find data.
 * @param totalsRow Indicates if there is a totals row
 * @param hasGetAccessor Indicates if the columns use a getAccessor function to find the data.
 */
export const createTable = (
   name,
   worksheet,
   columns,
   data,
   location,
   showRowStripes = false,
   style = {},
   properties,
   isAccessor = false,
   totalsRow = true,
   hasGetAccessor = false
) => {
   let rows;

   if (hasGetAccessor) {
      rows = map(data, (item) => {
         let modifiedItem = {};
         for (const column of columns) {
            modifiedItem[column.accessor] = get(item, column.getAccessor || column.accessor);
         }
         return values(modifiedItem);
      });
   } else {
      if (isAccessor) {
         properties = map(columns, 'accessor');
      }

      if (data.length > 0) {
         rows = properties?.length > 0 ? map(data,
             (item) => values(pick(item, properties))) : map(data, values);
      } else {
         rows = [];
         let rowData = [];
         for (let i = 0; i < properties.length; i++) {
            rowData.push("");
         }

         rows.push(rowData);
      }
   }

   worksheet.addTable({
      name,
      ref: location,
      headerRow: true,
      totalsRow,
      style: {
         theme: 'TableStyleLight15',
         showRowStripes: true,
         // ...style,
      },
      columns,
      rows,
   });
};

/**
 * A table for an Excel spreadsheet.
 *
 * @param worksheet The worksheet of the spreadsheet.
 * @param columns The columns for the table.
 * @param data The data properties must match the columns in order. For example the first column will be the first
 *        property in the object
 * @param location The location of the cell (e.g. 'A1').
 * @param style
 * @param properties Optional properties of the data to be shown in the table
 */
export const createTableLx = ({name, worksheet, columns, data, style, properties, ...tableProps}) => {
   let rows = map(data, (item) => {
      let modifiedItem = {};
      for (const column of columns) {
         const value = column.value ? resultOf(column.value, item) : get(item, column.getAccessor || column.accessor);
         modifiedItem[column.accessor] = value === undefined || value === null ? '' : value;
      }
      return values(modifiedItem);
   });
   const useColumns = map(columns, (column) => pick(column, ['name', 'totalsRowFunction', 'style', 'totalsRowLabel']));

   worksheet.addTable({
      ...tableProps,
      name: camelCase(name),
      style: {
         theme: 'TableStyleLight15',
         showRowStripes: true,
         // ...style,
      },
      columns: useColumns,
      rows,
   });
};

export function PMT(interestRate = 0, numberOfPeriods = 1, presentValue = 0, futureValue = 0, paymentType = 0) {
   if (!presentValue && !futureValue) {
      return undefined;
   }
   if (numberOfPeriods <= 0) {
      return undefined;
   }
   if (interestRate === 0) {
      return -(presentValue + futureValue) / numberOfPeriods;
   }

   const pvif = Math.pow(1 + interestRate, numberOfPeriods);
   let payment = (interestRate / (pvif - 1)) * -(presentValue * pvif + futureValue);

   if (paymentType === 1) {
      payment /= 1 + interestRate;
   }

   return payment;
}

export function round(x, isRounding = true) {
   return !isRounding ? x : Math.round(x * 100) / 100;
}

/**
 * Assign the fields from all items. Priority is left to right. If the field has a value it will not be overwritten.
 * @param primary The most important priority object. Set fields will not be overwritten.
 * @param items Array of items to provide values.
 */
export function assign(primary, ...items) {
   const result = {...primary};

   forEach(items, (item) => {
      forOwn(item, (value, key) => {
         if (result[key] === undefined) {
            result[key] = value;
         }
      });
   });
   return result;
}
