import PropTypes from 'prop-types';
import React from 'react';
import NumberFormat from 'react-number-format';
import set from 'lodash/set';

function NumberFormatCustom(props) {
   const {inputRef, onChange, value, defaultValue, ...other} = props;

   const handleChange = (values, {source}) => {
      if (source === 'event') {
         const target = {
            type: 'react-number-format',
            name: props.name,
            value: values.value,
            valueAsNumber: values.floatValue,
         };
         if (props['data-index'] !== undefined) {
            set(target, 'dataset.index', props['data-index']);
         }
         onChange && onChange({target});
      }
   };

   return (
      <NumberFormat
         {...other}
         defaultValue={defaultValue}
         value={value === '' ? null : value}
         getInputRef={inputRef}
         onValueChange={handleChange}
         thousandSeparator
      />
   );
}

NumberFormatCustom.propTypes = {
   inputRef: PropTypes.func,
   onChange: PropTypes.func.isRequired,
};

export default NumberFormatCustom;
