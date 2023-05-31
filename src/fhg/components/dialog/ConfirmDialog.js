import PropTypes from 'prop-types';
import React from 'react';
import ModalDialog from './ModalDialog';

function ConfirmDialog(props) {
   const {
      title,
      titleKey = 'confirmRemove.title',
      titleVariant = 'h5',
      titleValues,
      message,
      messageKey = 'confirmRemove.message',
      messageVariant = 'h6',
      open,
      onClose,
      onConfirm,
      confirmLabel,
      confirmKey = 'confirmRemove.title',
      messageValues,
      confirmColor,
      children,
   } = props;

   return (
      <ModalDialog
         open={open}
         title={title}
         titleKey={titleKey}
         titleValues={titleValues}
         titleVariant={titleVariant}
         message={message}
         messageKey={messageKey}
         messageVariant={messageVariant}
         submitColor={confirmColor}
         onClose={onClose}
         onSubmit={onConfirm}
         submitKey={confirmKey}
         submitLabel={confirmLabel}
         messageValues={messageValues}
      >
         {children}
      </ModalDialog>
   );
}
ConfirmDialog.propTypes = {
   message: PropTypes.string, // Message to be displayed to the user. Use either message or messageKey but not
   //    both.
   messageKey: PropTypes.string, // Message key of the message to be displayed to the user.
   messageVariant: PropTypes.string, // The variant for the message typography.
   onConfirm: PropTypes.func, // Called when the user confirms the message.
   onCancel: PropTypes.func, // Called when the user cancels.
   open: PropTypes.bool, // Indicates if the dialog should be open or not.
   title: PropTypes.string, // Title for the confirmation dialog.
   titleKey: PropTypes.string, // Localization key for the Title for the confirmation dialog.
   confirmLabel: PropTypes.string, // Label for the confirm button.
   confirmKey: PropTypes.string, // Localization key for the confirm button label.
   messageValues: PropTypes.object, // Localization values for the message.
};

ConfirmDialog.defaultProps = {
   open: true,
   confirmLabel: 'OK',
   confirmKey: 'ok.button',
};
