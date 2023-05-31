import {useRef} from 'react';
import React from 'react';

const MAX_COUNT = 30;
const MAX_TIME = 200;

/**
 * Hook to call onClose when escape is pressed, and onSubmit when the enter key is pressed.
 */
function useEffect(effect, deps) {
   const testRef = useRef({count: 0, lastTime: 0}).current;

   React.useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
         let useTime = testRef.lastTime;
         testRef.lastTime = Date.now();

         if (Date.now() - useTime > MAX_TIME) {
            testRef.count = 0;
         }
         testRef.count += 1;
         if (testRef.count >= MAX_COUNT) {
            console.log(Date.now() - useTime);
            debugger;
            console.log(`Exceeded count for UseEffect.`);
            console.log(effect);
            testRef.count = 0;
         }
      } else {
         console.log('Remove TestEffect for production systems.');
      }
      return effect();
      // eslint-disable-next-line
   }, deps);
}

export default useEffect;
