import {Tooltip} from '@material-ui/core';
import {ButtonGroup} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {HighlightOff} from '@material-ui/icons';
import {ZoomOut} from '@material-ui/icons';
import {ZoomIn} from '@material-ui/icons';
import {useState} from 'react';
import React from 'react';
import {useMemo} from 'react';

const useStyles = makeStyles(
   (theme) => ({
      buttonGroupStyle: (props) => ({
         position: props?.position || 'absolute',
         top: props?.top || theme.spacing(2),
         right: props?.right || theme.spacing(2),
         backgroundColor: props?.backgroundColor || '#FAFAFA',
         zIndex: props?.zIndex || theme.zIndex.drawer,
      }),
      fadeArea: {
         '&:hover $fadeIn': {
            opacity: 1,
         },
      },
      fadeIn: (props) => ({
         opacity: props.opacity || 0.5,
      }),
   }),
   {name: 'ScalePanelStyles'}
);

/**
 * Component to show the buttons to zoom in, zoom out and rest the zoom.
 *
 * @param onZoomIn Callback when the zoom in button is pressed.
 * @param onZoomOut Callback when the zoom out button is pressed.
 * @param onZoomReset Callback when the reset button is pressed.
 * @param styleProps The style props for the zoom button panel.
 * @returns {JSX.Element}
 * @constructor
 */
function ScaleButtonPanel({onZoomIn, onZoomOut, onZoomReset, ...styleProps}) {
   const classes = useStyles(styleProps);

   return (
      <Box name='Button Group Box' className={`${classes.buttonGroupStyle} ${classes.fadeArea}`}>
         <ButtonGroup color='primary' className={classes.fadeIn}>
            <Button onClick={onZoomIn}>
               <Tooltip title={'Make Larger'} enterDelay={200}>
                  <ZoomIn />
               </Tooltip>
            </Button>
            <Button onClick={onZoomOut}>
               <Tooltip title={'Make Smaller'} enterDelay={200}>
                  <ZoomOut />
               </Tooltip>
            </Button>
            <Button onClick={onZoomReset}>
               <Tooltip title={'Normal Size'} enterDelay={200}>
                  <HighlightOff />
               </Tooltip>
            </Button>
         </ButtonGroup>
      </Box>
   );
}

// Amount to change scale when "zooming".
const SCALE_DELTA = 0.02;

/**
 * Hook to scale the contents inside the panel. A zoom button panel scale, and style.
 * @param styleProps Style props for the button panel
 * @returns {{buttonPanel: unknown, scale: number, scaleStyle: {transform: string, transformOrigin: string}}}
 */
export default function useScalePanel(styleProps) {
   const [scale, setScale] = useState(1);

   const handleZoomIn = () => {
      setScale((scale) => (scale || 1) + SCALE_DELTA);
   };

   const handleZoomOut = () => {
      setScale((scale) => (scale || 1) - SCALE_DELTA);
   };

   const handleZoomReset = () => {
      setScale(1);
   };

   const scaleStyle = useMemo(() => {
      return scale !== 1
         ? {
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
           }
         : {};
   }, [scale]);

   const buttonPanel = useMemo(
      () => (
         <ScaleButtonPanel
            {...styleProps}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
         />
      ),
      [styleProps]
   );

   return {scaleStyle, buttonPanel, scale: scale};
}
