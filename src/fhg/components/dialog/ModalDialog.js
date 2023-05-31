import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, {useEffect, useCallback} from 'react';
import Grid from '../Grid';
import Typography from '../Typography';

const useStyles = makeStyles(
   (theme) => ({
      contentStyle: {
         flex: '1 1 auto',
         overflow: 'auto',
      },
      contentStyleNoScroll: {
         '&:first-child': {
            paddingTop: 10,
         },
         flex: '1 1 auto',
         overflow: 'hidden',
         display: 'flex',
         paddingLeft: 10,
         paddingRight: 10,
         paddingBottom: 0,
      },
      spinnerMargin: {
         marginLeft: theme.spacing(0.5),
      },
      actionStyle: {
         margin: 0,
         padding: theme.spacing(1),
         flex: '0 0 auto',
      },
      fatButtonStyle: {
         margin: `0 0 0 ${theme.spacing(1)}px !important`,
         width: 'unset',
         height: 'unset',
         '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
            width: 'auto',
            height: 'auto',
            padding: '12px 24px !important',
         },
      },
      titleStyle: {
         borderBottom: '1px solid #BFBAAE',
         flex: '0 0 auto',
         textTransform: 'capitalize',
      },
      innerStyle: {
         paddingTop: theme.spacing(1),
         height: '100%',
      },
      noScroll: {
         flex: '0 0 auto',
      },
      formStyle: {
         overflow: 'hidden',
         display: 'flex',
         flexDirection: 'column',
      },
   }),
   {name: 'ModalDialogStyles'}
);

/**
 * The New User dialog which creates a new user.
 */
export default function ModalDialog({
   open,
   titleKey,
   title,
   titleValues,
   titleVariant = 'h6',
   submitKey,
   messageKey,
   message,
   messageValues,
   messageVariant = 'subtitle1',
   cancelKey,
   submitColor,
   onClose,
   onSubmit,
   maxWidth,
   fullWidth,
   submitColorStyle,
   cancelColorStyle,
   disableBackdropClick,
   buttons,
   contentsScroll,
   fullScreen,
   isForm,
   isSaving,
   isEnabled,
   TransitionComponent,
   children,
   fullHeight,
   hideBackdrop,
}) {
   const classes = useStyles();

   const handleSubmit = useCallback(
      (event) => {
         event.preventDefault();

         onSubmit && onSubmit(event);
      },
      [onSubmit]
   );

   const handleKey = useCallback(
      (event) => {
         if (!event.defaultPrevented && open) {
            if (event.key === 'Escape' && onClose) {
               event.preventDefault();
               onClose(event);
            } else if (!isForm && event.key === 'Enter') {
               event.preventDefault();
               event.stopPropagation();
               handleSubmit(event);
            }
         }
      },
      [handleSubmit, isForm, onClose, open]
   );

   /**
    * Handles keydown events for Escape and Enter.
    */
   useEffect(() => {
      document.addEventListener('keydown', handleKey, false);

      // Cleanup the listener when this component is removed.
      return () => {
         document.removeEventListener('keydown', handleKey, false);
      };
   }, [isForm, onClose, open, handleSubmit, handleKey]);

   const handleClickSubmit = (event) => {
      if (!event.isDefaultPrevented()) {
         handleSubmit(event);
      }
   };
   return (
      <Dialog
         open={open}
         onClose={onClose}
         maxWidth={maxWidth}
         onKeyDown={handleKey}
         fullWidth={fullWidth}
         disableBackdropClick={disableBackdropClick}
         fullScreen={fullScreen}
         hideBackdrop={hideBackdrop}
         TransitionComponent={TransitionComponent}
      >
         <Grid container direction={'column'} wrap={'nowrap'} fullHeight={fullHeight}>
            {(title || titleKey) && (
               <DialogTitle disableTypography className={classes.titleStyle}>
                  <Typography
                     className={classes.titleTypography}
                     variant={titleVariant}
                     id={titleKey}
                     values={titleValues}
                  >
                     {title}
                  </Typography>
               </DialogTitle>
            )}
            <DialogContent className={contentsScroll ? classes.contentStyle : classes.contentStyleNoScroll}>
               <Grid
                  container
                  className={contentsScroll ? classes.innerStyle : classes.noScroll}
                  direction={'column'}
                  wrap={'nowrap'}
                  fullHeight={fullHeight}
               >
                  {messageKey && (
                     <Typography id={messageKey} variant={messageVariant} values={messageValues} hasBold>
                        {message}
                     </Typography>
                  )}
                  {children}
               </Grid>
            </DialogContent>
            <DialogActions className={classes.actionStyle} spacing={1}>
               {buttons}
               <Button
                  className={`${classes.fatButtonStyle} button ${cancelColorStyle}`}
                  disabled={isSaving}
                  onClick={onClose}
               >
                  <Typography color='inherit' id={cancelKey} />
               </Button>
               {!!onSubmit && (
                  <Button
                     className={`${classes.fatButtonStyle} button ${submitColorStyle}`}
                     type='submit'
                     variant={'contained'}
                     disabled={isSaving || !isEnabled}
                     onClick={!isForm ? handleClickSubmit : undefined}
                     color={submitColor}
                  >
                     <Typography color='inherit' id={submitKey} values={titleValues} />
                     {isSaving && <CircularProgress className={classes.spinnerMargin} size={15} thickness={2.5} />}
                  </Button>
               )}
            </DialogActions>
         </Grid>
      </Dialog>
   );
}

