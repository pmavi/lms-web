import useTheme from '@material-ui/core/styles/useTheme';
import {findIndex} from 'lodash';
import {filter} from 'lodash';
import sumBy from 'lodash/sumBy';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import {useGlobalFilter, useSortBy, useTable} from 'react-table';
import {atom} from 'recoil';
import {CURRENCY_FORMAT} from '../../../Constants';
import {useEffect} from 'react';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import StaticCell from './StaticCell';
import TableContainerFHG from './TableContainerFHG';
import TableSearchToolbar from './TableSearchToolbar';
import makeStyles from '@material-ui/core/styles/makeStyles';

const EMPTY_DATA = [{}];

export const editCellState = atom({
   key: 'editCellState',
   default: false,
});

export const selectedCellState = atom({
   key: 'selectedCellState',
   default: undefined,
});

const columnHasFooter = (column) => {
   if (column.Footer) {
      return true;
   } else if (column.columns?.length > 0) {
      for (const columnItem of column.columns) {
         if (columnHasFooter(columnItem)) {
            return true;
         }
      }
      return false;
   } else {
      return false;
   }
};

const useStyles = makeStyles(
   {
      root: {},
      totalFooter: {
         display: 'flex',
         cursor: 'default',
      },
   },
   {name: 'TableFhgStyles'}
);

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
   minWidth: 30,
   width: 150,
   maxWidth: 400,
   Cell: StaticCell,
};

const defaultPropGetter = () => ({});

/**
 * The table component that handles searching (filtering) and selection.
 *
 * Reviewed: 4/14/20
 *
 * @param titleKey The message key for the title.
 * @param title The title text.
 * @param columns The columns for the table.
 * @param data The data for the table.
 * @param updateMyData  Callback when a cell is edited.
 * @param skipPageReset Indicates that the page reset should be skipped.
 * @param onSelect Callback when an item is selected.
 * @param selectId The current selection item ID.
 * @param allowCellSelection Indicates if cells can be selected.
 * @param searchFilter The current search filter for external search.
 * @param allowSearch Indicates if the search component should be shown.
 * @param stickyHeader Indicates if the header of the table is sticky.
 * @param stickyExternal Indicates if there is a sticky external component. Makes all the overflow unset.
 * @param stickyLeftColumn Indicates if the left column is sticky.
 * @param classesProp The classes to override the table classes.
 * @param emptyTableMessageKey Message Key for message displayed when the table is empty
 * @param hasShadow Indicates if the table has a shadow
 * @param totalPath Path in the row.values to the total value to display.
 * @param onChangeNotes Callback when the notes change.
 * @param name Name of the table.
 * @param isEditOnSingleClick Indicates if a single click edits or double click.
 * @param onScroll Callback when the TableContainer scrolls.
 * @param getCellProps Gets extra properties for the cells not specified in the column.
 * @param onDoubleClick Callback when the table row is double-clicked.
 * @param onContextMenu Callback when the table row has a content menu request.
 * @param children The children components. The children of the table displayed in the search bar.
 * @return {*}
 * @constructor
 */
export default function TableFHG({
   titleKey,
   title,
   columns,
   data,
   updateMyData,
   skipPageReset,
   onSelect,
   selectId,
   allowCellSelection = false,
   searchFilter,
   allowSearch,
   stickyHeader = true,
   stickyExternal = true,
   stickyLeftColumn = false,
   classes: classesProp,
   emptyTableMessageKey,
   hasShadow = true,
   totalPath,
   onChangeNotes,
   name,
   isEditOnSingleClick = false,
   onScroll,
   getCellProps = defaultPropGetter,
   onDoubleClick,
   onContextMenu,
   children,
}) {
   const classes = useStyles();
   const theme = useTheme();

   if (classesProp?.root) {
      classes.root = classesProp.root;
   }

   // Use the state and functions returned from useTable to build your UI
   const {
      getTableProps,
      headerGroups,
      footerGroups,
      prepareRow,
      rows,
      preGlobalFilteredRows,
      setGlobalFilter,
      setHiddenColumns,
      state: {globalFilter},
   } = useTable(
      {
         columns,
         data: data || EMPTY_DATA,
         defaultColumn: defaultColumn,
         autoResetPage: !skipPageReset,
         // updateMyData isn't part of the API, but
         // anything we put into these options will
         // automatically be available on the instance.
         // That way we can call this function from our
         // cell renderer!
         updateMyData,
         isEditOnSingleClick,
         tableName: name,
      },
      useGlobalFilter,
      useSortBy
   );

   const totalTable = useMemo(() => {
      return totalPath && rows
         ? sumBy(rows, (row) => {
              return row?.values?.[totalPath];
           })
         : 0;
   }, [rows, totalPath]);

   const hasFooter = useMemo(() => {
      return findIndex(columns, columnHasFooter) >= 0;
   }, [columns]);

   useEffect(() => {
      const hiddenColumns = filter(columns, (column) => column.show === false).map((column) => column.id);
      setHiddenColumns(hiddenColumns);
   }, [columns, setHiddenColumns]);

   /**
    * Set the global filter from the search filter when the search filter changes.
    */
   useEffect(() => {
      if (searchFilter !== undefined) {
         setGlobalFilter(searchFilter);
      }
   }, [searchFilter, setGlobalFilter]);

   return (
      <Grid
         name={'TableFHG Root Grid'}
         item
         container
         direction={'column'}
         fullWidth
         fullHeight
         wrap={'nowrap'}
         className={classes.root}
         overflow={stickyExternal ? 'unset' : 'hidden'}
      >
         {(allowSearch || title || titleKey || children) && (
            <TableSearchToolbar
               titleKey={titleKey}
               title={title}
               allowSearch={allowSearch}
               preGlobalFilteredRows={preGlobalFilteredRows}
               setGlobalFilter={setGlobalFilter}
               globalFilter={globalFilter}
            >
               {children}
            </TableSearchToolbar>
         )}
         <TableContainerFHG
            name={name}
            headerGroups={headerGroups}
            footerGroups={footerGroups}
            prepareRow={prepareRow}
            getTableProps={getTableProps}
            rows={rows}
            onSelect={onSelect}
            selectId={selectId}
            allowCellSelection={allowCellSelection}
            stickyHeader={stickyHeader}
            classes={classesProp}
            emptyTableMessageKey={emptyTableMessageKey}
            hasFooter={hasFooter}
            hasShadow={hasShadow}
            onChangeNotes={onChangeNotes}
            getCellProps={getCellProps}
            stickyLeftColumn={stickyLeftColumn}
            onScroll={onScroll}
            stickyExternal={stickyExternal}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
         />
         {totalPath && (
            <Grid
               item
               container
               resizable={false}
               className={classes.totalFooter}
               justify={'flex-end'}
               overflow={'unset'}
               style={!hasShadow ? {borderRight: `1px solid ${theme.palette.divider}`} : undefined}
            >
               <Grid item style={{position: 'sticky', right: 0}}>
                  <TypographyFHG
                     variant={'subtitle1'}
                     color={'textSecondary'}
                     style={{
                        textAlign: 'right',
                        paddingTop: 8,
                        paddingRight: 16,
                        fontSize: 18,
                        fontWeight: 'bold',
                        height: 36,
                     }}
                  >
                     Total {numberFormatter(CURRENCY_FORMAT, totalTable)}
                  </TypographyFHG>
               </Grid>
            </Grid>
         )}
      </Grid>
   );
}
