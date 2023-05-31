import {Collapse} from '@material-ui/core';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Delete} from '@material-ui/icons';
import {indexOf} from 'lodash';
import defer from 'lodash/defer';
import moment from 'moment';
import {parse} from 'query-string';
import {useMemo} from 'react';
import React, {useState, useCallback} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {DATE_DB_FORMAT, DATE_FORMAT_KEYBOARD} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {BANK_QUERY} from '../../data/QueriesGL';
import {LIABILITY_DELETE} from '../../data/QueriesGL';
import {getLiabilityRefetchQueries} from '../../data/QueriesGL';
import {LIABILITY_CREATE_UPDATE} from '../../data/QueriesGL';
import {LIABILITY_CATEGORY_QUERY} from '../../data/QueriesGL';
import {LIABILITY_QUERY} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import CheckboxFHG from '../../fhg/components/CheckboxFHG';
import ConfirmIconButton from '../../fhg/components/ConfirmIconButton';
import Form from '../../fhg/components/edit/Form';
import Prompt from '../../fhg/components/edit/Prompt';
import useEditData from '../../fhg/components/edit/useEditData';
import Grid from '../../fhg/components/Grid';
import KeyboardDatePickerFHG from '../../fhg/components/KeyboardDatePickerFHG';
import ProgressButton from '../../fhg/components/ProgressButton';
import ProgressIndicator from '../../fhg/components/ProgressIndicator';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../../fhg/hooks/useKeyDown';
import AutocompleteLF2 from '../AutocompleteLF2';
import ButtonLF from '../ButtonLF';
import TextFieldLF from '../TextFieldLF';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import {assign} from '../../fhg/utils/DataUtil';

const TYPE_CATEGORIES = ['Accounts Payable', 'Outstanding Drafts/Checks', 'Income Taxes Payable'];

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
         maxHeight: `calc(100% - 80px)`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(3),
      },
      buttonPanelStyle: {
         // marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 0, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      checkboxStyle: {
         marginTop: 0,
         marginRight: theme.spacing(0),
         marginLeft: theme.spacing(-1),
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
   {name: 'LiabilityEditStyles'}
);

