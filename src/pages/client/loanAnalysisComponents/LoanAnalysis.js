import {Chip} from '@material-ui/core';
import {Divider, Paper} from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import {TextField} from '@material-ui/core';
import {withStyles} from '@material-ui/core';
import {Tab} from '@material-ui/core';
import {Tabs} from '@material-ui/core';
import Hidden from '@material-ui/core/Hidden';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Autocomplete} from '@material-ui/lab';
import {delay} from 'lodash';
import {join} from 'lodash';
import {filter} from 'lodash';
import {map} from 'lodash';
import {castArray} from 'lodash';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useMemo} from 'react';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {FormattedNumber} from 'react-intl';
import {useHistory} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import {LOAN_ANALYSIS_INDEX} from '../../../Constants';
import {LIABILITIES_PATH} from '../../../Constants';
import {ENTITY_ASSET_PATH} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import {LOAN_ANALYSIS_QUERY} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import useEditData from '../../../fhg/components/edit/useEditData';

import Grid from '../../../fhg/components/Grid';
import InfoPopup from '../../../fhg/components/InfoPopup';
import InfoVideoPopup from '../../../fhg/components/InfoVideoPopup';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import CurrentAssets from './CurrentAssets';
import CurrentLiabilities from './CurrentLiabilities';
import IntermediateAssets from './IntermediateAssets';
import IntermediateLiabilities from './IntermediateLiabilities';
import LongTermAssets from './LongTermAssets';
import LongTermLiabilities from './LongTermLiabilities';
import useLoanAnalysisExcelExport from './useLoanAnalysisExcelExport';

const StyledTabs = withStyles((theme) => ({
   root: {
      borderBottom: '1px solid #e8e8e8',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
   },
   indicator: {
      backgroundColor: theme.palette.primary.main,
   },
}))(Tabs);

const StyledTab = withStyles((theme) => ({
   root: {
      textTransform: 'none',
      minWidth: 72,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(4),
      '&:hover': {
         color: theme.palette.primary.light, //'#9EC574',
         opacity: 1,
      },
      '&$selected': {
         color: theme.palette.primary.main,
         fontWeight: theme.typography.fontWeightMedium,
      },
      '&:focus': {
         color: theme.palette.primary.light, //'#9EC574',
      },
   },
   selected: {},
}))((props) => <Tab disableRipple {...props} />);

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
      headerBoldTextStyle: {
         fontSize: '1.20rem',
         fontWeight: 'bold',
      },
      totalsFrameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      tabsFrameStyle: {
         padding: theme.spacing(0, 2, 0, 2),
      },
      tabContentFrameStyle: {
         height: 'calc(100% - 79px)',
      },
      tableContentFrameStyle: {
         height: 'calc(100% - 24px)',
      },
      rowSpacing: {
         paddingBottom: theme.spacing(4),
         paddingRight: theme.spacing(2),
      },
      rowSpacingLast: {
         paddingRight: theme.spacing(2),
      },
      pr3: {
         paddingRight: theme.spacing(3),
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
      summaryPaperStyle: {
         marginTop: theme.spacing(1),
         width: '100%',
         padding: theme.spacing(1),
         border: `solid 1px ${theme.palette.divider}`,
         backgroundColor: 'rgba(223,235,209,0.35)',
      },
   }),
   {name: 'LoanAnalysisStyles'}
);

// Passed to be used in other tables.
const useTableStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: '#F0F6E9 !important',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(3),
         whiteSpace: 'nowrap',
      },
      tableHeadRoot: {
         top: 0,
         position: 'sticky',
         zIndex: theme.zIndex.drawer + 1,
      },
      tableRoot: {
         margin: 0,
      },
      tableHeaderStyle: {
         backgroundColor: '#F0F6E9 !important',
      },
      footerStyle: {
         cursor: 'default',
         fontSize: 18,
      },
      frameStyle: {
         boxShadow: theme.shadows[2],
         backgroundColor: 'white',
         margin: 2,
      },
   }),
   {name: 'tableStyles'}
);

