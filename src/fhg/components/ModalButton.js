import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import ModalDialog from './dialog/ModalDialog';
import Typography from './Typography';

/**
 * Button Component to show confirmation.
 *
 * Reviewed:
 */
ModalButton.propTypes = {
   titleKey: PropTypes.string.isRequired, // Localization key for the title.
   messageKey: PropTypes.string, // Localization key for the messages.
   buttonLabelKey: PropTypes.string, // Localization key for the button label.
   onSubmit: PropTypes.func.isRequired, // The callback when the action is confirmed.
   onCancel: PropTypes.func, // The callback when the action is canceled.
   component: PropTypes.any, // The Button component. Defaults to Button.
   buttonProperties: PropTypes.any, // The properties for the button component.
};

export default function ModalButton({
   titleKey,
   messageKey,
   buttonLabelKey,
   onSubmit,
   onCancel,
   confirmProps,
   children,
   color,
   component,
   values,
   titleValues,
   submitStyle,
   isModalButtonEnabled,
   buttonTypographyProps,
   ...buttonProperties
}) {
   const [isModalOpen, setIsModalOpen] = useState(false);

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

   const handleSubmit = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsModalOpen(false);

      onSubmit?.();
   };

   const handleCancel = () => {
      setIsModalOpen(false);
      onCancel?.();
   };

   return (
      <Fragment>
         {isModalOpen && (
            <ModalDialog
               submitKey={buttonLabelKey}
               {...confirmProps}
               titleKey={titleKey}
               messageKey={messageKey}
               onSubmit={handleSubmit}
               onClose={handleCancel}
               hideBackdrop
               submitColor={color}
               messageValues={values}
               titleValues={useTitleValues}
               submitColorStyle={submitStyle}
               isEnabled={isModalButtonEnabled}
            >
               {children}
            </ModalDialog>
         )}
         <Button onClick={handleClick} color={color} {...buttonProperties}>
            {!component && buttonLabelKey && (
               <Typography variant={'button'} id={buttonLabelKey} {...buttonTypographyProps} />
            )}
         </Button>
      </Fragment>
   );
}
