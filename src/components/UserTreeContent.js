import IconButton from '@material-ui/core/IconButton';
import useTheme from '@material-ui/core/styles/useTheme';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import * as PropTypes from 'prop-types';
import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {USER_EDIT} from '../Constants';
import {USER_DELETE} from '../data/QueriesGL';
import {getUserCacheQueries} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import Grid from '../fhg/components/Grid';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';

UserTreeContent.propTypes = {
   classes: PropTypes.any,
   onClick: PropTypes.func,
   user: PropTypes.any,
   onConfirm: PropTypes.func,
   theme: PropTypes.any
};

export default function UserTreeContent({user, classes}) {
   const {clientId} = useParams();
   const history = useHistory();
   const theme = useTheme();
   const location = useLocation();

   const [userDelete] = useMutationFHG(USER_DELETE);

   const handleEditUser = event => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: USER_EDIT, id: user.id};
      history.replace(location);
   };

   const handleDeleteUser = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await userDelete({
         variables: {id: user.id},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getUserCacheQueries(clientId), user.id),
      });
   };

   return <Grid container direction={'row'} justify={'space-between'} className={classes.fadeArea}>
      <Grid item>
         <TypographyFHG variant='subtitle1' color={'textPrimary'} className={classes.treeLabelStyle}
                        onClick={handleEditUser}>
            {user?.contactName || user?.username}
         </TypographyFHG>
      </Grid>
      <Grid item>
         <ConfirmIconButton
            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
            onConfirm={handleDeleteUser}
            values={{type: 'user', name: user.contactName}}
            messageKey={'confirmRemoveValue.message'}
            buttonLabelKey={'delete.button'}
            size={'small'}
            submitStyle={classes.deleteColorStyle}
            style={{float: 'right'}}
            buttonTypographyProps={{
               color: theme.palette.error.dark,
               style: {textDecoration: 'underline'}
            }}
         >
            <Delete fontSize={'small'}/>
         </ConfirmIconButton>
         <IconButton size={'small'}
                     onClick={handleEditUser}
                     className={classes.fadeIn}>
            <Edit fontSize={'small'}/>
         </IconButton>
      </Grid>
   </Grid>;
}
