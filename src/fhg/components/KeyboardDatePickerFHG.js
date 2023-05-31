import makeStyles from '@material-ui/core/styles/makeStyles';
import {KeyboardDatePicker as KeyboardDatePickerOriginal} from '@material-ui/pickers';
import React, {useState, useMemo, Fragment} from 'react';
import {useIntl} from 'react-intl';
import TextFieldFHG from '../../components/TextField';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {formatMessage} from '../utils/Utils';
import ValidateTarget from './ValidateTarget';

const useStyles = makeStyles((theme) => ({
   buttonPadding: {
      '& button': {
         padding: theme.spacing(0.5),
      },
      '& > div': {
         paddingRight: 0,
      },
      '& > div > div': {
         marginLeft: 0,
      },
      '& input > div': {
         marginLeft: 0,
      },
   },
}));

/**
 * The TextField with preset formats.
 */
export default function KeyboardDatePickerFHG({
   name,
   className,
   label,
   labelKey,
   disableToolbar = false,
   format = DATE_FORMAT_KEYBOARD,
   autoOk = true,
   onChange,
   value,
   defaultValue,
   getValue,
   variant = 'inline',
   InputAdornmentProps = {position: 'start'},
   required,
   ...keyboardDatePickerProps
}) {
   const classes = useStyles();
   const intl = useIntl();
   const [isSet, setIsSet] = useState(value !== undefined && value !== null && value !== '');

   return useMemo(() => {
      const currentLabel = label || (labelKey && formatMessage(intl, labelKey)) || undefined;
      const handleChange = (moment) => {
         setIsSet(true);
         onChange && onChange({target: {name}}, moment, 'date-picker');
      };

      const useValue = getValue ? getValue(name, defaultValue) : isSet || value !== undefined ? value : defaultValue;

      return (
         <Fragment>
            <KeyboardDatePickerOriginal
               name={name}
               className={`${classes.buttonPadding} ${className}`}
               disableToolbar={disableToolbar}
               format={format}
               autoOk={autoOk}
               // disableFuture={true}
               label={currentLabel}
               onChange={handleChange}
               value={useValue}
               variant={variant}
               InputAdornmentProps={InputAdornmentProps}
               TextFieldComponent={TextFieldFHG}
               required={required}
               {...keyboardDatePickerProps}
            />
            {required && <ValidateTarget name={'validate ' + name} value={isSet ? value : defaultValue} />}
         </Fragment>
      );
   }, [
      label,
      labelKey,
      intl,
      getValue,
      name,
      defaultValue,
      isSet,
      value,
      classes.buttonPadding,
      className,
      disableToolbar,
      format,
      autoOk,
      variant,
      InputAdornmentProps,
      required,
      keyboardDatePickerProps,
      onChange,
   ]);
}
