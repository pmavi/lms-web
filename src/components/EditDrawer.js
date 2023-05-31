import {Drawer} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {EDIT_DRAWER_WIDTH} from '../Constants';
import {APPBAR_SMALL_HEIGHT} from '../Constants';
import {APPBAR_HEIGHT} from '../Constants';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {useEffect} from 'react';

const useStyles = makeStyles(theme => ({
   inputStyle: {
      backgroundColor: theme.palette.background.default,
   },
   frameStyle: {
      padding: theme.spacing(4, 2),
   },
   expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: 'rotate(180deg)',
   },
   titleStyle: {
      paddingTop: theme.spacing(2),
   },
   drawerPaper: props => ({
      backgroundColor: props?.backgroundColor || theme.palette.background.paper,
      width: props?.width || EDIT_DRAWER_WIDTH,
      maxWidth: '100%',
      marginTop: APPBAR_HEIGHT,
      height: `calc(100% - ${APPBAR_HEIGHT}px)`,
      overflow: 'visible',
      [theme.breakpoints.down('sm')]: {
         marginTop: APPBAR_SMALL_HEIGHT,
         height: `calc(100% - ${APPBAR_SMALL_HEIGHT}px)`,
      },
   }),
   backdropStyle: {
      marginTop: APPBAR_HEIGHT,
      [theme.breakpoints.down('sm')]: {
         marginTop: APPBAR_SMALL_HEIGHT,
      },
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
}), {name: 'EditDrawerStyles'});

export default function EditDrawer({open = true, onClose, children, ...styleProps}) {
   const classes = useStyles(styleProps);
   const history = useHistory();
   const location = useLocation();

   useEffect(() => {
      //POP only occurs when this URL is reached through browser action. App actions will be 'Replace' or 'Push'.
      if (history?.action === 'POP') {
         location.state = {};
         history.replace(location);
      }
   }, [history, location]);

   return (
      <Drawer
         anchor={'right'}
         open={open}
         // onClose={toggleDrawer(false)}
         // onOpen={toggleDrawer(true)}
         classes={{
            paper: classes.drawerPaper,
         }}
         ModalProps={{disableEscapeKeyDown: true, BackdropProps: {className: classes.backdropStyle}}}
      >
         {open && onClose && (
            <IconButton key='close' className={classes.closeButtonStyle} aria-label='Close' color='inherit'
                        onClick={onClose}>
               <CloseIcon/>
            </IconButton>
         )}
         {children}
      </Drawer>
   );
}
