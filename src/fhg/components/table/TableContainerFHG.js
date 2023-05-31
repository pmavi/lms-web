import {ClickAwayListener} from '@material-ui/core';
import {withStyles} from '@material-ui/core';
import {Tooltip} from '@material-ui/core';
import {TableFooter} from '@material-ui/core';
import {Popover} from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {Notes} from '@material-ui/icons';
import findIndex from 'lodash/findIndex';
import * as PropTypes from 'prop-types';
import React, {useState, useRef, Fragment, useCallback} from 'react';
import {useRecoilValue} from 'recoil';
import {atom} from 'recoil';
import {useRecoilState} from 'recoil';
import ButtonLF from '../../../components/ButtonLF';
import TextFieldLF from '../../../components/TextFieldLF';
import {useEffect} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {resultOf} from '../../utils/Utils';
import Form from '../edit/Form';
import useEditData from '../edit/useEditData';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import {selectedCellState} from './TableFHG';

const LightTooltip = withStyles((theme) => ({
   tooltip: {
      backgroundColor: '#fcf6de',
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 14,
   },
}))(Tooltip);

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
         '& tr:nth-of-type(odd)': {
            backgroundColor: '#fafafa',
         },
         '& tr:nth-of-type(even)': {
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
      buttonStyle: {
         padding: theme.spacing(0.5),
      },
   }),
   {name: 'TableContainerFHGStyles'}
);

const useNoteStyles = makeStyles(
   (theme) => ({
      paper: {
         padding: theme.spacing(1),
         backgroundColor: '#fcf6de',
         zIndex: `${theme.zIndex.drawer} !important`,
         maxWidth: 400,
      },
      editPaper: {
         padding: theme.spacing(1),
         backgroundColor: '#fcf6de',
         zIndex: `${theme.zIndex.drawer} !important`,
         width: 260,
      },
      popover: {
         pointerEvents: 'none',
      },
      noteIconStyle: {
         position: 'absolute',
         right: -4,
         top: -4,
         backgroundColor: 'rgba(244,215,110,0.5)',
         fontSize: 16,
         zIndex: theme.zIndex.drawer,
      },
      root: {
         zIndex: `${theme.zIndex.drawer + 2} !important`,
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'visible',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
   }),
   {name: 'NotesStyles'}
);

export const noteEditStatus = atom({
   key: 'noteEditStatus',
   default: false,
});

function NoteCell({onChange, notes, selected, cellKey, anchorRef}) {
   const classes = useNoteStyles();
   const [open, setOpen] = useState();
   const [noteClicked, setNoteClicked] = useState(false);
   const [isEditNote, setIsEditNote] = useRecoilState(noteEditStatus);

   const [, /*editValues*/ handleChange, {getValue, setDefaultValues}] = useEditData(notes);

   useEffect(() => {
      setDefaultValues({notes});
   }, [notes, setDefaultValues]);

   const handleClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setIsEditNote(false);
      handlePopoverClose(event, undefined, false);
   };

   const handleSave = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      onChange?.(getValue('notes'));
   };

   const handlePopoverClose = (event, reason, isEditNoteParam = isEditNote) => {
      if (!isEditNoteParam) {
         setOpen(undefined);
         setNoteClicked(false);
         setIsEditNote(false);
      }
   };

   const handleNotesClick = (cellKey) => () => {
      if (!isEditNote) {
         setOpen(cellKey);
         setNoteClicked(true);
      }
   };

   const handleHoverClose = () => {
      if (noteClicked && !isEditNote) {
         setOpen(undefined);
         setNoteClicked(false);
      }
   };

   const handleHoverClose1 = () => {
      if (noteClicked && !isEditNote) {
         setNoteClicked(false);
         setOpen(undefined);
      }
   };

   const handleKeydown = (event) => {
      if (event?.key === 'Escape') {
         handleClose(event);
      }
   };

   /**
    * Open the note edit. Only open if listening for the onChange.
    */
   const handleOpenEdit = () => {
      if (onChange) {
         setIsEditNote(true);
      }
   };

   const handleDelete = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      onChange?.(null);
   };

   return (
      <div style={{width: '100%', position: 'relative', height: 1}}>
         {notes && (
            <ClickAwayListener onClickAway={handleHoverClose1} disableReactTree={true}>
               <LightTooltip
                  onClose={handleHoverClose}
                  open={open === cellKey && !isEditNote}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  title={open === cellKey && !isEditNote && getValue('notes')}
               >
                  <LightTooltip title={!isEditNote && !open && getValue('notes')}>
                     <Notes
                        onClick={handleNotesClick(cellKey)}
                        className={classes.noteIconStyle}
                        onDoubleClick={handleOpenEdit}
                     />
                  </LightTooltip>
               </LightTooltip>
            </ClickAwayListener>
         )}
         {selected && isEditNote && (
            <Popover
               // className={!noteClicked ? classes.popover : undefined}
               classes={{paper: classes.editPaper, root: classes.root}}
               open={selected && isEditNote}
               anchorEl={selected && isEditNote && anchorRef.current}
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
               transformOrigin={{vertical: 'top', horizontal: 'left'}}
               onClose={handlePopoverClose}
               disableRestoreFocus
               hideBackdrop
            >
               {isEditNote && onChange ? (
                  <Grid container>
                     <Form onSubmit={handleSave} className={classes.formStyle}>
                        <TextFieldLF
                           name={'notes'}
                           autoFocus
                           onChange={handleChange}
                           onKeyDown={handleKeydown}
                           value={getValue('notes')}
                           maxRows={4}
                           minRows={1}
                           multiline
                        />
                        <Grid container justify={'space-between'}>
                           <Grid item>
                              <ButtonLF
                                 labelKey={'save.label'}
                                 onClickCapture={handleSave}
                                 onClick={handleSave}
                                 onMouseDown={handleSave}
                                 type={'submit'}
                                 className={classes.buttonStyle}
                              />
                              <ButtonLF
                                 labelKey={'cancel.button'}
                                 onClickCapture={handleClose}
                                 onClick={handleClose}
                                 onMouseDown={handleClose}
                                 className={classes.buttonStyle}
                              />
                           </Grid>
                           <Grid item>
                              <ButtonLF
                                 labelKey={'delete.button'}
                                 onClickCapture={handleDelete}
                                 onClick={handleDelete}
                                 onMouseDown={handleDelete}
                                 disabled={!getValue('notes')}
                                 className={classes.buttonStyle}
                              />
                           </Grid>
                        </Grid>
                     </Form>
                  </Grid>
               ) : (
                  getValue('notes')
               )}
            </Popover>
         )}
      </div>
   );
}

