import {StyleSheet} from '@react-pdf/renderer';
import {Page} from '@react-pdf/renderer';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import {SEAT_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import AccountabilityChartPdfContent from './AccountabilityChartPdfContent';
import useGetPageSize from './useGetPageSize';
import useGetRoot from './useGetRoot';
import split from 'lodash/split';

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'montserrat',
      paddingLeft: 20,
      paddingTop: 20,
      paddingBottom: 50,
      paddingRight: 20,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      backgroundColor: '#FAFAFA',
      width: '100%',
   },
});

/**
 * Hook to return the pages for the Accountability Chart PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useAccountabilityChartPdf(intl, orientation = 'landscape', clientId, entityId, date, itemsKey) {
   const [seatQuery] = useLazyQueryFHG(SEAT_ALL_WHERE_QUERY, undefined, 'seat.type');
   const [userQuery] = useLazyQueryFHG(USER_CLIENT_QUERY, undefined, 'user.type');

   const getRoot = useGetRoot();
   const getPageSizes = useGetPageSize();

   return useCallback(
      async (entityNames = '') => {
         const seatData = await seatQuery({variables: {entityId}});
         const users = await userQuery({variables: {clientId}});
         const roots = getRoot(entityId, seatData?.data?.seats);
         const pageSizes = getPageSizes(roots, itemsKey);
         const entityNameList = split(entityNames, ', ');

         return (
            <>
               {roots?.map((root, index) => (
                  <Page
                     key={'AccountabilityChartPdf' + index}
                     size={pageSizes[index]}
                     orientation={orientation}
                     style={styles.generalInformation1}
                     wrap={false}
                  >
                     <Title>{`Accountability Chart - ${entityNameList[index]}`}</Title>
                     <Footer />
                     <AccountabilityChartPdfContent
                        root={root}
                        labelKey={'name'}
                        itemsKey={itemsKey}
                        users={users?.data?.users}
                     />
                  </Page>
               ))}
            </>
         );
      },
      [clientId, entityId, getPageSizes, getRoot, itemsKey, orientation, seatQuery, userQuery]
   );
}
