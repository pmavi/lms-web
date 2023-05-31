import PropTypes from 'prop-types';
import React, {useRef, useEffect, forwardRef} from 'react';

/**
 * Form component that handles custom validation and removing prevents default for the submit event.
 *
 * Reviewed: 3/26/20
 */
const Form = forwardRef(
function Form({onSubmit, onValid, validate, customValidity, reportInvalid, children, ...props}, ref) {
   const useFormEl = useRef();
   const formEl = ref || useFormEl;

   /**
    * Rechecks validity if the checkValidity prop changes.
    */
   useEffect(() => {
      /**
       * Validate the form data. Calls customValidity if the rest of the form is valid.
       *
       * @param isReport True if the validity should be reported.
       * @return {boolean} True if the form is valid and the custom validity is valid.
       */
      const checkValidity = (isReport = true) => {
         let isValid;
         let form = formEl.current;
         if (form) {
            // noinspection JSUnresolvedFunction
            isValid = form.checkValidity();
            if (isValid && customValidity) {
               isValid = customValidity();
            }
            if (!isValid && isReport) {
               // noinspection JSUnresolvedFunction
               return form.reportValidity();
            }
            return isValid
         }
         return true;
      };

      if (validate && checkValidity(reportInvalid)) {
         onValid && onValid()
      }
   }, [validate, reportInvalid, customValidity, onValid, formEl]);

   /**
    * Rechecks validity if the checkValidity prop changes.
    *
    * @param prevProps
    * @param prevState
    * @param snapshot
    */

   /**
    * Submits the form data and prevents the default for the submit event.
    * @param event The submit event.
    */
   const submitHandler = (event) => {
      event && event.preventDefault();
      event && event.stopPropagation();
      let form = formEl.current;
      let isValid = true;

      if (customValidity) {
         isValid = customValidity();
      }
      if (!isValid && reportInvalid) {
         // noinspection JSUnresolvedFunction
         return form.reportValidity();
      }

      if (isValid) {
         onSubmit && onSubmit(event);
      }
   };

   return (
      <form ref={formEl} onSubmit={submitHandler} {...props} className={props.className}>
         {children}
      </form>
   );
});

Form.propTypes = {
   validate: PropTypes.bool,           // True to force validation.
   reportInvalid: PropTypes.bool,      // True to report when invalid. Can prevent reporting if needed.
   onValid: PropTypes.func,            // Callback when the form is valid.
   onSubmit: PropTypes.func,           // Submit callback to submit the form inputs.
   customValidity: PropTypes.func,     // A validity check from the parent component.
};

Form.defaultProps = {
   validate: false,
   reportInvalid: true,
};

export default Form;