import numberFormatter from 'number-formatter';
import {useState} from 'react';
import React from 'react';
import {useCallback} from 'react';
import {useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {useEffect} from 'react';
import {toNumberIfString} from '../../utils/Utils';
import {EditableCell} from './EditableCell';
import {selectedCellState} from './TableFHG';
import {editCellState} from './TableFHG';

export default function StaticCell(data) {
   const {cell, row, column, color, defaultValue, updateMyData, tableName, isEditOnSingleClick} = data;
   const prefix = cell?.column?.prefix;
   const format = cell?.column?.format;
   const isEditable =
      typeof cell?.column?.isEditable === 'function' ? cell.column.isEditable(cell) : cell.column.isEditable;
   const isFormattedNumber = cell?.column?.isFormattedNumber || prefix || format;
   const [value, setValue] = useState(cell?.value || defaultValue);
   const [showEdit, setShowEdit] = useRecoilState(editCellState);
   const cellSelected = useRecoilValue(selectedCellState);
   const isSelected =
      cellSelected?.tableName === tableName &&
      cellSelected?.rowIndex === row?.index &&
      cellSelected?.columnIndex === column?.___index;

   const isUseEditCell = updateMyData && isEditable && showEdit && isSelected;

   useEffect(() => {
      setValue(cell?.value || defaultValue);
   }, [cell?.value, defaultValue]);

   const handleEdit = useCallback(() => {
      setShowEdit(isEditable);
   }, [isEditable, setShowEdit]);

   const handleChange = (value) => {
      setValue(toNumberIfString(value));
      updateMyData(row?.index, column?.id, value, row.original, cell);
   };

   if (isUseEditCell) {
      return (
         <EditableCell
            key={`EditableCell' ${tableName} ${row?.index} ${column?.___index}`}
            cell={cell}
            row={row}
            column={column}
            defaultValue={defaultValue === 'Add a category' ? '' : defaultValue}
            onChange={handleChange}
         />
      );
   }

   return (
      <div
         key={`StaticCell' ${tableName} ${row?.index} ${column?.___index}`}
         onDoubleClick={(isEditable === true && !isEditOnSingleClick && handleEdit) || undefined}
         onClick={(isEditable === true && isEditOnSingleClick && handleEdit) || undefined}
         style={{color, minHeight: 18}}
      >
         {isFormattedNumber ? numberFormatter(prefix + format, value) : value}
      </div>
   );
}

// StaticCell.propTypes = {
//    cellProps: PropTypes.any,
//    color: PropTypes.any,
//    prefix: PropTypes.any,
//    format: PropTypes.any,
//    value: PropTypes.any,
//    defaultValue: PropTypes.any
// };
