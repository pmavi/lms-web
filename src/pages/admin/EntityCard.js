import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import React from 'react';
import Grid from '../../fhg/components/Grid';
import Typography from '../../fhg/components/Typography';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 300,
      },
      dividerStyle: {
         marginBottom: theme.spacing(0.5),
         marginTop: theme.spacing(0.5),
      },
      subtitleStyle: {
         position: 'sticky',
         top: 0,
         backgroundColor: theme.palette.background.paper,
         color: 'rgba(0, 0, 0, 0.54)',
         fontSize: 14,
      },
      listItemStyle: {
         color: 'rgba(0, 0, 0, 0.87)',
         fontSize: 14,
      },
   }),
   {name: 'EntityCardStyles'}
);

export default function EntityCard({item}) {
   const classes = useStyles();
   const theme = useTheme();

   return (
      // <Grid item fullHeight style={{display: 'flex', flexDirection: 'column', height: 'fit-content'}}>
      <Grid item fullHeight style={{display: 'flex', flexDirection: 'column'}} overflow={'auto'}>
         {item?.description && (
            <>
               <Typography
                  id={'entity.description.label'}
                  className={classes.subtitleStyle}
                  style={{marginRight: theme.spacing(1)}}
               />
               <Typography className={classes.listItemStyle}>{item?.description}</Typography>
            </>
         )}
         {item?.ein && (
            <Box
               display={'flex'}
               flexDirection={'row'}
               alignItems='center'
               mb={1}
               style={{backgroundColor: theme.palette.background.paper, position: 'sticky', top: 0}}
            >
               {' '}
               <Typography
                  id={'entity.ein.label'}
                  className={classes.subtitleStyle}
                  style={{marginRight: theme.spacing(1)}}
               />
               <Typography className={classes.listItemStyle}>{item?.ein}</Typography>
            </Box>
         )}
      </Grid>
   );
}
