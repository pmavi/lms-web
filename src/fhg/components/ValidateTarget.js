import React from 'react';

/**
 * The component used as a placeholder for not implemented components.
 *
 * Reviewed: 6/22/20
 */
export default function ValidateTarget({name, top, value}) {
   return (
      <input
         aria-invalid='false'
         id={name}
         name='confirm'
         type='text'
         required
         value={value || ''}
         readOnly
         style={{
            display: 'block',
            width: 1,
            height: 1,
            padding: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative',
            border: 'none',
            top,
            zIndex: -1,
            outline: 'unset',
         }}
      />
   );
}
