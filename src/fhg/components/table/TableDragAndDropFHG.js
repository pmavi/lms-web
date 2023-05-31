import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import findIndex from 'lodash/findIndex';
import {Fragment} from 'react';
import {useCallback} from 'react';
import {useMemo} from 'react';
import React, {useState, useEffect, useRef} from 'react';
import {useGlobalFilter, useSortBy, useTable} from 'react-table';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import DragCell from './DragCell';
import TableSearchToolbar from './TableSearchToolbar';

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         // backgroundColor: `rgba(223,235,209,0.41) !important`,
         backgroundColor: `#F0F6E9 !important`,
         whiteSpace: 'nowrap',
         padding: '2px 8px',
         fontSize: 16,
         cursor: 'pointer',
         textAlign: 'center',
      },
      rowStyle: {
         '& tr:nth-of-type(odd):not(.Mui-selected)': {
            backgroundColor: '#fafafa',
         },
         '& tr:nth-of-type(even):not(.Mui-selected)': {
            backgroundColor: 'white',
         },
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 18,
         '&.editable': {
            color: 'black',
         },
         '&:hover.editable': {
            backgroundColor: '#f0f6e9',
            cursor: 'pointer',
         },
         '&:hover:not(.editable)': {
            backgroundColor: '#f0f0f0',
            cursor: 'default',
         },
      },
      cellFooterStyle: {
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 18,
         borderRight: '2px solid rgba(0, 0, 0, 0.12)',
      },
      selected: {
         backgroundColor: `${theme.palette.action.selected} !important`,
      },
      stickyExternal: {
         overflow: 'unset',
         backgroundColor: 'inherit',
      },
      stickyFrame: {
         overflow: 'unset',
         '& table': {
            '& thead > tr': {
               position: 'sticky',
               left: 0,
               top: 0,
            },
            '& tbody > tr, tfoot > tr': {
               position: 'sticky',
               left: 0,
            },
            '& tfoot > tr > td': {
               backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
            },
            '& th:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
            },
         },
      },
   }),
   {name: 'TableFHGStyles'}
);

/**
 * The table component that handles dragging and dropping.
 *
 * Reviewed:
 *
 * @param titleKey The message key for the title.
 * @param columns The columns for the table.
 * @param data The data for the table.
 * @param updateMyData  Callback when a cell is edited.
 * @param skipPageReset Indicates that the page reset should be skipped.
 * @param onSelect Callback when an item is selected.
 * @param selectId The current selection item ID.
 * @param searchFilter The current search filter for external search.
 * @param stickyHeader
 * @param children
 * @return {*}
 * @constructor
 */
