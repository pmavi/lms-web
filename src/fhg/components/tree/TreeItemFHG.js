import {Menu} from '@material-ui/core';
import {Divider} from '@material-ui/core';
import {CardHeader} from '@material-ui/core';
import {CardActions} from '@material-ui/core';
import {CardContent} from '@material-ui/core';
import {Card} from '@material-ui/core';
import {styled} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {AddCircle} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import {MoreVert} from '@material-ui/icons';
import {Edit} from '@material-ui/icons';
import {ExpandMore as ExpandMoreIcon} from '@material-ui/icons';
import {indexOf} from 'lodash';
import findIndex from 'lodash/findIndex';
import {useCallback} from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import {useLayoutEffect} from 'react';
import {useRef} from 'react';
import React from 'react';
import {atom} from 'recoil';
import {PASSIVE_ROOT_ID} from '../../../Constants';
import {ACTIVE_ROOT_ID} from '../../../Constants';
import {PRIMARY_COLOR} from '../../../Constants';
import {removeOne} from '../../utils/Utils';
import ConfirmMenuItem from '../ConfirmMenuItem';
import Grid from '../Grid';
import Collapse from '../transitions/Collapse';
import TreeGroupFHG from './TreeGroupFHG';
import {useDrag} from 'react-dnd';
import {useDrop} from 'react-dnd';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import update from 'immutability-helper';

const COLLAPSE_TIMEOUT = 500;
const SCROLL_TIMEOUT = 300;

export const moveState = atom({
   key: 'moveState',
   default: [],
});

export const ExpandMore = styled((props) => {
   const {expand, ...other} = props;
   return <IconButton {...other} />;
})(({theme, expand}) => ({
   transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
   marginLeft: 'auto',
   color: expand ? theme.palette.primary.light : undefined,
   transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
   }),
}));

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 320,
         height: 310,
         display: 'flex',
         flexDirection: 'column',
         marginLeft: 'auto',
         marginRight: 'auto',
         marginBottom: 'auto,',
         overflow: 'hidden',
      },
      contentRoot: {
         // flex: '1 1 100%',
         paddingTop: 0,
         paddingBottom: theme.spacing(0.5),
         flex: '1 1 auto',
         height: '100%',
         overflow: 'auto',
         borderBottom: `1px solid ${theme.palette.divider}`,
      },
      titleStyle: {
         fontWeight: 500,
         fontSize: 16,
         color: 'rgba(0, 0, 0, 0.87)',
      },
      listItemStyle: {
         color: 'rgba(0, 0, 0, 0.87)',
         fontSize: 14,
      },
      buttonStyle: {
         '&:hover': {
            color: `#91B867`,
         },
      },
      moveStyle: {
         marginLeft: theme.spacing(1),
         marginRight: theme.spacing(1),
      },
      maskStyle: {
         filter: 'invert(43%) sepia(12%) saturate(0%) hue-rotate(223deg) brightness(95%) contrast(103%)',
         // filter: 'invert(43%) sepia(18%) saturate(0%) hue-rotate(284deg) brightness(96%) contrast(81%)',
         '&:hover': {
            filter: 'invert(63%) sepia(39%) saturate(454%) hue-rotate(46deg) brightness(94%) contrast(86%)',
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      moveTypeStyle: {
         transition: 'transform 800ms ease-in-out  100ms',
         willChange: 'transform',
         userSelect: 'none',
      },
   }),
   {name: 'TreeCardViewStyles'}
);
export const ITEM_DRAG_TYPE = 'item';

