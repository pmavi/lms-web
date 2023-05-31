// noinspection ES6CheckImport

import {Divider} from '@material-ui/core';
import {ListSubheader} from '@material-ui/core';
import {MenuItem, Menu} from '@material-ui/core';
import {Chip} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import useTheme from '@material-ui/core/styles/useTheme';
import Typography from '@material-ui/core/Typography';
import {Block} from '@material-ui/icons';
import {FilterList} from '@material-ui/icons';
import {map} from 'lodash';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useCallback} from 'react';
import React, {useMemo} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import {ASSET_INDEX} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {ASSET_EDIT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {ASSET_QUERY} from '../../../data/QueriesGL';
import {ASSET_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ENTITY_BY_ID_QUERY} from '../../../data/QueriesGL';
import {ASSET_CATEGORY_QUERY} from '../../../data/QueriesGL';
import {ASSETS_ENTITY_QUERY} from '../../../data/QueriesGL';
import numberFormatter from 'number-formatter';
import useEditData from '../../../fhg/components/edit/useEditData';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import TableFHG from '../../../fhg/components/table/TableFHG';
import TypographyWithHover from '../../../fhg/components/table/TypographyWithHover';
import TypographyFHG from '../../../fhg/components/Typography';
import find from 'lodash/find';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';

import Grid from '../../../fhg/components/Grid';
import filter from 'lodash/filter';
import {useEffect} from 'react';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {getAssetDetails} from './AsssetUtil';
import useAssetsExcelExport from './useAssetsExcelExport';

export const TERM_TO_DISPLAY = {current: 'Current', intermediate: 'Intermediate', long: 'Long Term'};
const REMOVED_ASSETS_CATEGORY = 'Removed Assets';
const REMOVED_ASSETS_CATEGORY_OBJECT = {id: 1, name: REMOVED_ASSETS_CATEGORY};

const useStyles = makeStyles(
   (theme) => ({
      root: {
         // padding: theme.spacing(4, 3, 4, 2),
      },
      headerStyle: {
         backgroundColor: 'rgba(223,235,209,0.35)',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(2),
      },
      headerTextStyle: {
         fontWeight: 500,
      },
      tableStyle: {
         cursor: 'pointer',
         padding: theme.spacing(0, 3, 2, 2),
         '& .searchBarTitleStyle': {
            position: 'sticky',
            left: 20,
            zIndex: 4,
         },
         '& .searchStyle': {
            position: 'sticky',
            right: 10,
         },
         '& tbody tr td p': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& tbody tr td div': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& .MuiToolbar-root': {
            backgroundColor: '#FAFAFA',
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 4,
         },
         totalFooter: {
            position: 'sticky',
            right: 10,
         },
         '& .MuiTableCell-stickyHeader': {
            top: 62,
         },
      },
      frameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      tableRoot: {
         overflow: 'unset',
         position: 'relative',
      },
   }),
   {name: 'AssetsStyles'}
);

/**
 * Asset List component to display all the current entity Assets.
 *
 * Reviewed: 5/28/21
 */
export default function Assets() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const date = sessionStorage.filterDate ? sessionStorage.filterDate : moment().format(MONTH_FORMAT);
   const theme = useTheme();
   const classes = useStyles();
   const {category} = parse(location.search) || {};

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const [editValues, handleChange, {getValue}] = useEditData({historyDate});

   const [assetCreateUpdate] = useMutationFHG(ASSET_CREATE_UPDATE, {historyDate}, true);

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type'
   );

   const exportToExcel = useAssetsExcelExport(`${entityData?.entity.name}-Assets`, 'Assets');
   const [assetCategoryData] = useQueryFHG(ASSET_CATEGORY_QUERY);
   //'assetCategory.term'
   const assetCategories = useMemo(
      () => sortBy(assetCategoryData?.assetCategories, ['term', 'name']),
      [assetCategoryData]
   );

   const [assetsData] = useQueryFHG(ASSETS_ENTITY_QUERY, {
      variables: {entityId, historyDate: editValues?.historyDate || historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });
   const [selectedCategory, setSelectedCategory] = React.useState();

   const assetGroups = useMemo(() => groupBy(assetsData?.assets, 'assetCategory.term'), [assetsData]);
   const totalCurrent = useMemo(() => {
      return assetGroups?.current ? sumBy(filter(assetGroups?.current, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups]);

   const totalIntermediate = useMemo(() => {
      return assetGroups?.intermediate ? sumBy(filter(assetGroups?.intermediate, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups?.intermediate]);

   useEffect(() => {
      const historyDate = getValue('historyDate');

      if (historyDate) {
         sessionStorage.filterDate = historyDate ? moment(historyDate).format(MONTH_FORMAT) : undefined;
      }
   }, [getValue]);

   const totalLong = useMemo(() => {
      return assetGroups?.long ? sumBy(filter(assetGroups?.long, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups?.long]);

   // Create the list of assets based on the selected category.
   const assets = useMemo(() => {
      let filteredAssets;

      if (selectedCategory) {
         if (selectedCategory.name === REMOVED_ASSETS_CATEGORY) {
            filteredAssets = filter(assetsData?.assets || [], {isRemoved: true});
         } else {
            filteredAssets = filter(assetsData?.assets || [], {
               isRemoved: false,
               assetCategoryId: selectedCategory?.id,
            });
         }
      } else {
         filteredAssets = filter(assetsData?.assets || [], {isRemoved: false});
      }
      const tableAssets = map(filteredAssets, (asset) => ({
         ...asset,
         removedLabel: asset.isRemoved ? 'removed' : undefined,
         collateralString: asset.isCollateral ? 'Yes' : 'No',
         details: getAssetDetails(asset),
      }));
      return sortBy(tableAssets, ['isRemoved', 'assetCategory.name']);
   }, [assetsData, selectedCategory]);
   const assetGroupsByCategory = useMemo(() => groupBy(assets, 'assetCategory.name'), [assets]);

   const [anchorEl, setAnchorEl] = React.useState(null);

   usePageTitle({titleKey: 'assets.title', values: {month: moment(date, MONTH_FORMAT)?.format('MMMM')}});

   /**
    * Set the selected category based on the category in the search parameters for the location
    */
   useEffect(() => {
      if (category !== selectedCategory?.name && assetCategories?.length > 0) {
         const useSelectedCategory = find(assetCategories, {name: category});
         setSelectedCategory(useSelectedCategory);
      }
   }, [category, assetCategories, selectedCategory]);

   /**
    * On category button click, open the menu.
    * @param event the click event.
    */
   const handleCategoryClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   /**
    * On category menu click, close the menu.
    */
   const handleCategoryClose = () => {
      setAnchorEl(null);
   };

   /**
    * On select category, close the menu and select the category. Add the category to the location search.
    *
    * @param category The category selected.
    * @return {(function(): void)|*}
    */
   const handleSelectCategory = (category) => () => {
      setSelectedCategory(category);
      setAnchorEl(null);

      const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
      searchParams.category = category?.name;
      const search = stringify(searchParams);
      history.push({pathname: location.pathname, search});
   };

   /**
    * On Add Asset, navigate to show the edit drawer.
    */
   const handleAddAsset = () => {
      location.state = {edit: ASSET_EDIT};
      history.replace(location);
   };

   /**
    * On row select, navigate to show the edit drawer for the asset.
    * @param original
    */
   const handleRowSelect = (original) => {
      location.state = {edit: ASSET_EDIT, id: original?.assetId || original?.id};
      history.replace(location);
   };

   /**
    * On export Excel, download the Excel document.
    */
   const handleExportExcel = () => {
      exportToExcel(assets, totalCurrent, totalIntermediate, totalLong, entityData?.entity.name);
   };

   /**
    * Submit the asset.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (event, asset) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const assetEdited = {...asset};
            delete assetEdited.assetCategory;
            delete assetEdited.assetType;
            delete assetEdited.bank;

            const removedDate = moment(asset?.removedDate) || moment();
            let useHistoryDate = asset?.historyDate ? asset?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(asset?.startDate)) {
               useHistoryDate = moment(asset?.startDate);
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...assetEdited,
               id: assetEdited?.assetId,
               isCollateral: !assetEdited?.isCollateral,
            };

            await assetCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  asset: {
                     ...asset,
                     collateralString: variables?.isCollateral ? 'Yes' : 'No',
                     isCollateral: variables?.isCollateral,
                  },
               },
               update: cacheUpdate(getAssetUpdateQueries(entityId, historyDate), asset?.id, 'asset'),
               refetchQueries: () => getAssetRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [assetCreateUpdate, entityId, historyDate]
   );

   /**
    * Create the columns for the assets table.
    */
   const columns = useMemo(() => {
      return [
         {
            id: 'description',
            Header: <TypographyFHG id={'assets.description.column'} />,
            accessor: 'description',
            minWidth: 300,
            width: 300,
            maxWidth: 300,
            Cell: (row) => <TypographyWithHover>{row.value}</TypographyWithHover>,
         },
         {
            id: 'details',
            Header: <TypographyFHG id={'assets.details.column'} />,
            accessor: 'details',
            minWidth: 300,
            width: 300,
            maxWidth: 300,
            Cell: (row) => <TypographyWithHover>{row.value}</TypographyWithHover>,
         },
         {
            id: 'collateralString',
            Header: <TypographyFHG id={'assets.collateral.column'} />,
            accessor: 'collateralString',
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => (
               <Grid container justify={'center'}>
                  <Chip
                     size='small'
                     label={row.values?.collateralString}
                     style={{
                        margin: 'auto',
                        width: 67,
                        backgroundColor: row?.original?.isCollateral ? theme.palette.table.header.secondary : undefined,
                     }}
                     onClick={(event) => handleSubmit(event, row.original)}
                  />
               </Grid>
            ),
         },
         {
            id: 'removedLabel',
            Header: <TypographyFHG id={'assets.removed.column'} />,
            accessor: 'removedLabel',
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            show: selectedCategory?.name === REMOVED_ASSETS_CATEGORY,
            Cell: ({row}) => (
               <Grid container justify={'center'}>
                  {row?.original?.isRemoved && <Block color={'error'} />}
               </Grid>
            ),
         },
         {
            id: 'amount',
            Header: <TypographyFHG id={'assets.amount.column'} />,
            accessor: 'amount',
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter('$#,###,###,##0.', row.values?.amount)}</div>
            ),
         },
      ];
   }, [selectedCategory?.name, theme.palette.table.header.secondary, handleSubmit]);

   const getAssetRefetchQueries = (entityId, assetId, historyDate) => {
      return [
         // {query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'},
         {query: ASSET_QUERY, variables: {assetId, historyDate}, queryPath: 'asset'},
      ];
   };

   const getAssetUpdateQueries = (entityId, historyDate) => {
      return [{query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'}];
   };

   return (
      <Grid container fullWidth fullHeight direction={'column'} wrap={'nowrap'} className={classes.root}>
         <Grid className={classes.frameStyle} container item direction={'column'} wrap={'nowrap'} resizable={false}>
            <Grid item>
               <TypographyFHG
                  id={'asset.totalCurrent.label'}
                  color='textPrimary'
                  variant='subtitle1'
                  values={{total: totalCurrent}}
               />
            </Grid>
            <Grid item>
               <TypographyFHG
                  id={'asset.totalIntermediate.label'}
                  color='textPrimary'
                  variant='subtitle1'
                  values={{total: totalIntermediate}}
               />
            </Grid>
            <Grid item>
               <TypographyFHG
                  id={'asset.totalLongTerm.label'}
                  color='textPrimary'
                  variant='subtitle1'
                  values={{total: totalLong}}
               />
            </Grid>
            <Grid item>
               <TypographyFHG
                  id={'asset.total.label'}
                  className={classes.headerTextStyle}
                  color='primary'
                  variant='h6'
                  values={{total: totalLong + totalIntermediate + totalCurrent}}
               />
            </Grid>
         </Grid>
         <Grid
            container
            item
            direction={'row'}
            justify={'space-between'}
            alignItems={'center'}
            style={{marginLeft: 16}}
            resizable={false}
         >
            <Grid item container direction={'row'} fullWidth={false}>
               <Grid item>
                  <ButtonLF
                     labelKey={'asset.add.button'}
                     onClick={handleAddAsset}
                     disabled={entityId === 'undefined'}
                  />
               </Grid>
               <Divider orientation='vertical' flexItem />
               <Grid item>
                  <ExportPdfChoiceButton
                     clientId={clientId}
                     selectedIndex={ASSET_INDEX}
                     entityIds={entityId}
                     historyDate={historyDate}
                     disabled={assets?.length <= 0}
                  />
               </Grid>
               <Divider orientation='vertical' flexItem />
               <Grid item>
                  <ButtonLF
                     labelKey={'asset.exportExcel.button'}
                     disabled={assets?.length <= 0}
                     component={'a'}
                     onClick={handleExportExcel}
                  />
               </Grid>
            </Grid>
            <Grid container item direction={'row'} fullWidth={false} alignItems={'center'}>
               <Grid item>
                  <KeyboardDatePickerFHG
                     key={'historyDate'}
                     name={'historyDate'}
                     style={{marginTop: 0, marginBottom: theme.spacing(2)}}
                     views={['month']}
                     format={MONTH_FORMAT}
                     labelKey={'date.label'}
                     disableFuture={true}
                     inputVariant={'standard'}
                     value={getValue('historyDate')}
                     onChange={handleChange}
                     fullWidth={false}
                     disabled={entityId === 'undefined'}
                  />
               </Grid>

               <Grid item>
                  <Button
                     variant={'text'}
                     startIcon={<FilterList />}
                     disabled={entityId === 'undefined'}
                     onClick={handleCategoryClick}
                     color='primary'
                     size='large'
                     style={{marginRight: 16}}
                  >
                     {!selectedCategory ? (
                        <TypographyFHG id={'asset.category.label'} />
                     ) : (
                        <Typography>{selectedCategory?.name}</Typography>
                     )}
                  </Button>
                  <Menu
                     id='category-menu'
                     anchorEl={anchorEl}
                     keepMounted
                     open={Boolean(anchorEl)}
                     onClose={handleCategoryClose}
                  >
                     <MenuItem
                        key={'None'}
                        value={0}
                        selected={!selectedCategory}
                        onClick={handleSelectCategory(undefined)}
                     >
                        All Categories
                     </MenuItem>
                     <MenuItem
                        key={'removed'}
                        value={1}
                        selected={selectedCategory?.id === REMOVED_ASSETS_CATEGORY_OBJECT.id}
                        onClick={handleSelectCategory(REMOVED_ASSETS_CATEGORY_OBJECT)}
                     >
                        {REMOVED_ASSETS_CATEGORY}
                     </MenuItem>
                     {assetCategories?.map((category, index) => (
                        <div key={category?.id}>
                           {category.term !== assetCategories?.[index - 1]?.term && (
                              <ListSubheader>{TERM_TO_DISPLAY[category.term]}</ListSubheader>
                           )}
                           <MenuItem
                              key={category?.id}
                              value={category?.id}
                              selected={selectedCategory?.id === category?.id}
                              onClick={handleSelectCategory(category)}
                           >
                              {category.name}
                           </MenuItem>
                        </div>
                     ))}
                  </Menu>
               </Grid>
            </Grid>
         </Grid>
         <ProgressIndicator isGlobal={false} />
         <Grid
            item
            container
            className={classes.tableStyle}
            direction={'column'}
            fullWidth
            fullHeight
            isScrollable
            innerStyle={{height: 'fit-content', maxHeight: '100%'}}
         >
            {Object.values(assetGroupsByCategory)?.map((data, rowIndex) => (
               <Grid item key={rowIndex} overflow={'unset'} resizable>
                  <TableFHG
                     name={'Assets'}
                     columns={columns}
                     data={data}
                     title={Object.keys(assetGroupsByCategory)[rowIndex]}
                     classes={{
                        root: classes.tableRoot,
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     allowSearch
                     emptyTableMessageKey={entityId !== 'undefined' ? 'asset.na.label' : 'asset.noEntity.label'}
                     onSelect={handleRowSelect}
                     totalPath={'amount'}
                     stickyExternal={true}
                  ></TableFHG>
               </Grid>
            ))}
         </Grid>
      </Grid>
   );
}
