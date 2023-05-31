import IconButton from '@material-ui/core/IconButton';
import useTheme from '@material-ui/core/styles/useTheme';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import find from 'lodash/find';
import * as PropTypes from 'prop-types';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {CLIENT_EDIT} from '../Constants';
import {ADMIN_PATH} from '../Constants';
import {CITY_STATE_QUERY} from '../data/QueriesGL';
import {CLIENT_DELETE} from '../data/QueriesGL';
import {getClientCacheQueries} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {useLocation} from 'react-router-dom';

ClientTreeContent.propTypes = {
   classes: PropTypes.any,
   client: PropTypes.any,
};

export function ClientTreeContent({client, classes}) {
   const history = useHistory();
   const location = useLocation();
   const theme = useTheme();

   const [clientDelete] = useMutationFHG(CLIENT_DELETE);
   const [cityStateData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');
   const selectedState = find(cityStateData?.states, {id: client?.stateId});
   const selectedCity = find(cityStateData?.cities, {id: client?.cityId});

   const handleEditClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: CLIENT_EDIT, id: client?.id};
      history.replace(location);
   };

   const handleDeleteClient = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await clientDelete({
         variables: {id: client?.id},
         optimisticResponse: {client_Delete: 1},
         update: cacheDelete(getClientCacheQueries(), client?.id),
      });
      history.push(ADMIN_PATH);
   };

   return <>
      <div className={classes.fadeArea}>
         <ConfirmIconButton
            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
            onConfirm={handleDeleteClient}
            values={{type: 'client', name: client.name}}
            messageKey={'confirmRemoveValue.message'}
            buttonLabelKey={'delete.button'}
            size={'small'}
            submitStyle={classes.deleteColorStyle}
            style={{float: 'right'}}
            buttonTypographyProps={{
               float: 'right',
               color: theme.palette.error.dark,
               style: {textDecoration: 'underline'}
            }}
         >
            <Delete fontSize={'small'}/>
         </ConfirmIconButton>
         <IconButton size={'small'} style={{float: 'right'}} onClick={handleEditClient}
                     className={classes.fadeIn}>
            <Edit fontSize={'small'}/>
         </IconButton>
         <TypographyFHG variant='subtitle1' color={'textPrimary'} className={classes.treeLabelStyle}
                        onClick={handleEditClient}>
            {client?.name}
         </TypographyFHG>
      </div>
      <TypographyFHG variant='body2' color={'textPrimary'}>
         {client?.addressLineOne || ''}
      </TypographyFHG>
      <TypographyFHG variant='body2' color={'textPrimary'}>
         {client?.addressLineTwo || ''}
      </TypographyFHG>
      {(selectedCity || selectedState) && (
         <TypographyFHG variant='body2' color={'textPrimary'} gutterBottom>
            {`${selectedCity?.name || ''}, ${selectedState?.abbreviation ||
            ''} ${client?.zipCode || ''}`}
         </TypographyFHG>
      )}
      <TypographyFHG variant='body2' color={'textPrimary'}>
         {client?.phone || ''}
      </TypographyFHG>
      <TypographyFHG variant='body2' color={'textPrimary'}>
         {client?.email || ''}
      </TypographyFHG>
   </>;
}
