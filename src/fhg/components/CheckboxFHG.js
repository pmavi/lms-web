import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import * as PropTypes from 'prop-types';
import React, {useState} from 'react';
import TypographyFHG from './Typography';

const useStyles = makeStyles(theme => ({
   checkboxStyle: props => ({
      marginLeft: props.marginLeft !== undefined ? theme.spacing(props.marginLeft) : theme.spacing(-1),
      marginTop: props.marginTop !== undefined ? theme.spacing(props.marginTop) : theme.spacing(2),
      width: props.fullWidth ? '100%' : undefined,
   }),
}), "CheckboxStyles");

CheckboxFHG.propTypes = {
   name: PropTypes.string.isRequired,
   checked: PropTypes.bool,
   labelKey: PropTypes.string,
   defaultChecked: PropTypes.bool,
   onChange: PropTypes.func,
   label: PropTypes.string,
   ...Checkbox.propTypes,
}

/**
 * The Checkbox with preset formats.
 */
export default function CheckboxFHG({name, checked, labelKey, defaultChecked, onChange, label, classes:classesProp={}, fullWidth, marginTop, marginLeft, ...checkboxProps}) {
   const classes = {...useStyles({fullWidth, marginTop, marginLeft}), ...classesProp};

   const [isSet, setIsSet] = useState(checked !== undefined && checked !== null);

   const handleChange = (event) => {
      setIsSet(true);
      onChange && onChange(event);
   };

   return (
      <FormControlLabel
         className={classes.checkboxStyle}
         control={
            <Checkbox
               name={name}
               checked={isSet ? checked : defaultChecked || false}
               onChange={handleChange}
               {...checkboxProps}
            />
         }
         label={<TypographyFHG id={labelKey}>{label}</TypographyFHG>}
      />
   );
}
