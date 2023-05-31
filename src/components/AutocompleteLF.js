import React from 'react';
import AutocompleteFHG from '../fhg/components/edit/AutocompleteFHG';

// AutocompleteLF.propTypes = {
//    isOptionObjects: PropTypes.bool,
//    labelKey: PropTypes.string,
//    optionObjects: PropTypes.array,
//    optionKey: PropTypes.string,
//    ...Autocomplete.propTypes,
// }

/**
 * The Autocomplete with preset formats.
 */
export default function AutocompleteLF({name, editData, labelTemplate, labelKey, ...otherProps}) {
   const useLabelKey = labelTemplate?.format({name}) || labelKey;

   return (
      <AutocompleteFHG
         name={name}
         labelKey={useLabelKey}
         defaultValue={editData?.defaultValue?.[name]}
         value={editData?.value?.[name]}
         onChange={editData?.handleChange}
         {...otherProps}
      />
   );
}


