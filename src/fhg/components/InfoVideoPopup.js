import {Popover} from '@material-ui/core';
import {IconButton} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {HelpOutline} from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import {useCallback} from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import React, {Fragment} from 'react';
import Grid from './Grid';
import TypographyFHG from './Typography';

const useStyles = makeStyles(theme => ({
   popover: {
      // pointerEvents: 'none',
   },
   paper: {
      padding: theme.spacing(1, 3, 1, 1),
      backgroundColor: '#f1f1f1',
      maxWidth: 300,
   },
   paragraphStyle: {
      '& p:first-of-type': {
         display: 'block',
         marginBlockStart: '0',
         marginBlockEnd: '1em',
         marginInlineStart: '0',
         marginInlineEnd: '0px',
      }
   },
   frameStyle: {
      margin: 'auto !important',
   },
}), {name: 'InfoPopupStyles'});

/**
 * Component to show help on hover.
 *
 * @param labelKey The key of the help text.
 * @param videoId The wistia media hashed ID.
 * @return {JSX.Element|null}
 * @constructor
 */
export default function InfoVideoPopup({labelKey, videoId, ...buttonProps}) {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);
   const [delayOpenTarget, setDelayOpenTarget] = useState(false);
   const [timoutOutState, setTimoutOutState] = useState();

   useEffect(() => {
      if (!document.getElementById('wistia_script')) {
         const wistiaScript = document.createElement('script');
         wistiaScript.id = 'wistia_script';
         wistiaScript.type = 'text/javascript';
         wistiaScript.src = 'https://fast.wistia.com/assets/external/E-v1.js';
         wistiaScript.async = true;
         document.body.appendChild(wistiaScript);
      }
      if (!document.getElementById('wistia_medias_script')) {
         //     <script src="https://fast.wistia.com/embed/medias/kvooi0oe1v.jsonp" async></script>
         const wistiaMediasScript = document.createElement('script');
         wistiaMediasScript.id = 'wistia_medias_script';
         wistiaMediasScript.src = `https://fast.wistia.com/embed/medias/${videoId}.jsonp`;
         wistiaMediasScript.async = true;
         document.body.appendChild(wistiaMediasScript);
      }
   }, []);

   useEffect(() => {
      if (delayOpenTarget) {
         setTimoutOutState(setTimeout(() => {
            if (delayOpenTarget) {
               setAnchorEl(delayOpenTarget);
            }
         }, 600));
      } else if (timoutOutState) {
         clearTimeout(timoutOutState);
         setTimoutOutState(undefined);
      }
   }, [delayOpenTarget]);

   const handlePopoverOpenImmediate = event => {
      setAnchorEl(event.currentTarget);
   };

   const handlePopoverOpen = event => {
      setDelayOpenTarget(event.currentTarget);
   };

   const handleDelayClose = useCallback(event => {
      event?.stopPropagation();
      event?.preventDefault();

      if (!anchorEl) {
         setDelayOpenTarget(undefined);
      }
   }, [anchorEl]);

   const handlePopoverClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setAnchorEl(null);
      setDelayOpenTarget(undefined);
      if (timoutOutState) {
         clearTimeout(timoutOutState);
         setTimoutOutState(undefined);
      }
   };

   const open = Boolean(anchorEl);

   if (videoId) {
      return (
         <Fragment>
            <IconButton
               id={'iconButton'}
               name={'button'}
               size={'small'}
               onClick={handlePopoverOpenImmediate}
               onMouseEnter={handlePopoverOpen}
               onMouseLeave={handleDelayClose}
               {...buttonProps}
            >
               <HelpOutline/>
            </IconButton>

            <Popover
               id={'InfoPopover' + videoId}
               classes={{
                  paper: classes.paper,
               }}
               open={open}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
               }}
               onClose={handlePopoverClose}
               disableRestoreFocus
            >
               <Grid container direction={'column'}>
                  {labelKey && (
                     <Grid item>
                        <TypographyFHG id={labelKey} className={classes.paragraphStyle} hasLineBreaks/>
                     </Grid>
                  )}
                  <Grid item className={classes.frameStyle}>
                     <div className={`wistia_embed wistia_async_${videoId} popover=true popoverAnimateThumbnail=true`}
                          onClick={handlePopoverClose}
                          style={{
                             margin: 'auto',
                             display: 'inline-block',
                             height: '84px',
                             position: 'relative',
                             width: '150px'
                          }}>&nbsp;</div>
                  </Grid>
               </Grid>
               <CloseIcon style={{right: 0, top: 0, position: 'absolute', float: 'right'}}
                          onClick={handlePopoverClose}/>
            </Popover>

         </Fragment>
      );
   } else {
      console.log('InfoVideoPopup must have a videoId. If you do not have a video, use InfoPopup.');
      return null;
   }
}
