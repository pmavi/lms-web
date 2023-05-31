import MaskedInput from 'react-text-mask';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '../../../components/TextField';

/**
 * The component to handle masked input (e.g. '(   )   -    ', for phone numbers).
 * @param props
 * @return {*}
 * @constructor
 */
export function TextMaskCustom(props) {
   const {inputRef, mask, showMask = true, value, ...other} = props;

   return (
      <MaskedInput
         {...other}
         ref={(ref) => {
            inputRef(ref ? ref.inputElement : null);
         }}
         mask={mask}
         value={value}
         placeholderChar={'\u2000'}
         showMask={value && showMask}
      />
   );
}

TextMaskCustom.propTypes = {
   inputRef: PropTypes.func.isRequired,
   ...MaskedInput.propTypes,
};

// Default phone mask for phone inputs.
const PHONE_MASK = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
// Default String based on the PHONE_MASK, to be used for comparison.

/**
 * The phone number input component.
 * @param props
 * @return {*}
 * @constructor
 */
export function PhoneNumberInput(props) {
   const {inputRef, showMask = true, ...other} = props;

   return <TextMaskCustom {...other} inputRef={inputRef} mask={PHONE_MASK} showMask={showMask} />;
}

PhoneNumberInput.propTypes = {
   inputRef: PropTypes.func.isRequired,
   showMask: PropTypes.bool,
   ...TextMaskCustom.propTypes,
};

/**
 * Component which is a phone number field.
 * @param props The props are the same as TextField.
 * @return {*}
 * @constructor
 */
export function PhoneNumberField(props) {
   const {value, defaultValue, ...otherProps} = props;
   return (
      <TextField
         {...otherProps}
         value={value}
         defaultValue={defaultValue}
         inputProps={{
            pattern: '\\(   \\)    -    |^\\([0-9]{3}\\) [0-9]{3}[-]?([0-9]{4})$',
            title: '(999) 999-9999 phone number',
         }}
         InputLabelProps={{shrink: !!value || !!defaultValue ? true : undefined}}
         InputProps={{
            inputComponent: PhoneNumberInput,
         }}
      />
   );
}

PhoneNumberField.propTypes = {
   ...TextField.propTypes,
};
