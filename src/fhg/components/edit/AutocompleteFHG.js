import Autocomplete from '@material-ui/lab/Autocomplete';
import isObjectLike from 'lodash/isObjectLike';
import find from 'lodash/find';
import get from 'lodash/get';
import * as PropTypes from 'prop-types';
import React, {useState} from 'react';
import TextFieldFHG from '../../../components/TextField';
import {useEffect} from 'react';
import {hasValue, renderOptionsKey} from '../../utils/Utils';

AutocompleteFHG.propTypes = {
   isOptionObjects: PropTypes.bool,
   labelKey: PropTypes.string,
   optionObjects: PropTypes.array,
   optionKey: PropTypes.string,
   ...Autocomplete.propTypes,
}

/**
 * The Autocomplete with preset formats.
 */
export default function AutocompleteFHG({
   name,
   editName,
   defaultValue = null,
   value,
   autoComplete = true,
   isOptionObjects = true,
   disableClearable = true,
   options = [],
   optionKey = 'name',
   valueKey = 'id',
   labelKey,
   onChange,
   autoHighlight = true,
   selectOnFocus = true,
   autoFocus,
   required,
   placeholderKey,
   variant,
   inputProps,
   onClear,
   ...textFieldProps
}) {

   const [innerValue, setValue] = useState(isOptionObjects ? {} : undefined);
   const [isSet, setIsSet] = useState(false);

   useEffect(() => {
      if (!!value && !isSet) {
         const predicate = isObjectLike(value) ? {[valueKey]: value[valueKey]} : {[valueKey]: value};
         const newValue = find(options, predicate);
         if (newValue) {
            setValue(newValue);
         }
      }
   }, [value, options, isSet, valueKey]);

   useEffect(() => {
      let newValue;

      if (!value) {
         if (hasValue(defaultValue)) {
            if (options) {
               if (isOptionObjects) {
                  const predicate = isObjectLike(defaultValue) ? {[valueKey]: defaultValue[valueKey]} :
                     {[valueKey]: defaultValue};
                  newValue = find(options, predicate);
               } else {
                  newValue = defaultValue;
               }
               if (newValue) {
                  setValue(newValue);
               }
            }
         } else {
            setValue(null);
         }
      }
   }, [valueKey, value, defaultValue, options, isOptionObjects]);

   const getOptionLabel = option => {
      if (option && typeof option === 'string') {
         return option;
      }
      const item = isOptionObjects ? (option ? option[optionKey] || 'Untitled' : 'Untitled') : option || 'Untitled';
      if (item === undefined) {
         console.log('AutocompleteFHG item undefined');
         return 'Untitled';
      }
      return item;
   }

   const handleChange = (event, newValue, reason) => {
      setValue(newValue);
      setIsSet(true);
      if (isOptionObjects) {
         let newValueObject;

         if (reason === 'create-option' && newValue && typeof newValue === 'string') {
            newValueObject = {[editName]: newValue, [name]: undefined};
         } else if (reason === 'clear') {
            newValueObject = {[name]: newValue};
            if (editName) {
               newValueObject[editName] = undefined;
            }
         } else {
            newValueObject = {[name]: get(newValue, valueKey)};
            if (editName) {
               newValueObject[editName] = undefined;
            }
         }
         onChange && onChange(event, newValue, reason, newValueObject, name);
      } else {
         onChange && onChange(event, newValue, reason, undefined, name);
      }
   };

   const handleInputChange = (event, newValue, reason) => {
      if (reason === 'input') {
         const useValue = newValue && newValue.length > 0 ? newValue.toLowerCase() : '';
         const found = find(options, option => option[optionKey].toLowerCase() === useValue);
         const newValueObject = found ? {[name]: found[valueKey], [editName]: newValue} :
            {[editName]: newValue, [name]: null};
         setIsSet(true);

         onChange && onChange(event, newValue, reason, newValueObject, editName);
      } else if (reason === 'clear') {
         onClear?.(event, innerValue, reason);
      }
   };

   const onHighlightChange = (event, value, reason) => {
      if (reason === 'keyboard') {
         if (onChange) {
            const newValueObject = {[name]: value[valueKey]};
            // if (editName) {
            //    newValueObject[editName] = null;
            // }
            setIsSet(true);
            onChange && onChange(event, newValueObject, reason, newValueObject, name);
         }
      }
   };

   const handleGetOptionSelected = (option, value) => {
      if (value === null || value === undefined) {
         return false;
      }

      if (typeof option === 'string') {
         if (typeof value === 'object') {
            return option === value[optionKey];
         } else {
            return option === value;
         }
      } else if (typeof option === 'object') {
         if (typeof value === 'string') {
            return option[optionKey] === value;
         } else if (typeof value === 'number') {
            return option[valueKey] === value;
         } else if (typeof value === 'object') {
            return option[valueKey] === value[valueKey];
         } else {
            return option === value[optionKey];
         }
      }
   };

   return (
      <Autocomplete
         name={name}
         freeSolo={!!editName}
         options={options || []}
         autoComplete={autoComplete}
         autoHighlight={autoHighlight}
         onHighlightChange={onHighlightChange}
         selectOnFocus={selectOnFocus}
         disableClearable={disableClearable}
         getOptionLabel={textFieldProps.getOptionLabel || getOptionLabel}
         // getOptionLabel={textFieldProps.getOptionLabel || (isOptionObjects ? getOptionLabel : undefined)}
         renderOption={textFieldProps.renderOption || renderOptionsKey(optionKey)}
         // renderOption={textFieldProps.renderOption || (isOptionObjects ? renderOptionsKey(optionKey) : undefined)}
         getOptionSelected={handleGetOptionSelected}
         onChange={handleChange}
         onInputChange={!!editName ? handleInputChange : undefined}
         renderInput={(params) => (
            <TextFieldFHG {...params} key={'autoCompleteTextKey' + name} name={'autoCompleteText' + name}
                          placeholderKey={placeholderKey || labelKey} autoFocus={autoFocus}
                          labelKey={labelKey} required={required} variant={variant}
                          InputLabelProps={{style: {zIndex: 100}}}
                          InputProps={params.InputProps ? {...params.InputProps, ...inputProps} : inputProps}
            />
         )}
         {...textFieldProps}
         value={innerValue}
      />
   );
}


