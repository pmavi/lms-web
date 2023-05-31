// import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
// import PropTypes from 'prop-types';
import {PhoneNumberField} from '../fhg/components/edit/TextMaskCustom';
import useMessage from '../fhg/hooks/useMessage';

// const useStyles = makeStyles(theme => ({}), {name: 'PhoneNumberFieldLfStyles'});

PhoneNumberFieldLF.propTypes = {

};

export default function PhoneNumberFieldLF({name, label, labelKey, labelTemplate, placeholderKey, defaultValue, value, editData, onChange, ...phoneFieldProps}) {
   // const classes = useStyles();
   const useLabelKey = labelTemplate?.format({name}) || labelKey;
   const currentLabel = useMessage(useLabelKey, label);
   const currentPlaceholder = useMessage(placeholderKey) || undefined;

   return (
      <PhoneNumberField
         {...phoneFieldProps}
         key={name}
         name={name}
         label={currentLabel}
         placeholder={currentPlaceholder}
         defaultValue={defaultValue || editData?.defaultValue?.[name]}
         value={value || editData?.value?.[name]}
         onChange={onChange || editData?.handleChange}
         // disabled={disabled}
      />
   );
}

