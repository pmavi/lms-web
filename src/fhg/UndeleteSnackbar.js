import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import {useRecoilState} from 'recoil';
import {atom} from 'recoil';
import ButtonLF from '../components/ButtonLF';
import {UNDO_DURATION} from '../Constants';
import Typography from './components/Typography';

export const undeleteStatus = atom({
   key: 'undeleteStatus',
   default: {
      show: false,
      values: {type: 'N/A'},
      autoHideDuration: undefined,
      messageId: 'confirmRemoveValue.Undo.message',
      onUndo: () => {},
   },
});

const useStyles = makeStyles(
   (theme) => ({
      snackbarMessageStyle: {
         marginRight: theme.spacing(1),
      },
      closeButtonStyle: {
         position: 'absolute',
         right: 0,
         top: 0,
         marginLeft: 'auto',
         zIndex: 1001,
      },
      messageStyle: {
         backgroundColor: `${theme.palette.background.default} !important`,
         color: `${theme.palette.text.secondary} !important`,
         paddingRight: theme.spacing(6),
      },
   }),
   {name: 'UndeleteSnackbarStyles'}
);

/**
 * Snackbar to handle option to undelete.
 * @returns {JSX.Element|null}
 * @constructor
 */
export default function UndeleteSnackbar() {
   const classes = useStyles();
   const [{id, show, autoHideDuration, onUndo, values, messageId}, setUndeleteStatus] = useRecoilState(undeleteStatus);

   /**
    * Close the snackbar.
    */
   const handleClose = () => {
      setUndeleteStatus({
         show: false,
         values: {type: 'N/A'},
         autoHideDuration: undefined,
         messageId: 'confirmRemoveValue.Undo.message',
         onUndo: () => {},
      });
   };

   /**
    * Undo the delete.
    */
   const handleUndo = () => {
      onUndo?.(id);
      handleClose();
   };

   if (show) {
      return (
         <Snackbar
            open={show}
            autoHideDuration={autoHideDuration || UNDO_DURATION}
            onClose={handleClose}
            ContentProps={{classes: {root: classes.messageStyle}}}
            ClickAwayListenerProps={{mouseEvent: false, touchEvent: false}}
            message={
               <Typography
                  id={messageId}
                  variant={'subtitle1'}
                  className={classes.snackbarMessageStyle}
                  values={values}
                  color={'inherit'}
               >
                  <ButtonLF labelKey={'undo.label'} onClick={handleUndo} />
               </Typography>
            }
            action={[
               <IconButton
                  key='close'
                  aria-label='Close'
                  color='inherit'
                  size={'small'}
                  className={classes.closeButtonStyle}
                  onClick={handleClose}
               >
                  <CloseIcon fontSize='inherit' />
               </IconButton>,
            ]}
         />
      );
   }

   return null;
}
