/* eslint-disable no-use-before-define */
import {map} from 'lodash';
import {isObjectLike} from 'lodash';
import {Fragment} from 'react';
import React from 'react';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import ValidateTarget from '../fhg/components/ValidateTarget';
import {useEffect} from 'react';
import {renderOptionsKey} from '../fhg/utils/Utils';
import TextFieldFHG from './TextField';
import find from 'lodash/find';

const filter = createFilterOptions();
// const filter = createFilterOptions({
//    // matchFrom: 'start',
//    stringify: option => option.name,
// });

export default function AutocompleteLF2({
   labelKey,
   labelTemplate,
   name,
   editName,
   options,
   value,
   optionKey = 'name',
   valueKey = 'id',
   defaultValue,
   onChange,
   autoComplete = true,
   freeSolo = true,
   required,
   variant = 'outlined',
   fullWidth = true,
   multiple,
   ...autocompleteOptions
}) {
   const useLabelKey = labelTemplate?.format({name}) || labelKey;
   const valueObject = !valueKey ? value : find(options, {[valueKey]: value});
   const [valueLocal, setValueLocal] = React.useState(valueObject);

   // useEffect(() => {
   //  setValueLocal(valueObject);
   // }, [valueObject]);

   useEffect(() => {
      if (typeof value === 'string' && options?.length > 0 && isObjectLike(options[0])) {
         const valueObject = find(options, {[valueKey]: value});
         if (valueObject) {
            setValueLocal(valueObject);
         }
      }
   }, [value, options, valueKey]);

   useEffect(() => {
      if (options?.length > 0 && isObjectLike(options[0])) {
         if (multiple) {
            if (value?.length > 0 && typeof value[0] === 'string') {
               const valueObjectList = map(value, value => find(options, {[valueKey]: value}));
               setValueLocal(valueObjectList);
            }
         } else if (typeof defaultValue === 'string') {
            const valueObject = find(options, {[valueKey]: defaultValue});
            if (valueObject) {
               setValueLocal(valueObject);
            } else {
            }
         }
      }
   }, [defaultValue, valueKey, options, multiple, value]);

   const handleChange = (event, newValue, reason) => {
      if (reason === 'create-option') {
         // User created a new option by typing and pressed enter.
         setValueLocal({name: newValue});
         onChange(event, undefined, undefined, {[editName]: newValue, [name]: null});
      } else if (reason === 'clear') {
         // User cleared the input completely.
         setValueLocal(newValue);
         onChange(event, undefined, undefined, {[editName]: newValue, [name]: newValue});
      } else if (newValue && newValue.inputValue) {
         // Create a new option from the user typed input. User selected "Add [input]" from menu.
         setValueLocal({name: newValue.inputValue});
         onChange(event, undefined, undefined, {[editName]: newValue.inputValue, [name]: null});
      } else {
         setValueLocal(newValue);
         if (typeof newValue === 'string') {
            onChange(event, undefined, undefined, {[editName]: null, [name]: newValue});
         } else {
            onChange(event, undefined, undefined, {[editName]: null, [name]: newValue[valueKey]});
         }
      }
   };

   return (
      <Fragment>
         <Autocomplete
            key={'autocomplete' + defaultValue + '' + options?.length}
            {...autocompleteOptions}
            name={name}
            value={valueLocal || (multiple && []) || ''}
            onChange={handleChange}
            filterOptions={!multiple ? (options, params) => {
               const filtered = filter(options, params);

               // Suggest the creation of a new value
               if (params.inputValue !== '') {
                  filtered.push({
                     inputValue: params.inputValue,
                     name: `Add "${params.inputValue}"`,
                  });
               }

               return filtered;
            } : undefined}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            options={options}
            getOptionLabel={multiple ? option => option.name : (option) => {
               // Value selected with enter, right from the input
               if (typeof option === 'string') {
                  return option;
               }
               // Add "xxx" option created dynamically
               if (option.inputValue) {
                  return option.inputValue;
               }
               // Regular option
               return option.name || 'N/A';
            }}
            renderOption={!multiple ? renderOptionsKey(optionKey) : undefined}
            // style={{ width: 300 }}
            freeSolo={freeSolo}
            renderInput={(params) => {
               return (
                  <TextFieldFHG {...params} key={'autoCompleteTextKey' + name} name={'autoCompleteText' + name}
                                labelKey={useLabelKey} required={required} variant={variant} fullWidth={fullWidth}/>
               )
            }}
            fullWidth={fullWidth}
         />
         {required &&
         <ValidateTarget name={'validate ' + name} value={valueLocal !== undefined ? valueLocal : defaultValue}/>}
      </Fragment>
   );
}
