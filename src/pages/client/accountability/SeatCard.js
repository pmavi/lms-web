import {Avatar} from '@material-ui/core';
import {MenuItem} from '@material-ui/core';
import {Menu} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Delete} from '@material-ui/icons';
import {MoreVert} from '@material-ui/icons';
import {Remove} from '@material-ui/icons';
import {PersonAdd} from '@material-ui/icons';
import {findIndex} from 'lodash';
import {map} from 'lodash';
import {differenceBy} from 'lodash';
import {clone} from 'lodash';
import {useEffect} from 'react';
import {Fragment} from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useParams} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import {USER_DELETE} from '../../../data/QueriesGL';
import {getUserCacheQueries} from '../../../data/QueriesGL';
import {USER_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import ConfirmMenuItem from '../../../fhg/components/ConfirmMenuItem';
import useEditData from '../../../fhg/components/edit/useEditData';
import Grid from '../../../fhg/components/Grid';
import MenuItemModal from '../../../fhg/components/MenuItemModal';
import Typography from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {findById} from '../../../fhg/utils/Utils';
import {removeOne} from '../../../fhg/utils/Utils';
import {stringAvatar} from '../../../fhg/utils/Utils';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 300,
      },
      dividerStyle: {
         marginBottom: theme.spacing(0.5),
      },
      subtitleStyle: {
         color: 'rgba(0, 0, 0, 0.54)',
         fontSize: 14,
      },
      listItemStyle: {
         color: 'rgba(0, 0, 0, 0.87)',
         fontSize: 14,
      },
      personAddStyle: {
         color: 'black',
         marginLeft: 8,
         '&:hover': {
            color: theme.palette.primary.light,
         },
      },
      fadeArea: {
         '&:hover $fadeIn': {
            opacity: 1,
            transition: '0.3s',
            transitionDelay: '0.1s',
         },
      },
      fadeIn: {
         opacity: 0,
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: 'purple',
         },
      },
      menuItemStyle: {
         paddingRight: theme.spacing(0.5),
      },
   }),
   {name: 'SeatCardStyles'}
);

/**
 * Card to show the accountability chart seat.
 *
 * @param item The data item with the seat information.
 * @return {JSX.Element}
 * @constructor
 */
