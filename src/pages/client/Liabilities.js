// noinspection JSUnresolvedVariable

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
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useCallback} from 'react';
import React, {useMemo} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../components/ButtonLF';
import ExportPdfChoiceButton from '../../components/ExportPdfChoiceButton';
import {LIABILITY_INDEX} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {CURRENCY_FORMAT} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
import {LIABILITY_EDIT} from '../../Constants';
import {LIABILITY_QUERY} from '../../data/QueriesGL';
import {LIABILITY_CREATE_UPDATE} from '../../data/QueriesGL';
import {ENTITY_BY_ID_QUERY} from '../../data/QueriesGL';
import {LIABILITY_CATEGORY_QUERY} from '../../data/QueriesGL';
import {LIABILITIES_ENTITY_QUERY} from '../../data/QueriesGL';
import numberFormatter from 'number-formatter';
import useEditData from '../../fhg/components/edit/useEditData';
import KeyboardDatePickerFHG from '../../fhg/components/KeyboardDatePickerFHG';
import ProgressIndicator from '../../fhg/components/ProgressIndicator';
import TableFHG from '../../fhg/components/table/TableFHG';
import TypographyWithHover from '../../fhg/components/table/TypographyWithHover';
import TypographyFHG from '../../fhg/components/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';

import Grid from '../../fhg/components/Grid';
import filter from 'lodash/filter';
import {useEffect} from 'react';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import {cacheUpdate} from '../../fhg/utils/DataUtil';
import useLiabilitiesExcelExport from './useLiabilitiesExcelExport';

export const TERM_TO_DISPLAY = {current: 'Current', intermediate: 'Intermediate', long: 'Long Term'};
const REMOVED_LIABILITIES_CATEGORY = 'Removed Liabilities';
const REMOVED_LIABILITIES_CATEGORY_OBJECT = {id: 1, name: REMOVED_LIABILITIES_CATEGORY};

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
         padding: theme.spacing(2, 3, 2, 2),
         '& .searchBarTitleStyle': {
            position: 'sticky',
            left: 20,
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
            position: 'sticky',
            top: 0,
            zIndex: 4,
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
      },
   }),
   {name: 'LiabilitiesStyles'}
);

/**
 * Liability List component to display all the current Liabilities.
 *
 * Reviewed: 5/28/21
 */
