import TableCell from '@material-ui/core/TableCell';
import {useRef} from 'react';
import React from 'react';
import {useDrop} from 'react-dnd';
import {useDrag} from 'react-dnd';
import {useSetRecoilState} from 'recoil';
import {atom} from 'recoil';
import {FOLDER_TYPE} from '../../../components/EntityFiles';
import {FILE_TYPE} from '../../../components/EntityFiles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {DIRECTORY_FILE_NAME} from '../../../Constants';

/**
 * Drag Cell State to contain the results of a drag and drop. item is the drag item (file or folder) and folder is the
 * folder it was dropped on.
 */
export const dragCellResults = atom({
   key: 'dragCellResults',
   default: {item: undefined, folder: undefined},
});

const useStyles = makeStyles(
   (theme) => ({
      borderStyle: {
         backgroundColor: '#F0F5EA',
         position: 'relative',
         '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            border: `1px solid ${theme.palette.primary.main}`,
         },
      },
   }),
   {name: 'DragCellStyles'}
);

/**
 * Drag and drop table cell component. The results of the dragCell are set in dragCellResults.
 *
 * Recoil State:
 *    dragCellResults - {item: [file or folder dropped], folder: [folder (or folder file) dropped on]}
 *
 * @param cell Table cell that can be dragged and dropped.
 * @param children The children components.
 * @param row The row of the cell to find the original item.
 * @param props The props from the react-table for the cell.
 * @returns {JSX.Element} The resulting component.
 * @constructor
 */
export default function DragCell({cell, children, row, ...props}) {
   const classes = useStyles();
   const myRef = useRef();

   const setMove = useSetRecoilState(dragCellResults);

   const [{canDrop, isOver}, drop] = useDrop(() => ({
      accept: [FILE_TYPE, FOLDER_TYPE],
      canDrop: (item) => {
         // Can drop on a folder or the '...' file indicating the parent directory.
         return (
            (row?.original?.type === FOLDER_TYPE || row?.original?.name === DIRECTORY_FILE_NAME) &&
            row?.original?.key !== item?.key
         );
      },
      drop: () => row?.original,
      collect: (monitor) => ({
         isOver: monitor.isOver(),
         canDrop: monitor.canDrop(),
      }),
   }));
   const isActive = canDrop && isOver;

   const [{isDragging}, drag] = useDrag(() => ({
      type: row?.original?.type,
      item: row?.original,
      // Can drag a file or a folder.
      canDrag: () =>
         (row?.original?.type === FILE_TYPE || row?.original?.type === FOLDER_TYPE) &&
         row?.original?.name !== DIRECTORY_FILE_NAME &&
         !row?.original?.isTemplatefolder,
      // On drop, set the dragCellResults with the item dropped and the folder (or folder file) the item was dropped on.
      end: (item, monitor) => {
         const dropResult = monitor.getDropResult();
         if (item && dropResult) {
            setMove({item, folder: dropResult});
         }
      },
      collect: (monitor) => ({
         isDragging: monitor.isDragging(),
      }),
   }));

   const opacity = isDragging ? 0.4 : 1;

   // Combine all the refs so only one is needed for both drag and drop targets.
   drag(drop(myRef));

   return (
      <TableCell
         ref={myRef}
         className={isActive ? classes.borderStyle : undefined}
         style={{
            whiteSpace: 'nowrap',
            padding: '6px 16px',
            fontSize: 18,
            opacity,
         }}
         {...props}
      >
         {cell.render('Cell')}
      </TableCell>
   );
}
