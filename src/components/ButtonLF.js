import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import ButtonFHG from '../fhg/components/ButtonFHG';

const useStyles = makeStyles({
   buttonStyle: {
      textDecoration: 'underline',
      '&:hover': {
         textDecoration: 'underline',
      },
   },
}, {name: 'ButtonLFStyles'});

ButtonLF.propTypes = {

};

export default function ButtonLF({labelKey, children, ...buttonProps}) {
   const classes = useStyles();

   return (
      <ButtonFHG labelKey={labelKey} color='primary' size='large' className={classes.buttonStyle} {...buttonProps}/>
   );
}
