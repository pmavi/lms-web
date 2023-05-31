import get from 'lodash/get';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import {useState, useEffect, useCallback} from 'react';
import {v4 as uuid} from 'uuid';
import {hasValue as hasValueUtil} from '../../utils/Utils';
import {editChange} from '../../utils/Utils';

const REQUIRED_DEFAULTS = ['id'];

export default function useEditData(
   defaultValuesProp,
   requiredEditValues = REQUIRED_DEFAULTS,
   isArrayType = false,
   onChange
) {
   const [isChanged, setIsChanged] = useState(false);
   const [defaultValues, setDefaultValues] = useState(defaultValuesProp ? defaultValuesProp : isArrayType ? [] : {});
   const [editValues, setEditValues] = useState(
      isArrayType ? [] : !isArray(requiredEditValues) ? requiredEditValues : {}
   );

   useEffect(() => {
      if (defaultValues && !isArrayType) {
         let requiredObject;

         if (isArray(requiredEditValues)) {
            requiredObject = pick(defaultValues, ['id', ...requiredEditValues]);
         } else {
            requiredObject = {...defaultValues};
         }

         setEditValues({...editValues, ...requiredObject});
      }
      //editValues and requiredEditValues cause constant changes.
      // eslint-disable-next-line
   }, [defaultValues, isArrayType]);

   /**
    * Handle onChange events for the inputs.
    *
    * NOTE:
    * Input components MUST have their name set to be set in the editValues.
    *
    * @param event The event that changed the input.
    * @param value The value if the component is an Autocomplete
    * @param reason The reason of the value change if Autocomplete
    * @param newValue The value from the component.
    * @param name the name of the component.
    */
   const handleChange = (event, value, reason, newValue, name) => {
      let useValue = newValue;

      if (isArrayType) {
         handleArrayChange(event);
      } else {
         let newEditValues;

         if (newValue) {
            newEditValues = {...editValues, ...newValue};
         } else {
            useValue = editChange(event, value, reason, true, newValue, name);
            newEditValues = {...editValues, ...useValue};
         }
         setEditValues(newEditValues);
         if (onChange) {
            let requiredObject;

            if (isArray(requiredEditValues)) {
               requiredObject = pick(defaultValues, ['id', ...requiredEditValues]);
            } else {
               requiredObject = {...defaultValues};
            }
            onChange?.({...requiredObject, ...useValue}, newEditValues);
         }

         if (reason !== 'reset') {
            setIsChanged(true);
         }
      }
      return useValue;
   };

   const handleArrayChange = (event) => {
      const index = get(event, 'target.dataset.index');
      const {componentName, newValue} = editChange(event, undefined, undefined, false);

      const edit = editValues[index];
      if (!edit) {
         let requiredValues = {};
         // Is there a default at each index?
         if (isArray(defaultValues)) {
            const defaultValue = get(defaultValues, `[${index}]`);
            if (defaultValue) {
               if (isArray(requiredEditValues)) {
                  requiredValues = pick(defaultValue, requiredEditValues);
               } else {
                  requiredValues = {uuid: defaultValue, id: defaultValue.id};
               }
            }
            //Is there a generic default?
         } else if (defaultValues) {
            if (isArray(requiredEditValues)) {
               requiredValues = pick(defaultValues, requiredEditValues);
               requiredValues.uuid = uuid();
            } else {
               requiredValues = {uuid: uuid(), id: defaultValues.id};
            }
         }
         editValues[index] = {[componentName]: newValue, ...requiredValues};
      } else {
         editValues[index] = {...edit, [componentName]: newValue};
      }
      setEditValues([...editValues]);
      setIsChanged(true);
   };

   const resetValues = useCallback(
      (defaultValuesLocal) => {
         let requiredObject;
         const useDefaultValues = defaultValuesLocal || defaultValuesProp || (isArrayType ? [] : {});

         if (isArray(requiredEditValues)) {
            requiredObject = pick(useDefaultValues, ['id', ...requiredEditValues]);
         } else {
            requiredObject = {...useDefaultValues};
         }

         setEditValues({...requiredObject});
         setDefaultValues(useDefaultValues);
         setIsChanged(false);
      },
      [isArrayType]
   );

   const handleSelectChange = (value, name) => {
      setEditValues((editValues) => ({...editValues, [name]: value}));
      setIsChanged(true);
   };

   /**
    * Get the current value for the named property. If the value has been edited, it will return the edited value even
    * if it is null, and it will return the default value if not edited. If there is no default value, the default
    * value from the parameter is used.
    *
    * @Param path The path to the property
    * @Param defaultValue The default value to use if there isn't an edit or default value already.
    *
    * @type {function(*, *=): *}
    */
   const getValue = useCallback(
      (path, defaultValue = '') => {
         const editValue = get(editValues, path);
         return editValue !== undefined ? editValue : get(defaultValues, path) || defaultValue;
      },
      [editValues, defaultValues]
   );

   /**
    * Get the current value for the named property. If the value has been edited, it will return the edited value even
    * if it is null, and it will return the default value if not edited. If there is no default value, the default
    * value from the parameter is used.
    *
    * @Param path The path to the property
    * @Param defaultValue The default value to use if there isn't an edit or default value already.
    *
    * @type {function(*, *=): *}
    */
   const setValue = useCallback(
      (path, value, isChanged = false) => {
         const newEditValues = {...editValues, [path]: value};

         setEditValues((editValues) => ({...editValues, [path]: value}));

         if (isChanged) {
            setIsChanged(true);
         }

         if (onChange) {
            let requiredObject;

            if (isArray(requiredEditValues)) {
               requiredObject = pick(defaultValues, ['id', ...requiredEditValues]);
            } else {
               requiredObject = {...defaultValues};
            }
            onChange?.({...requiredObject, ...newEditValues}, newEditValues);
         }
      },
      [editValues, defaultValues]
   );

   /**
    * Indicates if there is a value set for the property. If the default value is deleted, false will be returned even
    * though there is a defaultValue.
    *
    * @Param name The name of the property
    * @type {function(*=, *=): boolean}
    */
   const hasValue = useCallback(
      (name) => {
         return hasValueUtil(getValue(name));
      },
      [getValue]
   );

   return [
      editValues,
      handleChange,
      {
         handleSelectChange,
         isChanged,
         setIsChanged,
         setEditValues,
         defaultValues,
         setDefaultValues,
         resetValues,
         getValue,
         setValue,
         hasValue,
      },
   ];
}
