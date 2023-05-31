import {IconButton} from '@material-ui/core';
import {Popover} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {HelpOutline} from '@material-ui/icons';
import {useState} from 'react';
import React, {Fragment} from 'react';
import TypographyFHG from './Typography';

const useStyles = makeStyles(theme => ({
   popover: {
      pointerEvents: 'none',
   },
   paper: {
      padding: theme.spacing(1),
      backgroundColor: '#f1f1f1'
   },
}), {name: 'InfoPopupStyles'});

/**
 * Component to show help on hover.
 *
 * @param labelKey The key of the help text.
 *
 * @return {JSX.Element|null}
 * @constructor
 */
export default function InfoPopup({labelKey, }) {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);

   const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handlePopoverClose = () => {
      setAnchorEl(null);
   };

   const open = Boolean(anchorEl);

   if (labelKey) {
      return (
         <Fragment>
            <IconButton
               size={'small'}
               onMouseEnter={handlePopoverOpen}
               onMouseLeave={handlePopoverClose}
            >
               <HelpOutline/>
            </IconButton>
            <Popover
               id='mouse-over-popover'
               className={classes.popover}
               classes={{
                  paper: classes.paper,
               }}
               open={open}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
               }}
               onClose={handlePopoverClose}
               disableRestoreFocus
            >
               <TypographyFHG id={labelKey}/>
            </Popover>
         </Fragment>
      );
   } else {
      console.log('InfoPopup must have a labelKey');
      return null;
   }
}