const ASSET_TAB = 'asset';
const DEBT_TAB = 'debt';

/**
 * The Tab to show the asset loan position.
 * @param loanData The report data.
 * @param onRowSelect Callback when a row is selected.
 * @return {JSX.Element|null}
 * @constructor
 */
function AssetLoanTab({loanData, onRowSelect}) {
   const tableClasses = useTableStyles();

   // Only display the page when all the data is loaded.
   if (!loanData) {
      return null;
   }
   const currentData = loanData?.loanAnalysis?.assets?.current;
   const intermediateData = loanData?.loanAnalysis?.assets?.intermediate;
   const longTermData = loanData?.loanAnalysis?.assets?.longTerm;

   return (
      <Grid container item xs={12} spacing={2}>
         <CurrentAssets classes={tableClasses} data={currentData} onRowSelect={onRowSelect} />
         <IntermediateAssets classes={tableClasses} data={intermediateData} onRowSelect={onRowSelect} />
         <LongTermAssets classes={tableClasses} data={longTermData} onRowSelect={onRowSelect} />
      </Grid>
   );
}

function LiabilityLoanTab({loanData, onRowSelect}) {
   const tableClasses = useTableStyles();

   if (!loanData) {
      return null;
   }
   const currentData = loanData?.loanAnalysis?.liabilities?.current;
   const intermediateData = loanData?.loanAnalysis?.liabilities?.intermediate;
   const longTermData = loanData?.loanAnalysis?.liabilities?.longTerm;

   return (
      <Grid container item xs={12} spacing={2}>
         <CurrentLiabilities classes={tableClasses} data={currentData} onRowSelect={onRowSelect} />
         <IntermediateLiabilities classes={tableClasses} data={intermediateData} onRowSelect={onRowSelect} />
         <LongTermLiabilities classes={tableClasses} data={longTermData} onRowSelect={onRowSelect} />
      </Grid>
   );
}

/**
 * Loan Analysis component to display loan analysis for an entity.
 *
 * Reviewed:
 */
