import TextField from '@material-ui/core/TextField';
import React from 'react';
import {useIntl} from 'react-intl';
import NumberFormatCustom from '../fhg/components/NumberFormat';
import {formatMessage} from '../fhg/utils/Utils';
import CustomInputTextField from './CustomInputTextField';
import get from 'lodash/get';

/**
 * The TextField with preset formats.
 */
export default function TextFieldFHG ({ className, name, labelKey, placeholderKey, helpKey, helperText, defaultValue, value, onChange, margin, InputLabelProps, InputProps, label, fullWidth = true, isFormattedNumber, variant = 'outlined', classes, ...textFieldProps }) {
   const intl = useIntl();
   const currentLabel = label || (labelKey && formatMessage(intl, labelKey)) || undefined;
   const currentPlaceholder = (placeholderKey && formatMessage(intl, placeholderKey)) || undefined;
   const helpText = helperText || (helpKey && formatMessage(intl, helpKey)) || undefined;

   const useInputProps = {
      // style:{marginTop: 32, backgroundColor: theme.palette.background.paper},
      ...InputProps,
   };

   if (isFormattedNumber) {
      if (get(InputProps, 'inputComponent') || get(InputProps, 'inputProps.component')) {
         console.log('isFormattedNumber cannot have a different input component.', InputProps);
      }
      useInputProps.inputComponent = CustomInputTextField;
      useInputProps.inputProps = {...get(InputProps, 'inputProps', {}), ...(textFieldProps.inputProps || {}), component: NumberFormatCustom};
   }
   return (
      <TextField
         key={name}
         name={name}
         {...textFieldProps}
         defaultValue={defaultValue}
         value={value}
         onChange={onChange}
         label={currentLabel}
         placeholder={currentPlaceholder}
         helperText={helpText}
         InputLabelProps={InputLabelProps}
         InputProps={useInputProps}
         className={className}
         variant={variant}
         size="small"
         margin={margin || 'normal'}
         fullWidth={fullWidth}
      />
   );
}
