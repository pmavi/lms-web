import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import Prompt from './edit/Prompt';
import ProgressButton from './ProgressButton';
import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';

/**
 * Button to export pdf.
 *
 * Reviewed:
 */
PdfExportButton.propTypes = {
   messageKey: PropTypes.string, // Localization key for the prompt messages.
   labelKey: PropTypes.string, // Localization key for the button label.
   documentPath: PropTypes.string, // The path for the document including the name.
   getPdfDocument: PropTypes.func.isRequired, // The callback when the action is confirmed. A promise must be returned.
   color: PropTypes.any, // The color of the progress button.
   buttonTypographyProps: PropTypes.any, // The properties for the typography for the button.
   buttonProperties: PropTypes.any, // The properties for the button component.
};

export default function PdfExportButton({
   messageKey = 'pdf.leave.error',
   labelKey = 'asset.exportPdf.button',
   children,
   color,
   typographyProps,
   documentPath,
   getPdfDocument,
   ...buttonProperties
}) {
   const [isProgress, setIsProgress] = useState(false);

   /**
    * Generate the PDF document and save it to the file.
    *
    * @param document the PDF document to generate and save.
    * @param fileName The fileName for the PDF document.
    * @return {Promise<void>}
    */
   const generatePdfDocument = async (document, fileName) => {
      const blob = await pdf(document).toBlob();
      saveAs(blob, fileName);
   };

   /**
    * Handle the button click to generate the PDF file.
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
         const document = await getPdfDocument();
         await generatePdfDocument(document, documentPath);
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
