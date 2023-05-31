import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, FormattedNumber} from 'react-intl';
import Grid from './Grid';

/**
 * The Typography component that supports intl. The default value is the child element. The id is the lookup value for
 * the locale file.
 *
 * Example:
 * <Typography id='path.suppliers' variant='button'>Suppliers</Typography>
 *
 * Reviewed:
 */
const TypographyFHG = ({id, children, values, type = 'text', hasBold, intlProps, hasLineBreaks, ...otherProps}) => {
   if (values && (hasBold || values.hasBold)) {
      values.b = (...chunks) => <b>{chunks}</b>;
   }

   function linesToParagraphs(nodes) {
      return nodes
         .map((node) =>
            typeof node === 'string' ? node.split('\n').map((text, index) => <p key={index}>{text}</p>) : node
         )
         .reduce((nodes, node) => nodes.concat(node), []);
   }

   if (id) {
      if (type === 'number') {
         return (
            <Typography id={id} {...otherProps}>
               <FormattedNumber id={id} defaultMessage={children} values={values} {...intlProps} />
            </Typography>
         );
      }
      return (
         <Typography id={id} {...otherProps}>
            {children ? (
               <Grid container alignItems={'center'} resizable={false} justify={'center'}>
                  <Grid item>
                     <FormattedMessage id={id} defaultMessage={children} values={values} {...intlProps}>
                        {hasLineBreaks ? linesToParagraphs : undefined}
                     </FormattedMessage>
                  </Grid>
                  <Grid item>{children}</Grid>
               </Grid>
            ) : (
               <FormattedMessage id={id} defaultMessage={children} values={values} {...intlProps}>
                  {hasLineBreaks ? linesToParagraphs : undefined}
               </FormattedMessage>
            )}
         </Typography>
      );
   } else {
      return <Typography {...otherProps}>{children}</Typography>;
   }
};

// noinspection JSUnresolvedVariable
TypographyFHG.propTypes = {
   id: PropTypes.string, // Key to message in the localization file.
   values: PropTypes.object, // Values to use to fill parameters in the localized message.
   ...Typography.propTypes, // Supports all the properties from Typography.
};

TypographyFHG.defaultProps = {
   variant: 'inherit',
};
TypographyFHG.displayName = 'TypographyFHG';

export default TypographyFHG;