export default function LiabilityEdit() {
   const classes = useStyles();
   const {entityId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const date = sessionStorage.filterDate
      ? moment(sessionStorage.filterDate, MONTH_FORMAT)
      : location.search
      ? moment(parse(location.search)?.date)
      : moment();
   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const isCurrentMonth = moment(historyDate).isSame(moment(), 'month');
   const liabilityId = location?.state?.id;
   const isNew = !liabilityId;

   const editItem = useMemo(
      () => ({
         id: 0,
         entityId,
         amount: undefined,
         description: '',
         bankId: undefined,
         isCollateral: true,
         isRemoved: false,
         removedDate: undefined,
         startDate: historyDate,
         isDeleted: false,
         note: '',
         createdDateTime: new Date().toLocaleString(),
      }),
      [entityId, historyDate]
   );

   const [liabilityCategoryData] = useQueryFHG(LIABILITY_CATEGORY_QUERY);
   const liabilityCategories = useMemo(
      () => sortBy(liabilityCategoryData?.liabilityCategories || [], ['name']),
      [liabilityCategoryData]
   );

   const [bankData] = useQueryFHG(BANK_QUERY);
   const banks = useMemo(() => sortBy(bankData?.banks || [], 'name'), [bankData]);

   const [liabilityDelete] = useMutationFHG(LIABILITY_DELETE);

   const [isSaving, setIsSaving] = useState(false);
   const [showDates, setShowDates] = useState(!isCurrentMonth);

   const [
      editValues,
      handleChange,
      {isChanged = false, setIsChanged, defaultValues, setDefaultValues, getValue, setValue},
   ] = useEditData(isNew ? editItem : undefined, !isNew && ['entityId']);

   const [liabilityData] = useQueryFHG(LIABILITY_QUERY, {
      variables: {liabilityId, historyDate: editValues?.historyDate || historyDate},
      skip: !liabilityId || liabilityId === 'new',
   });
   const liability = useMemo(() => liabilityData?.liability || editItem, [liabilityData, editItem]);

   const [liabilityCreateUpdate] = useMutationFHG(LIABILITY_CREATE_UPDATE, {historyDate}, true);
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   const isTypeCategory = useMemo(() => {
      const categoryId = getValue('liabilityCategoryId');
      const selectedCategory = find(liabilityCategories, {id: categoryId});

      if (selectedCategory) {
         return selectedCategory ? indexOf(TYPE_CATEGORIES, selectedCategory.name) >= 0 : false;
      }
   }, [liabilityCategories, getValue]);

   useEffect(() => {
      if (liability) {
         setDefaultValues(liability);
      }
   }, [liability, setDefaultValues]);

   /**
    * When isRemoved is changed to false, set removedDate to null.
    */
   useEffect(() => {
      if (liability) {
         if (editValues.isRemoved === false) {
            setValue('removedDate', null);
         } else if (editValues.isRemoved === true) {
            setValue('removedDate', moment());
         }
      }
      // setValue causes endless loops.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [liability, editValues.isRemoved]);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         history.replace(location);
      });
   }, [history, location, setIsChanged]);

   useKeyDown(handleClose);

   const handleShowDates = () => {
      setShowDates((showDates) => !showDates);
   };

   const handleDelete = async () => {
      await liabilityDelete({
         variables: {id: liabilityId},
         optimisticResponse: {liability_Delete: 1},
         refetchQueries: () => getLiabilityRefetchQueries(entityId, liabilityId, historyDate),
      });
      handleClose();
   };

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         setIsSaving(true);
         try {
            const removedDate = moment(getValue('removedDate')) || moment();
            let useHistoryDate = editValues.historyDate ? editValues.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(getValue('startDate'))) {
               useHistoryDate = moment(getValue('startDate'));
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...editValues,
               paymentMaturityDate: getValue('paymentMaturityDate') ? getValue('paymentMaturityDate').format(DATE_DB_FORMAT) : null,
               removedDate: getValue('isRemoved') ? getValue('removedDate') : null,
               id: liabilityData?.liability?.liabilityId || uuid(),
            };
            if (isTypeCategory) {
               variables.bank = null;
               variables.bankId = null;
            }

            const liability = assign(
               {
                  bank:
                     typeof getValue('bank') === 'string'
                        ? {id: uuid(), name: getValue('bank'), __typename: 'Bank'}
                        : find(banks, getValue('bankId')) || getValue('bank'),
                  isDeleted: false,
               },
               variables,
               defaultValues,
               editItem,
               {
                  __typename: 'Liability',
                  liabilityCategory: find(liabilityCategories, getValue('liabilityCategoryId')),
                  liabilityId: liabilityData?.liability?.liabilityId || variables?.id,
                  isDeleted: false,
               }
            );

            await liabilityCreateUpdate({
               variables,
               optimisticResponse: {__typename: 'Mutation', liability},
               refetchQueries: () => getLiabilityRefetchQueries(entityId, variables?.id, historyDate),
            });
            setIsChanged(false);
            handleClose();
         } catch (e) {
            console.log(e);
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      isChanged,
      getValue,
      editValues,
      historyDate,
      liabilityData?.liability?.liabilityId,
      isTypeCategory,
      banks,
      defaultValues,
      editItem,
      liabilityCategories,
      liabilityCreateUpdate,
      setIsChanged,
      handleClose,
      entityId,
   ]);

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
         <Form onSubmit={!isPickerOpen ? handleSubmit : undefined} className={classes.formStyle}>
            <Prompt when={isChanged} />

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
                  <TypographyFHG variant={'h5'} id={'liability.title.label'} color={'textSecondary'} gutterBottom />
               </Grid>
               {!isNew && (
                  <Grid container overflow={'visible'} direction={'row'} fullWidth={false} alignItems={'center'}>
                     <Grid item overflow={'visible'}>
                        <CheckboxFHG
                           key={'isRemoved'}
                           name={'isRemoved'}
                           onChange={handleChange}
                           color={'default'}
                           labelKey={'liability.isRemoved.label'}
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
                           values={{type: 'liability'}}
                           messageKey={'confirmRemove.message'}
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
               <Grid name={'Liability Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Liability Edit Inner'}
                     container
                     item
                     fullWidth
                     overflow={'visible'}
                     className={classes.innerStyle}
                  >
                     <Grid item>
                        <ButtonLF
                           labelKey={!showDates ? 'liability.showDates.label' : 'liability.hideDates.label'}
                           onClick={handleShowDates}
                        />
                     </Grid>
                     <Collapse id='datesId' in={showDates} timeout='auto' unmountOnExit style={{width: '100%'}}>
                        <KeyboardDatePickerFHG
                           key={'startDate' + defaultValues.id}
                           name={'startDate'}
                           views={['month']}
                           format={MONTH_FORMAT}
                           labelKey={'liability.addedDate.label'}
                           maxDate={getValue('removedDate') || moment()}
                           value={getValue('startDate')}
                           onChange={handleChange}
                           disabled={isSaving}
                           required
                        />
                        <KeyboardDatePickerFHG
                           key={'historyDate' + defaultValues.id}
                           name={'historyDate'}
                           views={['month']}
                           format={MONTH_FORMAT}
                           labelKey={'asset.date.label'}
                           minDate={moment(getValue('startDate')).startOf('month')}
                           maxDate={moment(getValue('removedDate') || moment()).endOf('month')}
                           defaultValue={historyDate}
                           value={editValues.historyDate}
                           onChange={handleChange}
                           required
                           disabled={isSaving}
                        />
                        {getValue('isRemoved') && (
                           <KeyboardDatePickerFHG
                              key={'removedDate' + defaultValues.id}
                              name={'removedDate'}
                              views={['month']}
                              format={MONTH_FORMAT}
                              minDate={getValue('startDate')}
                              labelKey={'liability.removedDate.label'}
                              value={getValue('removedDate')}
                              onChange={handleChange}
                              disabled={isSaving}
                           />
                        )}
                     </Collapse>
                     <AutocompleteLF2
                        key={`'liabilityCategoryId ${defaultValues?.id}`}
                        name={'liabilityCategoryId'}
                        freeSolo={false}
                        autoHighlight
                        editName={'liabilityCategory'}
                        options={liabilityCategories}
                        labelTemplate={'liability.category.label'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        value={getValue('liabilityCategoryId')}
                        required
                        fullWidth
                     />
                     <Collapse in={!isTypeCategory} style={{width: '100%'}}>
                        <AutocompleteLF2
                           key={`bankId ${defaultValues?.id}`}
                           name={'bankId'}
                           editName={'bank'}
                           autoHighlight
                           options={banks}
                           labelKey={'liability.bank.label'}
                           onChange={handleChange}
                           onBlur={() => setIsPickerOpen(false)}
                           onFocus={() => setIsPickerOpen(true)}
                           value={getValue('bankId')}
                           required={!isTypeCategory}
                           fullWidth
                        />
                     </Collapse>
                     <TextFieldLF
                        key={'description' + defaultValues?.id}
                        name={'description'}
                        labelTemplate={'task.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.description}
                        value={editValues.description}
                        multiline
                        rows={2}
                        disabled={isSaving}
                     />
                     <TextFieldLF
                        key={'interestRate' + defaultValues?.id}
                        type={'number'}
                        name={'interestRate'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        // defaultValue={defaultValues.interestRate}
                        value={getValue('interestRate')}
                        disabled={isSaving}
                        inputProps={{
                           min: 0,
                           max: 99.99,
                           step: 0.01,
                        }}
                        required
                     />
                     <TextFieldLF
                        key={'payment' + defaultValues?.id}
                        internalKey={'payment' + defaultValues?.id}
                        isFormattedNumber
                        name={'payment'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('payment')}
                        disabled={isSaving}
                        inputProps={{prefix: '$', allowNegative: false}}
                     />
                     <TextFieldLF
                        key={'paymentDueDate' + defaultValues?.id}
                        name={'paymentDueDate'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('paymentDueDate')}
                        disabled={isSaving}
                     />
                     <KeyboardDatePickerFHG
                         key={'paymentMaturityDate' + defaultValues.id}
                         name={'paymentMaturityDate'}
                         format={DATE_FORMAT_KEYBOARD}
                         labelKey={'liability.paymentMaturityDate.label'}
                         value={getValue('paymentMaturityDate', null)}
                         defaultValue={null}
                         onChange={handleChange}
                         disabled={isSaving}
                     />
                     <CheckboxFHG
                        key={'isCollateral'}
                        name={'isCollateral'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'liability.isCollateral.label'}
                        value={'isCollateral'}
                        defaultChecked={defaultValues.isCollateral}
                        checked={editValues.isCollateral}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                     <TextFieldLF
                        key={'amount' + defaultValues?.id}
                        internalKey={'amount' + defaultValues?.id}
                        isFormattedNumber
                        name={'amount'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('amount')}
                        disabled={isSaving}
                        inputProps={{prefix: '$', allowNegative: true}}
                        required
                     />
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
                        type='submit'
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
               </Grid>
            </Grid>
         </Form>
      </Grid>
   );
}
