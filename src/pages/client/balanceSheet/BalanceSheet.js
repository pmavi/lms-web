// import {PDFViewer} from '@react-pdf/renderer';
import {Chip} from '@material-ui/core';
import {Divider} from '@material-ui/core';
import {TextField} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Autocomplete} from '@material-ui/lab';
import {join} from 'lodash';
import {castArray} from 'lodash';
import {filter} from 'lodash';
import {map} from 'lodash';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {useCallback} from 'react';
import React, {useMemo} from 'react';
import {FormattedNumber} from 'react-intl';
import {useHistory} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import {BALANCE_SHEET_INDEX} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {LIABILITIES_PATH} from '../../../Constants';
import {ENTITY_ASSET_PATH} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {BALANCE_SHEET_QUERY} from '../../../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import useEditData from '../../../fhg/components/edit/useEditData';
import find from 'lodash/find';

import Grid from '../../../fhg/components/Grid';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import TableFHG from '../../../fhg/components/table/TableFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import {parse} from 'query-string';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useBalanceSheetExcelExport from './useBalanceSheetExcelExport';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: '#F0F6E9 !important',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(2),
      },
      tableHeadRoot: {
         top: 0,
         position: 'sticky',
         zIndex: theme.zIndex.drawer + 1,
      },
      headerTextStyle: {
         fontWeight: 500,
      },
      tableRoot: {
         margin: 0,
      },
      tableHeaderStyle: {
         backgroundColor: 'rgba(223,235,209,0.41)',
      },
      inputStyle: {
         minWidth: 60,
         '& input': {
            minWidth: '200px !important',
         },
      },
      entitySelectStyle: {
         marginBottom: 6,
      },
      tableFrameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      totalsFrameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      tableRow: {
         backgroundColor: '#F0F6E9 !important',
         // backgroundColor: 'transparent !important',
      },
   }),
   {name: 'BalanceSheetStyles'}
);

/**
 * Balance sheet component for the current entity.
 *
 * Reviewed: 5/28/21
 */
