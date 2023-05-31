import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {errorState} from '../../pages/Main';
import Typography from './Typography';

const useStyles = makeStyles(
   (theme) => ({
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
   }),
   {name: 'ErrorSnackbarStyles'}
);

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
 * @return {JSX.Element}
 * @constructor
 */
export default function ErrorSnackbar() {
   const classes = useStyles();
   const [open, setOpen] = useState(false);

   const errorStateValue = useRecoilValue(errorState);
   const {error, errorKey, errorMessage, values, enableRefresh, errorInfo} = errorStateValue;

   useEffect(() => {
      if (errorStateValue && (error || errorKey)) {
         setOpen(true);
      }
   }, [errorStateValue, error]);

   /**
    * Force a browser reload.
    */
   const handleRefresh = () => {
      window.location.reload();
   };

   const handleClose = () => {
      setOpen(false);
   };

   return (
      <Snackbar
         open={open}
         anchorOrigin={{vertical: 'top', horizontal: 'center'}}
         ContentProps={{
            'aria-describedby': 'message-id',
            classes: {
               root: classes.errorMessage,
            },
         }}
         message={
            <>
               <Typography id={errorKey} values={values} color={'inherit'}>
                  {errorMessage}
               </Typography>
               {(error || errorInfo) && (
                  <details style={{whiteSpace: 'pre-wrap'}}>
                     {error?.toString()}
                     <br />
                     {errorInfo?.componentStack}
                  </details>
               )}
            </>
         }
         action={[
            enableRefresh && (
               <Button key='undo' color='inherit' size='small' onClick={handleRefresh}>
                  <Typography color='inherit' id='refresh'>
                     Refresh
                  </Typography>
               </Button>
            ),
            <IconButton
               key='close'
               aria-label='Close'
               color='inherit'
               className={classes.closeButtonStyle}
               onClick={handleClose}
            >
               <CloseIcon />
            </IconButton>,
         ]}
      />
   );
}
