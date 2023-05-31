import {useRef} from 'react';
import {useLayoutEffect} from 'react';

function runKeyHandler(event, keyHandlers) {
   const handler = keyHandlers[event.key];

   if (handler) {
      handler(event);
      // if event was handled prevent other side effects (e.g. page scroll)
      event.preventDefault();
   }
}

/**
 * Hook to call onClose when escape is pressed, and onSubmit when the enter key is pressed.
 * Example:
 *   {
 *       ArrowUp: ({ctrlKey, metaKey}) => {
 *         if (ctrlKey || metaKey) {
 *            handleMoveUp();
 *         }
 *       }
 *   }
 * @param active Indicates if the keydown listeners are active.
 * @param keyHandlers an object where the property is the event.key and the value is the callback for the key.
 * @param ignoreDefaultPrevented Indicates if the defaultPrevented should be ignored.
 */
export default function useKeyDownLX(active, keyHandlers, ignoreDefaultPrevented = false) {
   const keyDownRef = useRef(keyHandlers);

   keyDownRef.current = keyHandlers;

   useLayoutEffect(() => {
      if (active) {
         let handleKeyDown = (event) => {
            runKeyHandler(event, keyDownRef.current);
         };
         window.addEventListener('keydown', handleKeyDown);
         return function () {
            window.removeEventListener('keydown', handleKeyDown);
         };
      }
   }, [active]);
}
