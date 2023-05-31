import without from 'lodash/without';
import {useMemo} from 'react';
import {useCallback} from 'react';
import {atom, useRecoilState} from 'recoil';

export const progressState = atom({
   key: 'progressState',
   default: false,
});
export const progressGlobal = atom({
   key: 'progressGlobal',
   default: true,
});

let progressList = [];

/**
 * Hook to call onClose when escape is pressed, and onSubmit when the enter key is pressed.
 */
export default function useProgress(uniqueId) {

   const [progressValue, setProgressState] = useRecoilState(progressState);

   const setProgress = useCallback((progress) => {
      if (progress) {
         if (progressList.indexOf(uniqueId) < 0 ) {
            const newProgress = progressList.push(uniqueId) > 0;
            setProgressState(newProgress);
         }
      } else if (progressList?.length > 0) {
         const list = without(progressList, uniqueId);
         if (progressList?.length !== list.length) {
            const newProgress = list.length > 0;
            progressList = list;
            setProgressState(newProgress);
         }
      }
   }, [setProgressState, uniqueId]);

   return useMemo(() => [progressValue, setProgress], [setProgress, progressValue]);
}
