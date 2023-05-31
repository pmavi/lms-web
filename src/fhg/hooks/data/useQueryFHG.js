import {useQuery} from '@apollo/client';
import uniqueId from 'lodash/uniqueId';
import {useMemo} from 'react';
import {useRef} from 'react';
import {useEffect} from 'react';
import {useSetRecoilState} from 'recoil';
import {errorState} from '../../../pages/Main';
import useMessage from '../useMessage';
import {progressGlobal} from '../useProgress';
import useProgress from '../useProgress';

export default function useQueryFHG(query, options, typeKey, showGlobalProgress, showLoading) {
   const theUniqueId = useRef(uniqueId()).current;
   const [, /*Unused*/ setProgress] = useProgress(theUniqueId);
   const type = useMessage(typeKey, 'Unknown');

   const setErrorState = useSetRecoilState(errorState);

   const {loading, error, data} = useQuery(query, options);
   const setProgressGlobal = useSetRecoilState(progressGlobal);

   useEffect(() => {
      setProgressGlobal(showGlobalProgress);
      return () => {
         setProgressGlobal(true);
      };
   }, [showGlobalProgress, setProgressGlobal]);

   useEffect(() => {
      return () => {
         setProgress(false);
      };
   }, [setProgress]);

   useEffect(() => {
      if (showLoading !== false) {
         setProgress(loading);
      }
   }, [loading, setProgress, showLoading]);

   useEffect(() => {
      if (error) {
         console.log('Error type', typeKey);
         console.log(error, error.stackTrace);
         setErrorState({error, errorKey: 'load.error', values: {type, message: error.message}});
      }
   }, [error, setErrorState, typeKey, type]);

   return useMemo(() => [data, {loading, error}], [data, error, loading]);
}
