import {useMutation} from '@apollo/client';
import uniqueId from 'lodash/uniqueId';
import {useState, useRef} from 'react';
import {useIntl} from 'react-intl';
import {useSetRecoilState} from 'recoil';
import {errorState} from '../../../pages/Main';
import {formatMessage} from '../../utils/Utils';
import {useEffect} from 'react';
import useProgress from '../useProgress';

export const CREATE_UPDATE_ACTION = 'createUpdate';
export const DELETE_ACTION = 'delete';
export const SORT_ACTION = 'sort';
export const UNDELETE_ACTION = 'undelete';
// export const UNDELETE_ACTION = 'undelete';

/**
 * Hook for useMutation that updates the cache for add and delete queries. Update mutations should automatically update
 * cache without this update.
 *
 * NOTE:
 * 1) Assumes that the result of the mutation only has a single property. (e.g. {data: {operators: {...}}})
 * 2) Updates ONLY the FIRST property in an updateQuery. The first property is assumed to be a list and adds the result
 *    property to the list. Other properties in the original query are copied to the updated cache item.
 *
 * Reviewed:
 *
 * @param mutation The graphql mutation.
 *    typeKey - The localization key for the type of the object
 *    actionType - The localization key for the action type (e.g. create, update, delete).
 * @param options The options for the mutation.
 * @param showLoading Indicates if the progress should be shown.
 * @return
 */
export default function useMutationFHG(mutation, options, showLoading) {
   const theUniqueId = useRef(uniqueId()).current;
   const intl = useIntl();
   const [, /*Unused*/ setProgress] = useProgress(theUniqueId);

   const setErrorState = useSetRecoilState(errorState);

   const [lastMessage, setLastMessage] = useState('');

   useEffect(() => {
      return () => {
         setProgress(false);
      };
   }, [setProgress]);

   const [mutationFunction, {loading, error, data}] = useMutation(mutation.mutation, options);

   useEffect(() => {
      if (error) {
         const type = formatMessage(intl, mutation.typeKey);
         const action = formatMessage(intl, mutation.actionKey);
         const errorMessage = formatMessage(intl, 'action.error', undefined, {type, action});

         if (errorMessage !== lastMessage) {
            console.log(error);
            setLastMessage(errorMessage);
            setErrorState({error, errorMessage, errorKey: undefined});
         }
      } else if (lastMessage !== undefined) {
         setLastMessage(undefined);
      }
   }, [error, setErrorState, lastMessage, intl, mutation.actionKey, mutation.typeKey]);

   useEffect(() => {
      if (showLoading) {
         setProgress(loading);
      }
   }, [loading, setProgress, showLoading]);

   return [mutationFunction, {loading, error, data}];
}
