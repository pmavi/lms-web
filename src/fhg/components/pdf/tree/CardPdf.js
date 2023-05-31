import {join} from 'lodash';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {Text, StyleSheet, View} from '@react-pdf/renderer';
import {SPACING_DEFAULT_PDF} from '../../../../Constants';
import {findById} from '../../../utils/Utils';
import DividerPdf from './DividerPdf';
import ListItem from './ListItem';
import map from 'lodash/map';

const MAX_RESPONSIBILITY_LIST = 4;

const styles = StyleSheet.create({
   titleStyle: {
      fontWeight: 500,
      fontSize: 12,
      padding: SPACING_DEFAULT_PDF * 2,
      color: 'rgba(0, 0, 0, 0.87)',
   },
   subtitleStyle: {
      marginTop: SPACING_DEFAULT_PDF,
      marginBottom: SPACING_DEFAULT_PDF,
      marginLeft: SPACING_DEFAULT_PDF * 2,
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: 10,
   },
   userStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginBottom: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.87)',
   },
   responsibilityStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginRight: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.87)',
   },
});

/**
 * Component for the tree node contents to display. Works with accountability chart and is not completely generic.
 *
 * Reviewed: 8/22/2022
 *
 * @param item The item to display.
 * @param labelKey The key of the property to display for the title of the node.
 * @param users The users for the accountability chart.
 * @return {JSX.Element}
 * @constructor
 */
export default function CardPdf({item, labelKey, users}) {
   let responsibilitiesAll;
   const [cardUsers, setCardUsers] = useState();

   /**
    * Initialize the users based on the item userIdList.
    */
   useEffect(() => {
      const itemUsers = findById(users, item?.userIdList);
      let itemUsersString = undefined;

      if (itemUsers?.length > 0) {
         itemUsersString = join(map(itemUsers, 'contactName'), ', ');
      }
      setCardUsers(itemUsersString);
   }, [users, item?.userIdList]);

   if (item?.responsibilities?.length > MAX_RESPONSIBILITY_LIST) {
      responsibilitiesAll = item?.responsibilities.join('  \u2022\u00A0');
   }

   return (
      <View style={{display: 'flex', flexDirection: 'column'}}>
         <Text style={styles.titleStyle}>{item?.[labelKey] || 'Untitled'}</Text>
         {cardUsers && (
            <>
               <DividerPdf orientation={'horizontal'} size={1} color={'rgba(0, 0, 0, 0.08)'} />
               <Text style={styles.subtitleStyle}>Persons</Text>
               <Text style={styles.userStyle}>{cardUsers}</Text>
            </>
         )}
         <DividerPdf orientation={'horizontal'} size={1} color={'rgba(0, 0, 0, 0.08)'} />
         <Text style={styles.subtitleStyle}>Roles & Responsibilities</Text>
         {item?.responsibilities?.length > 0 &&
            item?.responsibilities?.length <= MAX_RESPONSIBILITY_LIST &&
            item?.responsibilities.map((responsibility) => (
               <ListItem key={'li ' + responsibility}>{responsibility}</ListItem>
            ))}
         {responsibilitiesAll && (
            <Text key={'fulltextResponsibilities '} style={styles.responsibilityStyle}>
               {'\u2022\u00A0' + responsibilitiesAll}
            </Text>
         )}
      </View>
   );
}
