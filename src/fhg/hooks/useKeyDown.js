import {useLayoutEffect} from 'react';
import {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useEffect} from 'react';

useKeyDown.propTypes = {
   onClose: PropTypes.func,
   onSubmit: PropTypes.func,
};

/**
 * Hook to call onClose when escape is pressed, and onSubmit when the enter key is pressed.
 * @param onClose The callback for closing for escape key.
 * @param onSubmit The callback for submit for enter key.
 * @param ignoreDefaultPrevented Indicates if the defaultPrevented should be ignored.
 * @param onOther Callback when keys other than Enter and Escape are pressed.
 */
function useKeyDown(onClose, onSubmit, ignoreDefaultPrevented = false, onOther) {
   const handleKey = useCallback(
      (event) => {
         if (ignoreDefaultPrevented || !event.defaultPrevented) {
            if (event.key === 'Escape' && onClose) {
               event.preventDefault();
               onClose?.(event);
            } else if (event.key === 'Enter' && typeof onSubmit === 'function') {
               onSubmit?.(event);
            } else {
               onOther?.(event);
            }
         }
      },
      [ignoreDefaultPrevented, onClose, onOther, onSubmit]
   );

   /**
    * Handles keydown events for Escape and Enter.
    */
   useEffect(() => {
      console.log('add key', Date.now());
      document.addEventListener('keydown', handleKey, false);
   }, [handleKey]);

   /**
    * Cleanup the listener when this component is removed. This is needed because of a bug in react. Should be able to
    * do this from UseEffect.
    */
   useLayoutEffect(() => {
      return () => {
         console.log('remove key', Date.now());
         document.removeEventListener('keydown', handleKey, false);
      };
   }, [handleKey]);

   return [handleKey, onSubmit, onClose];
}

export default useKeyDown;
