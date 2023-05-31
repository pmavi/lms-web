import {Collapse} from '@material-ui/core';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Delete} from '@material-ui/icons';
import {indexOf} from 'lodash';
import {map} from 'lodash';
import defer from 'lodash/defer';
import moment from 'moment';
import {parse} from 'query-string';
import {useMemo} from 'react';
import React, {useState, useCallback} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {DATE_DB_FORMAT} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {ASSET_DELETE} from '../../data/QueriesGL';
import {UNIT_TYPE_CREATE_UPDATE} from '../../data/QueriesGL';
import {getUnitTypeCacheQueries} from '../../data/QueriesGL';
import {getAssetRefetchQueries} from '../../data/QueriesGL';
import {ASSET_CREATE_UPDATE} from '../../data/QueriesGL';
import {ASSET_CATEGORY_QUERY} from '../../data/QueriesGL';
import {ASSET_QUERY} from '../../data/QueriesGL';
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
import {cacheUpdate} from '../../fhg/utils/DataUtil';
import {TERM_TO_DISPLAY} from '../../pages/client/assets/Assets';
import AssetBreederLivestockEdit from './AssetBreederLivestockEdit';
import AssetLivestockEdit from './AssetLivestockEdit';
import AssetQuantityEdit from './AssetQuantityEdit';
import AssetYearEdit from './AssetYearEdit';
import AutocompleteLF2 from '../AutocompleteLF2';
import ButtonLF from '../ButtonLF';
import TextFieldLF from '../TextFieldLF';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import {assign} from '../../fhg/utils/DataUtil';

export const LIVESTOCK_CATEGORY_NAME = 'Market Livestock';
export const BREEDER_LIVESTOCK_CATEGORY_NAME = 'Breeder Livestock';
export const QUANTITY_CATEGORY1 = 'Crop & Feed Inventory';
export const QUANTITY_CATEGORY2 = 'Prepaid Expenses';
export const QUANTITY_CATEGORY_NAME = 'Quantity Category';
export const REAL_ESTATE_CATEGORY_NAME = 'Real Estate';
export const ACRES_CATEGORY_NAME = 'Investment in Crops';
export const DEFAULT_CATEGORY_NAME = 'Default';
export const YEAR_CATEGORY1 = 'Machinery & Equipment';
export const YEAR_CATEGORY2 = 'Vehicles';
export const YEAR_CATEGORY3 = 'Real Estate';
export const YEAR_CATEGORIES = [YEAR_CATEGORY1, YEAR_CATEGORY2, YEAR_CATEGORY3];

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
         // marginLeft: -8,
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
   {name: 'AssetEditStyles'}
);

