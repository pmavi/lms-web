// eslint-disable-next-line
import Button, {ButtonProps} from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from './Typography';

const useStyles = makeStyles(
   (theme) => ({
      spinnerMargin: {
         marginLeft: theme.spacing(0.5),
         color: 'white',
      },
      darkSpinnerMargin: {
         marginLeft: theme.spacing(0.5),
         color: theme.palette.primary.main,
      },
   }),
   {name: 'ProgressButtonStyles'}
);

/**
 * Button Component to show progress.
 *
 * Reviewed:
 *
 * @param isProgress
 * @param labelKey
 * @param isSpinnerDark Indicates if the spinner should be dark.
 * @param children
 * @param typographyProps
 * @param buttonProperties {ButtonProps}
 * @return {JSX.Element}
 * @constructor
 */
const ProgressButton = React.forwardRef(function ProgressButton(
   {isProgress = false, labelKey, isSpinnerLight = false, children, typographyProps, ...buttonProperties},
   ref
) {
   const classes = useStyles();

   return (
      <Button {...buttonProperties} ref={ref}>
         {labelKey && <Typography variant={'inherit'} id={labelKey} {...typographyProps} />}
         {children}
         {isProgress && (
            <CircularProgress
               className={
                  buttonProperties?.classes?.spinnerMargin ||
                  (!isSpinnerLight ? classes.darkSpinnerMargin : classes.spinnerMargin)
               }
               size={15}
               thickness={2.5}
            />
         )}
      </Button>
   );
});

ProgressButton.propTypes = {
   isProgress: PropTypes.bool.isRequired, //Indicates if the progress should be showing.
   labelKey: PropTypes.string, // Localization key for the button label.
   typographyProps: PropTypes.any, // The properties for the typography component.
   ...Button.propTypes,
};

export default ProgressButton;
