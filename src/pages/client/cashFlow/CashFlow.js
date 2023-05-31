import {Chip} from '@material-ui/core';
import {TextField} from '@material-ui/core';
import {Divider} from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Delete} from '@material-ui/icons';
import {Edit} from '@material-ui/icons';
import {Autocomplete} from '@material-ui/lab';
import {differenceBy} from 'lodash';
import {trim} from 'lodash';
import {castArray} from 'lodash';
import {join} from 'lodash';
import {map} from 'lodash';
import {filter} from 'lodash';
import {defer} from 'lodash';
import {findLastIndex} from 'lodash';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {useRef} from 'react';
import {useLayoutEffect} from 'react';
import {useState, useCallback, useMemo} from 'react';
import React from 'react';
import {isFirefox} from 'react-dnd-html5-backend/dist/BrowserDetector';
import {FormattedNumber} from 'react-intl';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useRecoilState} from 'recoil';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import TextFieldLF from '../../../components/TextFieldLF';
import {DATE_FORMAT_KEYBOARD} from '../../../Constants';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';
import {CASH_FLOW_INDEX} from '../../../Constants';
import {DEPRECIATION_TYPE_NAME} from '../../../Constants';
import {PERCENT_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOCK_ICON} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {YEAR_FORMAT} from '../../../Constants';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import {getCashFlowReportRefetchQueries} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import {getIncomeUpdateQueries} from '../../../data/QueriesGL';
import {getExpenseUpdateQueries} from '../../../data/QueriesGL';
import {getIncomeTypeUpdateQueries} from '../../../data/QueriesGL';
import {INCOME_TYPE_UNDELETE} from '../../../data/QueriesGL';
import {INCOME_TYPE_DELETE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_UNDELETE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_DELETE} from '../../../data/QueriesGL';
import {getExpenseTypeUpdateQueries} from '../../../data/QueriesGL';
import {EXPENSE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {EXPENSE_DELETE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_DELETE} from '../../../data/QueriesGL';
import {INCOME_CREATE_UPDATE} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import ConfirmButton from '../../../fhg/components/ConfirmButton';
import Form from '../../../fhg/components/edit/Form';
import useEditData from '../../../fhg/components/edit/useEditData';
import {Notes} from '@material-ui/icons';
import {v4 as uuid} from 'uuid';
import {parse} from 'query-string';
import Grid from '../../../fhg/components/Grid';
import InfoVideoPopup from '../../../fhg/components/InfoVideoPopup';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import StaticCell from '../../../fhg/components/table/StaticCell';
import {noteEditStatus} from '../../../fhg/components/table/TableContainerFHG';
import {selectedCellState} from '../../../fhg/components/table/TableFHG';
import {editCellState} from '../../../fhg/components/table/TableFHG';

import TableFHG from '../../../fhg/components/table/TableFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import {titleStatus} from '../../../fhg/components/WebAppBar';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {hasValue} from '../../../fhg/utils/Utils';
import {useLocation} from 'react-router-dom';
import useCashFlowExcelExport from './useCashFlowExcelExport';
import useScalePanel from '../../../fhg/hooks/useScalePanel';

const PERCENT_COLUMN_WIDTH = isFirefox() ? 61.2 : 86;
const DEFAULT_COLUMN_WIDTH = 145.5;
const ACTUAL_COLUMN_WIDTH = DEFAULT_COLUMN_WIDTH;
const CATEGORY_INCOME_COLUMN_ID = 'income';
const CATEGORY_EXPENSE_COLUMN_ID = 'expense';
const CATEGORY_COLUMN_INDEX = 0;
const INCOME_TABLE = 'Income';
const EXPENSES_TABLE = 'Expenses';

const ADD_BUTTON_CELL_VALUE = undefined;

const MINIMUM_YEAR = '01-01-1901';

const operatingLoanBalance = [];

export function convertYearToNumber(year) {
   const type = typeof year;
   if (type === 'string') {
      return +year;
   } else if (type !== 'number') {
      return moment(year).year();
   }
   return year || 0;
}

function sumAnnualRow(type, row) {
   let sum = 0;

   for (const month of DEFAULT_MONTH_ORDER) {
      sum += row?.values?.[`${month}.${type}`] || 0;
   }
   return sum;
}

const defaultExpenseOrIncome = {
   actual: '',
   expected: '',
   note: '',
   isDeleted: false,
   name: '',
};

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: 'rgba(223,235,209,0.35)',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(2),
      },
      totalsAreaStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      totalsStyle: {
         marginBottom: theme.spacing(2),
      },
      tableRoot: {
         boxShadow: theme.shadows[2],
         backgroundColor: 'white',
         height: '100%',
      },
      tableFrameStyle: {
         padding: theme.spacing(0.5, 3, 0.5, 2),
      },
      buttonStyle: {
         margin: theme.spacing(1),
      },
      deleteButtonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         color: 'black',
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      footerStyle: {
         fontSize: 16,
      },
      formStyle: {
         maxHeight: '100%',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      tableHeadRoot: {
         top: 0,
         position: 'sticky',
         zIndex: theme.zIndex.drawer + 1,
      },
      negativeStyle: {
         color: theme.palette.error.main,
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 16,
         '&.editable': {
            color: 'black',
         },
         '&:hover.editable': {
            backgroundColor: 'rgba(240, 246, 233, 0.75)',
            cursor: 'pointer',
         },
         '&:hover:not(.editable)': {
            backgroundColor: '#f0f0f0',
            cursor: 'default',
         },
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
      progressStyle: {
         position: 'relative',
         top: '50%',
         left: '50%',
         zIndex: 5000,
      },
      borderFrame: {
         boxShadow: theme.shadows[2],
         backgroundColor: 'white',
         marginTop: 1,
         marginRight: 1,
         marginBottom: theme.spacing(2),
         position: 'relative',
      },
      buttonStyleLF: {
         textDecoration: 'underline',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      lockStyle: {
         position: 'relative',
         '&.disabled:hover:before': {
            content: `url(${LOCK_ICON})`,
            paddingLeft: 'calc(50% - 64px)',
            paddingTop: '8%',
            marginRight: '5%',
            width: 'calc(100% - 16px)',
            height: '100%',
            filter: 'opacity(60%)',
            transition: '1s',
            '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
               opacity: 0.3,
            },
            display: 'block',
            verticalAlign: 'middle',
            backgroundColor: `#fbfbfb`,
            position: 'fixed',
            zIndex: 10000,
         },
      },
      stickyFrame: {
         overflow: 'unset',
         '& table': {
            '& thead > tr': {
               position: 'sticky',
               left: 1,
               top: 0,
            },
            '& tbody > tr, tfoot > tr': {
               position: 'sticky',
               left: 1,
            },
            '& tfoot > tr > td': {
               backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 1,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
               borderLeft: `1px solid ${theme.palette.divider}`,
            },
            '& th:first-child': {
               position: 'sticky',
               left: 1,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
               borderLeft: `1px solid ${theme.palette.divider}`,
            },
            '& tr:nth-child(2) > th:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
                  right: PERCENT_COLUMN_WIDTH,
               },
            },
            '& tr:nth-child(2) > th:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& tr:nth-child(2) > th:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& th:last-child': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: 0,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& tr:first-child > th:last-child': {
               borderLeft: `2px solid ${theme.palette.divider}`,
            },
            '& td:last-child': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: 0,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
         },
      },
   }),
   {name: 'CashFlowStyles'}
);

const getInitialCashFlow = (year) => ({
   id: uuid(),
   actualOperatingLoanBalance: 0,
   date: moment().format(DATE_DB_FORMAT),
   entityId: '',
   targetIncome: 0,
   operatingLoanLimit: 0,
   carryoverIncome: 0,
   year,
});

