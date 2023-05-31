import {Radio} from '@material-ui/core';
import {FormControlLabel} from '@material-ui/core';
import {RadioGroup} from '@material-ui/core';
import {Collapse} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import useTheme from '@material-ui/core/styles/useTheme';
import React from 'react';
import {FormattedNumber} from 'react-intl';
import {useLocation} from 'react-router-dom';
import TypographyFHG from '../../fhg/components/Typography';
import {useEffect} from 'react';
import TextFieldLF from '../TextFieldLF';
import defer from 'lodash/defer';

const CALCULATE = 'calculate';
const ENTER = 'enter';

export default function AssetQuantityEdit({
   open,
   onChange,
   isSaving,
   defaultValues,
   setEditValues,
   getValue,
   labelKey = 'asset.acres.label',
   valueKey = 'acres',
}) {
   const theme = useTheme();
   const location = useLocation();
   const isNew = !location?.state?.id;

   const [value, setValue] = React.useState();
   const [valueInit, setValueInit] = React.useState(false);

   useEffect(() => {
      if (!valueInit) {
         if (isNew) {
            setValue(ENTER);
            setValueInit(true);
         } else if (getValue('price') !== undefined || getValue('amount') !== undefined) {
            if (getValue('price')) {
               setValue(CALCULATE);
            } else {
               setValue(ENTER);
            }
            setValueInit(true);
         }
      }
   }, [isNew, valueInit, getValue]);

   const handleChange = (event) => {
      setValue(event.target.value);
   };

   const handleEnterChange = (event) => {
      onChange(event);
      defer(() => {
         setEditValues(editValues => ({...editValues, price: null, [valueKey]: null}));
      })
   };

   const total = getValue(valueKey, 0) * getValue('price', 0);
   return (
      <Collapse id='datesId' in={open} timeout='auto' unmountOnExit style={{width: '100%'}}>
         <FormControl component='fieldset'>
            <RadioGroup key={'radioGroup' + valueInit} aria-label='calculate' name='calculateGroup' value={value}
                        onChange={handleChange}>
               <FormControlLabel value={ENTER} control={<Radio color={'primary'}/>}
                                 style={{color: theme.palette.primary.main}} label='Enter Amount'/>
               <Collapse in={value === ENTER}>
                  <TextFieldLF
                     key={'amount' + defaultValues?.id}
                     internalKey={'amount' + defaultValues?.id}
                     isFormattedNumber
                     name={'amount'}
                     labelTemplate={'asset.{name}.label'}
                     onChange={handleEnterChange}
                     value={value === ENTER && getValue('amount')}
                     disabled={isSaving || value !== ENTER}
                     required={value === ENTER}
                     inputProps={{prefix: '$'}}
                  />
               </Collapse>
               <FormControlLabel value={CALCULATE} control={<Radio color={'primary'}/>}
                                 style={{color: theme.palette.primary.main}} label='Calculate Amount'/>
               <Collapse in={value === CALCULATE}>
                  <TextFieldLF
                     key={valueKey + defaultValues?.id + value}
                     internalKey={valueKey + defaultValues?.id}
                     isFormattedNumber
                     name={valueKey}
                     labelKey={labelKey}
                     onChange={onChange}
                     value={getValue(valueKey)}
                     disabled={isSaving || value !== CALCULATE}
                     required={value === CALCULATE}
                  />
                  <TextFieldLF
                     key={'price' + defaultValues?.id + value}
                     internalKey={'price' + defaultValues?.id}
                     isFormattedNumber
                     name={'price'}
                     labelKey={'asset.price.label'}
                     onChange={onChange}
                     value={getValue('price')}
                     disabled={isSaving || value !== CALCULATE}
                     inputProps={{prefix: '$'}}
                     required={value === CALCULATE}
                  />
                  <TypographyFHG variant={'body1'}>
                     Amount: $
                     <FormattedNumber value={total}/>
                  </TypographyFHG>
               </Collapse>
            </RadioGroup>
         </FormControl>
      </Collapse>
   );
}
