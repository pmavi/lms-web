import Box from '@material-ui/core/Box';
import React from 'react';

import useScalePanel from '../hooks/useScalePanel';

/**
 * Scale Panel component that scales the children. The zoom in/out and clear buttons are displayed in the upper right.
 *
 * Reviewed:
 */
export default function ScalePanel({name, style = {}, children}) {
   const propertyKey = name + 'Scale';

   const {scaleStyle, buttonPanel} = useScalePanel({propertyKey});

   return (
      <Box
         name='ScaleFrame'
         height={'100%'}
         width={'100%'}
         position={'relative'}
         overflow={'hidden'}
         flex={'1 1 0%'}
         display={'flex'}
      >
         {buttonPanel}
         <Box name='Scale Grid' overflow={'auto'} width={'100%'} display={'flex'}>
            <Box name='Scale Contents' marginLeft='auto' marginRight='auto' style={{...scaleStyle, ...style}}>
               {children}
            </Box>
         </Box>
      </Box>
   );
}
