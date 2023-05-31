import {Collapse} from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import {YEAR_FORMAT} from '../../Constants';
import KeyboardDatePickerFHG from '../../fhg/components/KeyboardDatePickerFHG';
import TextFieldLF from '../TextFieldLF';

export default function AssetYearEdit({
   open,
   onChange,
   isSaving,
   defaultValues,
   getValue,
}) {

   return (
      <Collapse id='datesId' in={open} timeout='auto' unmountOnExit style={{width: '100%'}}>
         <KeyboardDatePickerFHG
            name={'year'}
            views={['year']}
            format={YEAR_FORMAT}
            labelKey={'asset.year.label'}
            value={moment(getValue('year'), YEAR_FORMAT)}
            onChange={onChange}
            disabled={isSaving}
            fullWidth
            required
         />
         <TextFieldLF
            key={'amount' + defaultValues?.id}
            internalKey={'amount' + defaultValues?.id}
            isFormattedNumber
            name={'amount'}
            labelTemplate={'asset.{name}.label'}
            onChange={onChange}
            value={getValue('amount')}
            disabled={isSaving}
            inputProps={{prefix: '$'}}
            required
         />
      </Collapse>
   );
}