export default function LoanAnalysis() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const {entityIds = [entityId], isAllEntities = false} = parse(location.search) || {};
   const date = sessionStorage.filterDate ? sessionStorage.filterDate : moment().format(MONTH_FORMAT);
   const firstDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const lastDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
   const entityIdList = castArray(entityIds);
   const classes = useStyles();
   const tableClasses = useTableStyles();
   usePageTitle({titleKey: 'loan.title', values: {month: moment(date, MONTH_FORMAT)?.format('MMMM')}});
   const theme = useTheme();

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

   const [loanAnalysisData] = useQueryFHG(LOAN_ANALYSIS_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: isAllEntities ? map(entities, 'id') : entityIdList, date: lastDate},
      skip: !validate(entityId),
   });
   const [selectedTab, setSelectedTab] = useState(ASSET_TAB);

   const clientLeverage = loanAnalysisData?.loanAnalysis?.clientLeverage || 0;
   const totalBankSafetyNet = loanAnalysisData?.loanAnalysis?.totalBankSafetyNet || 0;

   const currentBankLoanValue = loanAnalysisData?.loanAnalysis?.assets?.current?.bankLoanValue || 0;
   const intermediateBankLoanValue = loanAnalysisData?.loanAnalysis?.assets?.intermediate?.bankLoanValue || 0;
   const longTermBankLoanValue = loanAnalysisData?.loanAnalysis?.assets?.longTerm?.bankLoanValue || 0;

   const totalAvailable = currentBankLoanValue + intermediateBankLoanValue + longTermBankLoanValue;
   const totalAssets = loanAnalysisData?.loanAnalysis?.assets?.totalAssets || 0;
   const totalLiabilities = loanAnalysisData?.loanAnalysis?.liabilities?.totalLiabilities || 0;

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

   useEffect(() => {
      const existingEntityId = editValues?.entityId;

      if (entityId && existingEntityId?.length <= 1 && entityId !== existingEntityId?.[0]) {
         setEditValues((editValues) => ({...editValues, entityId: [entityId]}));
      }
   }, [editValues?.entityId, entityId, setEditValues]);

   /**
    * Handle changes to the selected tab.
    *
    * @param event The target of the event that triggered the change.
    * @param value The value of the change.
    */
   const handleTabChange = (event, value) => {
      setSelectedTab(value);
   };

   const handleEntityChange = (event, value) => {
      delay(() => {
         setEditValues((editValues) => ({...editValues, entityId: map(value, (value) => value.id)}));
      });
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

   const handleRowSelect = (assetLiabilityPath) => (row) => {
      const search = stringify({category: row.categoryName});
      const pathname = assetLiabilityPath.replace(':clientId', clientId).replace(':entityId', entityId);
      history.push({pathname, search});
   };

   const entityNames = useMemo(() => {
      return join(map(getEntities(), 'name'), ', ');
   }, [getEntities]);

   const exportToExcel = useLoanAnalysisExcelExport(`${entityNames}-Loan Analysis`, 'Loan Analysis');

   /**
    * On export excel, download the Excel document.
    */
   const handleExportExcel = () => {
      exportToExcel(loanAnalysisData?.loanAnalysis, getValue('reportDate'), entityNames);
   };

   const currentLiabilitiesData = loanAnalysisData?.loanAnalysis?.liabilities?.current;
   const intermediateLiabilitiesData = loanAnalysisData?.loanAnalysis?.liabilities?.intermediate;
   const longTermLiabilitiesData = loanAnalysisData?.loanAnalysis?.liabilities?.longTerm;
   const currentAssetsData = loanAnalysisData?.loanAnalysis?.assets?.current;
   const intermediateAssetsData = loanAnalysisData?.loanAnalysis?.assets?.intermediate;
   const longTermAssetsData = loanAnalysisData?.loanAnalysis?.assets?.longTerm;

   const currentLeveragePosition =
      (currentAssetsData?.bankLoanValue || 0) - (currentLiabilitiesData?.subtotalLiabilities || 0);
   const intermediateLeveragePosition =
      (intermediateAssetsData?.bankLoanValue || 0) - (intermediateLiabilitiesData?.subtotalLiabilities || 0);
   const longTermLeveragePosition =
      (longTermAssetsData?.bankLoanValue || 0) - (longTermLiabilitiesData?.subtotalLiabilities || 0);

   return (
      <Grid name={'loan sheet root'} container fullWidth fullHeight direction={'column'} wrap={'nowrap'}>
         {/*Header to filter loan analysis*/}
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
                        disabled={getValue('isAllEntityId')}
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
                        selectedIndex={LOAN_ANALYSIS_INDEX}
                        entityIds={entityIdList}
                        historyDate={getValue('reportDate')}
                        disabled={!loanAnalysisData}
                     />
                  </Grid>
                  <Divider orientation='vertical' flexItem />
                  <Grid item>
                     <ButtonLF
                        labelKey={'asset.exportExcel.button'}
                        disabled={!loanAnalysisData}
                        component={'a'}
                        onClick={handleExportExcel}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </div>
         <Grid
            name={'totals area'}
            container
            item
            direction={'row'}
            resizable={false}
            className={classes.totalsFrameStyle}
         >
            <Grid
               name={'totals left column'}
               container
               item
               direction={'column'}
               wrap={'nowrap'}
               xs={12}
               sm={6}
               resizable={false}
            >
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'loan.totalAvailableBorrowingPower.label'}
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                  />
                  <TypographyFHG
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                     style={{color: totalAvailable >= 0 ? undefined : theme.palette.error.main}}
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalAvailable} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'loan.totalLiabilities.label'}
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                  />
                  <TypographyFHG
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                     style={{color: totalLiabilities >= 0 ? undefined : theme.palette.error.main}}
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalLiabilities} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid container fullWidth={false}>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'loan.leverage.label'}
                        color='primary'
                        className={classes.headerBoldTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG
                        color='primary'
                        className={classes.headerBoldTextStyle}
                        variant='h6'
                        style={{color: clientLeverage >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={clientLeverage} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
                  <InfoVideoPopup labelKey={'loan.leverage.help'} videoId={'c2rnupax5t'} />
               </Grid>
            </Grid>
            <Grid
               name={'totals right column'}
               container
               item
               direction={'column'}
               wrap={'nowrap'}
               xs={12}
               sm={6}
               fullWidth={false}
            >
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'loan.totalAssets.label'}
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                  />
                  <TypographyFHG
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                     style={{color: totalAssets >= 0 ? undefined : theme.palette.error.main}}
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalAssets} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                  <TypographyFHG
                     id={'loan.totalLiabilities.label'}
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                  />
                  <TypographyFHG
                     color='primary'
                     className={classes.headerTextStyle}
                     variant='h6'
                     style={{color: totalLiabilities >= 0 ? undefined : theme.palette.error.main}}
                  >
                     {/* eslint-disable-next-line react/style-prop-object */}
                     <FormattedNumber value={totalLiabilities} style='currency' currency='USD' />
                  </TypographyFHG>
               </Grid>
               <Grid item container>
                  <Grid item container justify={'space-between'} fullWidth={false} resizable style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'loan.totalBank.label'}
                        color='textPrimary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG
                        color='textPrimary'
                        className={classes.headerTextStyle}
                        variant='h6'
                        style={{color: totalBankSafetyNet >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={totalBankSafetyNet} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
                  <InfoPopup labelKey={'loan.totalBank.help'} />
               </Grid>
            </Grid>
         </Grid>
         <Grid name={'Asset Debt tabs Area'} item container className={classes.tabsFrameStyle} fullHeight>
            <Hidden lgUp>
               <StyledTabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  aria-label='ant example'
                  style={{width: '100%'}}
               >
                  <StyledTab
                     label={<TypographyFHG variant='subtitle1' id={'loan.assetPosition.tab'} />}
                     value={ASSET_TAB}
                  />
                  <StyledTab
                     label={<TypographyFHG variant='subtitle1' id={'loan.debtPosition.tab'} />}
                     value={DEBT_TAB}
                  />
               </StyledTabs>
               <Grid name={'Tab frame'} item container isScrollable className={classes.tabContentFrameStyle}>
                  {
                     {
                        [ASSET_TAB]: (
                           <AssetLoanTab loanData={loanAnalysisData} onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)} />
                        ),
                        [DEBT_TAB]: (
                           <LiabilityLoanTab
                              loanData={loanAnalysisData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                           />
                        ),
                     }[selectedTab]
                  }
               </Grid>
            </Hidden>
            <Hidden mdDown>
               <Grid
                  name={'Positions frame'}
                  item
                  container
                  className={classes.tableContentFrameStyle}
                  resizable
                  direction={'column'}
               >
                  <Grid name={'titles for tables'} item container resizable={false} styles={{height: 30}}>
                     <Grid item xs={6}>
                        <TypographyFHG
                           id={'loan.assetPosition.tab'}
                           className={classes.headerTextStyle}
                           color='secondary'
                           style={{paddingLeft: 2}}
                           variant='subtitle1'
                        />
                     </Grid>
                     <Grid item xs={6} style={{marginLeft: -6}}>
                        <TypographyFHG
                           id={'loan.debtPosition.tab'}
                           className={classes.headerTextStyle}
                           color='secondary'
                           variant='subtitle1'
                        />
                     </Grid>
                  </Grid>
                  <Grid
                     name={'Assets Position and Debt Position tables'}
                     item
                     container
                     resizable
                     fullHeight
                     fullWidth
                     direction={'row'}
                     isScrollable
                     innerStyle={{height: 'fit-content', maxHeight: '100%'}}
                  >
                     <Grid name={'Current Assets and Liabilities tables'} className={classes.rowSpacing} item container>
                        <Grid name={'Asset Current table'} className={classes.pr3} item xs={6}>
                           <CurrentAssets
                              classes={tableClasses}
                              data={currentAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                           />
                        </Grid>
                        <Grid name={'Liabilities Current table'} item xs={6}>
                           <CurrentLiabilities
                              classes={tableClasses}
                              data={currentLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                           />
                        </Grid>
                        <Paper className={classes.summaryPaperStyle} elevation={2}>
                           <Grid
                              name={'Current Leverage'}
                              item
                              container
                              justify={'space-between'}
                              wrap={'nowrap'}
                              direction={'row'}
                           >
                              <Grid item>
                                 <TypographyFHG
                                    id={'loan.currentBorrowingPower.label'}
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                 />
                              </Grid>
                              <Grid item>
                                 <TypographyFHG
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                    style={{
                                       color: currentLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                    }}
                                 >
                                    {/* eslint-disable-next-line react/style-prop-object */}
                                    <FormattedNumber value={currentLeveragePosition} style='currency' currency='USD' />
                                 </TypographyFHG>
                              </Grid>
                           </Grid>
                        </Paper>
                     </Grid>
                     <Grid
                        name={'Intermediate Assets and Liabilities tables'}
                        className={classes.rowSpacing}
                        item
                        container
                        overflow={'unset'}
                     >
                        <Grid name={'Asset Intermediate table'} className={classes.pr3} item xs={6} overflow={'unset'}>
                           <IntermediateAssets
                              classes={tableClasses}
                              data={intermediateAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                           />
                        </Grid>
                        <Grid name={'Liabilities Intermediate table'} item xs={6} overflow={'unset'}>
                           <IntermediateLiabilities
                              classes={tableClasses}
                              data={intermediateLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                           />
                        </Grid>
                        <Paper className={classes.summaryPaperStyle} elevation={2}>
                           <Grid
                              name={'Intermediate Leverage'}
                              item
                              container
                              justify={'space-between'}
                              wrap={'nowrap'}
                              direction={'row'}
                           >
                              <Grid item>
                                 <TypographyFHG
                                    id={'loan.intermediateBorrowingPower.label'}
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                 />
                              </Grid>
                              <Grid item>
                                 <TypographyFHG
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                    style={{
                                       color: intermediateLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                    }}
                                 >
                                    <FormattedNumber
                                       value={intermediateLeveragePosition}
                                       // eslint-disable-next-line react/style-prop-object
                                       style='currency'
                                       currency='USD'
                                    />
                                 </TypographyFHG>
                              </Grid>
                           </Grid>
                        </Paper>
                     </Grid>
                     <Grid
                        name={'Long Term Assets and Liabilities tables'}
                        className={classes.rowSpacingLast}
                        item
                        container
                        overflow={'unset'}
                     >
                        <Grid name={'Asset Long Term table'} className={classes.pr3} item xs={6} overflow={'unset'}>
                           <LongTermAssets
                              classes={tableClasses}
                              data={longTermAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                           />
                        </Grid>
                        <Grid name={'Liabilities Long Term table'} item xs={6} overflow={'unset'}>
                           <LongTermLiabilities
                              classes={tableClasses}
                              data={longTermLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                           />
                        </Grid>
                        <Paper className={classes.summaryPaperStyle} elevation={2} style={{marginBottom: 2}}>
                           <Grid
                              name={'Long Term Leverage'}
                              item
                              container
                              justify={'space-between'}
                              wrap={'nowrap'}
                              direction={'row'}
                           >
                              <Grid item>
                                 <TypographyFHG
                                    id={'loan.longTermBorrowingPower.label'}
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                 />
                              </Grid>
                              <Grid item>
                                 <TypographyFHG
                                    color='primary'
                                    className={classes.headerBoldTextStyle}
                                    variant='h6'
                                    style={{
                                       color: longTermLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                    }}
                                 >
                                    {/* eslint-disable-next-line react/style-prop-object */}
                                    <FormattedNumber value={longTermLeveragePosition} style='currency' currency='USD' />
                                 </TypographyFHG>
                              </Grid>
                           </Grid>
                        </Paper>
                     </Grid>
                  </Grid>
               </Grid>
            </Hidden>
         </Grid>
      </Grid>
   );
}
