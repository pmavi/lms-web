import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {defer} from 'lodash';
import moment from 'moment';
import React, {useState, useCallback} from 'react';
import {useLocation} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {MONTH_ONLY_FORMAT} from '../Constants';
import {ADMIN_SETUP_PATH} from '../Constants';
import {CLIENT_BY_ID_QUERY} from '../data/QueriesGL';
import {getCityCacheQueries} from '../data/QueriesGL';
import {CITY_CREATE_UPDATE} from '../data/QueriesGL';
import {getClientCacheQueries} from '../data/QueriesGL';
import {CITY_STATE_QUERY} from '../data/QueriesGL';
import {CLIENT_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import Form from '../fhg/components/edit/Form';
import Prompt from '../fhg/components/edit/Prompt';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import DatePickerFHG from '../fhg/components/DatePickerFHG';
import ProgressButton from '../fhg/components/ProgressButton';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../fhg/hooks/useKeyDown';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import AutocompleteLF from './AutocompleteLF';
import PhoneNumberFieldLF from './PhoneNumberFieldLF';
import TextFieldLF from './TextFieldLF';

const useStyles = makeStyles(theme => ({
   paperStyle: {
      maxHeight: `calc(100% - 1px)`,
      margin: theme.spacing(0, 0, 0, 2),
   },
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
   spacingSmall: {
      '& > *': {
         marginRight: theme.spacing(1),
      },
   },
   titleStyle: {},
   frameStyle: {
      padding: theme.spacing(3, 0),
   },
   '::placeholder': {
      color: '#707070 !important',
   },
   dividerStyle: {
      marginBottom: theme.spacing(2),
   },
   uploadStyle: {
      position: 'sticky',
      bottom: 0,
      backgroundColor: theme.palette.background.paper,
      marginTop: theme.spacing(2),
   },
}), {name: 'EntityEditStyles'});

export default function ClientEdit() {
   const classes = useStyles();
   const theme = useTheme();
   const {clientId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const isNew = !location?.state?.id;

   const editItem = {
      id: uuid(),
      name: '',
      addressLineOne: '',
      addressLineTwo: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      cityId: '',
      stateId: '',
      zipCode: '',
      startMonth: moment(`1/1/${(new Date()).getFullYear()}`),
      isDeleted: false,
   };

   const [optionsData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');
   const [cityCreateUpdate] = useMutationFHG(CITY_CREATE_UPDATE);

   const [clientData] = useQueryFHG(CLIENT_BY_ID_QUERY, {variables: {clientId}, skip: !validate(clientId) || isNew},
      'client.type');
   const [clientCreateUpdate] = useMutationFHG(CLIENT_CREATE_UPDATE);

   const [isSaving, setIsSaving] = useState(false);
   const [
      editValues, handleChange, {
         isChanged = false,
         setIsChanged,
         defaultValues,
         setDefaultValues,
         resetValues
      }
   ] = useEditData(
      isNew ? editItem : undefined);
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   useEffect(() => {
      if (clientData?.client) {
         setDefaultValues({...clientData.client, startMonth: moment(`${clientData.client.startMonth}/1/${(new Date()).getFullYear()}`)});
      }
   }, [clientData, setDefaultValues]);

   const handleClose = useCallback((newUrl) => {
      resetValues();
      defer(() => {
         location.state = undefined;
         if (newUrl) {
            location.pathname = newUrl;
         }
         history.replace(location);
      });
   }, [location, history, resetValues]);

   // Remove the event from being passed to handleClose.
   useKeyDown(() => handleClose());

   /**
    * Submit the client to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {

      if (isChanged) {
         try {
            setIsSaving(true);
            if (editValues.city) {
               const variables = {id: uuid(), name: editValues.city};
               await cityCreateUpdate({
                  variables,
                  optimisticResponse: {
                     city: {
                        ...variables,
                        __typename: 'City',
                     },
                     __typename: 'Mutation',
                  },
                  update: cacheUpdate(getCityCacheQueries(), variables.id, 'city'),
               });
               editValues.cityId = variables.id;
            }
            await clientCreateUpdate({
               variables: {...editValues, startMonth: moment(editValues.startMonth).format(MONTH_ONLY_FORMAT)},
               optimisticResponse: {
                  __typename: 'Mutation',
                  client: {
                     __typename: 'Client',
                     ...defaultValues,
                     ...editValues,
                     isDeleted: false,
                  }
               },
               update: cacheUpdate(getClientCacheQueries(), editValues.id, 'client'),
            });
            setIsChanged(false);
            handleClose(ADMIN_SETUP_PATH.replace(':clientId?', editValues.id));
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [clientCreateUpdate, handleClose, isChanged, cityCreateUpdate, defaultValues, editValues, setIsChanged]);

   // if (Object.keys(defaultValues).length <= 0) {
   //    return null;
   // }
   //
   return (
      <Grid container fullWidth fullHeight className={classes.frameStyle} direction={'column'} overflow={'visible'}
            wrap={'nowrap'}>
         <Grid item resizable={false} className={classes.infoInnerStyle}>
            <TypographyFHG variant={'h5'} id={'client.title.label'} color={'textSecondary'} gutterBottom
                           className={classes.titleStyle}/>
         </Grid>
         <Grid item container resizable>
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Prompt when={isChanged}/>
               <Grid name={'Client Edit Root'} container item fullWidth className={classes.infoRootStyle}>
                  <Grid name={'Task Edit Inner'} container item fullWidth className={classes.infoInnerStyle}
                        overflow={'visible'}>
                     <TextFieldLF
                        key={'name' + defaultValues.id}
                        name={'name'}
                        autoFocus
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.name}
                        value={editValues.name}
                        required
                     />
                     <TextFieldLF
                        key={'contactName' + defaultValues.id}
                        name={'contactName'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.contactName}
                        value={editValues.contactName}
                     />
                     <PhoneNumberFieldLF
                        key={'phone' + defaultValues.id}
                        name='phone'
                        labelTemplate={'client.{name}.label'}
                        placeholderKey={'phone.placeholder'}
                        disabled={isSaving || defaultValues?.isDeleted}
                        onChange={handleChange}
                        defaultValue={defaultValues.phone}
                        value={editValues.phone}
                     />
                     <TextFieldLF
                        key={'email' + defaultValues.id}
                        name={'email'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.email}
                        value={editValues.email}
                     />
                     <TextFieldLF
                        key={'addressLineOne' + defaultValues.id}
                        name={'addressLineOne'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.addressLineOne}
                        value={editValues.addressLineOne}
                     />
                     <TextFieldLF
                        key={'addressLineTwo' + defaultValues.id}
                        name={'addressLineTwo'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.addressLineTwo}
                        value={editValues.addressLineTwo}
                     />
                     <AutocompleteLF
                        key={'cityId' + defaultValues.id}
                        name={'cityId'}
                        editName={'city'}
                        options={optionsData?.cities}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        disableClearable={false}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        defaultValue={defaultValues.cityId}
                        // value={editValues.cityId}
                        fullWidth
                     />
                     <Grid container direction={'row'} wrap={'nowrap'} fullWidth>
                        <Grid item xs={8} style={{marginRight: theme.spacing(1)}}>
                           <AutocompleteLF
                              key={'stateId' + defaultValues.id}
                              name={'stateId'}
                              options={optionsData?.states}
                              labelTemplate={'client.{name}.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.stateId}
                              value={editValues.stateId}
                           />
                        </Grid>
                        <Grid item xs={4}>
                           <TextFieldLF
                              key={'zipCode' + defaultValues.id}
                              name={'zipCode'}
                              labelTemplate={'client.{name}.label'}
                              inputProps={{
                                 'data-type': 'number',
                                 maxLength: 5,
                                 pattern: '[0-9]{5}',
                                 title: 'Five digit zip code'
                              }}
                              onChange={handleChange}
                              defaultValue={defaultValues.zipCode}
                              value={editValues.zipCode}
                              fullWidth={false}
                           />
                        </Grid>
                     </Grid>
                     <DatePickerFHG
                        key={'startMonth' + defaultValues.id}
                        name={'startMonth'}
                        views={['month']}
                        disableToolbar={true}
                        format={MONTH_ONLY_FORMAT}
                        labelKey={'client.startMonth.label'}
                        defaultValue={defaultValues.startMonth}
                        value={editValues.startMonth}
                        minDate={moment().startOf('year')}
                        maxDate={moment().endOf('year')}
                        onChange={handleChange}
                        disabled={isSaving}
                        required
                     />
                  </Grid>
               </Grid>
               <Grid container item direction={'row'} fullWidth className={classes.buttonPanelStyle}
                     overflow={'visible'} resizable={false}>
                  <ProgressButton isProgress={isSaving} variant='text' color='primary' type={'submit'}
                                  size='large' labelKey='save.label' disabled={isSaving}/>
                  <ButtonFHG variant='text' size={'large'} labelKey={'cancel.button'} disabled={isSaving}
                             onClick={() => handleClose()}/>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