const DECEMBER_ACTUAL_OPERATING_BALANCE = 24;
const DECEMBER_PROJECTED_OPERATING_BALANCE = 23;
/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed: 5/28/21(incomplete development)
 */
export default function CashFlow() {
   const {clientId, entityId} = useParams();
   const location = useLocation();
   const history = useHistory();
   const searchParsed = parse(location.search) || {};
   const {entityIds = [entityId], isAllEntities = false} = searchParsed;
   let searchYear = sessionStorage.filterDate ? moment(sessionStorage.filterDate, MONTH_FORMAT) : undefined;
   const entityIdList = castArray(entityIds);
   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {fetchPolicy: 'cache-network', variables: {clientId}},
      'client.type'
   );

   const [year, setYear] = useState();
   // Set the startMonth and default to jan if not set
   const startMonth = clientData?.client.startMonth || 'jan';

   const fiscalYear = useMemo(() => {
      if (startMonth) {
         const fiscalYearStart = moment(`${moment().get('year')}-${startMonth}`, 'YYYY-MMM');
         return moment().isBefore(fiscalYearStart, 'month')
            ? fiscalYearStart.subtract(1, 'year').year()
            : fiscalYearStart.year();
      }
      return undefined;
   }, [clientData?.client.startMonth]);

   // Set the year to the year from the URL if it exists and is valid. If not, use the current fiscal year.
   useEffect(() => {
      if (!searchYear || !searchYear?.isValid() || searchYear?.isBefore(MINIMUM_YEAR, 'year')) {
         setYear(fiscalYear || moment().year());
      } else {
         setYear(searchYear.year());
      }
   }, [searchYear, fiscalYear]);

   const theme = useTheme();
   const classes = useStyles();

   const incomeTotals = useRef({}).current;
   const expenseTotals = useRef({}).current;

   const [showEdit, setShowEdit] = useRecoilState(editCellState);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const [pdfDataReady, setPdfDataReady] = useState(true);
   const [pdfReportReady, setPdfReportReady] = useState(false);
   const [refreshExpense, setRefreshExpense] = useState(Date.now());
   const [refreshIncome, setRefreshIncome] = useState(Date.now());

   const [incomeCreateUpdate] = useMutationFHG(INCOME_CREATE_UPDATE);
   const [incomeDelete] = useMutationFHG(INCOME_DELETE);
   const [incomeTypeCreateUpdate] = useMutationFHG(INCOME_TYPE_CREATE_UPDATE);
   const [incomeTypeDelete] = useMutationFHG(INCOME_TYPE_DELETE);
   const [incomeTypeUndelete] = useMutationFHG(INCOME_TYPE_UNDELETE);

   const [expenseCreateUpdate] = useMutationFHG(EXPENSE_CREATE_UPDATE);
   const [expenseDelete] = useMutationFHG(EXPENSE_DELETE);
   const [expenseTypeDelete] = useMutationFHG(EXPENSE_TYPE_DELETE);
   const [expenseTypeUndelete] = useMutationFHG(EXPENSE_TYPE_UNDELETE);
   const [expenseTypeCreateUpdate] = useMutationFHG(EXPENSE_TYPE_CREATE_UPDATE);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const entities = sortBy(entitiesData?.entities || [], 'name');

   const [cashFlowData, {loading}] = useQueryFHG(CASH_FLOW_QUERY, {
      fetchPolicy: 'network-only',
      variables: {entityId: isAllEntities ? map(entities, 'id') : entityIdList, year: convertYearToNumber(year)},
      skip: !validate(entityId) || !fiscalYear,
   });
   const [cashFlowDataLazy] = useLazyQueryFHG(CASH_FLOW_QUERY, {fetchPolicy: 'network-only'}, 'cashFlow.type');
   const [entityCashFlowData, {loading: entityCashFlowDataLoading}] = useQueryFHG(ENTITY_CASH_FLOW_ALL_WHERE_QUERY, {
      fetchPolicy: 'cache-network',
      variables: {entityId: isAllEntities ? map(entities, 'id') : entityIdList, year: convertYearToNumber(year)},
      skip: !validate(entityId) || !fiscalYear,
   });

   const monthOrder = useMemo(() => cashFlowData?.cashFlow?.monthOrder || DEFAULT_MONTH_ORDER, [cashFlowData]);

   const [entityCashFlowCreateUpdate] = useMutationFHG(ENTITY_CASH_FLOW_CREATE_UPDATE);

   const [isLoading, setIsLoading] = useState(true);

   const handleYearChange = (event, value) => {
      setYear(value?.year());
      const date = sessionStorage.filterDate ? moment(sessionStorage.filterDate, MONTH_FORMAT) : moment();
      date.set('year', value?.year());
      sessionStorage.filterDate = moment(date).format(MONTH_FORMAT);
   };

   const [editValues, handleChange, {getValue, setValue, setEditValues}] = useEditData({
      entityId: entityIdList,
      isLocked: false,
      isAllEntityId: isAllEntities,
   });

   const {buttonPanel, scaleStyle, scale} = useScalePanel({
      position: 'relative',
      top: 'unset',
      right: 'unset',
      backgroundColor: 'white',
      opacity: 1,
   });

   /**
    * When the url params change check for the auto lock.
    */
   useEffect(() => {
      setValue('isLocked', year < fiscalYear || entityIdList?.length > 1 || isAllEntities);
      // adding setValue will cause infinite calls.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [entityIdList?.length, fiscalYear, isAllEntities, year]);

   const handleChangeCallback = (changed) => {
      setPdfDataReady(false);
      handleSubmitDebounced(changed, year);
   };

   const [
      editCashFlowValues,
      handleCashFlowChange,
      {getValue: getCashFlowValue, defaultValues: defaultCashFlowValues, resetValues: resetCashFlowValues},
   ] = useEditData(
      {id: uuid(), entityId, ...entityCashFlowData?.entityCashFlow?.[0]},
      ['id', 'entityId'],
      undefined,
      handleChangeCallback
   );

   const [selectedLocation, setSelectedLocation] = useState();
   const setEditNote = useSetRecoilState(noteEditStatus);

   const handleEntityChange = (event, value) => {
      defer(() => {
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
   }, [entities, getValue]);

   const entityNames = useMemo(() => {
      return join(map(getEntities(), 'name'), ', ');
   }, [getEntities]);

   useEffect(() => {
      if (editValues?.entityId?.length > 0 || editValues?.isAllEntityId !== undefined) {
         const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
         searchParams.year = year;

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
   }, [history, location.pathname, location.search, editValues, setEditValues, getValue, year]);

   useEffect(() => {
      if (loading || entityCashFlowDataLoading) {
         setPdfDataReady(false);
      } else if (cashFlowData && entityNames && entityCashFlowData) {
         setPdfDataReady(true);
      }
   }, [loading, cashFlowData, entityNames, entityCashFlowDataLoading, entityCashFlowData]);

   useEffect(() => {
      if (loading || entityCashFlowDataLoading || !pdfDataReady || !entityNames) {
         setPdfReportReady(false);
      } else {
         setPdfReportReady(true);
      }
   }, [loading, entityCashFlowDataLoading, cashFlowData, pdfDataReady, entityNames]);

   const exportToExcel = useCashFlowExcelExport(`${entityNames}-Cash Flow`, 'CashFlow');

   /**
    * On export excel, download the Excel document.
    */
   const handleExportExcel = async () => {
      const result = await cashFlowDataLazy({
         fetchPolicy: 'network-only',
         variables: {entityId: isAllEntities ? map(entities, 'id') : entityIdList, year},
      });

      exportToExcel(
         result?.data,
         year,
         entityNames,
         getCashFlowValue('actualOperatingLoanBalance'),
         getCashFlowValue('operatingLoanLimit'),
         operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE],
         operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE],
         getCashFlowValue('targetIncome'),
         getCashFlowValue('carryoverIncome')
      );
   };

   usePageTitle({titleKey: 'cashFlow.title', values: {year}});
   const setTitleStatus = useSetRecoilState(titleStatus);

   setTitleStatus((status) => ({
      ...status,
      helpKey: 'cashFlow.overall.help',
      videoId: 'kvooi0oe1v',
   }));

   useEffect(() => {
      if (entityCashFlowData?.entityCashFlow) {
         setIsLoading(false);

         if (entityCashFlowData.entityCashFlow.length > 0) {
            let values = {id: uuid(), entityId};

            if ((isAllEntities || entityIdList?.length > 1) && entityCashFlowData.entityCashFlow.length > 1) {
               const array = entityCashFlowData?.entityCashFlow;
               values.actualOperatingLoanBalance = sumBy(array, 'actualOperatingLoanBalance');
               values.operatingLoanLimit = sumBy(array, 'operatingLoanLimit');
            } else {
               values = {...values, ...entityCashFlowData?.entityCashFlow?.[0]};
            }
            resetCashFlowValues(values);
         } else {
            resetCashFlowValues();
         }
      }
   }, [entityCashFlowData?.entityCashFlow, entityId, entityIdList?.length]);

   const {incomeCashFlowData, expenseCashFlowData} = useMemo(() => {
      const cashFlow = cashFlowData?.cashFlow;

      if (cashFlow) {
         const useCashFlowExpenses = differenceBy(cashFlow?.expenses, [{typeName: DEPRECIATION_TYPE_NAME}], 'typeName');
         return {
            incomeCashFlowData: cashFlow?.income ? [...cashFlow?.income, {}] : [{}],
            expenseCashFlowData: useCashFlowExpenses ? [...useCashFlowExpenses, {}] : [{}],
         };
      } else {
         return {incomeCashFlowData: [], expenseCashFlowData: []};
      }
   }, [cashFlowData]);

   /**
    * When the grouped expenses change, select the new category and set it for editing.
    */
   useEffect(() => {
      if (expenseCashFlowData?.length > 0) {
         const newCategoryIndex = findLastIndex(expenseCashFlowData, ['typeName', null]);

         if (newCategoryIndex >= 0) {
            setSelectedLocation({isExpense: true});
            setCellSelected({
               tableName: EXPENSES_TABLE,
               rowIndex: newCategoryIndex,
               columnIndex: CATEGORY_COLUMN_INDEX,
            });
            setShowEdit(true);
         }
      }
   }, [expenseCashFlowData, setCellSelected, setShowEdit]);

   // Create the columns for the income table.
   const columns = useMemo(() => {
      let columnIndex = 0;
      const cellDefaults = {
         isFormattedNumber: true,
         prefix: '',
         format: CURRENCY_FULL_FORMAT,
         minWidth: 145,
         maxWidth: 145,
         width: 145,
         tableCellProps: {align: 'right'},
         isEditable: true,
         Footer: (info) => {
            // Only calculate total visits if rows change
            const sum = React.useMemo(() => {
               const sumCalc = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               incomeTotals[info.column.id] = sumCalc;
               return sumCalc;
            }, [info.rows, info.column.id]);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
      };
      const actualCellDefaults = {
         ...cellDefaults,
         field: 'actual',
         bold: true,
         isEditable: (data) => data?.row?.original?.typeName !== undefined,
      };
      const expectedCellDefaults = {
         ...cellDefaults,
         field: 'expected',
         isEditable: (data) => data?.row?.original?.typeName !== undefined,
      };

      const columns = [
         {
            id: CATEGORY_INCOME_COLUMN_ID,
            Header: <TypographyFHG id={'cashFlow.income.column'} />,
            accessor: 'typeName',
            style: {align: 'right', whiteSpace: 'pre-wrap'},
            minWidth: 240,
            maxWidth: 240,
            width: 240,
            ___index: columnIndex++,
            isEditable: (data) => !!data?.row?.original?.entityId || data?.row?.original?.typeName === undefined,
            Cell: (data) => {
               return getValue('isLocked') && data.value === ADD_BUTTON_CELL_VALUE ? (
                  ''
               ) : (
                  <StaticCell
                     {...data}
                     isEditable={!!data?.row?.original?.entityId || data?.row?.original?.typeName === undefined}
                     color={data.value === ADD_BUTTON_CELL_VALUE ? 'lightgrey' : undefined}
                     defaultValue={data.value === ADD_BUTTON_CELL_VALUE ? 'Add a category' : 'Untitled Category'}
                  />
               );
            },
            Footer: 'Total Income',
         },
      ];

      for (const month of monthOrder) {
         columns.push({
            id: month,
            Header: <TypographyFHG id={`cashFlow.${month}.column`} />,
            columns: [
               {
                  Header: <TypographyFHG id={'cashFlow.projected.column'} />,
                  accessor: `${month}.expected`,
                  ___index: columnIndex++,
                  ...expectedCellDefaults,
                  isEditable: month !== 'annual',
               },
               {
                  Header: <TypographyFHG id={'cashFlow.actual.column'} />,
                  accessor: `${month}.actual`,
                  ___index: columnIndex++,
                  ...actualCellDefaults,
                  isEditable: month !== 'annual',
               },
            ],
         });
      }

      columns.push({
         id: 'annual',
         Header: <TypographyFHG id={`cashFlow.annual.column`} />,
         Footer: '',
         columns: [
            {
               Header: <TypographyFHG id={'cashFlow.projected.column'} />,
               ___index: columnIndex++,
               accessor: `annual.expected`,
               field: 'expected',
               isEditable: false,
               ...cellDefaults,
               Cell: ({row}) => {
                  const sum = React.useMemo(() => sumAnnualRow('expected', row), [row]);

                  row.values[`annual.expected`] = sum;
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </div>
                  );
               },
            },
            {
               Header: <TypographyFHG id={'cashFlow.percent.column'} />,
               ___index: columnIndex++,
               accessor: `annual.expectedPercent`,
               field: 'expected',
               isEditable: false,
               ...cellDefaults,
               minWidth: PERCENT_COLUMN_WIDTH,
               maxWidth: PERCENT_COLUMN_WIDTH,
               width: PERCENT_COLUMN_WIDTH,
               Cell: '',
               Footer: (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     100%
                  </div>
               ),
            },
            {
               Header: <TypographyFHG id={'cashFlow.actual.column'} />,
               accessor: `annual.actual`,
               ___index: columnIndex++,
               field: 'actual',
               bold: true,
               isEditable: false,
               ...cellDefaults,
               Cell: ({row}) => {
                  const sum = React.useMemo(() => sumAnnualRow('actual', row), [row]);

                  row.values[`annual.actual`] = sum;
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </div>
                  );
               },
            },
            {
               Header: <TypographyFHG id={'cashFlow.percent.column'} />,
               ___index: columnIndex++,
               accessor: `annual.actualPercent`,
               field: 'expected',
               isEditable: false,
               ...cellDefaults,
               minWidth: PERCENT_COLUMN_WIDTH,
               maxWidth: PERCENT_COLUMN_WIDTH,
               width: PERCENT_COLUMN_WIDTH,
               Cell: '',
               Footer: (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     100%
                  </div>
               ),
            },
         ],
      });
      return columns;
   }, [monthOrder, incomeTotals, getValue, classes.footerStyle, theme.palette.error.main]);

   /**
    * Submit the expense type changes to the server.
    */
   const submitExpenseType = useCallback(
      async function (expenseTypeId = uuid(), value) {
         const variables = {id: expenseTypeId, name: value?.length > 0 ? value.trim() : undefined, entityId};

         await expenseTypeCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               expenseType: {
                  __typename: 'ExpenseType',
                  ...variables,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getExpenseTypeUpdateQueries(), variables.id, 'expenseType'),
            refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
         });
      },
      [entityId, expenseTypeCreateUpdate, year]
   );

   // Create the columns for the expense table.
   const expenseColumns = useMemo(() => {
      let columnIndex = 0;

      const cellDefaults = {
         isFormattedNumber: true,
         prefix: '',
         format: CURRENCY_FULL_FORMAT,
         minWidth: 145,
         maxWidth: 145,
         width: 145,
         tableCellProps: {align: 'right'},
         isEditable: true, //(cell) => cell?.row?.values?.expense !== undefined,
         Footer: (info) => {
            const sum = React.useMemo(() => {
               const sumCalc = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               expenseTotals[info.column.id] = sumCalc;
               return sumCalc;
            }, [info.rows, info.column.id]);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
         Footer2: (info) => {
            const sum = incomeTotals[info.column.id] - expenseTotals[info.column.id];

            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
         Footer3: (info) => {
            const sum = React.useMemo(() => {
               let calc;
               let useOperatingLoanBalance;

               // The first actual columns use the user defined value for actualOperatingLoanBalance.
               if (info.column.___index === 1 || info.column.___index === 2) {
                  useOperatingLoanBalance = getCashFlowValue('actualOperatingLoanBalance') ?? 0;
                  // The first actual columns use the user defined value for actualOperatingLoanBalance.
               } else {
                  useOperatingLoanBalance = operatingLoanBalance[info.column.___index - 2] ?? 0;
               }

               calc = useOperatingLoanBalance - (incomeTotals[info.column.id] - expenseTotals[info.column.id]);
               operatingLoanBalance[info.column.___index] = calc;

               return calc < 0 ? 0 : calc;
            }, [info.column.id, info.column.___index, operatingLoanBalance, incomeTotals, expenseTotals]);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
      };

      const columns = [
         {
            id: CATEGORY_EXPENSE_COLUMN_ID,
            Header: <TypographyFHG id={'cashFlow.expense.column'} />,
            accessor: 'typeName',
            style: {align: 'right', whiteSpace: 'pre-wrap'},
            minWidth: 240,
            maxWidth: 240,
            width: 240,
            ___index: columnIndex++,
            isEditable: (data) => !!data?.row?.original?.entityId || data?.row?.original?.typeName === undefined,
            Cell: (data) => {
               return getValue('isLocked') && data.value === ADD_BUTTON_CELL_VALUE ? (
                  ''
               ) : (
                  <StaticCell
                     {...data}
                     isEditable={!!data?.row?.original?.entityId || data?.row?.original?.typeName === undefined}
                     color={data.value === ADD_BUTTON_CELL_VALUE ? 'lightgrey' : undefined}
                     defaultValue={data.value === ADD_BUTTON_CELL_VALUE ? 'Add a category' : 'Untitled Category'}
                  />
               );
            },
            Footer: 'Total Expense',
            Footer2: 'Net Cash Flow',
            Footer3: 'Operating Loan Balance',
         },
      ];

      for (const month of monthOrder) {
         columns.push({
            id: month,
            Header: <TypographyFHG id={`cashFlow.${month}.column`} />,
            Footer: '',
            columns: [
               {
                  Header: <TypographyFHG id={'cashFlow.projected.column'} />,
                  ___index: columnIndex++,
                  accessor: `${month}.expected`,
                  field: 'expected',
                  isEditable: (data) => data?.row?.original?.typeName !== undefined,
                  ...cellDefaults,
               },
               {
                  Header: <TypographyFHG id={'cashFlow.actual.column'} />,
                  accessor: `${month}.actual`,
                  ___index: columnIndex++,
                  field: 'actual',
                  bold: true,
                  isEditable: (data) => data?.row?.original?.typeName !== undefined,
                  ...cellDefaults,
               },
            ],
         });
      }
      columns.push({
         id: 'annual',
         Header: <TypographyFHG id={`cashFlow.annual.column`} />,
         Footer: '',
         columns: [
            {
               Header: <TypographyFHG id={'cashFlow.projected.column'} />,
               ___index: columnIndex++,
               accessor: `annual.expected`,
               field: 'expected',
               isEditable: false,
               ...cellDefaults,
               Footer3: '  ',
               Cell: ({row}) => {
                  const sum = React.useMemo(() => sumAnnualRow('expected', row), [row]);
                  row.values[`annual.expected`] = sum;

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </div>
                  );
               },
               Footer: (info) => {
                  const sum = React.useMemo(() => {
                     const sumCalc = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
                     expenseTotals[info.column.id] = sumCalc;
                     return sumCalc;
                  }, [info.rows, info.column.id]);
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </div>
                  );
               },
            },
            {
               Header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessor: `annual.expectedPercent`,
               ___index: columnIndex++,
               field: 'expectedPercent',
               isEditable: false,
               ...cellDefaults,
               minWidth: PERCENT_COLUMN_WIDTH,
               maxWidth: PERCENT_COLUMN_WIDTH,
               width: PERCENT_COLUMN_WIDTH,
               Footer: (info) => {
                  const sum = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
                  expenseTotals[info.column.id] = sum;
                  return (
                     <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
               Footer2: () => {
                  // Income annual projected percent will always be 100% - projected expense %.
                  const sum = 100 - expenseTotals['annual.expectedPercent'];
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
               Footer3: '  ',
               Cell: ({row}) => {
                  const sum = React.useMemo(() => {
                     let sum = sumAnnualRow('expected', row);
                     const totalIncome = incomeTotals?.['annual.expected'];
                     return totalIncome > 0 ? (sum / totalIncome) * 100 : 0;
                  }, [row, incomeTotals?.['annual.expected']]);

                  row.values[`annual.expectedPercent`] = sum;

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
            },
            {
               Header: <TypographyFHG id={'cashFlow.actual.column'} />,
               accessor: `annual.actual`,
               ___index: columnIndex++,
               field: 'actual',
               bold: true,
               isEditable: false,
               ...cellDefaults,
               Footer3: '  ',
               Cell: ({row}) => {
                  const sum = React.useMemo(() => sumAnnualRow('actual', row), [row]);
                  row.values[`annual.actual`] = sum;

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </div>
                  );
               },
            },
            {
               Header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessor: `annual.actualPercent`,
               ___index: columnIndex++,
               field: 'actualPercent',
               bold: true,
               isEditable: false,
               ...cellDefaults,
               minWidth: PERCENT_COLUMN_WIDTH,
               maxWidth: PERCENT_COLUMN_WIDTH,
               width: PERCENT_COLUMN_WIDTH,
               Footer: (info) => {
                  const sum = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
                  expenseTotals[info.column.id] = sum;
                  return (
                     <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
               Footer2: () => {
                  // Income annual actual percent will always be 100% - actual expense %.
                  const sum = 100 - expenseTotals['annual.actualPercent'];
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
               Footer3: '  ',
               Cell: ({row}) => {
                  const sum = React.useMemo(() => {
                     let sum = sumAnnualRow('actual', row);
                     const totalIncome = incomeTotals?.['annual.actual'];
                     return totalIncome > 0 ? (sum / totalIncome) * 100 : 0;
                  }, [row, incomeTotals?.['annual.actual']]);

                  row.values[`annual.actualPercent`] = sum;

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
            },
         ],
      });
      return columns;
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      getCashFlowValue,
      getValue,
      refreshExpense,
      incomeTotals,
      operatingLoanBalance,
      expenseTotals,
      classes.footerStyle,
      theme.palette.error.main,
      monthOrder,
   ]);

   /**
    * Perform keyboard navigation and escape and enter.
    *
    * @type {(function(*): void)|*}
    */
   const handleKey = useCallback(
      (event) => {
         let rowIndex;
         let columnIndex;

         if (!event.defaultPrevented && event.target.name !== 'notes' && !showEdit) {
            const offset = event.shiftKey ? -1 : 1;

            switch (event.keyCode) {
               // Tab
               case 9:
                  if (cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex + offset;
                  }
                  break;

               // Enter
               case 13:
                  if (cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex + offset;
                  }
                  break;

               //Escape
               case 27:
                  event.preventDefault();
                  setCellSelected({});
                  break;

               // Left Arrow
               case 37:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex - offset;
                  }
                  break;

               // Up Arrow
               case 38:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex - offset;
                  }
                  break;

               // Right Arrow
               case 39:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex + offset;
                  }
                  break;

               // Down Arrow
               case 40:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex + offset;
                  }
                  break;

               // 0 - 9 or number pad 0 - 9 or "-".
               default:
                  if (
                     (event.keyCode >= 48 && event.keyCode <= 57) ||
                     (event.keyCode >= 96 && event.keyCode <= 105) ||
                     (event.keyCode === 189 && !!(selectedLocation?.cell || cellSelected?.tableName))
                  ) {
                     setShowEdit(true);
                  }
                  break;
            }

            if (rowIndex !== undefined || columnIndex !== undefined) {
               const maxColumn =
                  (cellSelected?.tableName === INCOME_TABLE ? columns.length : expenseColumns.length) * 2 - 1;
               const maxRow =
                  cellSelected?.tableName === INCOME_TABLE ? incomeCashFlowData?.length : expenseCashFlowData?.length;

               if (
                  (!rowIndex || (rowIndex >= 0 && rowIndex < maxRow)) &&
                  (!columnIndex || (columnIndex >= 0 && columnIndex < maxColumn))
               ) {
                  event?.preventDefault();
                  event?.stopPropagation();
                  setCellSelected((cellSelected) => ({
                     ...cellSelected,
                     rowIndex: rowIndex !== undefined ? rowIndex : cellSelected.rowIndex,
                     columnIndex: columnIndex !== undefined ? columnIndex : cellSelected.columnIndex,
                  }));
                  defer(() => {
                     const id = `StaticCell' ${cellSelected?.tableName} ${rowIndex || cellSelected?.rowIndex} ${
                        columnIndex || cellSelected?.columnIndex
                     }`;
                     const dom = document.getElementById(id);

                     if (dom) {
                        dom.focus();

                        if (dom?.scrollIntoViewIfNeeded) {
                           dom.scrollIntoViewIfNeeded(false);
                        } else {
                           dom.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
                        }
                     }
                  });
               }
            }
         }
      },
      [
         showEdit,
         setCellSelected,
         cellSelected?.rowIndex,
         cellSelected?.columnIndex,
         cellSelected?.tableName,
         setShowEdit,
         columns?.length,
         expenseColumns?.length,
         incomeCashFlowData?.length,
         expenseCashFlowData?.length,
      ]
   );

   /**
    * Install keydown listener.
    */
   useEffect(() => {
      document.addEventListener('keydown', handleKey, false);
   }, [cellSelected, setCellSelected, setShowEdit, handleKey]);

   /**
    * Cleanup the listener when this component is removed. This is needed because of a bug in react. Should be able to
    * do this from UseEffect.
    */
   useLayoutEffect(() => {
      return () => {
         setTitleStatus((status) => ({
            ...status,
            helpKey: undefined,
            videoId: undefined,
         }));
         document.removeEventListener('keydown', handleKey, false);
      };
   }, [cellSelected, setCellSelected, setShowEdit, handleKey, setTitleStatus]);

   /**
    * When the new note button is clicked, turn on note editing.
    * @return {Promise<void>}
    */
   const handleAddNote = useCallback(async () => {
      setEditNote(true);
   }, [setEditNote]);

   /**
    * When the edit button is clicked, turn on cell editing.
    */
   const handleEditCell = useCallback(() => {
      setShowEdit(true);
   }, [setShowEdit]);

   /**
    * When a cell is selected set the selected location and turn on cell editing.
    * @param isExpense Indicates if the cell is in the expense or the income table.
    * @return {(function(*, *, *, *, *): void)|*}
    */
   const handleSelectCell = useCallback(
      (isExpense) => (index, cellKey, rowIndex, columnIndex, cell) => {
         setSelectedLocation({isExpense, cell});

         if (columnIndex === CATEGORY_COLUMN_INDEX && cell.value === ADD_BUTTON_CELL_VALUE) {
            setShowEdit(true);
         }
      },
      [setShowEdit]
   );

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (changes, year) => {
         const variables = {...changes, year: convertYearToNumber(year)};

         await entityCashFlowCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               entityCashFlow: {
                  __typename: 'EntityCashFlow',
                  ...getInitialCashFlow(year),
                  ...defaultCashFlowValues,
                  ...editCashFlowValues,
                  isDeleted: false,
               },
            },
            refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
         });
      },
      [year, entityCashFlowCreateUpdate, defaultCashFlowValues, editCashFlowValues, entityId]
   );

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   const handleFocusEdit = () => {
      setSelectedLocation({});
      setCellSelected({});
   };

   /**
    * Get the income or expense object that is represented by the selected cell. The parent column ID has the name of
    * the field for the cell.
    *
    * @return {*} expense or income object.
    */
   const getSelectedItem = useCallback(() => {
      const parentId = selectedLocation?.cell?.column?.parent?.id;

      if (parentId) {
         if (cellSelected?.tableName === INCOME_TABLE) {
            return incomeCashFlowData?.[cellSelected?.rowIndex]?.[parentId];
         } else if (cellSelected?.tableName === EXPENSES_TABLE) {
            return expenseCashFlowData?.[cellSelected?.rowIndex]?.[parentId];
         } else {
            console.log('Could not find the selected item', cellSelected, selectedLocation);
         }
      }
   }, [expenseCashFlowData, incomeCashFlowData, cellSelected, selectedLocation]);

   /**
    * When a cell is updated, submit the changes to the server.
    * @param index - unused
    * @param id The ID of the column
    * @param value The updated value.
    * @param original The original income or expense.
    * @return {Promise<void>} For the server submit.
    */
   const handleUpdate = useCallback(
      async (index, id, value, original) => {
         if (id === CATEGORY_INCOME_COLUMN_ID) {
            if (
               value !== 'Add a category' &&
               trim(value) &&
               original?.typeName !== value &&
               (!original?.id || original?.entityId)
            ) {
               const variables = {
                  id: original?.typeId || uuid(),
                  name: value?.length > 0 ? value.trim() : undefined,
                  entityId,
               };

               await incomeTypeCreateUpdate({
                  variables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     incomeType: {
                        __typename: 'IncomeType',
                        ...variables,
                        isDeleted: false,
                     },
                  },
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
            }
         } else if (id === CATEGORY_EXPENSE_COLUMN_ID) {
            if (
               value !== 'Add a category' &&
               trim(value) &&
               original?.typeName !== value &&
               (!original?.id || original?.entityId)
            ) {
               await submitExpenseType(original?.typeId, value);
            }
         } else {
            let itemCreateUpdate;
            const [recordField, field] = id?.split('.');
            const item = get(original, recordField);

            if (recordField && field && item) {
               const variables = {
                  entityId,
                  date: moment(
                     `${recordField}-01-${
                        DEFAULT_MONTH_ORDER.indexOf(recordField) < DEFAULT_MONTH_ORDER.indexOf(startMonth) // If record month is strictly prior
                           ? // to the startMonth
                             year + 1 // Add one year to date
                           : year // Otherwise, send selected year
                     }`
                  ),
                  [field]: +value || 0,
               };

               item[field] = +value || 0;

               if (cellSelected.tableName === INCOME_TABLE) {
                  variables.incomeTypeId = original?.typeId;
                  itemCreateUpdate = incomeCreateUpdate;
                  setRefreshIncome(Date.now());
               } else if (cellSelected.tableName === EXPENSES_TABLE) {
                  variables.expenseTypeId = original?.typeId;
                  itemCreateUpdate = expenseCreateUpdate;
                  setRefreshExpense(Date.now());
               } else {
                  console.log('could not find the selected item', cellSelected, selectedLocation);
                  return;
               }

               itemCreateUpdate({variables});
            }
         }
         setPdfDataReady(true);
      },
      [
         cellSelected,
         entityId,
         expenseCreateUpdate,
         incomeCreateUpdate,
         incomeTypeCreateUpdate,
         selectedLocation,
         submitExpenseType,
         year,
      ]
   );

   /**
    * Closes the notes edit popup.
    */
   const handleCloseNotes = useCallback(() => {
      setEditNote(false);
   }, [setEditNote]);

   /**
    * Callback when the note is updated. Submit the note changes to the server.
    * @param note The updated note.
    * @return {Promise<void>}
    */
   const handleUpdateNotes = useCallback(
      async (note) => {
         let itemCreateUpdate, __typename, mutationPath;
         const item = getSelectedItem();
         if (item) {
            const [recordField] = selectedLocation?.cell?.column?.id?.split('.') || [];
            const itemUuid = item?.id?.split('_');
            const useId = itemUuid?.[0] === entityId ? uuid() : itemUuid[0];

            // If record month is strictly prior to the startMonth
            const useYear =
               DEFAULT_MONTH_ORDER.indexOf(recordField) < DEFAULT_MONTH_ORDER.indexOf(startMonth)
                  ? year + 1 // Add one year to date
                  : year; // Otherwise, send selected year

            const variables = {
               id: useId,
               entityId,
               [selectedLocation?.cell?.column?.field === 'expected' ? 'noteExpected' : 'noteActual']: note,
               date: moment(`${recordField}-01-${useYear}`).format(DATE_DB_FORMAT),
            };

            if (cellSelected.tableName === INCOME_TABLE) {
               variables.incomeTypeId = selectedLocation.cell?.row?.original?.typeId;
               itemCreateUpdate = incomeCreateUpdate;
               __typename = 'Income';
               mutationPath = 'income';
            } else if (cellSelected.tableName === EXPENSES_TABLE) {
               variables.expenseTypeId = selectedLocation.cell?.row?.original?.typeId;
               itemCreateUpdate = expenseCreateUpdate;
               __typename = 'Expense';
               mutationPath = 'expense';
            } else {
               console.log('could not find the selected item', cellSelected, selectedLocation);
               return;
            }

            await itemCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  [mutationPath]: {
                     __typename,
                     ...defaultExpenseOrIncome,
                     ...item,
                     ...variables,
                     isDeleted: false,
                  },
               },
               refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
            });
         }
         handleCloseNotes();
      },
      [
         cellSelected,
         entityId,
         expenseCreateUpdate,
         getSelectedItem,
         handleCloseNotes,
         incomeCreateUpdate,
         selectedLocation,
         year,
      ]
   );

   /**
    * Callback when a category is deleted.
    * @return {Promise<void>}
    */
   const handleDeleteCategory = useCallback(async () => {
      if (cellSelected?.rowIndex >= 0) {
         if (cellSelected.tableName === EXPENSES_TABLE) {
            if (cellSelected.columnIndex !== CATEGORY_COLUMN_INDEX) {
               const date = selectedLocation?.cell?.column?.parent?.id;
               const item = expenseCashFlowData[cellSelected.rowIndex][date];

               if (item?.id) {
                  await expenseDelete({
                     variables: {id: item?.id},
                     optimisticResponse: {expense_Delete: 1},
                     update: cacheDelete(getExpenseUpdateQueries(entityId), item?.id),
                     refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
                  });
               }
               return;
            }
            const expenseType = expenseCashFlowData[cellSelected?.rowIndex];

            if (expenseType) {
               const item = selectedLocation.cell.row.original;
               await expenseTypeDelete({
                  variables: {id: item?.typeId},
                  optimisticResponse: {expenseType_Delete: 1},
                  update: cacheDelete(getExpenseTypeUpdateQueries(), item?.id),
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
               setSelectedLocation({});
               setCellSelected({});
            } else {
               console.log('Could not delete expense type at row, ', cellSelected?.rowIndex);
            }
         } else {
            if (cellSelected.columnIndex !== CATEGORY_COLUMN_INDEX) {
               const date = selectedLocation.cell.column?.parent?.id;
               const item = incomeCashFlowData[cellSelected.rowIndex][date];

               if (item?.id) {
                  await incomeDelete({
                     variables: {id: item?.id},
                     optimisticResponse: {income_Delete: 1},
                     update: cacheDelete(getIncomeUpdateQueries()),
                     refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
                  });
               }
               return;
            }

            const incomeType = incomeCashFlowData[cellSelected?.rowIndex];

            if (incomeType) {
               const item = selectedLocation.cell.row.original;

               await incomeTypeDelete({
                  variables: {id: item?.typeId},
                  optimisticResponse: {incomeType_Delete: 1},
                  update: cacheDelete(getIncomeTypeUpdateQueries(), item?.id),
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
               setSelectedLocation({});
               setCellSelected({});
            } else {
               console.log('Could not delete income type at row, ', cellSelected?.rowIndex);
            }
         }
      }
   }, [
      expenseCashFlowData,
      incomeCashFlowData,
      cellSelected,
      year,
      entityId,
      expenseDelete,
      expenseTypeDelete,
      incomeDelete,
      incomeTypeDelete,
      selectedLocation?.cell?.column?.parent?.id,
      selectedLocation?.cell?.row.original,
      setCellSelected,
   ]);

   /**
    * Callback whe the category is undeleted. Call the server to undelete the category.
    * @return {Promise<void>}
    */
   const handleUnDeleteCategory = useCallback(
      async (deletedId) => {
         if (deletedId) {
            if (cellSelected.tableName === EXPENSES_TABLE) {
               await expenseTypeUndelete({
                  variables: {id: deletedId},
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
            } else {
               await incomeTypeUndelete({
                  variables: {id: deletedId},
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
            }
         }
      },
      [entityId, expenseTypeUndelete, incomeTypeUndelete, year, cellSelected?.tableName]
   );

   /**
    * Indicates if a cell in the category is selected.
    * @return {boolean} True if the columns is the category column.
    */
   const isCategoryCellSelected = () => {
      return cellSelected?.columnIndex === CATEGORY_COLUMN_INDEX && selectedLocation?.cell?.row?.original.entityId;
   };

   /**
    * Indicates if the selected cell has a value.
    * @return {boolean} True if the selected cell has a value.
    */
   const selectedCellHasValue = () => {
      return hasValue(selectedLocation?.cell?.value);
   };

   /**
    * Indicates if the selected cell has a note.
    * @return {*} The selected note.
    */
   const selectedCellHasNote = () => {
      const selectedItem = getSelectedItem();
      return selectedItem?.noteActual || selectedItem?.noteExpected;
   };

   const getClassForValue = (value = 0, defaultStyle) => {
      if (value < 0) {
         return classes.negativeStyle;
      }

      return defaultStyle;
   };

   /**
    * If the Income table is scrolling, scroll the Expense table the same amount.
    * @param event The scroll event.
    */
   const handleIncomeScroll = useCallback((event) => {
      const expenseTableContainer = document.getElementsByName(EXPENSES_TABLE + 'Container')?.[0];

      expenseTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
   }, []);

   /**
    * If the Expense table is scrolling, scroll the Income table the same amount.
    * @param event The scroll event.
    */
   const handleExpenseScroll = useCallback((event) => {
      const incomeTableContainer = document.getElementsByName(INCOME_TABLE + 'Container')?.[0];
      incomeTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
   }, []);

   /**
    * Calculate the end of the current year, or the next year if in the fourth quarter.
    * @return {Moment} The last day of the year or next year if in the last quarter.
    */
   const calculateMaximumYear = () => {
      let lastDate = moment().endOf('year');
      const isLastQuarter = moment().quarter() >= 4;

      // If in the last quarter move to the end of next year, otherwise end of this year.
      return isLastQuarter ? lastDate.add(1, 'year') : lastDate;
   };

   const ExpenseTable = useMemo(
      () => (
         <TableFHG
            key={'ExpenseTable' + refreshExpense}
            name={EXPENSES_TABLE}
            columns={expenseColumns}
            data={expenseCashFlowData}
            stickyHeader={false}
            stickyLeftColumn={true}
            updateMyData={getValue('isLocked') ? undefined : handleUpdate}
            onChangeNotes={getValue('isLocked') ? undefined : handleUpdateNotes}
            onScroll={handleExpenseScroll}
            classes={{
               root: classes.tableRoot,
               tableHeadRoot: classes.tableHeadRoot,
               cellStyle: classes.cellStyle,
               stickyFrame: classes.stickyFrame,
            }}
            allowCellSelection={true}
            hasShadow={false}
            onSelect={handleSelectCell(true)}
         />
      ),
      [
         refreshExpense,
         classes.cellStyle,
         classes.tableHeadRoot,
         classes.tableRoot,
         expenseCashFlowData,
         expenseColumns,
         getValue,
         handleSelectCell,
         handleUpdate,
         handleUpdateNotes,
         handleExpenseScroll,
         incomeTotals,
         expenseTotals,
      ]
   );

   const IncomeTable = useMemo(
      () => (
         <TableFHG
            key={'IncomeTable' + refreshIncome}
            name={INCOME_TABLE}
            columns={columns}
            data={incomeCashFlowData}
            stickyHeader={false}
            stickyLeftColumn={true}
            updateMyData={getValue('isLocked') ? undefined : handleUpdate}
            onChangeNotes={getValue('isLocked') ? undefined : handleUpdateNotes}
            onScroll={handleIncomeScroll}
            classes={{
               root: classes.tableRoot,
               tableHeadRoot: classes.tableHeadRoot,
               cellStyle: classes.cellStyle,
               stickyFrame: classes.stickyFrame,
            }}
            allowCellSelection={true}
            hasShadow={false}
            onSelect={handleSelectCell(false)}
         />
      ),
      [
         refreshIncome,
         classes.cellStyle,
         classes.tableHeadRoot,
         classes.tableRoot,
         columns,
         getValue,
         handleSelectCell,
         handleUpdate,
         handleUpdateNotes,
         incomeCashFlowData,
         handleIncomeScroll,
      ]
   );
   const date = (sessionStorage.filterDate ? moment(sessionStorage.filterDate, MONTH_FORMAT) : moment()).format(
      DATE_FORMAT_KEYBOARD
   );

   return (
      <Grid name={'cash flow root'} container fullWidth fullHeight direction={'column'} wrap={'nowrap'}>
         <Form onSubmit={handleSubmit} className={classes.formStyle}>
            {/*Header to filter balance sheet*/}
            <div className={classes.headerStyle}>
               <Grid
                  name={'headerFilter'}
                  item
                  container
                  direction={'row'}
                  alignItems={'center'}
                  resizable={false}
                  justify={'space-between'}
               >
                  <Grid container item fullWidth={false} spacing={1} alignItems={'center'}>
                     <Grid item>
                        <KeyboardDatePickerFHG
                           key={'year'}
                           name={'year'}
                           minDate={new Date(MINIMUM_YEAR)}
                           views={['year']}
                           format={YEAR_FORMAT}
                           labelKey={'cashFlow.year.label'}
                           maxDate={calculateMaximumYear()}
                           inputVariant={'standard'}
                           value={year?.toString()}
                           onChange={handleYearChange}
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
                                    {...{
                                       onDelete: option.id === entityId ? undefined : getTagProps({index})?.onDelete,
                                    }}
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
                     <Grid item>
                        <CheckboxFHG
                           key={'isLocked'}
                           name={'isLocked'}
                           onChange={handleChange}
                           color={'default'}
                           labelKey={'cashFlow.locked.label'}
                           value={'isLocked'}
                           checked={getValue('isLocked') || false}
                           marginTop={0}
                           marginLeft={2}
                           disabled={getValue('entityId')?.length > 1 || getValue('isAllEntityId')}
                           fullWidth
                        />
                     </Grid>
                  </Grid>
                  <Grid item container fullWidth={false}>
                     <Grid item>
                        <ExportPdfChoiceButton
                           clientId={clientId}
                           selectedIndex={CASH_FLOW_INDEX}
                           entityIds={entityIdList}
                           historyDate={date}
                           disabled={!pdfReportReady}
                        />
                     </Grid>
                     <Divider orientation='vertical' flexItem />
                     <Grid item>
                        <ButtonLF
                           labelKey={'asset.exportExcel.button'}
                           disabled={!pdfDataReady}
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
               className={classes.totalsAreaStyle}
               direction={'row'}
               resizable={false}
               spacing={3}
            >
               <Grid
                  name={'totals left column'}
                  className={classes.totalsStyle}
                  container
                  item
                  direction={'column'}
                  wrap={'nowrap'}
                  resizable={false}
                  xs={12}
                  sm={6}
               >
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG id={'cashFlow.actualYTD.label'} color='primary' variant='h6' />
                     <TypographyFHG
                        className={getClassForValue(incomeTotals?.['annual.actual'] - expenseTotals?.['annual.actual'])}
                        color='primary'
                        variant='h6'
                     >
                        <FormattedNumber
                           value={incomeTotals?.['annual.actual'] - expenseTotals?.['annual.actual'] || 0}
                           // eslint-disable-next-line react/style-prop-object
                           style='currency'
                           currency='USD'
                        />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG id={'cashFlow.projectedYTD.label'} color='primary' variant='h6'></TypographyFHG>
                     <TypographyFHG
                        color='primary'
                        variant='h6'
                        className={getClassForValue(
                           incomeTotals?.['annual.expected'] - expenseTotals?.['annual.expected']
                        )}
                     >
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber
                           value={incomeTotals?.['annual.expected'] - expenseTotals?.['annual.expected'] || 0}
                           // eslint-disable-next-line react/style-prop-object
                           style='currency'
                           currency='USD'
                        />
                     </TypographyFHG>
                  </Grid>
               </Grid>
               <Grid
                  name={'totals right column'}
                  container
                  item
                  direction={'column'}
                  wrap={'nowrap'}
                  resizable={false}
                  xs={12}
                  sm={6}
               >
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG id={'cashFlow.yearEndActualBalance.label'} color='textPrimary' variant='h6' />
                     <TypographyFHG color='textPrimary' variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber
                           // eslint-disable-next-line react/style-prop-object
                           style='currency'
                           currency='USD'
                           value={
                              operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE] > 0
                                 ? operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE]
                                 : 0
                           }
                        />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG id={'cashFlow.projectedOperatingBalance.label'} color='textPrimary' variant='h6' />
                     <TypographyFHG color='textPrimary' variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber
                           // eslint-disable-next-line react/style-prop-object
                           style='currency'
                           currency='USD'
                           value={
                              operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE] > 0
                                 ? operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE]
                                 : 0
                           }
                        />
                     </TypographyFHG>
                  </Grid>
               </Grid>
            </Grid>
            <Grid container item className={classes.tableFrameStyle} resizable direction={'column'}>
               {!isLoading && (
                  <Grid
                     container
                     item
                     justify={'space-between'}
                     direction={'row'}
                     alignItems={'center'}
                     style={{
                        padding: theme.spacing(1),
                        boxShadow: theme.shadows[3],
                        backgroundColor: 'white',
                        margin: '1px 1px',
                     }}
                  >
                     <Grid
                        container
                        item
                        fullWidth={false}
                        spacing={2}
                        resizable
                        alignItems={'center'}
                        style={{minWidth: 300}}
                     >
                        <TextFieldLF
                           key={'actualOperatingLoanBalance' + entityId}
                           className={classes.buttonStyle}
                           isFormattedNumber={true}
                           style={{width: 250}}
                           name={'actualOperatingLoanBalance'}
                           labelKey={'cashFlow.actualBeginBalance.label'}
                           onChange={handleCashFlowChange}
                           value={getCashFlowValue('actualOperatingLoanBalance')}
                           disabled={getValue('isLocked')}
                           inputProps={{prefix: '$'}}
                           fullWidth={false}
                           onFocus={handleFocusEdit}
                           onBlur={handleSubmitDebounced.flush}
                           placeholder={'$100,000'}
                           InputProps={{
                              endAdornment: (
                                 <InputAdornment position='end' className={classes.inputAdornmentStyle}>
                                    <InfoVideoPopup labelKey={'cashFlow.actualLOC.help'} videoId={'kvooi0oe1v'} />
                                 </InputAdornment>
                              ),
                           }}
                        />
                        <TextFieldLF
                           key={'operatingLoanLimit' + entityId}
                           className={classes.buttonStyle}
                           style={{width: 230}}
                           isFormattedNumber={true}
                           name={'operatingLoanLimit'}
                           labelKey={'cashFlow.operatingLimit.label'}
                           onChange={handleCashFlowChange}
                           value={getCashFlowValue('operatingLoanLimit')}
                           disabled={getValue('isLocked')}
                           inputProps={{prefix: '$'}}
                           fullWidth={false}
                           onFocus={handleFocusEdit}
                           onBlur={handleSubmitDebounced.flush}
                           placeholder={'$100,000'}
                        />

                        <TextFieldLF
                           key={'targetIncome' + entityId}
                           className={classes.buttonStyle}
                           style={{width: 230}}
                           isFormattedNumber={true}
                           name={'targetIncome'}
                           labelKey={'cashFlow.targetIncome.label'}
                           onChange={handleCashFlowChange}
                           value={getCashFlowValue('targetIncome')}
                           disabled={getValue('isLocked')}
                           inputProps={{prefix: '$'}}
                           fullWidth={false}
                           onFocus={handleFocusEdit}
                           onBlur={handleSubmitDebounced.flush}
                           placeholder={'$100,000'}
                        />
                        <TextFieldLF
                           key={'carryoverIncome' + entityId}
                           className={classes.buttonStyle}
                           style={{width: 230}}
                           isFormattedNumber={true}
                           name={'carryoverIncome'}
                           labelKey={'cashFlow.carryOverIncome.label'}
                           onChange={handleCashFlowChange}
                           value={getCashFlowValue('carryoverIncome')}
                           disabled={getValue('isLocked')}
                           inputProps={{prefix: '$'}}
                           fullWidth={false}
                           onFocus={handleFocusEdit}
                           onBlur={handleSubmitDebounced.flush}
                           placeholder={'$100,000'}
                        />
                     </Grid>
                     <Grid
                        container
                        item
                        fullWidth={false}
                        alignItems={'center'}
                        resizable={false}
                        style={{position: 'relative'}}
                     >
                        <ButtonLF
                           className={classes.buttonStyle}
                           startIcon={<Edit />}
                           labelKey={'edit.label'}
                           onClick={handleEditCell}
                           disabled={getValue('isLocked') || !selectedLocation?.cell?.row?.original.entityId}
                        />
                        <ConfirmButton
                           className={`${classes.deleteButtonStyle} ${classes.dialogRoot}`}
                           onConfirm={handleDeleteCategory}
                           messageKey={'cashFlow.confirmRemoveValue.message'}
                           onUndo={handleUnDeleteCategory}
                           undoId={selectedLocation?.cell?.row?.original?.typeId}
                           values={{
                              type: 'category',
                              name: isCategoryCellSelected()
                                 ? selectedLocation?.isExpense
                                    ? expenseCashFlowData?.[cellSelected?.rowIndex]?.typeName || 'Untitled Category'
                                    : incomeCashFlowData?.[cellSelected?.rowIndex || 0]?.typeName || 'Untitled Category'
                                 : undefined,
                           }}
                           color='primary'
                           size='large'
                           submitStyle={classes.deleteColorStyle}
                           startIcon={<Delete />}
                           buttonTypographyProps={{variant: 'inherit'}}
                           disabled={!isCategoryCellSelected() || getValue('isLocked')}
                        />
                        <ButtonLF
                           className={classes.buttonStyle}
                           startIcon={<Notes />}
                           disabled={isCategoryCellSelected() || !selectedCellHasValue() || getValue('isLocked')}
                           labelKey={selectedCellHasNote() ? 'cashFlow.editNote.label' : 'cashFlow.addNote.label'}
                           onClick={handleAddNote}
                        />
                        <Grid>{buttonPanel}</Grid>
                     </Grid>
                  </Grid>
               )}
               <Grid
                  name={'income and expense tables'}
                  item
                  container
                  resizable
                  fullWidth
                  fullHeight
                  direction={'column'}
               >
                  <Grid name={'padding frame'} item fullWidth>
                     <Grid
                        name={'income and expense tables inner'}
                        item
                        container
                        direction={'column'}
                        isScrollable
                        isAddScrollPadding={false}
                        innerStyle={{...scaleStyle, width: `${100 / scale}%`}}
                     >
                        <div className={`${classes.lockStyle} ${getValue('isLocked') ? 'disabled' : undefined}`}>
                           {columns.length > 0 && (
                              <Grid
                                 name={'Income table with header'}
                                 item
                                 resizable={false}
                                 overflow={'unset'}
                                 className={classes.borderFrame}
                              >
                                 {IncomeTable}
                              </Grid>
                           )}
                           {expenseColumns.length > 0 && (
                              <Grid
                                 name={'Expense table'}
                                 item
                                 resizable={false}
                                 overflow={'unset'}
                                 className={classes.borderFrame}
                              >
                                 {ExpenseTable}
                              </Grid>
                           )}
                        </div>
                     </Grid>
                  </Grid>
               </Grid>
            </Grid>
         </Form>
      </Grid>
   );
}
