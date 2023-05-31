import {IconButton} from '@material-ui/core';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import ModalDialog from './dialog/ModalDialog';

/**
 * Button Component to show confirmation.
 *
 * Reviewed:
 */
ConfirmIconButton.propTypes = {
   titleKey: PropTypes.string,                  // Localization key for the title.
   messageKey: PropTypes.string.isRequired,     // Localization key for the messages.
   buttonLabelKey: PropTypes.string,            // Localization key for the button label.
   onConfirm: PropTypes.func.isRequired,        // The callback when the action is confirmed.
   onCancel: PropTypes.func,                    // The callback when the action is canceled.
   component: PropTypes.any,                    // The Button component. Defaults to Button.
   isProgress: PropTypes.bool,                  // Indicates if the confirmed action is in progress.
   buttonProperties: PropTypes.any              // The properties for the button component.
};

export default function ConfirmIconButton({
   titleKey = 'confirmRemove.title', submitStyle,
   messageKey = 'confirmRemove.message', buttonLabelKey, onConfirm, onCancel, confirmProps, submitColor,
   children, color, component, values, titleValues, isProgress = false, buttonTypographyProps, ...buttonProperties
}) {

   const [isModalOpen, setIsModalOpen] = useState(false);

   const handleClick = event => {
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
      onConfirm && onConfirm();
   };

   const handleCancel = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      setIsModalOpen(false);
      onCancel && onCancel();
   };

   return (
      <Fragment>
         {isModalOpen && (
            <ModalDialog submitKey={buttonLabelKey} {...confirmProps} titleKey={titleKey} messageKey={messageKey} onSubmit={handleConfirm}
                         onClose={handleCancel} hideBackdrop submitColorStyle={submitStyle} submitColor={submitColor || color} messageValues={values} titleValues={titleValues || values}
            />
         )}
         <IconButton onClick={handleClick} {...buttonProperties} color={color} >
            {children}
         </IconButton>
      </Fragment>
   );
}

