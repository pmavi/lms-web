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
import {CASH_CONTRACT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {CASH_CONTRACT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACT_DELETE} from '../../../data/QueriesGL';
import {getCashContractRefetchQueries} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
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
 * Component to edit cash contracts.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function CashContract() {
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

   const [contractCreateUpdate] = useMutationFHG(CASH_CONTRACT_CREATE_UPDATE);
   const [contractDelete] = useMutationFHG(CASH_CONTRACT_DELETE);

   const editData = useEditData(undefined, ['contractId']);
   const [editValues, handleChange, {resetValues, getValue, defaultValues}] = editData;

   const [isDisabled, setIsDisabled] = useState(false);

   const [contractData] = useQueryFHG(
      CASH_CONTRACT_BY_ID_QUERY,
      {
         variables: {contractId, historyDate},
         skip: !contractId,
      },
      'contract.type',
      false
   );
   const contract = contractData?.contract;

   // A new cashContract or defaults for updating the cache for fields not entered.
   const cacheEditItem = useMemo(
      () => ({
         id: 0,
         contractId: uuid(),
         bushelsSold: 0,
         contractNumber: '',
         crop: '',
         date: moment(),
         deliveryLocation: '',
         deliveryMonth: moment(),
         description: '',
         entityId,
         historyDate,
         isDeleted: false,
         isDelivered: false,
         isHistorical: false,
         isNew: false,
         isRemoved: false,
         price: 0,
         removedDate: undefined,
         snapshotDate: null,
         startDate: historyDate,
      }),
      [entityId, historyDate]
   );

   /**
    * Listen for a new cash contract to reset to the new values.
    */
   useEffect(() => {
      if (isNew) {
         resetValues({...cacheEditItem});
      }
   }, [cacheEditItem, entityId, isNew, resetValues, historyDate]);

   /**
    * Listen for a change to the contract and reset the default values for that contract.
    */
   useEffect(() => {
      if (contract) {
         resetValues({
            ...contract,
            deliveryMonth: moment(contract?.deliveryMonth, 'M'),
            historyDate,
         });
      }
   }, [contract, historyDate, resetValues]);

   /**
    * Submit the cash contract changes to the server.
    *
    * NOTE: The generic fields are handled by ContractEdit.
    *
    * @param variables The generic fields updated by ContractEdit.
    * @returns {Promise<void>}
    */
   const handleSubmit = async (variables) => {
      try {
         setIsDisabled(true);

         if (variables?.deliveryMonth) {
            variables.deliveryMonth = +variables?.deliveryMonth.format('M');
         } else if (isNew) {
            variables.deliveryMonth = +moment().format('M');
         }

         // Create the cash contract for the cache.
         const contract = assign(
            {id: defaultValues?.id, __typename: 'CashContract'},
            variables,
            defaultValues,
            cacheEditItem
         );

         await contractCreateUpdate({
            variables,
            optimisticResponse: {__typename: 'Mutation', cashContract: contract},
            update: cacheUpdate(getCashContractRefetchQueries(entityId, historyDate), contract?.id, 'cashContract'),
         });
      } catch (e) {
         console.log(e);
         setIsDisabled(false);
      }
   };

   /**
    * Delete the cash contract.
    * @returns {Promise<void>}
    */
   const handleDelete = async () => {
      try {
         setIsDisabled(true);

         await contractDelete({
            variables: {contractId},
            optimisticResponse: {cashContract_Delete: 1},
            update: cacheDelete(getCashContractRefetchQueries(entityId, historyDate), contract?.id),
         });
      } catch (e) {
         console.log(e);
      } finally {
         setIsDisabled(false);
      }
   };

   return (
      <ContractEdit titleId={'contract.cash.label'} editData={editData} onSubmit={handleSubmit} onDelete={handleDelete}>
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
         <CheckboxFHG
            name={'isNew'}
            onChange={handleChange}
            color={'default'}
            labelKey={'contract.isNew.label'}
            value={'isNew'}
            defaultChecked={defaultValues.isNew}
            checked={editValues.isNew}
            disabled={isDisabled}
            marginTop={0}
            fullWidth
         />
         <TextFieldLF
            name={'bushelsSold'}
            isFormattedNumber
            labelTemplate={'contract.bushelsSold.label'}
            onChange={handleChange}
            value={getValue('bushelsSold')}
            disabled={isDisabled}
            required
         />
         <TextFieldLF
            name={'price'}
            isFormattedNumber
            labelTemplate={'contract.price.label'}
            onChange={handleChange}
            value={getValue('price')}
            inputProps={{prefix: '$'}}
            disabled={isDisabled}
            required
         />
         <KeyboardDatePickerFHG
            key={'deliveryMonth' + defaultValues.id}
            name={'deliveryMonth'}
            views={['month']}
            format={'MMMM'}
            minDate={moment(date).startOf('year')}
            labelKey={'contract.deliveryMonth.label'}
            value={getValue('deliveryMonth')}
            onChange={handleChange}
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
         <CheckboxFHG
            name={'isDelivered'}
            onChange={handleChange}
            color={'default'}
            labelKey={'contract.isDelivered.label'}
            value={'isDelivered'}
            defaultChecked={defaultValues.isDelivered}
            checked={editValues.isDelivered}
            disabled={isDisabled}
            marginTop={0}
            fullWidth
         />
      </ContractEdit>
   );
}