NoteCell.propTypes = {
   cellKey: PropTypes.any,
   selected: PropTypes.bool,
   editNote: PropTypes.bool,
   notes: PropTypes.any,
};

/**
 * The table component that handles searching (filtering) and selection.
 *
 * Reviewed:
 *
 * @param titleKey The message key for the title.
 * @param onSelect Callback when an item is selected.
 * @param stickyHeader Indicates if the header of the table is sticky.
 * @return {*}
 * @constructor
 */
export default function TableContainerFHG({
   name,
   rows,
   prepareRow,
   headerGroups,
   footerGroups,
   getTableProps,
   onSelect,
   selectId,
   allowCellSelection = false,
   stickyHeader = true,
   stickyLeftColumn = false,
   classes: classesProp,
   emptyTableMessageKey,
   hasFooter,
   hasShadow,
   onChangeNotes,
   onScroll,
   getCellProps,
   onDoubleClick,
   onContextMenu,
   stickyExternal,
}) {
   const theme = useTheme();
   const classes = {...useStyles(), ...(classesProp || {})};
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const isEditNote = useRecoilValue(noteEditStatus);

   const selectRef = useRef();
   const selectCellRef = useRef();

   useEffect(() => {
      if (selectId && rows?.length > 0) {
         const index = findIndex(rows, (row) => row?.original?.key === selectId);

         if (index !== selectedIndex) {
            setSelectedIndex(index);
         }
      }
   }, [selectId, rows]);

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowClick = useCallback(
      (row) => () => {
         if (!allowCellSelection && !isEditNote) {
            setSelectedIndex(row.index);
            onSelect && onSelect(row.original);
         }
      },
      [allowCellSelection, isEditNote, onSelect]
   );

   const handleSelectCell = React.useCallback(
      (cellKey, rowIndex, columnIndex, cell) => () => {
         if (allowCellSelection && !isEditNote) {
            setCellSelected({tableName: name, rowIndex, columnIndex});

            onSelect?.(undefined, cellKey, rowIndex, columnIndex, cell);
         }
      },
      [allowCellSelection, isEditNote, name, onSelect, setCellSelected]
   );

   return (
      <TableContainer
         name={name + 'Container'}
         className={stickyLeftColumn ? classes.stickyFrame : stickyExternal ? classes.stickyExternal : undefined}
         onScroll={onScroll}
         style={{
            minWidth: !hasShadow ? 'calc(100% + 1px)' : 'calc(100% - 3px)',
            width: 'max-content',
            boxShadow: hasShadow ? theme.shadows[2] : undefined,
            marginLeft: hasShadow ? 3 : undefined,
            marginRight: hasShadow ? 3 : undefined,
            marginBottom: hasShadow ? 3 : undefined,
            backgroundColor: theme.palette.background.paper,
         }}
      >
         <MaUTable
            {...getTableProps({style: {borderCollapse: !stickyHeader ? 'separate' : 'collapse'}})}
            stickyHeader={stickyHeader}
         >
            <TableHead classes={{root: classes.tableHeadRoot}}>
               {headerGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps({className: classes.tableHeadStyle})}>
                     {headerGroup.headers.map((column, index) => (
                        <TableCell
                           {...(column.id === 'selection'
                              ? column.getHeaderProps({className: classes.headerStyle})
                              : column.getHeaderProps(column.getSortByToggleProps({className: classes.headerStyle})))}
                           style={{
                              fontWeight: !column.depth ? 600 : 400,
                              borderRight:
                                 hasShadow && (!column.depth || index % 2 === 0)
                                    ? `2px solid ${theme.palette.divider}`
                                    : `1px solid ${theme.palette.divider}`,
                           }}
                        >
                           {column.render('Header')}
                           {/*<div>{column?.canFilter ? column?.render('Filter') : null}</div>*/}
                           {column.id !== 'selection' ? (
                              <TableSortLabel
                                 active={column.isSorted}
                                 // react-table has an unsorted state which is not treated here
                                 direction={column.isSortedDesc ? 'desc' : 'asc'}
                              />
                           ) : null}
                        </TableCell>
                     ))}
                  </TableRow>
               ))}
            </TableHead>
            <TableBody className={classes.rowStyle}>
               {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                     <TableRow
                        {...row.getRowProps()}
                        onClick={!isEditNote ? handleRowClick(row) : undefined}
                        hover={!allowCellSelection}
                        onDoubleClick={(event) => onDoubleClick?.(event, row)}
                        onContextMenu={(event) => onContextMenu?.(event, row)}
                        selected={!allowCellSelection && i === selectedIndex}
                        ref={i === selectedIndex ? selectRef : undefined}
                     >
                        {row.cells.map((cell, index) => {
                           const notes =
                              cell.column.field === 'actual'
                                 ? cell.row.original[cell.column?.parent?.id]?.noteActual
                                 : cell.row.original[cell.column?.parent?.id]?.noteExpected;
                           const cellProps = cell.getCellProps();
                           const isSelected =
                              cellSelected?.tableName === name &&
                              cellSelected?.rowIndex === i &&
                              cellSelected?.columnIndex === cell.column?.___index;
                           const isEditable = resultOf(cell.column.isEditable, cell);
                           return (
                              <TableCell
                                 {...cellProps}
                                 {...cell.column.tableCellProps}
                                 className={`${classes.cellStyle} ${isSelected ? classes.selected : ''} ${
                                    isEditable ? 'editable' : ''
                                 }`}
                                 ref={isSelected ? selectCellRef : undefined}
                                 style={{
                                    borderRight:
                                       hasShadow && (!cell.column.depth || index % 2 === 0)
                                          ? `2px solid ${theme.palette.divider}`
                                          : `1px solid ${theme.palette.divider}`,
                                    fontWeight: cell.column.bold ? 'bold' : undefined,
                                    minWidth: cell.column.minWidth || undefined,
                                    maxWidth: cell.column.maxWidth || undefined,
                                    width: cell.column.width || undefined,
                                    ...(cell.column.style || {}),
                                    ...getCellProps(cell),
                                 }}
                                 onClick={
                                    !isEditNote
                                       ? handleSelectCell(cellProps.key, i, cell.column?.___index, cell)
                                       : undefined
                                 }
                              >
                                 {(notes || isEditNote) && (
                                    <NoteCell
                                       key={'popover' + cellProps.key}
                                       cellKey={cellProps.key}
                                       selected={isSelected}
                                       anchorRef={selectCellRef}
                                       notes={notes}
                                       onChange={onChangeNotes}
                                    />
                                 )}
                                 {cell.render('Cell')}
                              </TableCell>
                           );
                        })}
                     </TableRow>
                  );
               })}
            </TableBody>

            {hasFooter && (
               <TableFooter>
                  {footerGroups?.map((group, groupIndex) => (
                     <Fragment key={'frag ' + groupIndex}>
                        <TableRow
                           {...group.getFooterGroupProps()}
                           key={'footer row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                        >
                           {group.headers.map((column, index) => {
                              if (column.Footer) {
                                 return (
                                    <TableCell
                                       {...column.getFooterProps()}
                                       {...resultOf(column.tableCellProps, undefined, {})}
                                       className={classes.cellFooterStyle}
                                       style={{
                                          fontWeight: column.bold ? 'bold' : undefined,
                                          borderRight:
                                             hasShadow && index % 2 === 0
                                                ? `2px solid ${theme.palette.divider}`
                                                : `1px solid ${theme.palette.divider}`,
                                       }}
                                    >
                                       {column.render('Footer')}
                                    </TableCell>
                                 );
                              } else {
                                 return null;
                              }
                           })}
                        </TableRow>
                        <TableRow
                           {...group.getFooterGroupProps()}
                           key={'footer2 row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                        >
                           {group.headers.map((column, columnIndex) => {
                              if (column.Footer2) {
                                 return (
                                    <TableCell
                                       {...column.getFooterProps()}
                                       {...resultOf(column.tableCellProps, undefined, {})}
                                       className={classes.cellFooterStyle}
                                       style={{
                                          fontWeight: column.bold ? 'bold' : undefined,
                                          borderRight:
                                             hasShadow && columnIndex % 2 === 0
                                                ? `2px solid ${theme.palette.divider}`
                                                : `1px solid ${theme.palette.divider}`,
                                       }}
                                    >
                                       {column.render('Footer2')}
                                    </TableCell>
                                 );
                              } else {
                                 return null;
                              }
                           })}
                        </TableRow>
                        <TableRow
                           {...group.getFooterGroupProps()}
                           key={'footer3 row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                        >
                           {group.headers.map((column, columnIndex) => {
                              if (column.Footer3) {
                                 return (
                                    <TableCell
                                       {...column.getFooterProps()}
                                       {...resultOf(column.tableCellProps, undefined, {})}
                                       className={classes.cellFooterStyle}
                                       style={{
                                          fontWeight: column.bold ? 'bold' : undefined,
                                          borderRight:
                                             hasShadow && columnIndex % 2 === 0
                                                ? `2px solid ${theme.palette.divider}`
                                                : `1px solid ${theme.palette.divider}`,
                                       }}
                                    >
                                       {column.render('Footer3')}
                                    </TableCell>
                                 );
                              } else {
                                 return null;
                              }
                           })}
                        </TableRow>
                     </Fragment>
                  ))}
               </TableFooter>
            )}
         </MaUTable>
         {rows?.length <= 0 && (
            <Grid container justify={'center'} style={{margin: theme.spacing(2)}}>
               <TypographyFHG id={emptyTableMessageKey} />
            </Grid>
         )}
      </TableContainer>
   );
}
