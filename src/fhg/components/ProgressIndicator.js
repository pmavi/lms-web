import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {progressState} from '../hooks/useProgress';
import {progressGlobal} from '../hooks/useProgress';

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
   {name: 'progressIndicatorStyles'}
);

ProgressIndicator.propTypes = {
   hasBackdrop: PropTypes.bool, // Indicates if the backdrop should display.
};

/**
 * Component to show the progress spinner.
 */
export default function ProgressIndicator({hasBackdrop = false, isGlobal = false, defaultIsInProgress}) {
   const classes = useStyles();
   const [useGlobal, setUseGlobal] = useRecoilState(progressGlobal);
   const isInProgress = useRecoilValue(progressState);
   const [inProgress, setInProgress] = useState(false);

   useEffect(() => {
      if (!isGlobal && useGlobal) {
         setUseGlobal(false);
      }
      return () => {
         setUseGlobal(true);
      };
   }, [isGlobal]);

   if ((isInProgress && useGlobal === isGlobal) || defaultIsInProgress) {
      if (!inProgress) {
         setInProgress(true);
      }
      if (hasBackdrop) {
         return (
            <>
               <CircularProgress className={classes.progressStyle} />
               <Backdrop className={classes.backdropStyle} open={true} />
            </>
         );
      } else {
         return <CircularProgress className={classes.progressStyle} />;
      }
   } else {
      if (inProgress) {
         setInProgress(false);
      }

      return null;
   }
}
