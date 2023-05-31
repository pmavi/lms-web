import {useLazyQuery} from '@apollo/client';
import uniqueId from 'lodash/uniqueId';
import {useRef} from 'react';
import {useSetRecoilState} from 'recoil';
import {errorState} from '../../../pages/Main';
import {useEffect} from 'react';
import useMessage from '../useMessage';
import useProgress from '../useProgress';

export default function useLazyQueryFHG(query, options, typeKey, showLoading) {
   const theUniqueId = useRef(uniqueId()).current;
   const [, /*Unused*/ setProgress] = useProgress(theUniqueId);
   const type = useMessage(typeKey, 'Unknown');

   const setErrorState = useSetRecoilState(errorState);

   const [queryFunction, result] = useLazyQuery(query, options);

   useEffect(() => {
      return () => {
         setProgress(false);
      };
   }, [setProgress]);

   useEffect(() => {
      if (showLoading) {
         setProgress(result?.loading);
      }
   }, [result?.loading, setProgress, showLoading]);

   useEffect(() => {
      if (result.error) {
         console.log('Error type', typeKey);
         console.log(result.error, result.error.stackTrace);
         setErrorState({error: result.error, errorKey: 'load.error', values: {type, message: result.error.message}});
      }
   }, [result?.error, setErrorState, typeKey, type]);

   return [queryFunction, result];
}