// noinspection JSUnusedLocalSymbols
const TreeItemFHG = React.forwardRef(function TreeItemFHG(
   {
      ContentComponent,
      defaultExpanded,
      expandAll,
      height,
      width,
      childCount,
      onMoveX,
      index,
      onMove,
      onAdd,
      onEdit,
      onDelete,
      item,
      itemsKey = 'items',
      parentKey,
      labelKey,
      parent,
      onHoverX,
      onUpdateMoveX,
   },
   ref
) {
   const classes = useStyles();
   const groupRef = useRef();
   const itemRef = useRef();
   const myRef = useRef();

   const [isMoveHorizontal, setIsMoveHorizontal] = useState(false);

   //Need duplicate tracking to access changes inside the drag and drop callbacks. Can't use useCallback because they don't update properly.
   const refChild = useRef({
      childItems: [],
      isMoveHorizontal: false,
   });
   const [childItems, setChildItems] = useState();

   useEffect(() => {
      const array = item?.[itemsKey] || [];

      if (array.length > 0) {
         for (let i = 0; i < array.length; i++) {
            if (array[i].order !== i) {
               array[i].order = i;
            }
         }
      }
      refChild.current.childItems = array;
      setChildItems(array);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [item?.[itemsKey]]);

   const handleUpdateMoveX = useCallback(
      (dragItem, monitor) => {
         if (!!onMoveX) {
            if (monitor?.didDrop()) {
               let useMove = [];
               const updatedItems = refChild.current.childItems || [];

               for (let i = 0; i < updatedItems.length; i++) {
                  const item = updatedItems[i];

                  if (i !== item.order) {
                     useMove.push({seat: item, order: i});
                  }
               }

               onMoveX(useMove);
            } else {
               revertMoveX();
            }
         }
      },
      [isMoveHorizontal, onMoveX]
   );

   const [, drag, dragPreview] = useDrag(
      () => ({
         type: ITEM_DRAG_TYPE,
         end: onUpdateMoveX,
         item,
         canDrag: () => !!onMove && item?.isEditable !== false && parent,
         collect: (monitor) => ({
            isDragging: monitor.isDragging(),
         }),
      }),
      [item, onUpdateMoveX]
   );

   const aDrop = useCallback(
      (droppedItem) => {
         if (!refChild.current.isMoveHorizontal) {
            setRefresh(new Date());
            onMove?.(droppedItem, item);
         }
      },
      [item, onMove]
   );

   const revertMoveX = () => {
      refChild.current.childItems = item[itemsKey] || [];
      setChildItems(item[itemsKey] || []);
      refChild.current.isMoveHorizontal = false;
      setRefresh(new Date());
   };

   const [{isOver, canDrop, dragItem}, drop] = useDrop({
      accept: ITEM_DRAG_TYPE,
      drop: aDrop,
      canDrop: (dropItem) => {
         // Is the dropItem being dropped on a node that doesn't allow children to be added.
         if (item?.hasAdd === false) {
            return undefined;
         }
         // Is the dropItem being dropped on itself?
         if (dropItem?.id === item?.id) {
            return undefined;
         }
         // Is the dropItem being dropped on its own parent? If so the dropItem is already a child of the parent.
         if (dropItem?.[parentKey] === item?.id) {
            return undefined;
         }
         if (!dropItem?.[parentKey]) {
            if (
               (dropItem?.isActive && item?.id === ACTIVE_ROOT_ID) ||
               (!dropItem?.isActive && item?.id === PASSIVE_ROOT_ID)
            ) {
               return undefined;
            }
         }
         return dropItem;
      },
      hover(hoverItem, monitor) {
         if (!!onMoveX) {
            if (!myRef.current) {
               revertMoveX();
               return;
            }
            // Don't replace items with themselves
            if (hoverItem.id === item.id) {
               return;
            }

            // Don't move horizontally if the parents of the two items aren't the same.
            if (hoverItem?.[parentKey] !== item?.[parentKey]) {
               revertMoveX();
               return;
            }
            // Original index where the item was before the drag.
            const dragIndex = hoverItem.order;
            // New index that the item is dragged and is hovering over.
            const hoverIndex = index;

            // Determine rectangle on screen
            const hoverBoundingRect = myRef.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverFourths = hoverBoundingRect.width / 4;
            const hoverThreeForths = hoverFourths * 3;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the left
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;

            // Dragging right, but is the hover in the right 1/4 of the item
            if (dragIndex < hoverIndex && hoverClientX < hoverThreeForths) {
               refChild.current.isMoveHorizontal = false;
               setIsMoveHorizontal(false);
               return;
            }

            // Dragging left, but is the hover in the left 1/4 of the item
            if (dragIndex > hoverIndex && hoverClientX > hoverFourths) {
               refChild.current.isMoveHorizontal = false;
               setIsMoveHorizontal(false);
               return;
            }
            onHoverX?.(dragIndex, hoverIndex);
            setRefresh(new Date());
            refChild.current.isMoveHorizontal = hoverItem.id;
            setIsMoveHorizontal(hoverItem.id);
         }
      },
      collect: (monitor) => ({
         isOver: monitor.isOver(),
         canDrop: monitor.canDrop(),
         dragItem: monitor.getItem(),
      }),
   });
   const [expanded, setExpanded] = React.useState(expandAll);

   const [showExpanded, setShowExpanded] = React.useState(expandAll);
   const [refresh, setRefresh] = useState(Date.now());

   const [anchorEl, setAnchorEl] = React.useState(null);

   // When the item is dragged horizontally only show the drop target as active if the item is in the middle half of the item.
   const isActive = isOver && canDrop && !refChild.current.isMoveHorizontal;

   useEffect(() => {
      if (defaultExpanded?.length > 0 && !expanded && item) {
         const foundIndex = indexOf(defaultExpanded, item?.id);

         if (foundIndex >= 0) {
            handleExpand();
            removeOne(defaultExpanded, foundIndex);
         }
      }
   }, [defaultExpanded, expanded, item]);

   useLayoutEffect(() => {
      if (expanded) {
         setTimeout(() => {
            groupRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
         }, SCROLL_TIMEOUT);
      } else {
         setTimeout(() => {
            itemRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
         }, SCROLL_TIMEOUT);
      }
   }, [expanded, itemRef, groupRef]);

   const handleHoverX = useCallback(
      (dragIndex, hoverIndex) => {
         if (dragIndex !== undefined && hoverIndex !== undefined) {
            const array = item?.[itemsKey] || [];
            const test = update(array, {
               $splice: [
                  [dragIndex, 1],
                  [hoverIndex, 0, array[dragIndex]],
               ],
            });
            refChild.current.childItems = test;
            setChildItems(test);
            setRefresh(new Date());
         }
      },
      [item, itemsKey]
   );

   const handleExpand = () => {
      setShowExpanded(true);
      setTimeout(() => {
         setExpanded(true);
      }, 10);
   };

   const handleCollapse = () => {
      setExpanded(false);
      setTimeout(() => {
         setShowExpanded(false);
      }, COLLAPSE_TIMEOUT);
   };

   const handleExpandClick = () => {
      const newExpanded = !expanded;

      if (newExpanded) {
         handleExpand();
      } else {
         handleCollapse();
      }
   };

   const handleAdd = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      onAdd?.(item);
      handleExpand();
   };

   const handleEdit = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      onEdit?.(item);
   };

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleDelete = async (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      await onDelete?.(item);
      const index = findIndex(item[itemsKey], {id: item.id});
      removeOne(item[itemsKey], index);
      setRefresh(new Date());
   };

   drag(drop(myRef));
   return (
      <Grid
         id={'Tree' + item?.id}
         key={'TreeItemRoot' + item?.id}
         ref={dragPreview}
         name={'Tree Item Root'}
         container
         item
         direction={'column'}
         alignContent={'center'}
         resizable={false}
         // overflow={'auto'}
         fullWidth={false}
         style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: dragItem?.id && dragItem?.id === item?.id ? 0.3 : 1,
         }}
      >
         <Grid ref={myRef} item style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Card
               className={classes.root}
               style={{
                  height: item?.height || height,
                  width: item?.width || width,
                  margin: 2,
                  backgroundColor: isActive ? '#F0F6EA' : undefined,
               }}
               ref={itemRef}
               elevation={2}
            >
               <CardHeader
                  title={
                     <Box alignItems={'center'} display={'flex'}>
                        {!!onMove && item?.isEditable !== false && parent && (
                           <DragIndicatorIcon className={classes.buttonStyle} style={{color: '#707070'}} />
                        )}
                        {item?.[labelKey] || 'Untitled'}
                     </Box>
                  }
                  titleTypographyProps={{variant: 'subtitle1', className: classes.titleStyle}}
                  action={
                     <React.Fragment>
                        {item?.isEditable !== false && (
                           <IconButton size={'small'} onClick={handleEdit} className={classes.buttonStyle}>
                              <Edit fontSize={'small'} />
                           </IconButton>
                        )}
                        {item?.isEditable !== false && onDelete && (
                           <React.Fragment>
                              <IconButton size={'small'} onClick={handleClick} className={classes.buttonStyle}>
                                 <MoreVert fontSize={'small'} />
                              </IconButton>
                              <Menu
                                 anchorEl={anchorEl}
                                 keepMounted
                                 open={Boolean(anchorEl)}
                                 onClose={handleClose}
                                 anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                 }}
                                 transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                 }}
                              >
                                 <ConfirmMenuItem
                                    className={classes.buttonStyle}
                                    messageKey='entity.confirmRemoveValue.message'
                                    color={'error'}
                                    onConfirm={handleDelete}
                                    values={{type: 'entity', name: item?.name}}
                                    size='small'
                                    submitStyle={classes.deleteColorStyle}
                                    startIcon={Delete}
                                    buttonTypographyProps={{variant: 'inherit'}}
                                    // disabled={isSaving || isNew}
                                 />
                              </Menu>
                           </React.Fragment>
                        )}
                     </React.Fragment>
                  }
               />
               <CardContent classes={{root: classes.contentRoot}}>
                  <Box height={'100%'} minHeight={100}>
                     {ContentComponent && <ContentComponent item={item} />}
                  </Box>
               </CardContent>
               <CardActions>
                  <Grid container justify={'space-between'}>
                     {/*Left actions*/}
                     <Grid item flex={'1 1 33%'}>
                        {item?.hasAdd !== false && (
                           <IconButton size={'small'} onClick={handleAdd}>
                              <AddCircle fontSize={'small'} className={classes.buttonStyle} />
                           </IconButton>
                        )}
                     </Grid>
                     {/*Center actions*/}
                     <Grid container item alignItems={'center'} justify={'center'} fullWidth={false} flex={'1 1 33%'}>
                        {item?.[itemsKey]?.length > 0 && (
                           <ExpandMore
                              expand={expanded}
                              onClick={handleExpandClick}
                              size={'small'}
                              style={{marginRight: 'auto'}}
                              className={classes.buttonStyle}
                           >
                              <ExpandMoreIcon />
                           </ExpandMore>
                        )}
                     </Grid>
                     {/*Right Actions*/}
                     <Grid item flex={'1 1 33%'} />
                  </Grid>
               </CardActions>
            </Card>
         </Grid>
         <Box name={'Expanding Grid'} ref={groupRef} display={'flex'} overflow={'hidden'} flex={'0 0 auto'}>
            {showExpanded && item?.[itemsKey]?.length > 0 && (
               <>
                  <Collapse in={expanded} style={{display: 'flex'}}>
                     <Box
                        key={'TreeItemExpanding' + item?.id}
                        name={'Expanding Grid'}
                        display={'flex'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                        flex={'0 0 auto'}
                        overflow={'hidden'}
                     >
                        <Divider
                           orientation={'vertical'}
                           flexItem
                           style={{
                              height: 20,
                              marginRight: 'auto',
                              marginLeft: 'auto',
                              backgroundColor: PRIMARY_COLOR,
                              width: 2,
                           }}
                        />
                        <TreeGroupFHG key={'ExpandedTreeItem' + item?.id + refresh}>
                           {childItems?.map((child, index) => (
                              <TreeItemFHG
                                 key={'child' + child?.order + '' + child?.id}
                                 ContentComponent={ContentComponent}
                                 onMoveX={onMoveX}
                                 childCount={childItems?.length || 0}
                                 onHoverX={handleHoverX}
                                 item={child}
                                 parent={item}
                                 index={index}
                                 itemsKey={itemsKey}
                                 defaultExpanded={defaultExpanded}
                                 expandAll={expandAll && expanded}
                                 labelKey={labelKey}
                                 parentKey={parentKey}
                                 height={height}
                                 width={width}
                                 onMove={onMove}
                                 onEdit={onEdit}
                                 onAdd={onAdd}
                                 onDelete={onDelete}
                                 onUpdateMoveX={handleUpdateMoveX}
                              />
                           ))}
                        </TreeGroupFHG>
                     </Box>
                  </Collapse>
               </>
            )}
         </Box>
      </Grid>
   );
});

export default TreeItemFHG;
