// eslint-disable-next-line
import Button, {ButtonProps} from '@material-ui/core/Button';
import * as PropTypes from 'prop-types';
import React from 'react';
import TypographyFHG from './Typography';

/**
 *
 * @param labelKey {string}
 * @param buttonProps {ButtonProps}
 * @return {JSX.Element}
 * @constructor
 */
ButtonFHG.propTypes = {
   labelKey: PropTypes.string,
}
export default function ButtonFHG({labelKey, ...buttonProps}) {
   return <Button {...buttonProps}>
      <TypographyFHG variant={'inherit'} id={labelKey}/>
   </Button>;
}