ModalDialog.propTypes = {
   message: PropTypes.string, // Message to be displayed to the user. Use either message or messageKey but
   //    not both.
   messageKey: PropTypes.string, // Message key of the message to be displayed to the user.
   onSubmit: PropTypes.func, // Called when the user submits/confirms.
   onClose: PropTypes.func, // Called when the user closes/cancels.
   open: PropTypes.bool, // Indicates if the dialog should be open or not.
   title: PropTypes.string, // Title for the confirmation dialog.
   titleKey: PropTypes.string, // Localization key for the Title for the confirmation dialog.
   titleValues: PropTypes.object, // Values for the Title for the confirmation dialog.
   submitLabel: PropTypes.string, // Label for the submit button.
   submitKey: PropTypes.string, // Localization key for the submit button label.
   cancelLabel: PropTypes.string, // Label for the cancel button.
   cancelKey: PropTypes.string, // Localization key for the cancel button label.
   cancelColorStyle: PropTypes.string, // The class specifying the color of the cancel button. Needs color and
   //    background color for all states (e.g. primary-color-button).
   messageValues: PropTypes.object, // Localization messageValues for the message.
   isSaving: PropTypes.bool, // Indicates if the saving progress should be shown.
   isEnabled: PropTypes.bool, // Indicates if the submit button can be enabled. It won't be enabled if
   // isSaving is true.
   submitColorStyle: PropTypes.string, // The class specifying the color of the submit button. Needs color and
   //    background color for all states (e.g. primary-color-button).
   maxWidth: PropTypes.string, // The maximum width of the dialog.
   children: PropTypes.any, // Optional children components.
   isForm: PropTypes.bool, // Is the modal containing a form? If not, the enter key is handled.
   useCaptureKeydown: PropTypes.bool,
   contentsScroll: PropTypes.bool,
};

ModalDialog.defaultProps = {
   open: true,
   isSaving: false,
   isEnabled: true,
   submitLabel: 'OK',
   submitKey: 'ok.button',
   cancelLabel: 'Cancel',
   cancelKey: 'cancel.button',
   submitColorStyle: 'primary-color-button',
   cancelColorStyle: 'minimal-cancel-button',
   maxWidth: 'md',
   isForm: false,
   useCaptureKeydown: true,
   contentsScroll: true,
};