export default function BalanceSheet() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const date = sessionStorage.filterDate ? sessionStorage.filterDate : moment().format(MONTH_FORMAT);
   const {entityIds = [entityId], isAllEntities = false} = parse(location.search) || {};
   const firstDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const lastDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
   const entityIdList = castArray(entityIds);
   const theme = useTheme();
   const classes = useStyles();
   usePageTitle({titleKey: 'balance.title', values: {month: moment(date, MONTH_FORMAT)?.format('MMMM')}});

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const entities = sortBy(entitiesData?.entities || [], 'name');

   const [editValues, handleChange, {getValue, setEditValues, defaultValues}] = useEditData(
      {
         reportDate: firstDate,
         entityId: entityIdList ? entityIdList : entityId ? [entityId] : [],
         isAllEntityId: isAllEntities,
      },
      ['entityId']
   );

   const [balanceSheetData] = useQueryFHG(BALANCE_SHEET_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: isAllEntities ? map(entities, 'id') : entityIdList, date: lastDate},
      skip: !validate(entityId),
   });

   const {workingCapital, currentRatio, totalEquity, totalLiabilities, totalAssets, equityAssetPercentage} =
      balanceSheetData?.balanceSheet || {};

   const assetsCurrent = balanceSheetData?.balanceSheet?.assets?.current?.categories || [{}];
   const assetsIntermediate = balanceSheetData?.balanceSheet?.assets?.intermediate?.categories || [{}];
   const assetsLongTerm = balanceSheetData?.balanceSheet?.assets?.longTerm?.categories || [{}];
   const liabilitiesCurrent = balanceSheetData?.balanceSheet?.liabilities?.current?.categories || [{}];
   const liabilitiesIntermediate = balanceSheetData?.balanceSheet?.liabilities?.intermediate?.categories || [{}];
   const liabilitiesLongTerm = balanceSheetData?.balanceSheet?.liabilities?.longTerm?.categories || [{}];

   /**
    * Set the location search parameters based on the report date and entities selected.
    */
   useEffect(() => {
      if (editValues?.reportDate || editValues?.entityId?.length > 0 || editValues?.isAllEntityId !== undefined) {
         const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
         sessionStorage.filterDate = getValue('reportDate')
            ? moment(getValue('reportDate')).format(MONTH_FORMAT)
            : undefined;

         if (getValue('isAllEntityId')) {
            searchParams.isAllEntities = true;
            searchParams.entityIds = undefined;
         } else {
            searchParams.isAllEntities = undefined;
            searchParams.entityIds = getValue('entityId') ? getValue('entityId') : undefined;
         }

         const search = stringify(searchParams);
         history.replace({pathname: location.pathname, search});
      }
   }, [history, location.pathname, location.search, editValues, setEditValues, getValue]);

   /**
    * Set the selected entities to the entity selected in the app bar, when only one entity is selected.
    */
   useEffect(() => {
      const existingEntityId = editValues?.entityId;

      if (entityId && existingEntityId?.length <= 1 && entityId !== existingEntityId?.[0]) {
         setEditValues((editValues) => ({...editValues, entityId: [entityId]}));
      }
   }, [editValues?.entityId, entityId, setEditValues]);

   // Create the asset columns for the table.
   const assetColumns = useMemo(() => {
      return [
         {
            id: 'currentAssets',
            Header: <TypographyFHG id={'balance.currentAsset.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   // Create the columns for the intermediate term assets table.
   const assetIntermediateTermColumns = useMemo(() => {
      return [
         {
            id: 'intermediateTerm',
            Header: <TypographyFHG id={'balance.intermediateTermAsset.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   // Create the columns for the long term assets table.
   const assetLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTerm',
            Header: <TypographyFHG id={'balance.longTermAsset.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   // Create the asset columns for the table.
   const liabilityColumns = useMemo(() => {
      return [
         {
            id: 'currentLiabilities',
            Header: <TypographyFHG id={'balance.currentLiabilities.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   // Create the columns for the intermediate  liabilities table.
   const liabilityIntermediateTermColumns = useMemo(() => {
      return [
         {
            id: 'intermediateLiabilities',
            Header: <TypographyFHG id={'balance.intermediateLiabilities.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   // Create the columns for the long term liabilities table.
   const liabilityLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTermLiabilities',
            Header: <TypographyFHG id={'balance.longTermLiabilities.label'} />,
            accessor: 'categoryName',
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
            ),
         },
      ];
   }, []);

   /**
    * When the entity selection changes set the new selected entity.
    * @param event The selection event.
    * @param value The new selected value.
    */
   const handleEntityChange = (event, value) => {
      setEditValues((editValues) => ({...editValues, entityId: map(value, (value) => value.id)}));
   };

   /**
    * Get the entity objects from the list of entityIds.
    */
   const getEntities = useCallback(() => {
      const isAllEntityIds = getValue('isAllEntityId');

      if (entities?.length > 0) {
         if (isAllEntityIds) {
            return entities;
         } else {
            const entityIds = getValue('entityId');
            // Get the entity objects from the list of entityIds.
            return filter(entities, (entity) => find(entityIds, (entityId) => entityId === entity.id));
         }
      }
      return [];
   }, [getValue, entities]);

   const entityNames = useMemo(() => {
      return join(map(getEntities(), 'name'), ', ');
   }, [getEntities]);

   const exportToExcel = useBalanceSheetExcelExport(`${entityNames}-Balance Sheet`, 'Balance Sheet');

   /**
    * On a row click, navigate to the Asset or Liability page with the category selected.
    * @param assetLiabilityPath The path for Asset or Liability.
    * @return {(function(*): void)|*}
    */
   const handleRowSelect = (assetLiabilityPath) => (row) => {
      const search = stringify({category: row.categoryName});
      const pathname = assetLiabilityPath.replace(':clientId', clientId).replace(':entityId', entityId);
      history.push({pathname, search});
   };

   /**
    * On export excel, download the Excel document.
    */
   const handleExportExcel = () => {
      exportToExcel(balanceSheetData?.balanceSheet, getValue('reportDate'), entityNames);
   };

   // if (mode === 'pdf' && balanceSheetData?.balanceSheet) {
   //    return (
   //       <PDFViewer style={{height: '100%', width: '100%'}}>
   //          <BalanceSheetPdf intl={intl} data={balanceSheetData?.balanceSheet} entityNames={entityNames}
   //                           reportDate={getValue('reportDate')}/>
   //       </PDFViewer>
   //    )
   // }

   return (
      <Grid name={'balance sheet root'} container fullWidth fullHeight direction={'column'} wrap={'nowrap'}>
         {/*Header to filter balance sheet*/}
         <div className={classes.headerStyle}>
            <Grid
               name={'headerFilter'}
               item
               container
               direction={'row'}
               alignItems={'center'}
               justify={'space-between'}
            >
               <Grid container item fullWidth={false} spacing={1} alignItems={'flex-end'}>
                  <Grid item>
                     <KeyboardDatePickerFHG
                        key={'reportDate'}
                        name={'reportDate'}
                        style={{marginTop: 18, marginBottom: 6, width: 120}}
                        views={['month']}
                        format={MONTH_FORMAT}
                        labelKey={'balance.reportDate.label'}
                        disableFuture={true}
                        inputVariant={'standard'}
                        defaultValue={defaultValues.reportDate}
                        value={editValues.reportDate}
                        onChange={handleChange}
                        fullWidth={false}
                     />
                  </Grid>
                  <Grid item>
                     <Autocomplete
                        key={'Entities ' + entityId}
                        className={classes.entitySelectStyle}
                        classes={{inputRoot: classes.inputStyle}}
                        multiple
                        options={entities}
                        disableClearable
                        onChange={handleEntityChange}
                        getOptionLabel={(option) => option?.name || 'n/a'}
                        value={getValue('isAllEntityId') ? [{name: 'All Entities'}] : getEntities()}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              variant='standard'
                              label='Entities'
                              placeholder='Select one or more entities'
                           />
                        )}
                        renderTags={(tagValue, getTagProps) =>
                           tagValue.map((option, index) => (
                              <Chip
                                 label={option.name}
                                 {...getTagProps({index})}
                                 {...{onDelete: option.id === entityId ? undefined : getTagProps({index})?.onDelete}}
                              />
                           ))
                        }
                        disabled={getValue('isAllEntityId', false)}
                        fullWidth
                     />
                  </Grid>
                  <Grid item>
                     <CheckboxFHG
                        key={'isAllEntityId'}
                        name={'isAllEntityId'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'entity.selectAll.label'}
                        value={'isAllEntityId'}
                        checked={getValue('isAllEntityId') || false}
                        marginTop={0}
                        marginLeft={2}
                        fullWidth
                     />
                  </Grid>
               </Grid>
               <Grid item container fullWidth={false}>
                  <Grid item>
                     <ExportPdfChoiceButton
                        clientId={clientId}
                        selectedIndex={BALANCE_SHEET_INDEX}
                        entityIds={entityIdList}
                        historyDate={getValue('reportDate')}
                        disabled={!balanceSheetData}
                     />
                  </Grid>
                  <Divider orientation='vertical' flexItem />
                  <Grid item>
                     <ButtonLF
                        labelKey={'asset.exportExcel.button'}
                        disabled={!balanceSheetData}
                        component={'a'}
                        onClick={handleExportExcel}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </div>
         {/*Totals and values balance sheet*/}
         <Grid
            name={'totalsValuesArea'}
            item
            container
            direction={'row'}
            resizable={false}
            className={classes.totalsFrameStyle}
         >
            {/*Left column with totals*/}
            <Grid name={'totalsArea'} item container direction={'column'} xs={12} sm={6} resizable={false}>
               <Grid item container justify={'space-between'} style={{maxWidth: 480, paddingRight: 16}}>
                  <TypographyFHG
                     id={'balance.totalAssets.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG className={classes.headerTextStyle} color='primary' variant='h6'>
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalAssets || 0} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480, paddingRight: 16}}>
                  <TypographyFHG
                     id={'balance.totalLiabilities.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG className={classes.headerTextStyle} color='primary' variant='h6'>
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalLiabilities || 0} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480, paddingRight: 16}}>
                  <TypographyFHG
                     id={'balance.totalEquity.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG
                     className={classes.headerTextStyle}
                     color={totalEquity < 0 ? 'error' : 'primary'}
                     variant='h6'
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalEquity || 0} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
            </Grid>
            {/*Right column with totals*/}
            <Grid name={'valuesArea'} item container direction={'column'} xs={12} sm={6}>
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'balance.currentRatio.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG
                     className={classes.headerTextStyle}
                     color={currentRatio < 0 ? 'error' : 'primary'}
                     variant='h6'
                  >
                     <FormattedNumber value={currentRatio || 0} minimumIntegerDigits={1} maximumFractionDigits={2} />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'balance.workingCapital.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG
                     className={classes.headerTextStyle}
                     color={workingCapital < 0 ? 'error' : 'primary'}
                     variant='h6'
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={workingCapital || 0} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'balance.equityAsset.label'}
                     className={classes.headerTextStyle}
                     color='primary'
                     variant='h6'
                  />
                  <TypographyFHG
                     className={classes.headerTextStyle}
                     color={equityAssetPercentage < 0 ? 'error' : 'primary'}
                     variant='h6'
                  >
                     <FormattedNumber
                        value={equityAssetPercentage || 0}
                        // eslint-disable-next-line react/style-prop-object
                        style='percent'
                        minimumIntegerDigits={1}
                        maximumFractionDigits={2}
                     />
                  </TypographyFHG>
               </Grid>
            </Grid>
         </Grid>
         {/*Assets and Liabilities tables*/}
         <Grid
            name={'assetsAndLiabilityTables'}
            item
            container
            className={classes.tableFrameStyle}
            resizable
            direction={'column'}
         >
            <Grid name={'titles for tables'} item container resizable={false} styles={{height: 30}}>
               <Grid item xs={6}>
                  <TypographyFHG
                     id={'balance.assets.label'}
                     className={classes.headerTextStyle}
                     color='secondary'
                     variant='subtitle1'
                  />
               </Grid>
               <Grid item xs={6} style={{paddingLeft: 4}}>
                  <TypographyFHG
                     id={'balance.liabilities.label'}
                     className={classes.headerTextStyle}
                     color='secondary'
                     variant='subtitle1'
                  />
               </Grid>
            </Grid>
            <Grid
               name={'Assets and Liabilities tables'}
               item
               container
               resizable
               fullHeight
               fullWidth
               direction={'row'}
               isScrollable
            >
               {/*Current Assets and Liabilities tables*/}
               <Grid name={'Current Assets and Liabilities tables'} item container spacing={3} overflow={'unset'}>
                  {/*Current Assets table*/}
                  <Grid name={'Current assets table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: 2}}>
                        <TableFHG
                           data={assetsCurrent}
                           columns={assetColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </div>
                  </Grid>
                  {/*Current liabilities table*/}
                  <Grid name={'Current liabilities table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: '2'}}>
                        <TableFHG
                           name={'Balance Sheet Current Liabilities'}
                           data={liabilitiesCurrent}
                           columns={liabilityColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </div>
                  </Grid>
               </Grid>
               <div style={{width: '100%', height: 24}} />
               {/*Intermediate Assets and Liabilities tables*/}
               <Grid name={'Intermediate Assets and Liabilities tables'} item container spacing={3} overflow={'unset'}>
                  {/*Intermediate Assets table*/}
                  <Grid name={'Intermediate assets table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: 2}}>
                        <TableFHG
                           data={assetsIntermediate}
                           columns={assetIntermediateTermColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </div>
                  </Grid>
                  {/*Intermediate liabilities table*/}
                  <Grid name={'Intermediate liabilities table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: '2'}}>
                        <TableFHG
                           name={'Balance Sheet Intermediate Liabilities'}
                           data={liabilitiesIntermediate}
                           columns={liabilityIntermediateTermColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </div>
                  </Grid>
               </Grid>
               <div style={{width: '100%', height: 24}} />
               {/*Long term Assets and  Liabilities tables*/}
               <Grid name={'Long Term Assets and Liabilities tables'} item container spacing={3} overflow={'unset'}>
                  {/*Long term Assets table*/}
                  <Grid name={'Long term assets table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: 2}}>
                        <TableFHG
                           name={'Balance Sheet Long Term Assets'}
                           data={assetsLongTerm}
                           columns={assetLongTermColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </div>
                  </Grid>
                  {/*Long term liabilities table*/}
                  <Grid name={'Long term Liabilities table'} item xs={6} overflow={'unset'}>
                     <div style={{boxShadow: theme.shadows[2], backgroundColor: 'white', margin: 2}}>
                        <TableFHG
                           name={'Balance Sheet Long term Liabilities'}
                           data={liabilitiesLongTerm}
                           columns={liabilityLongTermColumns}
                           classes={{
                              root: classes.tableRoot,
                              tableHeadRoot: classes.tableHeadRoot,
                              headerStyle: classes.tableRow,
                           }}
                           hasShadow={false}
                           stickyHeader={false}
                           totalPath={'total'}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </div>
                  </Grid>
               </Grid>
            </Grid>
         </Grid>
      </Grid>
   );
}
