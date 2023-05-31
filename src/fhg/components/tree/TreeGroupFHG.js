import {Divider} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import {useDrop} from 'react-dnd';
import {PRIMARY_COLOR} from '../../../Constants';
import {ITEM_DRAG_TYPE} from './TreeItemFHG';

const BOTTOM_MARGIN = 16;

const useStyles = makeStyles(
   (theme) => ({
      root: {
         paddingRight: theme.spacing(2),
         paddingLeft: theme.spacing(2),
         marginLeft: 'auto',
         marginRight: 'auto',
      },
      itemStyle: {
         marginBottom: BOTTOM_MARGIN,
         position: 'relative',
         '&:first-child:not(:only-child)': {
            paddingRight: theme.spacing(2),
            '&:after': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: `calc(50% - ${theme.spacing(1)}px)`,
               right: 0,
               borderTop: `2px solid ${theme.palette.primary.main}`,
               zIndex: 1,
            },
         },
         '&:last-child:not(:only-child)': {
            paddingLeft: theme.spacing(2),
            '&:after': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: `calc(50% - ${theme.spacing(1)}px)`,
               borderTop: `2px solid ${theme.palette.primary.main}`,
               zIndex: 1,
            },
         },
         '&:not(:first-child):not(:last-child)': {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            '&:after': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               borderTop: `2px solid ${theme.palette.primary.main}`,
               zIndex: 1,
            },
         },
      },
   }),
   {name: 'TreeGroupFHGStyles'}
);

export default function TreeGroupFHG({isTopLevel = false, children}) {
   const classes = useStyles();
   const [, drop] = useDrop(() => ({accept: ITEM_DRAG_TYPE}));

   const render = (child) => {
      if (typeof child === 'function') {
         return child({...child.props});
      } else if (typeof children === 'object') {
         return React.cloneElement(child, {
            ...child.props,
         });
      }
   };

   return (
      <Box
         ref={drop}
         name={'Tree Group Root'}
         className={classes.root}
         display={'flex'}
         flexDirection={'row'}
         flexWrap={'nowrap'}
         justifyContent={'space-around'}
         alignItems={'flex-start'}
         flex={'0 0 auto'}
         overflow={'hidden'}
      >
         {React.Children.map(children, (child, index) => (
            <Box
               name='Tree Group Cell'
               key={'group' + index}
               display={'flex'}
               className={isTopLevel ? classes.root : classes.itemStyle}
               justifyContent={'center'}
               flexDirection={'column'}
               flexWrap={'nowrap'}
               overflow={'hidden'}
               wrap={'nowrap'}
               alignItems={'flex-start'}
            >
               {!isTopLevel && (
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
               )}
               {render(child)}
            </Box>
         ))}
      </Box>
   );
}
