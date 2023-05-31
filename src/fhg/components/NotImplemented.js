import React from 'react';
import {useLocation} from 'react-router-dom';

/**
 * The component used as a placeholder for not implemented components.
 *
 * Reviewed: 3/26/20
 */
export default function NotImplemented({title = ''}) {
   const location = useLocation();

   return (
      <div style={{padding:16}}>
         <div style={{fontSize: 20}}>{title} - Not Implemented</div>
         <div style={{fontSize: 14}}>{location.pathname}</div>
      </div>
   );
}