export default function TableDragAndDropFHG({
   titleKey,
   title,
   columns,
   data = [{}],
   updateMyData,
   skipPageReset,
   onSelect,
   selectId,
   searchFilter,
   allowSearch,
   classes: classesProp,
   onDoubleClick,
   globalFilter: globalFilterParam,
   emptyTableMessageKey,
   isLoading,
   onContextMenu,
   onKeyDown,
   refreshTime,
   children,
}) {
   // Use the state and functions returned from useTable to build your UI
   const {
      getTableProps,
      headerGroups,
      prepareRow,
      rows,
      preGlobalFilteredRows,
      setGlobalFilter,
      state: {globalFilter},
   } = useTable(
      {
         columns,
         data,
         globalFilter: globalFilterParam,
         autoResetPage: !skipPageReset,
         // updateMyData isn't part of the API, but
         // anything we put into these options will
         // automatically be available on the instance.
         // That way we can call this function from our
         // cell renderer!
         updateMyData,
      },
      useGlobalFilter,
      useSortBy
   );
   const theme = useTheme();

   const [selectedIndex, setSelectedIndex] = useState(-1);

   const selectRef = useRef();
   const classes = {...useStyles(), ...(classesProp || {})};

   useEffect(() => {
      if (selectId && rows?.length > 0) {
         const index = findIndex(rows, (row) => row?.original?.key === selectId);

         if (index !== selectedIndex) {
            setSelectedIndex(index);
         }
      }
   }, [selectId, rows]);

   /**
    * Set the global filter from the search filter when the search filter changes.
    */
   useEffect(() => {
      if (searchFilter !== undefined) {
         setGlobalFilter(searchFilter);
      }
   }, [searchFilter, setGlobalFilter]);

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowClick = useCallback(
      (row) => (event) => {
         setSelectedIndex(row.index);
         onSelect && onSelect(row.original, row.index, event);
      },
      [onSelect]
   );

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowDoubleClick = useCallback(
      (row) => (event) => {
         onDoubleClick?.(row.original, row.index, event);
      },
      [onDoubleClick]
   );

   const toolbar = useMemo(() => {
      return (
         <TableSearchToolbar
            titleKey={titleKey}
            title={title}
            preGlobalFilteredRows={preGlobalFilteredRows}
            setGlobalFilter={setGlobalFilter}
            globalFilter={globalFilter}
         >
            {children}
         </TableSearchToolbar>
      );
   }, [children, globalFilter, preGlobalFilteredRows, setGlobalFilter, title, titleKey]);

   return (
      <Box
         name={'TableFHG Root Grid'}
         direction={'column'}
         height={'100%'}
         width={'100%'}
         wrap={'nowrap'}
         onKeyDown={onKeyDown}
      >
         {allowSearch && toolbar}
         <TableContainer onKeyDown={onKeyDown}>
            <Table {...getTableProps()}>
               <TableHead>
                  {headerGroups.map((headerGroup) => (
                     <TableRow {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, index) => (
                           <Fragment key={'hg ' + index}>
                              {column.show !== false && (
                                 <TableCell
                                    {...(column.id === 'selection'
                                       ? column.getHeaderProps({className: classes.headerStyle})
                                       : column.getHeaderProps(
                                            column.getSortByToggleProps({className: classes.headerStyle})
                                         ))}
                                    style={{
                                       fontWeight: !column.depth ? 600 : 400,
                                       borderRight: `1px solid ${theme.palette.divider}`,
                                    }}
                                 >
                                    {column.render('Header')}
                                    {column.id !== 'selection' ? (
                                       <TableSortLabel
                                          active={column.isSorted}
                                          // react-table has an unsorted state which is not treated here
                                          direction={column.isSortedDesc ? 'desc' : 'asc'}
                                       />
                                    ) : null}
                                 </TableCell>
                              )}
                           </Fragment>
                        ))}
                     </TableRow>
                  ))}
               </TableHead>
               <TableBody className={classes.rowStyle}>
                  {rows.map((row, i) => {
                     prepareRow(row);
                     const rowProps = row.getRowProps();
                     const rowId = rowProps.key + row?.original?.key + refreshTime;
                     return (
                        <TableRow
                           {...rowProps}
                           key={rowId}
                           id={rowId}
                           onClick={handleRowClick(row)}
                           onDoubleClick={onDoubleClick ? handleRowDoubleClick(row) : undefined}
                           onContextMenu={(event) => onContextMenu?.(event, row)}
                           selected={i === selectedIndex}
                           ref={i === selectedIndex ? selectRef : undefined}
                        >
                           {row.cells.map((cell) => {
                              if (cell?.column?.show !== false) {
                                 if (cell?.column?.isDraggable) {
                                    const cellProps = cell.getCellProps();

                                    return (
                                       <DragCell
                                          cell={cell}
                                          row={row}
                                          {...cellProps}
                                          key={rowId + cellProps.key}
                                          id={rowId + cellProps.key}
                                       />
                                    );
                                 } else {
                                    return (
                                       <TableCell
                                          {...cell.getCellProps()}
                                          style={{whiteSpace: 'nowrap', padding: '6px 16px', fontSize: 18}}
                                       >
                                          {cell.render('Cell')}
                                       </TableCell>
                                    );
                                 }
                              }
                           })}
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
            {rows?.length <= 0 && !isLoading && emptyTableMessageKey && (
               <Grid container justify={'center'} style={{margin: theme.spacing(2)}}>
                  <TypographyFHG
                     variant='body2'
                     id={emptyTableMessageKey}
                     color={'textPrimary'}
                     style={{marginLeft: 'auto', marginRight: 'auto'}}
                  />
               </Grid>
            )}
         </TableContainer>
      </Box>
   );
}