export default function Liabilities() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const date = sessionStorage.filterDate ? sessionStorage.filterDate : moment().format(MONTH_FORMAT);
   const theme = useTheme();
   const classes = useStyles();
   const {category} = parse(location.search) || {};

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const [editValues, handleChange, {getValue}] = useEditData({historyDate});

   const [liabilityCreateUpdate] = useMutationFHG(LIABILITY_CREATE_UPDATE, {historyDate}, true);

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type'
   );

   const exportToExcel = useLiabilitiesExcelExport(`${entityData?.entity.name}-Liabilities`, 'Liabilities');

   const [liabilityCategoryData] = useQueryFHG(LIABILITY_CATEGORY_QUERY);
   const liabilityCategories = useMemo(
      () => sortBy(liabilityCategoryData?.liabilityCategories, ['term', 'name']),
      [liabilityCategoryData]
   );

   const [liabilitiesData] = useQueryFHG(LIABILITIES_ENTITY_QUERY, {
      variables: {entityId, historyDate: editValues?.historyDate || historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });
   const [selectedCategory, setSelectedCategory] = React.useState();

   useEffect(() => {
      const historyDate = getValue('historyDate');

      if (historyDate) {
         sessionStorage.filterDate = historyDate ? moment(historyDate).format(MONTH_FORMAT) : undefined;
      }
   }, [getValue]);

   // Sum the total for the liabilities.
   const total = useMemo(() => {
      return liabilitiesData?.liabilities?.length > 0
         ? sumBy(liabilitiesData?.liabilities, (liability) => (!liability.isRemoved ? liability.amount : 0))
         : 0;
   }, [liabilitiesData]);

   // Create the filtered list of liabilities based on the category selected.
   const liabilities = useMemo(() => {
      let filteredLiabilities;

      if (selectedCategory) {
         if (selectedCategory.name === REMOVED_LIABILITIES_CATEGORY) {
            filteredLiabilities = filter(liabilitiesData?.liabilities, {isRemoved: true});
         } else {
            filteredLiabilities = filter(liabilitiesData?.liabilities || [], {
               liabilityCategoryId: selectedCategory?.id,
               isRemoved: false,
            });
         }
      } else {
         filteredLiabilities = filter(liabilitiesData?.liabilities || [], {isRemoved: false});
      }
      const tableLiabilities = map(filteredLiabilities, (liability) => ({
         ...liability,
         removedLabel: liability.isRemoved ? 'removed' : undefined,
         collateralString: liability.isCollateral ? 'Yes' : 'No',
      }));
      return sortBy(tableLiabilities, ['isRemoved', 'liabilityCategory.name', 'createdDateTime']);
   }, [liabilitiesData, selectedCategory]);
   const groupsByCategory = useMemo(() => groupBy(liabilities, 'liabilityCategory.name'), [liabilities]);

   const [anchorEl, setAnchorEl] = React.useState(null);

   usePageTitle({titleKey: 'liability.title', values: {month: moment(date, MONTH_FORMAT)?.format('MMMM')}});

   /**
    * If the category in the search for the location doesn't match the selected category, update the selected category.
    */
   useEffect(() => {
      if (category !== selectedCategory?.name && liabilityCategories?.length > 0) {
         const useSelectedCategory = find(liabilityCategories, {name: category});
         setSelectedCategory(useSelectedCategory);
      }
   }, [category, liabilityCategories, selectedCategory]);

   /**
    * When the category is clicked, open the menu.
    * @param event The click event.
    */
   const handleCategoryClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   /**
    * Close the category menu.
    */
   const handleCategoryClose = () => {
      setAnchorEl(null);
   };

   /**
    * Callback when a category is selected.
    * @param category The selected category.
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
    * Callback when a liability is added. Sets the location to show the edit sidebar.
    */
   const handleAddLiability = () => {
      location.state = {edit: LIABILITY_EDIT};
      history.replace(location);
   };

   /**
    * Callback when the liabilities are exported to Excel.
    */
   const handleExportExcel = () => {
      exportToExcel(liabilities, total, entityData?.entity.name);
   };

   /**
    * Callback when a row is selected. Sets the location to open the sidebar to edit the liability.
    * @param original
    */
   const handleRowSelect = (original) => {
      location.state = {edit: LIABILITY_EDIT, id: original?.liabilityId};
      history.replace(location);
   };

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (event, liability) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const liabilityEdited = {...liability};
            delete liabilityEdited.liabilityCategory;
            delete liabilityEdited.bank;

            const removedDate = moment(liability?.removedDate) || moment();
            let useHistoryDate = liability?.historyDate ? liability?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(liability?.startDate)) {
               useHistoryDate = moment(liability?.startDate);
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...liabilityEdited,
               id: liabilityEdited?.liabilityId,
               isCollateral: !liabilityEdited?.isCollateral,
            };

            await liabilityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  liability: {
                     ...liability,
                     collateralString: variables?.isCollateral ? 'Yes' : 'No',
                     isCollateral: variables?.isCollateral,
                  },
               },
               update: cacheUpdate(getLiabilityUpdateQueries(entityId, historyDate), liability?.id, 'liability'),
               refetchQueries: () => getLiabilityRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [liabilityCreateUpdate, entityId, historyDate]
   );

   // Create the columns for the liabilities table.
   const columns = useMemo(() => {
      return [
         {
            id: 'bank',
            Header: <TypographyFHG id={'liability.bank.column'} />,
            accessor: 'bank.name',
            minWidth: 200,
            width: 200,
            maxWidth: 200,
            Cell: (row) => <TypographyWithHover>{row.value}</TypographyWithHover>,
         },
         {
            id: 'description',
            Header: <TypographyFHG id={'liability.description.column'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
            accessor: 'description',
            Cell: (row) => <TypographyWithHover>{row.value}</TypographyWithHover>,
         },
         {
            id: 'interestRate',
            Header: <TypographyFHG id={'liability.interestRate.column'} />,
            accessor: 'interestRate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter('##0.0#%', row.values?.interestRate)}</div>
            ),
         },
         {
            id: 'payment',
            Header: <TypographyFHG id={'liability.payment.column'} />,
            accessor: 'payment',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.payment)}</div>
            ),
         },
         {
            id: 'paymentDueDate',
            Header: <TypographyFHG id={'liability.paymentDueDate.column'} />,
            accessor: 'paymentDueDate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
         },
         {
            id: 'paymentMaturityDate',
            Header: <TypographyFHG id={'liability.paymentMaturityDate.column'} />,
            accessor: 'paymentMaturityDate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
         },
         {
            id: 'collateralString',
            Header: <TypographyFHG id={'liability.collateral.column'} />,
            accessor: 'collateralString',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
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
            Header: <TypographyFHG id={'liability.removed.column'} />,
            accessor: 'removedLabel',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            show: selectedCategory?.name === REMOVED_LIABILITIES_CATEGORY,
            Cell: ({row}) => (
               <Grid container justify={'center'}>
                  {row?.original?.isRemoved && <Block color={'error'} />}
               </Grid>
            ),
         },
         {
            id: 'amount',
            Header: <TypographyFHG id={'liability.amount.column'} />,
            accessor: 'amount',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.amount)}</div>
            ),
         },
      ];
   }, [selectedCategory?.name, theme.palette.table.header.secondary, handleSubmit]);

   const getLiabilityRefetchQueries = (entityId, liabilityId, historyDate) => {
      return [{query: LIABILITY_QUERY, variables: {liabilityId, historyDate}, queryPath: 'liability'}];
   };

   const getLiabilityUpdateQueries = (entityId, historyDate) => {
      return [{query: LIABILITIES_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'liabilities'}];
   };

   return (
      <Grid container fullWidth fullHeight direction={'column'} wrap={'nowrap'} className={classes.root}>
         <Grid className={classes.frameStyle} container item direction={'column'} wrap={'nowrap'} resizable={false}>
            <Grid item>
               <TypographyFHG
                  id={'liability.total.label'}
                  className={classes.headerTextStyle}
                  color='primary'
                  variant='h6'
                  values={{total}}
               />
            </Grid>
         </Grid>
         <Grid
            name={'Frame around buttons'}
            container
            item
            direction={'row'}
            justify={'space-between'}
            alignItems={'center'}
            style={{marginLeft: 8}}
         >
            <Grid item container direction={'row'} fullWidth={false}>
               <Grid item>
                  <ButtonLF
                     labelKey={'liability.add.button'}
                     onClick={handleAddLiability}
                     disabled={entityId === 'undefined'}
                  />
               </Grid>
               <Divider orientation='vertical' flexItem />
               <Grid item>
                  <ExportPdfChoiceButton
                     clientId={clientId}
                     selectedIndex={LIABILITY_INDEX}
                     entityIds={entityId}
                     historyDate={historyDate}
                     disabled={liabilities?.length <= 0}
                  />
               </Grid>
               <Divider orientation='vertical' flexItem />
               <Grid item>
                  <ButtonLF
                     labelKey={'asset.exportExcel.button'}
                     onClick={handleExportExcel}
                     disabled={liabilities?.length <= 0}
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
                     disabled={entityId === 'undefined'}
                     fullWidth={false}
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
                        <TypographyFHG id={'liability.category.label'} />
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
                        selected={selectedCategory?.id === REMOVED_LIABILITIES_CATEGORY_OBJECT.id}
                        onClick={handleSelectCategory(REMOVED_LIABILITIES_CATEGORY_OBJECT)}
                     >
                        {REMOVED_LIABILITIES_CATEGORY}
                     </MenuItem>
                     {liabilityCategories?.map((category, index) => (
                        <div key={category?.id}>
                           {category.term !== liabilityCategories?.[index - 1]?.term && (
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
            name={'frame around table group'}
            item
            container
            className={classes.tableStyle}
            innerStyle={{height: 'fit-content', maxHeight: '100%'}}
            direction={'column'}
            fullWidth
            fullHeight
            isScrollable
         >
            {Object.values(groupsByCategory)?.map((data, rowIndex) => {
               return (
                  <Grid item key={rowIndex} overflow={'unset'} resizable>
                     <TableFHG
                        name={'Liabilities'}
                        columns={columns}
                        data={data}
                        stickyExternal={true}
                        classes={{
                           root: classes.tableRoot,
                           headerTextStyle: classes.headerTextStyle,
                           tableStyle: classes.tableStyle,
                        }}
                        allowSearch
                        showFooter
                        totalPath={'amount'}
                        title={Object.keys(groupsByCategory)[rowIndex]}
                        emptyTableMessageKey={
                           entityId !== 'undefined' ? 'liability.na.label' : 'liability.noEntity.label'
                        }
                        onSelect={handleRowSelect}
                     ></TableFHG>
                  </Grid>
               );
            })}
         </Grid>
      </Grid>
   );
}
