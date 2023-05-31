import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Delete} from '@material-ui/icons';
import {defer} from 'lodash';
import React, {useState, useCallback} from 'react';
import {useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {ADMIN_USERS_PATH} from '../Constants';
import {USER_DELETE} from '../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import {getUserCacheQueries} from '../data/QueriesGL';
import {USER_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ConfirmButton from '../fhg/components/ConfirmButton';
import Form from '../fhg/components/edit/Form';
import Prompt from '../fhg/components/edit/Prompt';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import ProgressButton from '../fhg/components/ProgressButton';
import {authenticationDataStatus} from '../fhg/components/security/AuthenticatedUser';
import PasswordTextField from '../fhg/components/security/PasswordTextField';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../fhg/hooks/useKeyDown';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import {formatMessage} from '../fhg/utils/Utils';
import {USER_NODE} from './AdminDrawer';
import TextFieldLF from './TextFieldLF';
import {useLocation} from 'react-router-dom';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)}px)`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
   }),
   {name: 'UserEditStyles'}
);

export default function UserEdit({isAdmin = false}) {
   const classes = useStyles();
   const theme = useTheme();
   const {clientId, userId: userIdParam} = useParams();
   const intl = useIntl();
   const history = useHistory();
   const editItem = {
      name: '',
      username: '',
      clientId,
      isDeleted: false,
   };

   const location = useLocation();
   const userId = location?.state?.id || userIdParam;
   const isNew = !userId;

   const [userData] = useQueryFHG(
      USER_CLIENT_QUERY,
      {variables: {clientId, id: userId}, skip: !(isAdmin || validate(clientId)) || !userId},
      'user.type'
   );
   const [userCreateUpdate] = useMutationFHG(USER_CREATE_UPDATE);
   const [userDelete] = useMutationFHG(USER_DELETE);

   const [isSaving, setIsSaving] = useState(false);
   const [
      editValues,
      handleChange,
      {isChanged = false, setIsChanged, defaultValues, setDefaultValues, resetValues, getValue},
   ] = useEditData(isNew ? editItem : undefined, ['id', 'clientId']);

   const authState = useRecoilValue(authenticationDataStatus);

   useEffect(() => {
      if (isNew) {
         resetValues();
      }
   }, [isNew, resetValues]);

   useEffect(() => {
      if (userData?.users?.length > 0) {
         resetValues();
         setDefaultValues(userData.users[0]);
      }
   }, [userData, setDefaultValues, resetValues]);

   const handleClose = useCallback(() => {
      // onClose?.(clientId);
      resetValues();

      defer(() => {
         if (!isAdmin) {
            location.state = {edit: undefined, id: undefined, nodeIdOpen: USER_NODE};
            history.replace(location);
         } else {
            history.replace(ADMIN_USERS_PATH);
         }
      });
   }, [isAdmin, resetValues, location, history]);

   useKeyDown(handleClose);

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);

            await userCreateUpdate({
               variables: {id: uuid(), ...editValues},
               optimisticResponse: {
                  __typename: 'Mutation',
                  user: {
                     __typename: 'User',
                     ...defaultValues,
                     ...editValues,
                     clientId: getValue('clientId') || '',
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getUserCacheQueries(clientId || null), editValues.id, 'user'),
            });
            setIsSaving(false);
            setIsChanged(false);
            handleClose();
         } catch (e) {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [getValue, clientId, userCreateUpdate, handleClose, isChanged, defaultValues, editValues, setIsChanged]);

   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsSaving(true);

      await userDelete({
         variables: {id: userId},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getUserCacheQueries(clientId || null), userId),
      });
      setIsSaving(false);
      handleClose();
   };

   /**
    * Handle onChange events for the password. Check if the password and confirm match.
    *
    * @param event The event that changed the input.
    * @param value The value if the component is an Autocomplete
    * @param name
    * @param reason The reason of the value change if Autocomplete
    */
   const handleChangeCallback = useCallback(
      (event, value, reason, newValue, name) => {
         handleChange(event, value, reason, newValue, name);

         if (name === 'password') {
            const target = document.getElementById('confirm_password');
            if (target) {
               target.setCustomValidity(
                  this.state.confirm !== this.state.password
                     ? formatMessage(intl, 'user.confirmMismatch.message', 'Confirm does not match the password.')
                     : ''
               );
            }
         }
      },
      [handleChange, intl]
   );

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         {!isAdmin && (
            <Grid item resizable={false} className={classes.infoInnerStyle}>
               <TypographyFHG variant={'h5'} id={'user.title.label'} color={'textSecondary'} gutterBottom />
            </Grid>
         )}
         <Grid item container resizable>
            <Form onSubmit={handleSubmit} className={classes.formStyle}>
               <Prompt when={isChanged} />
               <Grid name={'User Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid name={'User Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                     <TextFieldLF
                        key={'contactName' + defaultValues.id}
                        name={'contactName'}
                        autoFocus
                        labelTemplate={'user.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.contactName}
                        value={editValues.contactName}
                        required
                     />
                     <TextFieldLF
                        key={'email' + defaultValues.id}
                        name={'email'}
                        labelTemplate={'user.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.email}
                        value={editValues.email}
                        required
                     />
                     <TextFieldLF
                        key={'username' + defaultValues.id}
                        name={'username'}
                        labelTemplate={'user.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.username}
                        value={editValues.username}
                        disabled={!isNew}
                        helperText={!isNew ? 'Username cannot be changed' : undefined}
                        required
                     />
                     <PasswordTextField
                        key={'password' + defaultValues.id}
                        name='password'
                        fullWidth
                        isNew={isNew}
                        disabled={isSaving}
                        onChange={handleChangeCallback}
                        password={editValues.password}
                        confirm={editValues.confirm}
                     />
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  justify={'space-between'}
                  overflow={'visible'}
                  resizable={false}
                  alignItems={'center'}
               >
                  <Grid item>
                     <ProgressButton
                        isProgress={isSaving}
                        variant='text'
                        color='primary'
                        type={'submit'}
                        size='large'
                        labelKey='save.label'
                        disabled={isSaving}
                     />
                     <ButtonFHG
                        variant='text'
                        size={'large'}
                        labelKey={'cancel.button'}
                        disabled={isSaving}
                        onClick={() => handleClose()}
                     />
                  </Grid>
                  {isAdmin && defaultValues?.username !== authState?.username && (
                     <Grid item>
                        <ConfirmButton
                           className={classes.buttonStyle}
                           color={theme.palette.error.dark}
                           onConfirm={handleDelete}
                           values={{
                              type: isAdmin ? 'admin user' : 'user',
                              name: getValue('contactName'),
                           }}
                           size='large'
                           submitStyle={classes.deleteColorStyle}
                           startIcon={<Delete />}
                           buttonTypographyProps={{variant: 'inherit'}}
                           disabled={isSaving || isNew}
                        />
                     </Grid>
                  )}
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
