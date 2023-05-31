import moment from 'moment';
import {parse} from 'query-string';
import {useEffect} from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {FUTURE_CONTRACT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {FUTURE_CONTRACT_DELETE} from '../../../data/QueriesGL';
import {FUTURE_CONTRACT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {getFutureContractRefetchQueries} from '../../../data/QueriesGL';
import useEditData from '../../../fhg/components/edit/useEditData';
import KeyboardDatePickerFHG from '../../../fhg/components/KeyboardDatePickerFHG';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {assign} from '../../../fhg/utils/DataUtil';
import ContractEdit from './ContractEdit';

/**
 * Component to edit futures contracts.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function FutureContract() {
   const {entityId} = useParams();
   const location = useLocation();

   const date = sessionStorage.filterDate
      ? moment(sessionStorage.filterDate, MONTH_FORMAT)
      : location.search
      ? moment(parse(location.search)?.date)
      : moment();
   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const contractId = location?.state?.id;
   const isNew = !contractId;

   const [contractCreateUpdate] = useMutationFHG(FUTURE_CONTRACT_CREATE_UPDATE);
   const [contractDelete] = useMutationFHG(FUTURE_CONTRACT_DELETE);

   const editData = useEditData(undefined, ['contractId']);
   const [, /*editValues*/ handleChange, {resetValues, getValue, defaultValues}] = editData;

   const [isDisabled, setIsDisabled] = useState(false);

   const [contractData] = useQueryFHG(
      FUTURE_CONTRACT_BY_ID_QUERY,
      {
         variables: {contractId, historyDate},
         skip: !contractId,
      },
      'contract.type',
      false
   );
   const contract = contractData?.contract;

   // The new and cache future contract.
   const cacheEditItem = useMemo(
      () => ({
         id: 0,
         contractId: uuid(),
         bushelsSold: 0,
         cashPrice: 0,
         contractNumber: '',
         crop: '',
         date: moment(),
         deliveryLocation: '',
         description: '',
         entityId,
         estimatedBasis: 0,
         futuresPrice: 0,
         historyDate,
         isDeleted: false,
         isHistorical: false,
         isRemoved: false,
         month: moment().month(),
         note: undefined,
         removedDate: undefined,
         snapshotDate: null,
         startDate: historyDate,
         year: moment().year(),
      }),
      [entityId, historyDate]
   );

   /**
    * Listen for new and reset the values to the initial values.
    */
   useEffect(() => {
      if (isNew) {
         resetValues({...cacheEditItem});
      }
   }, [cacheEditItem, entityId, isNew, resetValues, historyDate]);

   /**
    * Listen for a contract change and reset the default values.
    */
   useEffect(() => {
      if (contract) {
         resetValues({
            ...contract,
            monthYear:
               contract?.month && contract?.year ? moment(`${contract?.month}-${contract?.year}`, 'MM-YYYY') : moment(),
            historyDate,
         });
      }
   }, [contract, historyDate, resetValues]);

   /**
    * Submit the future contract changes to the server.
    *
    * NOTE: The generic fields are handled by ContractEdit.
    *
    * @param variables The variables with the generic contract fields set.
    * @returns {Promise<void>}
    */
   const handleSubmit = async (variables) => {
      try {
         setIsDisabled(true);

         if (variables?.monthYear) {
            variables.month = variables?.monthYear.month() + 1;
            variables.year = variables?.monthYear.year();
         } else if (isNew) {
            // month is zero based.
            variables.month = moment().month() + 1;
            variables.year = moment().year();
         }

         // Create the futures contract for the cache.
         const contract = assign(
            {id: defaultValues?.id, __typename: 'FuturesContract'},
            variables,
            defaultValues,
            cacheEditItem
         );

         await contractCreateUpdate({
            variables,
            optimisticResponse: {__typename: 'Mutation', futureContract: contract},
            update: cacheUpdate(getFutureContractRefetchQueries(entityId, historyDate), contract?.id, 'futureContract'),
         });
      } catch (e) {
         console.log(e);
         setIsDisabled(false);
      }
   };

   /**
    * Delete the futures contract.
    * @returns {Promise<void>}
    */
   const handleDelete = async () => {
      try {
         setIsDisabled(true);

         await contractDelete({
            variables: {contractId},
            optimisticResponse: {futuresContract_Delete: 1},
            update: cacheDelete(getFutureContractRefetchQueries(entityId, historyDate), contract?.id),
         });
      } catch (e) {
         console.log(e);
      } finally {
         setIsDisabled(false);
      }
   };

   return (
      <ContractEdit
         titleId={'contract.future.label'}
         editData={editData}
         onSubmit={handleSubmit}
         onDelete={handleDelete}
      >
         <ProgressIndicator isGlobal={false} />
         <TextFieldLF
            name={'crop'}
            labelTemplate={'contract.crop.label'}
            onChange={handleChange}
            value={getValue('crop')}
            disabled={isDisabled}
            autoFocus
            required
         />
         <TextFieldLF
            name={'bushels'}
            isFormattedNumber
            labelTemplate={'contract.bushels.label'}
            onChange={handleChange}
            value={getValue('bushels')}
            disabled={isDisabled}
            required
         />
         <KeyboardDatePickerFHG
            key={'monthYear'}
            name={'monthYear'}
            views={['month']}
            format={MONTH_FORMAT}
            labelKey={'contract.monthYear.label'}
            value={getValue('monthYear')}
            onChange={handleChange}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'futuresPrice'}
            isFormattedNumber
            labelTemplate={'contract.futurePrice.label'}
            onChange={handleChange}
            value={getValue('futuresPrice')}
            inputProps={{prefix: '$'}}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'estimatedBasis'}
            isFormattedNumber
            labelTemplate={'contract.estimatedBasis.label'}
            onChange={handleChange}
            value={getValue('estimatedBasis')}
            inputProps={{prefix: '$'}}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'cashPrice'}
            isFormattedNumber
            labelTemplate={'contract.cashPrice.label'}
            onChange={handleChange}
            value={getValue('cashPrice')}
            inputProps={{prefix: '$'}}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'contractNumber'}
            inputProps={{
               'data-type': 'number',
            }}
            labelTemplate={'contract.contractNumber.label'}
            onChange={handleChange}
            value={getValue('contractNumber')}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'deliveryLocation'}
            labelTemplate={'contract.deliveryLocation.label'}
            onChange={handleChange}
            value={getValue('deliveryLocation')}
            disabled={isDisabled}
            required
         />
      </ContractEdit>
   );
}
