import {Divider} from '@material-ui/core';
import {MenuItem, Menu} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Typography from '@material-ui/core/Typography';
import {FilterList} from '@material-ui/icons';
import {indexOf} from 'lodash';
import filter from 'lodash/filter';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useState} from 'react';
import React from 'react';
import {useEffect} from 'react';
import {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useHistory, useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import {CONTRACTS_INDEX} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {CONTRACT_EDIT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {ENTITY_BY_ID_QUERY} from '../../../data/QueriesGL';
import {HEDGE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {FUTURE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import useEditData from '../../../fhg/components/edit/useEditData';
import ExcelExportButton from '../../../fhg/components/ExcelExportButton';

import Grid from '../../../fhg/components/Grid';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import SearchFilter from '../../../fhg/components/table/SearchFilter';
import TableFHG from '../../../fhg/components/table/TableFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useContractExcelExport from './useContractExcelExport';

const REMOVED_CATEGORY = 'Removed Contracts';
const ALL_CATEGORY = 'All Contracts';
export const CASH_CONTRACTS_CATEGORY = 'Cash Contracts';
export const FUTURE_CONTRACTS_CATEGORY = 'Future Contracts';
export const HEDGE_CONTRACTS_CATEGORY = 'Hedges Contracts';

const contractCategories = [
   ALL_CATEGORY,
   REMOVED_CATEGORY,
   CASH_CONTRACTS_CATEGORY,
   FUTURE_CONTRACTS_CATEGORY,
   HEDGE_CONTRACTS_CATEGORY,
];

const useStyles = makeStyles(
   (theme) => ({
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
         '& tbody tr td p': {
            textOverflow: 'ellipsis',
         },
         '& tbody tr td div': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& .MuiToolbar-root': {
            backgroundColor: '#FAFAFA',
            position: 'sticky',
            top: 0,
            zIndex: 2,
         },
         '& .MuiTableCell-stickyHeader': {
            top: 62,
         },
      },
      tableStyle2: {
         cursor: 'pointer',
         padding: theme.spacing(0, 3, 2, 2),
      },
      frameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      buttonStyleLF: {
         textDecoration: 'underline',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
   }),
   {name: 'ContractsStyles'}
);

/**
 * Contract List component to display all the Contracts & Hedges.
 *
 * Reviewed:
 */
export default function Contracts() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const date = sessionStorage.filterDate ? sessionStorage.filterDate : moment().format(MONTH_FORMAT);
   const theme = useTheme();
   const classes = useStyles();
   const intl = useIntl();
   const {category = ALL_CATEGORY} = parse(location.search);

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const [, /*editValues*/ handleChange, {getValue}] = useEditData({historyDate});

   const [selectedCategory, setSelectedCategory] = React.useState(ALL_CATEGORY);
   const [pdfReportReady, setPdfReportReady] = useState(false);

   const [cashContractsData] = useQueryFHG(CASH_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate: moment(getValue('historyDate', historyDate)).format(DATE_DB_FORMAT)},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const cashContracts = useMemo(() => {
      if (cashContractsData?.cashContracts) {
         return filter(cashContractsData?.cashContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [cashContractsData?.cashContracts, selectedCategory]);

   const [futureContractsData] = useQueryFHG(FUTURE_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate: moment(getValue('historyDate', historyDate)).format(DATE_DB_FORMAT)},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const futureContracts = useMemo(() => {
      if (futureContractsData?.futureContracts) {
         return filter(futureContractsData?.futureContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [futureContractsData?.futureContracts, selectedCategory]);

   const [hedgeContractsData] = useQueryFHG(HEDGE_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate: moment(getValue('historyDate', historyDate)).format(DATE_DB_FORMAT)},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const hedgeContracts = useMemo(() => {
      if (hedgeContractsData?.hedgeContracts) {
         return filter(hedgeContractsData?.hedgeContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [hedgeContractsData?.hedgeContracts, selectedCategory]);

   const [searchFilter, setSearchFilter] = useState();

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type'
   );

   useEffect(() => {
      setPdfReportReady(cashContracts && futureContracts && hedgeContracts && entityData?.entity.name);
   }, [cashContracts, entityData?.entity.name, futureContracts, hedgeContracts]);

   const exportToExcel = useContractExcelExport(
      intl,
      `${entityData?.entity.name}-Contracts_${moment().format(DATE_DB_FORMAT)}`
   );

   useEffect(() => {
      const historyDate = getValue('historyDate');

      if (historyDate) {
         sessionStorage.filterDate = historyDate ? moment(historyDate).format(MONTH_FORMAT) : undefined;
      }
   }, [getValue]);

   const [anchorEl, setAnchorEl] = React.useState(null);

   usePageTitle({titleKey: 'contract.title', values: {month: moment(date, MONTH_FORMAT)?.format('MMMM')}});

   /**
    * Set the selected category based on the category in the search parameters for the location
    */
   useEffect(() => {
      if (category !== selectedCategory && contractCategories?.length > 0) {
         const useSelectedCategoryIndex = indexOf(contractCategories, category);

         if (useSelectedCategoryIndex >= 0) {
            setSelectedCategory(contractCategories[useSelectedCategoryIndex]);
         } else {
            setSelectedCategory(undefined);
         }
         setSearchFilter(undefined);
      }
   }, [category, selectedCategory]);

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
      setSearchFilter(undefined);
      setAnchorEl(null);

      const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
      searchParams.category = category;
      const search = stringify(searchParams);
      history.push({pathname: location.pathname, search});
   };

   /**
    * On Add Contract, navigate to show the edit drawer.
    */
   const handleAddContract = (category) => () => {
      location.state = {edit: CONTRACT_EDIT, category};
      history.replace(location);
   };

   /**
    * On row select, navigate to show the edit drawer for the contract.
    * @param category The category of contract to edit.
    */
   const handleRowSelect = (category) => (original) => {
      location.state = {edit: CONTRACT_EDIT, category, id: original?.contractId};
      history.replace(location);
   };

   /**
    * On export excel, download the Excel document.
    */
   const handleExportExcel = () => {
      exportToExcel(cashContracts, futureContracts, hedgeContracts, getValue('historyDate'), entityData?.entity.name);
   };

   /**
    * Create the columns for the contracts table.
    */
   const cashColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'isNew',
            Header: <TypographyFHG id={'contract.new.column'} />,
            minWidth: 50,
            width: 50,
            maxWidth: 50,
            Cell: ({row}) => (row?.values?.isNew ? 'Yes' : 'No'),
         },
         {
            accessor: 'bushelsSold',
            Header: <TypographyFHG id={'contract.bushelsSold.column'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'right'}}>{row.values?.bushelsSold}</div>,
         },
         {
            accessor: 'price',
            Header: <TypographyFHG id={'contract.price.column'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, row.values?.price)}</div>
            ),
         },
         {
            accessor: 'deliveryMonth',
            Header: <TypographyFHG id={'contract.deliveryMonth.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) =>
               row?.values?.deliveryMonth ? moment(row?.values?.deliveryMonth, 'M').format('MMM') : 'N/A',
         },
         {
            accessor: 'deliveryLocation',
            Header: <TypographyFHG id={'contract.deliveryLocation.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'isDelivered',
            Header: <TypographyFHG id={'contract.delivered.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (row?.values?.isDelivered ? 'Yes' : 'No'),
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushelsSold || 0) * (info.row.values?.price || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   /**
    * Create the columns for the futures contracts table.
    */
   const futureColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'bushels',
            Header: <TypographyFHG id={'contract.bushels.column'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'right'}}>{row.values?.bushels}</div>,
         },
         {
            accessor: 'monthYear',
            Header: <TypographyFHG id={'contract.monthYear.column'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => `${row?.original?.month}/${row?.original?.year}`,
         },
         {
            accessor: 'futuresPrice',
            Header: <TypographyFHG id={'contract.futurePrice.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.futuresPrice)}</div>
            ),
         },
         {
            accessor: 'estimatedBasis',
            Header: <TypographyFHG id={'contract.estimatedBasis.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.estimatedBasis)}</div>
            ),
         },
         {
            accessor: 'cashPrice',
            Header: <TypographyFHG id={'contract.cashPrice.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.cashPrice)}</div>
            ),
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'deliveryLocation',
            Header: <TypographyFHG id={'contract.deliveryLocation.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushels || 0) * (info.row.values?.cashPrice || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   /**
    * Create the columns for the hedges contracts table.
    */
   const hedgeColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'bushels',
            Header: <TypographyFHG id={'contract.bushels.column'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'right'}}>{row.values?.bushels}</div>,
         },
         {
            accessor: 'strikePrice',
            Header: <TypographyFHG id={'contract.strikePrice.column'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.strikePrice)}</div>
            ),
         },
         {
            accessor: 'strikeCost',
            Header: <TypographyFHG id={'contract.strikeCost.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.strikeCost)}</div>
            ),
         },
         {
            accessor: 'futuresMonth',
            Header: <TypographyFHG id={'contract.futureMonth.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => `${row?.original?.month}/${row?.original?.year}`,
         },
         {
            accessor: 'currentMarketValue',
            Header: <TypographyFHG id={'contract.currentMarketValue.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FORMAT, row.values?.currentMarketValue)}
               </div>
            ),
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushels || 0) * (info.row.values?.currentMarketValue || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   return (
      <Grid container fullWidth fullHeight direction={'column'} wrap={'nowrap'} className={classes.root}>
         <Grid
            container
            item
            direction={'row'}
            justify={'space-between'}
            alignItems={'center'}
            style={{paddingRight: theme.spacing(2), paddingLeft: theme.spacing(2), marginTop: theme.spacing(2)}}
            resizable={false}
         >
            <Grid item container direction={'row'} fullWidth={false}>
               <Grid item>
                  <ExportPdfChoiceButton
                     clientId={clientId}
                     selectedIndex={CONTRACTS_INDEX}
                     entityIds={entityId}
                     historyDate={getValue('historyDate')}
                     disabled={!pdfReportReady}
                  />
               </Grid>
               <Divider orientation='vertical' flexItem />
               <Grid item>
                  <ExcelExportButton
                     onExcelDocument={handleExportExcel}
                     disabled={!pdfReportReady}
                     component={'a'}
                     variant='text'
                     color='primary'
                     size='large'
                     className={classes.buttonStyleLF}
                  />
               </Grid>
            </Grid>
            <Grid container item direction={'row'} fullWidth={false} alignItems={'center'} spacing={4}>
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
                  <SearchFilter globalFilter={searchFilter} setGlobalFilter={setSearchFilter} />
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
                        <TypographyFHG id={'contract.category.label'} />
                     ) : (
                        <Typography>{selectedCategory}</Typography>
                     )}
                  </Button>
                  <Menu
                     id='category-menu'
                     anchorEl={anchorEl}
                     keepMounted
                     open={Boolean(anchorEl)}
                     onClose={handleCategoryClose}
                  >
                     {contractCategories?.map((category, index) => (
                        <MenuItem
                           key={'category ' + index}
                           value={index}
                           selected={selectedCategory === category}
                           onClick={handleSelectCategory(category)}
                        >
                           {category}
                        </MenuItem>
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
            isScrollable
            style={{height: 'max-content'}}
         >
            {(selectedCategory === ALL_CATEGORY ||
               selectedCategory === CASH_CONTRACTS_CATEGORY ||
               selectedCategory === REMOVED_CATEGORY) && (
               <Grid item fullWidth overflow={'unset'}>
                  <TableFHG
                     name={'CashContracts'}
                     columns={cashColumns}
                     data={cashContracts}
                     title={'Cash Contracts'}
                     classes={{headerTextStyle: classes.headerTextStyle, tableStyle: classes.tableStyle2}}
                     searchFilter={searchFilter}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'}
                     onSelect={handleRowSelect(CASH_CONTRACTS_CATEGORY)}
                     stickyExternal={true}
                  >
                     <Box display={'flex'} flex={'1 1 0%'} justifyContent={'flex-start'}>
                        <ButtonLF
                           style={{position: 'sticky', left: 165}}
                           labelKey={'contract.addCashContract.label'}
                           onClick={handleAddContract(CASH_CONTRACTS_CATEGORY)}
                        />
                     </Box>
                  </TableFHG>
               </Grid>
            )}
            {(selectedCategory === ALL_CATEGORY ||
               selectedCategory === FUTURE_CONTRACTS_CATEGORY ||
               selectedCategory === REMOVED_CATEGORY) && (
               <Grid item fullWidth overflow={'unset'}>
                  <TableFHG
                     name={'FutureContracts'}
                     columns={futureColumns}
                     data={futureContracts}
                     title={'Futures Contracts'}
                     classes={{headerTextStyle: classes.headerTextStyle, tableStyle: classes.tableStyle2}}
                     searchFilter={searchFilter}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'}
                     onSelect={handleRowSelect(FUTURE_CONTRACTS_CATEGORY)}
                     stickyExternal={true}
                  >
                     <Box display={'flex'} flex={'1 1 0%'} justifyContent={'flex-start'}>
                        <ButtonLF
                           style={{position: 'sticky', left: 195}}
                           labelKey={'contract.addFutureContract.label'}
                           onClick={handleAddContract(FUTURE_CONTRACTS_CATEGORY)}
                        />
                     </Box>
                  </TableFHG>
               </Grid>
            )}
            {(selectedCategory === ALL_CATEGORY ||
               selectedCategory === HEDGE_CONTRACTS_CATEGORY ||
               selectedCategory === REMOVED_CATEGORY) && (
               <Grid item fullWidth overflow={'unset'}>
                  <TableFHG
                     name={'HedgeContracts'}
                     columns={hedgeColumns}
                     data={hedgeContracts}
                     title={'Hedges Contracts'}
                     classes={{headerTextStyle: classes.headerTextStyle, tableStyle: classes.tableStyle}}
                     searchFilter={searchFilter}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'}
                     onSelect={handleRowSelect(HEDGE_CONTRACTS_CATEGORY)}
                     stickyExternal={true}
                  >
                     <Box display={'flex'} flex={'1 1 0%'} justifyContent={'flex-start'}>
                        <ButtonLF
                           style={{position: 'sticky', left: 197}}
                           labelKey={'contract.addHedgeContract.label'}
                           onClick={handleAddContract(HEDGE_CONTRACTS_CATEGORY)}
                        />
                     </Box>
                  </TableFHG>
               </Grid>
            )}
         </Grid>
      </Grid>
   );
}
