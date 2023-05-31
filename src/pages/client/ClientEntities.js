import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import Grid from '../../fhg/components/Grid';
import ScalePanel from '../../fhg/components/ScalePanel';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import ClientEntityTree from './ClientEntityTree';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         height: '100%',
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(4, 3),
         [theme.breakpoints.up('md')]: {
            padding: `${theme.spacing(2)}px 3px`,
         },
         overflow: 'auto',
         maxHeight: '100%',
      },
   }),
   {name: 'ClientEntitiesStyles'}
);

/**
 * Client Entities Tree component for the clients. Displays two levels at the client level and at the entity level.
 *
 * Reviewed:
 */
export default function ClientEntities({allowDelete = true}) {
   const classes = useStyles();

   usePageTitle({titleKey: 'balance.entities.label'});

   return (
      <Grid container className={classes.root} fullHeight>
         <Grid name='ContentGrid' container item resizable className={classes.contentStyle}>
            <ScalePanel name={'clientEntities'}>
               <ClientEntityTree allowDelete={allowDelete} />
            </ScalePanel>
         </Grid>
      </Grid>
   );
}
