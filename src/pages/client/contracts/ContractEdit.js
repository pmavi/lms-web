import {Collapse} from '@material-ui/core';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Delete} from '@material-ui/icons';
import {toLower} from 'lodash';
import defer from 'lodash/defer';
import moment from 'moment';
import {parse} from 'query-string';
import React, {useState, useCallback} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import ButtonLF from '../../../components/ButtonLF';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import ConfirmIconButton from '../../../fhg/components/ConfirmIconButton';
import Form from '../../../fhg/components/edit/Form';
import Prompt from '../../../fhg/components/edit/Prompt';
import Grid from '../../../fhg/components/Grid';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import ProgressButton from '../../../fhg/components/ProgressButton';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import TypographyFHG from '../../../fhg/components/Typography';
// import {useEffect} from 'react';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import useEffect from '../../../fhg/hooks/useKeyDown';
import {v4 as uuid} from 'uuid';
import useMessage from '../../../fhg/hooks/useMessage';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         overflow: 'visible',
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
      buttonPanelStyle: {
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
      innerStyle: {
         paddingLeft: theme.spacing(2),
         paddingRight: theme.spacing(2),
      },
      headerStyle: {
         paddingLeft: theme.spacing(2),
         paddingRight: theme.spacing(2),
      },
      deleteButtonStyle: {
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
   }),
   {name: 'ContractEditStyles'}
);

/**
 * Generic Edit for all contract types.
 * @param titleId The title id to display.
 * @param editData The editData containing all the editData for both generic and specific data for the contract.
 * @param onSubmit Callback when the user submits the data.
 * @param onDelete Callback when the user deletes the contract.
 * @param children The child elements containing all the specific edit fields.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ContractEdit({titleId, editData, onSubmit, onDelete, children}) {
   const classes = useStyles();
   const title = useMessage(titleId);
   const {entityId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const category = location.state?.category;

   const date = sessionStorage.filterDate
      ? moment(sessionStorage.filterDate, MONTH_FORMAT)
      : location.search
      ? moment(parse(location.search)?.date)
      : moment();

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const contractId = location?.state?.id;
   const isNew = !contractId;

   const [isSaving, setIsSaving] = useState(false);
   const [showDates, setShowDates] = useState(false);

   const [editValues, handleChange, {isChanged = false, setIsChanged, defaultValues, getValue, setValue}] = editData;

   /**
    * When isRemoved is changed to false, set removedDate to null.
    */
   useEffect(() => {
      if (editValues.isRemoved === false) {
         setValue('removedDate', null);
      } else if (editValues.isRemoved === true) {
         setValue('removedDate', moment());
      }
   }, [editValues.isRemoved, setValue]);

   /**
    * Close the edit.
    *
    * Note: The item to edit is contained in the location state. Clearing the state will close the edit.
    * @type {(function(): void)|*}
    */
   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         history.replace(location);
      });
   }, [history, location, setIsChanged]);

   /**
    * Show all the date fields.
    */
   const handleShowDates = () => {
      setShowDates((showDates) => !showDates);
   };

   /**
    * Submit the contract.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            const removedDate = moment(getValue('removedDate')) || moment();
            let useHistoryDate = moment(historyDate);

            if (useHistoryDate.isBefore(getValue('startDate'))) {
               useHistoryDate = moment(getValue('startDate'));
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               entityId,
               ...editValues,
               id: getValue('contractId') || uuid(),
               startDate: getValue('startDate').format(DATE_DB_FORMAT),
               historyDate: useHistoryDate.startOf('month').format(DATE_DB_FORMAT),
               removedDate: editValues.isRemoved ? removedDate.format(DATE_DB_FORMAT) : null,
            };
            setIsSaving(true);

            onSubmit(variables);

            handleClose();
         } catch (e) {
            console.log(e);
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [isChanged, getValue, editValues, historyDate, entityId, onSubmit, handleClose]);

   /**
    * Delete the contract.
    */
   const handleDelete = () => {
      onDelete?.();
      handleClose();
   };

   useKeyDown(handleClose);

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
         <ProgressIndicator isGlobal={false} />
         <Grid
            item
            container
            direction={'row'}
            alignItems={'center'}
            justify={'space-between'}
            resizable={false}
            className={classes.headerStyle}
            wrap={'nowrap'}
         >
            <Grid item>
               <TypographyFHG variant={'h5'} color={'textSecondary'} gutterBottom>
                  {title}
               </TypographyFHG>
            </Grid>
            {!isNew && (
               <Grid container overflow={'visible'} direction={'row'} fullWidth={false} alignItems={'center'}>
                  <Grid item overflow={'visible'}>
                     <CheckboxFHG
                        key={'isRemoved'}
                        name={'isRemoved'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'contract.isRemoved.label'}
                        value={'isRemoved'}
                        defaultChecked={defaultValues.isRemoved}
                        checked={editValues.isRemoved}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                  </Grid>
                  <Grid item>
                     <ConfirmIconButton
                        className={`${classes.deleteButtonStyle}`}
                        onConfirm={handleDelete}
                        values={{type: toLower(title), name: getValue('crop')}}
                        messageKey={'contract.RemoveValue.message'}
                        buttonLabelKey={'delete.button'}
                        size={'small'}
                        submitStyle={classes.deleteColorStyle}
                     >
                        <Delete fontSize={'small'} />
                     </ConfirmIconButton>
                  </Grid>
               </Grid>
            )}
         </Grid>
         <Grid item container resizable>
            <Form onSubmit={handleSubmit} className={classes.formStyle}>
               <Prompt when={isChanged} />
               <Grid name={'Contract Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Contract Edit Inner'}
                     container
                     item
                     fullWidth
                     overflow={'visible'}
                     className={classes.innerStyle}
                  >
                     <Grid item>
                        <ButtonLF
                           labelKey={!showDates ? 'contract.showDates.label' : 'contract.hideDates.label'}
                           onClick={handleShowDates}
                        />
                     </Grid>
                     <Collapse id='datesId' in={showDates} timeout='auto' unmountOnExit style={{width: '100%'}}>
                        <KeyboardDatePickerFHG
                           key={'startDate' + defaultValues.id}
                           name={'startDate'}
                           views={['month']}
                           format={MONTH_FORMAT}
                           labelKey={'contract.addedDate.label'}
                           maxDate={getValue('removedDate') || moment()}
                           value={getValue('startDate')}
                           onChange={handleChange}
                           disabled={isSaving}
                           required
                        />
                        {getValue('isRemoved') && (
                           <KeyboardDatePickerFHG
                              key={'removedDate' + defaultValues.id}
                              name={'removedDate'}
                              views={['month']}
                              format={MONTH_FORMAT}
                              minDate={getValue('startDate')}
                              labelKey={'contract.removedDate.label'}
                              value={getValue('removedDate', null)}
                              onChange={handleChange}
                              disabled={isSaving}
                           />
                        )}
                     </Collapse>
                     {children}
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  overflow={'visible'}
                  justify={'space-between'}
                  resizable={false}
               >
                  <Grid item>
                     <ProgressButton
                        isProgress={isSaving}
                        variant='text'
                        color='primary'
                        type={'submit'}
                        size='large'
                        labelKey='save.label'
                        disabled={isSaving || !category}
                     />
                     <ButtonFHG
                        variant='text'
                        size={'large'}
                        labelKey={'cancel.button'}
                        disabled={isSaving}
                        onClick={() => handleClose()}
                     />
                  </Grid>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
