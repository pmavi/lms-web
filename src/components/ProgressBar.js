import React from 'react';

const ProgressBar = ({theme, bgcolor, progress}) => {
   const Parentdiv = {
      width: '90%',
      backgroundColor: '#d8d8d8',
      borderRadius: 40,
      marginLeft: theme.spacing(2),
      clear: 'both',
      // padding: '5px 0'
   };

   const Childdiv = {
      height: '100%',
      width: `${progress}%`,
      backgroundColor: bgcolor,
      borderRadius: 40,
      textAlign: 'right',
      padding: '3px 0px',
   };

   const progresstext = {
      padding: 10,
      color: 'black',
      fontWeight: 900,
   };

   return (
      <div style={Parentdiv}>
         <div style={Childdiv}>
            <span style={progresstext}>{`${progress}%`}</span>
         </div>
      </div>
   );
};

export default ProgressBar;
