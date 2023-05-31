import {MenuItem} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import useTheme from '@material-ui/core/styles/useTheme';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import {forwardRef} from 'react';
import React, {Fragment, useState} from 'react';
import ButtonLF from '../../components/ButtonLF';
import {UNDO_DURATION} from '../../Constants';
import ModalDialog from './dialog/ModalDialog';
import TypographyFHG from './Typography';
import Typography from './Typography';

import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(
   (theme) => ({
      messageStyle: {
         backgroundColor: `${theme.palette.background.default} !important`,
         color: `${theme.palette.text.secondary} !important`,
         paddingRight: theme.spacing(6),
      },
      snackbarMessageStyle: {
         marginRight: theme.spacing(1),
      },
      closeButtonStyle: {
         position: 'absolute',
         right: 0,
         top: 0,
         marginLeft: 'auto',
         zIndex: 1001,
      },
      spinnerMargin: {
         marginLeft: theme.spacing(0.5),
      },
   }),
   {name: 'ConfirmMenuItemStyles'}
);

// noinspection JSUnusedLocalSymbols
/**
 * Confirm Menu Item Component to show confirmation when selecting a menu item.
 *
 * Reviewed:
 */
const ConfirmMenuItem = forwardRef(function ConfirmMenuItem(
   {
      titleKey = 'confirmRemove.title',
      messageKey = 'confirmRemoveValue.message',
      buttonLabelKey = 'delete.button',
      onConfirm,
      onCancel,
      confirmProps,
      children,
      color,
      component,
      values,
      titleValues,
      isProgress = false,
      submitStyle,
      onUndo = false,
      startIcon,
      onMenuClose,
      buttonTypographyProps,
      ...menuItemProperties
   },
   ref
) {
   const classes = useStyles();
   const theme = useTheme();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [showUndelete, setShowUndelete] = useState(false);

   const useTitleValues = titleValues || values;
   const StartIcon = startIcon;

   const handleClick = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      onMenuClose?.();
      if (menuItemProperties.type !== 'submit') {
         setIsModalOpen(true);
      }

      menuItemProperties?.onClick?.(event);
   };

   const handleConfirm = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsModalOpen(false);

      if (onUndo) {
         setShowUndelete(true);
      }
      onConfirm && onConfirm();
   };

   const handleCancel = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsModalOpen(false);
      onCancel?.(event);
   };

   const handleUndoClose = () => {
      setShowUndelete(false);
   };

   const handleUndo = () => {
      onUndo?.();
      handleUndoClose();
   };

   return (
      <Fragment>
         {isModalOpen && (
            <ModalDialog
               submitKey={buttonLabelKey}
               {...confirmProps}
               titleKey={titleKey}
               messageKey={messageKey}
               onSubmit={handleConfirm}
               onClose={handleCancel}
               hideBackdrop
               submitColor={color}
               messageValues={values}
               titleValues={useTitleValues}
               submitColorStyle={submitStyle}
            />
         )}
         {showUndelete && (
            <Snackbar
               open={true}
               autoHideDuration={UNDO_DURATION}
               onClose={handleUndoClose}
               ContentProps={{classes: {root: classes.messageStyle}}}
               message={
                  <Typography
                     id={'confirmRemoveValue.Undo.message'}
                     variant={'subtitle1'}
                     className={classes.snackbarMessageStyle}
                     values={values}
                     color={'inherit'}
                  >
                     <ButtonLF labelKey={'undo.label'} onClick={handleUndo} />
                  </Typography>
               }
               action={[
                  <IconButton
                     key='close'
                     aria-label='Close'
                     color='inherit'
                     size={'small'}
                     className={classes.closeButtonStyle}
                     onClick={handleUndoClose}
                  >
                     <CloseIcon fontSize='inherit' />
                  </IconButton>,
               ]}
            />
         )}
         <MenuItem onClick={handleClick} color={color} {...menuItemProperties}>
            {isProgress && <CircularProgress className={classes.spinnerMargin} size={15} thickness={2.5} />}
            {startIcon && <StartIcon fontSize={'small'} color={color} style={{marginRight: theme.spacing(1)}} />}
            <TypographyFHG variant='inherit' id={buttonLabelKey} color={color} {...buttonTypographyProps} />
            {children}
         </MenuItem>
      </Fragment>
   );
});

ConfirmMenuItem.propTypes = {
   titleKey: PropTypes.string, // Localization key for the title.
   messageKey: PropTypes.string, // Localization key for the messages.
   buttonLabelKey: PropTypes.string, // Localization key for the button label.
   onConfirm: PropTypes.func.isRequired, // The callback when the action is confirmed.
   onCancel: PropTypes.func, // The callback when the action is canceled.
   component: PropTypes.any, // The Button component. Defaults to Button.
   isProgress: PropTypes.bool, // Indicates if the confirmed action is in progress.
   menuItemProperties: PropTypes.any, // The properties for the button component.
};

export default ConfirmMenuItem;