export default function SeatCard({item}) {
   const {clientId, entityId} = useParams();
   const classes = useStyles();

   const [userData] = useQueryFHG(USER_CLIENT_QUERY, {variables: {clientId}, skip: !clientId}, 'user.type');
   const [userCreateUpdate] = useMutationFHG(USER_CREATE_UPDATE);
   const [userDelete] = useMutationFHG(USER_DELETE);
   const [seatCreateUpdate] = useMutationFHG(SEAT_CREATE_UPDATE);

   const [editValues, handleChange, {resetValues}] = useEditData();
   const [itemSelected, setItemSelected] = useState();

   const [anchorEl, setAnchorEl] = useState(null);
   const [users, setUsers] = useState([]);

   /**
    * Initialize the users based on the item userIdList.
    */
   useEffect(() => {
      const users = findById(userData?.users, item?.userIdList);
      setUsers(users ? users : []);
   }, [userData?.users, item?.userIdList]);

   /**
    * Show the add user menu for the component in the event.
    * @param event The mouse click event.
    */
   const handleAddUser = (event) => {
      setAnchorEl(event.currentTarget);
   };

   /**
    * Close the menu if the user clicks away or selects a user.
    */
   const handleClose = () => {
      setAnchorEl(undefined);
   };

   /**
    * Submit the set user to the server.
    *
    * @param user The user to submit.
    * @return {(function(): Promise<void>)|*}
    */
   const handleSetUser = (user) => async () => {
      const userIds = clone(users);
      userIds.push(user);
      setUsers(userIds);
      setAnchorEl(undefined);
      let variables = {id: item.id, userIdList: map(userIds, 'id')};
      await seatCreateUpdate({
         variables,
         optimisticResponse: {
            __typename: 'Mutation',
            seat: {
               __typename: 'Seat',
               ...item,
               ...variables,
               entityId,
               isDeleted: false,
            },
         },
      });
   };

   const handleNewUser = async () => {
      const variables = {id: uuid(), ...editValues, clientId};
      try {
         const result = await userCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               user: {
                  __typename: 'User',
                  variables,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getUserCacheQueries(clientId || null), variables.id, 'user'),
         });
         resetValues();
         await handleSetUser(result?.data?.user)();
      } catch (e) {
         console.log(e);
      }
   };

   const closeUserMenu = () => {
      setAnchorEl(undefined);
   };

   /**
    * Deletes the user from the users and userIds and submits the userIds in a mutation to the server.
    * @param user The deleted user.
    * @return {(function(): Promise<void>)|*}
    */
   const handleRemoveUser = (user) => async () => {
      const usersClone = clone(users);
      const index = findIndex(usersClone, {id: user?.id});

      if (index >= 0) {
         removeOne(usersClone, index);
         setUsers(usersClone);

         let variables = {id: item.id, userIdList: map(usersClone, 'id')};
         await seatCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               seat: {
                  __typename: 'Seat',
                  ...item,
                  ...variables,
                  entityId,
                  isDeleted: false,
               },
            },
            // update: isNew ? cacheUpdate(getSeatCacheQueries(clientId), editValues.id, 'seat') : undefined,
         });
      } else {
         console.log('Could not remove user', user, 'at index', index);
      }
   };

   /**
    * List of users not already selected for the seat.
    * @type {unknown[]}
    */
   const userOptions = useMemo(() => differenceBy(userData?.users, users, 'id'), [userData?.users, users]);

   const handleVerticalMenuClick = (event) => {
      event.stopPropagation();
      event.preventDefault();

      setItemSelected(event.currentTarget);
   };

   const handleCancel = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setItemSelected(undefined);
      setAnchorEl(undefined);
   };

   const handleDelete = (userId) => async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      await userDelete({
         variables: {id: userId},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getUserCacheQueries(clientId || null), userId),
      });
      setItemSelected(undefined);
      setAnchorEl(undefined);
   };

   return (
      <Grid item fullHeight style={{display: 'flex', flexDirection: 'column'}}>
         <Box display={'flex'} flexDirection={'row'} alignItems='center' mb={2}>
            {users?.map((user) => (
               <Box key={'frame ' + user?.id} display={'flex'} alignItems='center' marginTop={1}>
                  <Box position={'relative'} className={classes.fadeArea}>
                     <Tooltip title={user?.contactName}>
                        <Avatar variant='square' {...stringAvatar(user?.contactName)} />
                     </Tooltip>
                     <IconButton
                        size={'small'}
                        style={{position: 'absolute', right: -2, top: -8}}
                        className={classes.fadeIn}
                        onClick={handleRemoveUser(user)}
                     >
                        <Remove
                           color={'primary'}
                           style={{
                              fontSize: '1.1rem',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              border: '1px solid',
                           }}
                        />
                     </IconButton>
                  </Box>
                  {users.length === 1 && <Typography className={classes.listItemStyle}>{user?.contactName}</Typography>}
               </Box>
            ))}
            <Fragment>
               {userData?.users?.length > 0 ? (
                  <>
                     {userOptions?.length > 0 && (
                        <IconButton onClick={handleAddUser} size={'small'} className={classes.personAddStyle}>
                           <PersonAdd />
                        </IconButton>
                     )}
                     {!(users?.length > 0) && (
                        <Box
                           component={'span'}
                           fontSize={'smaller'}
                           ml={2}
                           style={{cursor: 'pointer'}}
                           onClick={handleAddUser}
                        >
                           Click to add seat holder
                        </Box>
                     )}
                     <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        transformOrigin={{
                           vertical: 'top',
                           horizontal: 'center',
                        }}
                     >
                        {userOptions?.map((user) => (
                           <MenuItem
                              key={'UserKey ' + user?.id}
                              value={user?.id}
                              onClick={handleSetUser(user)}
                              className={classes.menuItemStyle}
                           >
                              <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                                 {user?.contactName}
                                 {!user?.username && (
                                    <>
                                       <MoreVert onClick={handleVerticalMenuClick} />
                                       <Menu open={Boolean(itemSelected && anchorEl)} anchorEl={itemSelected}>
                                          <ConfirmMenuItem
                                             messageKey='confirmRemoveValue.message'
                                             color={'error'}
                                             onConfirm={handleDelete(user?.id)}
                                             onCancel={handleCancel}
                                             values={{type: 'person', name: user?.contactName}}
                                             size='small'
                                             submitStyle={classes.deleteColorStyle}
                                             startIcon={Delete}
                                             buttonTypographyProps={{variant: 'inherit'}}
                                          />
                                       </Menu>
                                    </>
                                 )}
                              </Box>
                           </MenuItem>
                        ))}
                        <MenuItemModal
                           key={'UserKey Add user'}
                           titleKey={'seat.person.title'}
                           buttonLabelKey={'seat.person.title'}
                           menuLabelKey={'seat.person.label'}
                           onClick={closeUserMenu}
                           onConfirm={handleNewUser}
                        >
                           <TextFieldLF
                              name={'contactName'}
                              autoFocus
                              labelKey='seat.name.label'
                              placeholderKey='seat.person.placeholder'
                              value={editValues.contactName}
                              onChange={handleChange}
                           />
                        </MenuItemModal>
                     </Menu>
                  </>
               ) : (
                  <Box component={'span'} fontSize={'smaller'} ml={2}>
                     Add users to the client to add a seat holder
                  </Box>
               )}
            </Fragment>
         </Box>
         <Divider light className={classes.dividerStyle} />
         <Typography id={'seat.responsibilities.label'} className={classes.subtitleStyle} />
         <Box overflow={'auto'} flex={'1 1 auto'}>
            <ul style={{marginTop: 4, marginLeft: -8, marginBottom: 4}}>
               {item?.responsibilities?.length > 0 &&
                  item?.responsibilities.map((responsibility) => (
                     <li key={'li ' + responsibility} style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.87)'}}>
                        {responsibility}
                     </li>
                  ))}
            </ul>
         </Box>
      </Grid>
   );
}
