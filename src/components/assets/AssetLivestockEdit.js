import {Radio} from '@material-ui/core';
import {FormControlLabel} from '@material-ui/core';
import {RadioGroup} from '@material-ui/core';
import {Collapse} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import useTheme from '@material-ui/core/styles/useTheme';
import React from 'react';
import {FormattedNumber} from 'react-intl';
import TypographyFHG from '../../fhg/components/Typography';
import {useEffect} from 'react';
import TextFieldLF from '../TextFieldLF';
import defer from 'lodash/defer';

const CALCULATE = 'calculate';
const ENTER = 'enter';

export default function AssetLivestockEdit({open, onChange, isSaving, defaultValues, setEditValues, getValue}) {
   const theme = useTheme();

   const [value, setValue] = React.useState(ENTER);
   const [valueInit, setValueInit] = React.useState(false);

   useEffect(() => {
      if (!valueInit && getValue('price')) {
         setValue(CALCULATE);
         setValueInit(true);
      }
   }, [getValue, valueInit]);

   const handleChange = (event) => {
      setValue(event.target.value);
   };

   const handleEnterChange = (event) => {
      onChange(event);
      defer(() => {
         setEditValues(editValues => ({...editValues, head: null, weight: null, price: null}));
      })
   };

   const amount = getValue('head', 0) * getValue('weight', 0) * getValue('price', 0);

   return (
      <Collapse id='datesId' in={open} timeout='auto' unmountOnExit style={{width: '100%'}}>
         <FormControl component='fieldset'>
            <RadioGroup aria-label='calculate' name='calculateGroup' value={value} onChange={handleChange}>
               <FormControlLabel value='enter' control={<Radio color={'primary'}/>}
                                 style={{color: theme.palette.primary.main}} label='Enter Amount'/>
               <Collapse in={value === ENTER}>
                  <TextFieldLF
                     key={'amount' + defaultValues?.id}
                     internalKey={'amount' + defaultValues?.id}
                     isFormattedNumber
                     name={'amount'}
                     labelTemplate={'asset.{name}.label'}
                     onChange={handleEnterChange}
                     value={getValue('amount')}
                     disabled={isSaving || value !== ENTER}
                     inputProps={{prefix: '$'}}
                     required={value === ENTER}
                  />
               </Collapse>
               <FormControlLabel value='calculate' control={<Radio color={'primary'}/>}
                                 style={{color: theme.palette.primary.main}} label='Calculate Amount'/>
               <Collapse in={value === CALCULATE}>
                  <TextFieldLF
                     key={'head' + defaultValues?.id + value}
                     internalKey={'head' + defaultValues?.id}
                     isFormattedNumber
                     name={'head'}
                     labelTemplate={'asset.{name}.label'}
                     onChange={onChange}
                     value={value === CALCULATE && getValue('head')}
                     disabled={isSaving || value !== CALCULATE}
                     required={value === CALCULATE}
                  />
                  <TextFieldLF
                     key={'weight' + defaultValues?.id + value}
                     internalKey={'weight' + defaultValues?.id}
                     isFormattedNumber
                     name={'weight'}
                     labelTemplate={'asset.{name}.label'}
                     onChange={onChange}
                     value={value === CALCULATE && getValue('weight')}
                     disabled={isSaving || value !== CALCULATE}
                     required={value === CALCULATE}
                  />
                  <TextFieldLF
                     key={'price' + defaultValues?.id + value}
                     internalKey={'price' + defaultValues?.id}
                     isFormattedNumber
                     name={'price'}
                     labelTemplate={'asset.{name}.label'}
                     onChange={onChange}
                     value={value === CALCULATE && getValue('price')}
                     disabled={isSaving || value !== CALCULATE}
                     required={value === CALCULATE}
                     inputProps={{prefix: '$'}}
                  />
                  <TypographyFHG key={'amount' + defaultValues?.id + value} variant={'body1'}>
                     Amount: $
                     <FormattedNumber key={'amount formatted' + amount} value={amount}/>
                  </TypographyFHG>
               </Collapse>
            </RadioGroup>
         </FormControl>
      </Collapse>
   );
}
