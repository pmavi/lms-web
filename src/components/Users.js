import {List} from '@material-ui/core';
import {ListItemText} from '@material-ui/core';
import {ListItem} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Add} from '@material-ui/icons';
import {sortBy} from 'lodash';
import {useMemo} from 'react';
import React from 'react';
import {Link} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {ADMIN_USERS_PATH} from '../Constants';
import {USER_EDIT} from '../Constants';
import {ADMIN_USER_PATH} from '../Constants';
import {APPBAR_SMALL_HEIGHT} from '../Constants';
import {ADMIN_DRAWER} from '../Constants';
import {USER_ADMIN_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import Grid from '../fhg/components/Grid';
import ResponsiveMobileDrawer from '../fhg/components/ResponsiveMobileDrawer';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../fhg/hooks/usePageTitle';
import UserEdit from './UserEdit';

const useStyles = makeStyles(theme => ({
   root: {
      margin: theme.spacing(0, 2),
   },
   infoInnerStyle: {
      padding: theme.spacing(0, 2),
   },
   frameStyle: {
      padding: theme.spacing(3, 0),
   },
   drawerStyle: {
      padding: theme.spacing(3, 2),
   },
}), {name: 'UsersStyles'});

export default function Users() {
   const classes = useStyles();
   const history = useHistory();
   const theme = useTheme();
   const {userId} = useParams();
   const location = useLocation();

   const [userData] = useQueryFHG(USER_ADMIN_QUERY, undefined, 'user.type');
   usePageTitle({titleKey: 'user.title2.label'});

   const sortedUsers = useMemo(() => {
      if (userData?.users) {
         return sortBy(userData?.users, 'contactName');
      }
      return [];
   }, [userData]);

   const handleNewUser = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      location.state = {edit: USER_EDIT};
      location.pathname = ADMIN_USERS_PATH;
      history.push(location);
   };

   return (
      <Grid container fullWidth fullHeight className={classes.frameStyle} direction={'row'} overflow={'visible'}
            wrap={'nowrap'}>
         <Grid item fullHeight resizable={false}>
            <ResponsiveMobileDrawer
               backgroundColor={theme.palette.background.default}
               width={ADMIN_DRAWER}
               ModalProps={{BackdropProps: {style: {height: '100%', marginTop: APPBAR_SMALL_HEIGHT}}}}>
               <Grid container fullWidth className={classes.drawerStyle}>
                  <Grid container item resizable={false} direction={'row'}>
                     <Grid item resizable={false} className={classes.infoInnerStyle}>
                        <TypographyFHG variant={'h5'} id={'user.adminTitle.label'} color={'textSecondary'}/>
                     </Grid>
                     <Grid item>
                        <ButtonFHG labelKey='user.new.button' startIcon={(<Add/>)} onClick={handleNewUser}/>
                     </Grid>
                  </Grid>
                  <Grid isScrollable className={classes.root}>
                     <List dense>
                        {sortedUsers.map(user => (
                           <ListItem button component={Link} to={ADMIN_USER_PATH.replace(':userId', user.id)}
                                     selected={userId === user.id}>
                              <ListItemText primary={user.contactName || user.username}
                                            primaryTypographyProps={{variant: 'subtitle1'}}/>
                           </ListItem>
                        ))}
                     </List>
                  </Grid>
               </Grid>
            </ResponsiveMobileDrawer>
         </Grid>
         {(userId || location?.state?.edit === USER_EDIT) && (
            <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 480}}>
               <UserEdit isAdmin/>
            </Grid>
         )}
      </Grid>
   );
}
