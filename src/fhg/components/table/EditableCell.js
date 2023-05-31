// Create an editable cell renderer
import makeStyles from '@material-ui/core/styles/makeStyles';
import {useCallback} from 'react';
import {useLayoutEffect} from 'react';
import React from 'react';
import {useRecoilState} from 'recoil';
import TextFieldFHG from '../../../components/TextField';
import {selectedCellState} from './TableFHG';
import {editCellState} from './TableFHG';

const useEditableStyles = makeStyles(
   {
      root: {
         '& input': {
            padding: 4,
         },
      },
   },
   {name: 'EditableCellStyles'}
);

export const EditableCell = ({cell, row, onChange, defaultValue}) => {
   const classes = useEditableStyles();
   // // We need to keep and update the state of the cell normally
   const [value, setValue] = React.useState(cell?.value || defaultValue || '');
   const [isChanged, setIsChanged] = React.useState(false);
   const [showEdit, setShowEdit] = useRecoilState(editCellState);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);

   const id = 'EditCell' + cell?.getCellProps().key;

   useLayoutEffect(() => {
      if (showEdit) {
         const dom = document.getElementById(id);

         if (dom) {
            dom.select();
         }
      }
   }, [showEdit, id]);

   const handleChange = useCallback(
      (e) => {
         setIsChanged(true);
         setValue(e.target.value);
      },
      [setValue]
   );

   /**
    * Update the external data when the input is blurred.
    */
   const onBlur = useCallback(() => {
      onChange?.(value);
      setShowEdit(false);
      setIsChanged(false);
   }, [setShowEdit, onChange, value]);

   const handleEditingKeyClick = useCallback(
      (event) => {
         const offset = event.shiftKey ? -1 : 1;

         if (event.key === 'Escape') {
            event.preventDefault();
            event?.stopPropagation();
            setValue(cell.value);
            setShowEdit(false);
         } else if (event.key === 'Enter') {
            event?.preventDefault();
            event?.stopPropagation();
            onBlur();
            if (cellSelected?.rowIndex >= 0) {
               setCellSelected((cellSelected) => ({...cellSelected, rowIndex: cellSelected?.rowIndex + offset}));
            }
         } else if (event.key === 'Tab') {
            event?.preventDefault();
            event?.stopPropagation();
            onBlur();
            if (cellSelected?.columnIndex) {
               const columnIndex = cellSelected.columnIndex + offset;
               setCellSelected((cellSelected) => ({...cellSelected, columnIndex}));
            }
         }
      },
      [cell.value, cellSelected?.columnIndex, cellSelected?.rowIndex, onBlur, setCellSelected, setShowEdit]
   );

   const handleFocus = (event) => {
      if (event?.target && !isChanged && !value) {
         event.target.focus();
         event.target.select();

         if (event.target?.scrollIntoViewIfNeeded) {
            event.target.scrollIntoViewIfNeeded(true);
         } else {
            event.target?.scrollIntoView(true);
         }
      }
   };

   const format = cell?.column?.format;
   const prefix = cell?.column?.prefix;
   const isFormattedNumber = cell?.column?.isFormattedNumber || prefix || format;
   let inputProps;

   if (isFormattedNumber) {
      inputProps = {
         prefix,
         'data-index': row?.index,
         'data-type': 'number',
         pattern: '^[0-9,]+$',
         title: 'Enter a valid number.',
         allowNegative: cell?.column?.allowNegative ?? true,
      };
   }

   return (
      <TextFieldFHG
         id={id}
         className={classes.root}
         isFormattedNumber={isFormattedNumber}
         inputProps={inputProps ? inputProps : undefined}
         value={value}
         onChange={handleChange}
         onFocusCapture={handleFocus}
         onBlurCapture={onBlur}
         autoFocus
         margin={'none'}
         size={'small'}
         onKeyDown={handleEditingKeyClick}
      />
   );
};
