import Drawer from '@material-ui/core/Drawer/Drawer';
import Hidden from '@material-ui/core/Hidden';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import PropTypes from 'prop-types';
import React from 'react';
import {atom, useRecoilState} from 'recoil';
import {APPBAR_SMALL_HEIGHT} from '../../Constants';
import {DRAWER_WIDTH, APPBAR_HEIGHT} from '../../Constants';

export const drawerIsOpenStatus = atom({
   key: 'isDrawerOpen',
   default: false,
});

const useStyles = makeStyles(theme => ({
   drawer: props => ({
      flex: '1 1',
      '@media print': {
         display: 'none',
      },
      [theme.breakpoints.up('md')]: {
         width: props?.width || DRAWER_WIDTH,
         // height: DRAWER_WIDTH,
         flexShrink: 0,
      },
   }),
   drawerPaper: props => ({
      // backgroundColor: theme.palette.environment.light.level1.base,
      // minWidth: 300,
      width: props?.width || DRAWER_WIDTH, //EQUIPMENT_LIST_PROPERTY_WIDTH,
      maxWidth: '100%',
      height: `calc(100% - ${APPBAR_HEIGHT}px)`,
      margin: 0,
      marginTop: APPBAR_HEIGHT,
      [theme.breakpoints.down('sm')]: {
         marginTop: APPBAR_SMALL_HEIGHT,
         height: `calc(100% - ${APPBAR_SMALL_HEIGHT}px)`,
      },
      // marginLeft: 'auto',
   }),
   noBorder: {
      borderRight: 'none',
   },
   closeButtonStyle: {
      '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
         position: 'absolute',
         top: 0,
         right: 0,
      },
      '@supports not (-ms-high-contrast: none)': {
         position: 'sticky',
      },
      right: 0,
      top: 0,
      marginLeft: 'auto',
      marginBottom: theme.spacing(-6),
      zIndex: 1001,
   },
}));

/**
 * Responsive Drawer Component which changes between a permanent drawer above the breakpoint and is temporary at or
 * below the breakpoint. The close button floats above the children and stays at in the top right of the component. The
 * children should allow space in the upper right corner for the close button.
 */
export default function ResponsiveMobileDrawer({children, width, backgroundColor, ModalProps}) {
   const classes = useStyles({width});
   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);

   return (
      <nav className={classes.drawer} aria-label='navigation'>
         <Hidden mdUp implementation='css'>
            <SwipeableDrawer
               variant='temporary'
               anchor='left'
               open={isDrawerOpen}
               onClose={() => setIsDrawerOpen(false)}
               onOpen={() => setIsDrawerOpen(true)}
               PaperProps={{style: {width, backgroundColor}}}
               classes={{
                  paper: classes.drawerPaper,
                  paperAnchorDockedLeft: classes.noBorder,
               }}

               ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                  ...ModalProps,
               }}
            >
               {children}
            </SwipeableDrawer>
         </Hidden>
         <Hidden smDown implementation='css'>
            <Drawer
               anchor='left'
               PaperProps={{style: {width, backgroundColor}}}
               classes={{
                  paper: classes.drawerPaper,
                  paperAnchorDockedLeft: classes.noBorder,
               }}
               elevation={0}
               variant='permanent'
               open
            >
               {children}
            </Drawer>
         </Hidden>
      </nav>
   );
}

ResponsiveMobileDrawer.propTypes = {
   children: PropTypes.any.isRequired,       // Children in the drawer.
   width: PropTypes.number,                  // Width of the draw to override the constant DRAWER_WIDTH.
   backgroundColor: PropTypes.string,        // Background color of the drawer.
};
