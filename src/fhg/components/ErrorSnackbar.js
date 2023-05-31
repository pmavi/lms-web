import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from './Typography';

const useStyles = makeStyles(theme => ({
   errorMessage: {
      backgroundColor: `${theme.palette.error.light} !important`,
      paddingRight: theme.spacing(6),
   },
   closeButtonStyle: {
      position: 'absolute',
      right: 0,
      top: 0,
      marginLeft: 'auto',
      zIndex: 1001,
   },
}), {name: 'ErrorSnackbarStyles'});


ErrorSnackbar.propTypes = {
   open: PropTypes.bool,
   enableRefresh: PropTypes.bool,
   onClose: PropTypes.func,
   messageKey: PropTypes.string,
   message: PropTypes.string,
   values: PropTypes.object,
};

/**
 * Component to show the error messages.
 *
 * Note:
 *    Message is the default property in values.
 *
 * Reviewed:
 *
 * @param open Indicates if the Error snackbar should be shown to the user.
 * @param onClose Callback when the snackbar is closed.
 * @param messageKey Intl ID for the error message.
 * @param values Value object for the error message.
 * @param message Text for the error message.
 * @param enableRefresh Indicates if the Refresh action should be shown / enabled.
 * @param error The error that occurred.
 * @param errorInfo The errorInfo for the error that occurred.
 * @return {JSX.Element}
 * @constructor
 */
export default function ErrorSnackbar({open=true, onClose, messageKey, values, message, enableRefresh = true, error, errorInfo}) {
   const classes = useStyles();

   /**
    * Force a browser reload.
    */
   const handleRefresh = () => {
      window.location.reload();
   };

   return (
      <Snackbar
         open={open}
         anchorOrigin={{vertical: 'top', horizontal: 'center'}}
         ContentProps={{
            'aria-describedby': 'message-id',
            classes: {
               root: classes.errorMessage,
            }
         }}
         message={<>
            <Typography id={messageKey} values={values} color={'inherit'}>{message}</Typography>
            {(error || errorInfo) && (
               <details style={{whiteSpace: 'pre-wrap', outline: 'none', outlineColor: 'transparent'}}>
                  {error && error.toString()}
                  <br/>
                  {errorInfo.componentStack}
               </details>
            )}
         </>}
         action={[
            enableRefresh && <Button key='undo' color='inherit' size='small' onClick={handleRefresh}>
               <Typography color='inherit' id='refresh'>Refresh</Typography>
            </Button>,
            onClose && (
               <IconButton
                  key='close'
                  aria-label='Close'
                  color='inherit'
                  className={classes.closeButtonStyle}
                  onClick={onClose}
               >
                  <CloseIcon/>
               </IconButton>
            ),
         ]}
      />
   );
};
