import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(
   {
      backdropStyle: {
         zIndex: 4000,
         color: '#fff',
         opacity: '0.2 !important',
      },
      progressStyle: {
         position: 'absolute',
         top: '50%',
         left: '50%',
         zIndex: 5000,
      },
   },
   {name: 'loadingStyles'}
);

/**
 * Component to show the error messages and loading spinner.
 *
 * Note:
 *    Message is the default property in values.
 */
function Loading({isLoading = true, hasBackdrop = false, classes: classesProp = {}, ...progressProps}) {
   const classes = {...useStyles(), ...classesProp};

   if (isLoading) {
      if (hasBackdrop) {
         return (
            <>
               <CircularProgress className={classes.progressStyle} />
               <Backdrop className={classes.backdropStyle} open={true} />
            </>
         );
      } else {
         return <CircularProgress className={classes.progressStyle} {...progressProps} />;
      }
   } else {
      return null;
   }
}

Loading.propTypes = {
   isLoading: PropTypes.bool, // Indicates if the data is still loading.
   hasBackdrop: PropTypes.bool, // Indicates if the backdrop should display.
};

export default Loading;
