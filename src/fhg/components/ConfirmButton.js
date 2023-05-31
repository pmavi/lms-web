import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {useSetRecoilState} from 'recoil';
import ButtonLF from '../../components/ButtonLF';
import {UNDO_DURATION} from '../../Constants';
import {undeleteStatus} from '../UndeleteSnackbar';
import ModalDialog from './dialog/ModalDialog';
import ProgressButton from './ProgressButton';
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
   }),
   {name: 'ConfirmButtonStyles'}
);

/**
 * Button Component to show confirmation.
 *
 * Reviewed:
 */
ConfirmButton.propTypes = {
   titleKey: PropTypes.string, // Localization key for the title.
   messageKey: PropTypes.string, // Localization key for the messages.
   buttonLabelKey: PropTypes.string, // Localization key for the button label.
   onConfirm: PropTypes.func.isRequired, // The callback when the action is confirmed.
   onCancel: PropTypes.func, // The callback when the action is canceled.
   component: PropTypes.any, // The Button component. Defaults to Button.
   isProgress: PropTypes.bool, // Indicates if the confirmed action is in progress.
   buttonProperties: PropTypes.any, // The properties for the button component.
};

export default function ConfirmButton({
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
   undoId,
   buttonTypographyProps,
   ...buttonProperties
}) {
   const classes = useStyles();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [showUndelete, setShowUndelete] = useState(false);
   const setUndeleteStatus = useSetRecoilState(undeleteStatus);

   const useTitleValues = titleValues || values;

   const handleClick = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      if (buttonProperties.type !== 'submit') {
         setIsModalOpen(true);
      }

      buttonProperties?.onClick?.(event);
   };

   const handleConfirm = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsModalOpen(false);

      if (onUndo) {
         if (undoId) {
            setUndeleteStatus((state) => ({
               ...state,
               show: true,
               values,
               autoHideDuration: 5000,
               onUndo,
               id: undoId,
            }));
         } else {
            console.log('Undo requires an undoId');
         }
      }
      onConfirm && onConfirm();
   };

   const handleCancel = () => {
      setIsModalOpen(false);
      onCancel && onCancel();
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
         <ProgressButton
            isProgress={isProgress}
            onClick={handleClick}
            color={color}
            isSpinnerLight
            {...buttonProperties}
         >
            {!component && buttonLabelKey && (
               <Typography variant={'button'} id={buttonLabelKey} {...buttonTypographyProps} />
            )}
            {children}
         </ProgressButton>
      </Fragment>
   );
}
