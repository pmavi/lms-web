import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import {useState} from 'react';
import React, {Fragment} from 'react';
import useMessage from '../../hooks/useMessage';
// import Typography from '../Typography';

import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
   popover: {
      pointerEvents: 'none',
   },
   paper: {
      padding: theme.spacing(1, 0.5, 0.5, 1),
      margin: theme.spacing(-1, 0, 0, -1),
      backgroundColor: '#F4F4F4', //'#DAE4EB',
   },
}), {name: 'TypographyWithHoverStyles'});

function isEllipsisActiveFunction(element) {
   return (element && element.offsetWidth < element.scrollWidth);
}

/**
 * The Typography component that supports intl. The default value is the child element.
 *
 * Example:
 * <Typography id='path.suppliers' variant='button'>Suppliers</Typography>
 */
export default function TypographyWithHover({id, children, values, backgroundColor, ...otherProps}) {
   const classes = useStyles();
   const message = useMessage(id, children, values) || children;
   const [anchorEl, setAnchorEl] = useState();
   const [isEllipsisActive, setIsEllipsisActive] = useState(false);
   const [open, setOpen] = useState();

   const handlePopoverOpen = event => {
      const isEllipsisActive = isEllipsisActiveFunction(event.currentTarget);
      setIsEllipsisActive(isEllipsisActive);
      setAnchorEl(event.currentTarget);
      setOpen(true);
   };

   const handlePopoverClose = () => {
      setIsEllipsisActive(false);
      setOpen(false);
   };

   const useIsEllipsisActive = isEllipsisActive && open;

   return (
      <Fragment>
         <Typography id={id} {...otherProps}
                     onMouseEnter={handlePopoverOpen}
                     onMouseLeave={handlePopoverClose}
         >
            {message}
         </Typography>
         {useIsEllipsisActive && (
            <Popover
               className={classes.popover}
               classes={{
                  paper: classes.paper,
               }}
               open={useIsEllipsisActive}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
               }}
               onClose={handlePopoverClose}
               disableRestoreFocus
            >
               <Typography id={id} {...otherProps} >{message}</Typography>
            </Popover>
         )}
      </Fragment>
   )
}