export default function AssetEdit() {
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
   const assetId = location?.state?.id;
   const isNew = !assetId;

   const editItem = useMemo(
      () => ({
         id: 0,
         entityId,
         amount: undefined,
         description: '',
         isCollateral: true,
         isRemoved: false,
         year: moment().get('year'),
         acres: undefined,
         price: undefined,
         weight: undefined,
         head: undefined,
         quantity: undefined,
         removedDate: undefined,
         startDate: historyDate,
         isDeleted: false,
      }),
      [entityId, historyDate]
   );

   const cacheEditItem = useMemo(
      () => ({
         amount: '',
         description: '',
         isCollateral: false,
         unitTypeId: 0,
         assetId: uuid(),
         isRemoved: false,
         year: moment().get('year'),
         acres: '',
         price: '',
         weight: '',
         head: '',
         quantity: '',
         removedDate: '',
         startDate: moment().format(DATE_DB_FORMAT),
         isDeleted: false,
      }),
      []
   );

   const [assetCategoryData] = useQueryFHG(ASSET_CATEGORY_QUERY);
   const assetCategories = useMemo(
      () =>
         sortBy(
            map(assetCategoryData?.assetCategories || [], (category) => ({
               ...category,
               label: TERM_TO_DISPLAY[category.term],
            })),
            ['term', 'name']
         ),
      [assetCategoryData]
   );

   const [assetCreateUpdate] = useMutationFHG(ASSET_CREATE_UPDATE);
   const [assetDelete] = useMutationFHG(ASSET_DELETE);
   const [unitTypeCreateUpdate] = useMutationFHG(UNIT_TYPE_CREATE_UPDATE);

   const [isSaving, setIsSaving] = useState(false);
   const [showDates, setShowDates] = useState(!isCurrentMonth);

   const [
      editValues,
      handleChange,
      {isChanged = false, setIsChanged, defaultValues, setDefaultValues, getValue, setValue, setEditValues},
   ] = useEditData(isNew ? editItem : undefined, !isNew && ['entityId']);

   const [assetData] = useQueryFHG(ASSET_QUERY, {
      variables: {assetId, historyDate: editValues?.historyDate || historyDate},
      skip: !assetId || assetId === 'new',
   });
   const asset = useMemo(() => assetData?.asset || editItem, [assetData, editItem]);

   const assetGroup = useMemo(() => {
      const assetCategoryId = getValue('assetCategoryId', asset?.assetCategoryId);
      const category = find(assetCategories, {id: assetCategoryId});

      switch (category?.name) {
         case LIVESTOCK_CATEGORY_NAME:
            return LIVESTOCK_CATEGORY_NAME;
         case BREEDER_LIVESTOCK_CATEGORY_NAME:
            return BREEDER_LIVESTOCK_CATEGORY_NAME;
         case REAL_ESTATE_CATEGORY_NAME:
         case ACRES_CATEGORY_NAME:
            return ACRES_CATEGORY_NAME;
         case QUANTITY_CATEGORY1:
         case QUANTITY_CATEGORY2:
            return QUANTITY_CATEGORY_NAME;
         default:
            return indexOf(YEAR_CATEGORIES, category?.name) >= 0 ? YEAR_CATEGORIES : DEFAULT_CATEGORY_NAME;
      }
   }, [asset, getValue, assetCategories]);

   const [isPickerOpen, setIsPickerOpen] = useState(false);

   useEffect(() => {
      if (asset) {
         setDefaultValues(asset);
      }
   }, [asset, setDefaultValues]);

   /**
    * When isRemoved is changed to false, set removedDate to null.
    */
   useEffect(() => {
      if (asset) {
         if (editValues.isRemoved === false) {
            setValue('removedDate', null);
         } else if (editValues.isRemoved === true) setValue('removedDate', moment());
      }
      // setValue would cause an infinite loop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [asset, editValues.isRemoved]);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         history.replace(location);
      });
   }, [history, location, setIsChanged]);

   const handleShowDates = () => {
      setShowDates((showDates) => !showDates);
   };

   const handleDelete = async () => {
      await assetDelete({
         variables: {id: assetId},
         optimisticResponse: {asset_Delete: 1},
         refetchQueries: () => getAssetRefetchQueries(entityId, assetId, historyDate),
      });
      handleClose();
   };

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      const calculateAmount = () => {
         if (editValues.price || editValues.head || editValues.weight || editValues.quantity || editValues.acres) {
            switch (assetGroup) {
               case LIVESTOCK_CATEGORY_NAME:
                  return getValue('head', 0) * getValue('weight', 0) * getValue('price');
               case BREEDER_LIVESTOCK_CATEGORY_NAME:
                  return getValue('head', 0) * getValue('price');
               case ACRES_CATEGORY_NAME:
                  return getValue('acres', 0) * getValue('price', 0);
               case QUANTITY_CATEGORY_NAME:
                  return getValue('quantity', 0) * getValue('price', 0);
               default:
                  return editValues.amount;
            }
         } else if (editValues.amount) {
            return editValues.amount;
         }
         return undefined;
      };

      if (isChanged) {
         try {
            const removedDate = moment(getValue('removedDate')) || moment();
            let useHistoryDate = editValues.historyDate ? editValues.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(getValue('startDate'))) {
               useHistoryDate = moment(getValue('startDate'));
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: useHistoryDate.startOf('month').format(DATE_DB_FORMAT),
               removedDate: editValues.isRemoved ? removedDate : null,
               ...editValues,
               year: typeof editValues.year === 'object' ? editValues.year.get('year') : editValues.year,
               id: assetData?.asset?.assetId || uuid(),
            };
            variables.amount = calculateAmount();
            setIsSaving(true);

            if (editValues.unit) {
               const unitVariables = {id: uuid(), name: editValues.unit};
               await unitTypeCreateUpdate({
                  variables: unitVariables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     unitType: {
                        __typename: 'UnitType',
                        ...unitVariables,
                        isDeleted: false,
                     },
                  },
                  update: cacheUpdate(getUnitTypeCacheQueries()),
               });
               variables.unitTypeId = unitVariables.id;
               delete variables.unit;
            }
            const asset = assign(variables, defaultValues, cacheEditItem, {__typename: 'Asset', isDeleted: false});

            await assetCreateUpdate({
               variables,
               optimisticResponse: {__typename: 'Mutation', asset},
               refetchQueries: () => getAssetRefetchQueries(entityId, variables?.id, historyDate),
            });
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
      editValues,
      assetGroup,
      getValue,
      historyDate,
      assetData?.asset?.assetId,
      defaultValues,
      cacheEditItem,
      assetCreateUpdate,
      handleClose,
      unitTypeCreateUpdate,
      entityId,
   ]);

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
               <TypographyFHG variant={'h5'} id={'asset.title.label'} color={'textSecondary'} gutterBottom />
            </Grid>
            {!isNew && (
               <Grid container overflow={'visible'} direction={'row'} fullWidth={false} alignItems={'center'}>
                  <Grid item overflow={'visible'}>
                     <CheckboxFHG
                        key={'isRemoved'}
                        name={'isRemoved'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'asset.isRemoved.label'}
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
                        values={{type: 'asset'}}
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
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Prompt when={isChanged} />
               <Grid name={'Asset Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Asset Edit Inner'}
                     container
                     item
                     fullWidth
                     overflow={'visible'}
                     className={classes.innerStyle}
                  >
                     <Grid item>
                        <ButtonLF
                           labelKey={!showDates ? 'asset.showDates.label' : 'asset.hideDates.label'}
                           onClick={handleShowDates}
                        />
                     </Grid>
                     <Collapse id='datesId' in={showDates} timeout='auto' unmountOnExit style={{width: '100%'}}>
                        <KeyboardDatePickerFHG
                           key={'startDate' + defaultValues.id}
                           name={'startDate'}
                           views={['month']}
                           format={MONTH_FORMAT}
                           labelKey={'asset.addedDate.label'}
                           maxDate={getValue('removedDate') || moment()}
                           defaultValue={defaultValues.startDate}
                           value={editValues.startDate}
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
                              labelKey={'asset.removedDate.label'}
                              defaultValue={defaultValues.removedDate || null}
                              value={editValues.removedDate}
                              onChange={handleChange}
                              disabled={isSaving}
                           />
                        )}
                     </Collapse>
                     <AutocompleteLF2
                        key={`'assetCategoryId ${defaultValues?.id}`}
                        name={'assetCategoryId'}
                        groupBy={(option) => TERM_TO_DISPLAY[option.term]}
                        freeSolo={false}
                        disableClearable
                        autoHighlight
                        editName={'assetCategory'}
                        options={assetCategories}
                        labelTemplate={'asset.category.label'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        value={getValue('assetCategoryId')}
                        required
                        fullWidth
                     />
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
                     <CheckboxFHG
                        key={'isCollateral'}
                        name={'isCollateral'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'asset.isCollateral.label'}
                        value={'isCollateral'}
                        defaultChecked={defaultValues.isCollateral}
                        checked={editValues.isCollateral}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                     {
                        {
                           [DEFAULT_CATEGORY_NAME]: (
                              <TextFieldLF
                                 key={'amount' + defaultValues?.id}
                                 internalKey={'amount' + defaultValues?.id}
                                 isFormattedNumber
                                 name={'amount'}
                                 labelTemplate={'asset.{name}.label'}
                                 onChange={handleChange}
                                 value={getValue('amount')}
                                 disabled={isSaving}
                                 inputProps={{prefix: '$'}}
                                 required
                              />
                           ),
                           [BREEDER_LIVESTOCK_CATEGORY_NAME]: (
                              <AssetBreederLivestockEdit
                                 open={true}
                                 defaultValues={defaultValues}
                                 onChange={handleChange}
                                 isSaving={isSaving}
                                 getValue={getValue}
                                 setEditValues={setEditValues}
                              />
                           ),
                           [LIVESTOCK_CATEGORY_NAME]: (
                              <AssetLivestockEdit
                                 open={true}
                                 defaultValues={defaultValues}
                                 onChange={handleChange}
                                 isSaving={isSaving}
                                 getValue={getValue}
                                 setEditValues={setEditValues}
                              />
                           ),
                           [ACRES_CATEGORY_NAME]: (
                              <AssetQuantityEdit
                                 open={true}
                                 defaultValues={defaultValues}
                                 onChange={handleChange}
                                 isSaving={isSaving}
                                 getValue={getValue}
                                 setEditValues={setEditValues}
                                 editValues={editValues}
                              />
                           ),
                           [QUANTITY_CATEGORY_NAME]: (
                              <AssetQuantityEdit
                                 open={true}
                                 defaultValues={defaultValues}
                                 onChange={handleChange}
                                 isSaving={isSaving}
                                 getValue={getValue}
                                 setEditValues={setEditValues}
                                 labelKey={'asset.units.label'}
                                 valueKey={'quantity'}
                              />
                           ),
                           [YEAR_CATEGORIES]: (
                              <AssetYearEdit
                                 key={defaultValues?.id + getValue('assetCategoryId')}
                                 open={true}
                                 defaultValues={defaultValues}
                                 onChange={handleChange}
                                 isSaving={isSaving}
                                 getValue={getValue}
                                 editValues={editValues}
                              />
                           ),
                        }[assetGroup]
                     }
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
            </Form>
         </Grid>
      </Grid>
   );
}
