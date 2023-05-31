import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import Prompt from './edit/Prompt';
import ProgressButton from './ProgressButton';

/**
 * Button to export pdf.
 *
 * Reviewed:
 */
ExcelExportButton.propTypes = {
   messageKey: PropTypes.string, // Localization key for the prompt messages.
   labelKey: PropTypes.string, // Localization key for the button label.
   documentPath: PropTypes.string, // The path for the document including the name.
   onExcelDocument: PropTypes.func.isRequired, // The callback when the action is confirmed. A promise must be returned.
   color: PropTypes.any, // The color of the progress button.
   buttonTypographyProps: PropTypes.any, // The properties for the typography for the button.
   buttonProperties: PropTypes.any, // The properties for the button component.
};

export default function ExcelExportButton({
   messageKey = 'excel.leave.error',
   labelKey = 'asset.exportExcel.button',
   children,
   color,
   typographyProps,
   onExcelDocument,
   ...buttonProperties
}) {
   const [isProgress, setIsProgress] = useState(false);

   /**
    * Handle the button click to generate the Excel file.
    * @param event The click event.
    * @return {Promise<void>} The promise for the completion of the save.
    */
   const handleClick = async (event) => {
      try {
         setIsProgress(true);
         if (event) {
            event.stopPropagation();
            event.preventDefault();
         }
         onExcelDocument?.();
      } catch (e) {
         console.log(e);
      } finally {
         setIsProgress(false);
      }
   };

   return (
      <Fragment>
         <Prompt when={isProgress} messageKey={messageKey} />
         <ProgressButton
            isProgress={isProgress}
            labelKey={labelKey}
            typographyProps={typographyProps}
            onClick={handleClick}
            color={color}
            {...buttonProperties}
         >
            {children}
         </ProgressButton>
      </Fragment>
   );
}
