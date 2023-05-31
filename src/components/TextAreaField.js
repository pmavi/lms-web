import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import TextField from '@material-ui/core/TextField';
import get from 'lodash/get';
import React from 'react';
import NumberFormatCustom from '../fhg/components/NumberFormat';
import useMessage from '../fhg/hooks/useMessage';
import CustomInputTextField from './CustomInputTextField';
import ThemeProvider from './ThemeProvider';

const theme = createMuiTheme({
   palette: {
      text: {
         secondary: '#707070',
         primary: '#527928',
      },
   },
});

/**
 * The TextField with preset formats.

 * @param className
 * @param name
 * @param labelKey
 * @param placeholderKey
 * @param helpKey
 * @param helperText
 * @param defaultValue
 * @param value
 * @param onChange
 * @param margin
 * @param InputLabelProps
 * @param InputProps
 * @param label
 * @param fullWidth
 * @param isFormattedNumber
 * @param variant
 * @param size
 * @param labelTemplate
 * @param editData
 * @param classesProp
 * @param internalKey
 * @param textFieldProps
 * @param placeholder The placeholder for the text component.
 * @return {JSX.Element}
 * @constructor
 */
export default function TextFieldLF({
   className,
   name,
   labelKey,
   placeholderKey,
   helpKey,
   helperText,
   defaultValue,
   value,
   onChange,
   margin = 'normal',
   InputLabelProps,
   InputProps,
   label,
   fullWidth = true,
   isFormattedNumber,
   variant = 'outlined',
   size = 'small',
   labelTemplate,
   editData,
   classes: classesProp,
   internalKey,
   placeholder,
   rows,
   hidden,
   ...textFieldProps
}) {
   const classes = {...classesProp};
   const useLabelKey = labelTemplate?.format({name}) || labelKey;
   const currentLabel = useMessage(useLabelKey, label);
   const currentPlaceholder = useMessage(placeholderKey) || placeholder;
   const helpText = useMessage(helpKey, helperText) || helperText;

   const useInputProps = {
      ...InputProps,
   };

   if (isFormattedNumber) {
      if (get(InputProps, 'inputComponent') || get(InputProps, 'inputProps.component')) {
         console.log('isFormattedNumber cannot have a different input component.', InputProps);
      }
      useInputProps.inputComponent = CustomInputTextField;
      useInputProps.inputProps =
         {...get(InputProps, 'inputProps', {}), ...(textFieldProps.inputProps || {}), component: NumberFormatCustom};
   }

   return (
      <ThemeProvider theme={theme}>
         <TextField
            {...textFieldProps}
            key={'internal' + internalKey}
            name={name}
            className={`${classes.textFieldStyle} ${className}`}
            label={currentLabel}
            placeholder={currentPlaceholder}
            helperText={helpText}
            defaultValue={defaultValue}
            value={value}
            rows={rows ? rows : 8}
            multiline={true}
            onChange={onChange}
            InputProps={useInputProps}
            InputLabelProps={{
               ...InputLabelProps,
               shrink: true,
            }}
            hidden
            variant={variant}
            size={size}
            margin={margin}
            fullWidth={fullWidth}
         />
      </ThemeProvider>
   );
}
