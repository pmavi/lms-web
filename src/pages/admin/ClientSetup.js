import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import AdminDrawer from '../../components/AdminDrawer';
import Grid from '../../fhg/components/Grid';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import ClientEntityTree from '../client/ClientEntityTree';

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
   {name: 'ClientSetupStyles'}
);

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed:
 */
export default function ClientSetup() {
   const classes = useStyles();

   usePageTitle({titleKey: 'client.title.label'});

   return (
      <Grid container className={classes.root} fullHeight>
         <Grid name='DrawerGrid' item container resizable={false} fullHeight fullWidth={false} direction={'column'}>
            <AdminDrawer />
         </Grid>
         <Grid name='ContentGrid' container item resizable className={classes.contentStyle}>
            <ClientEntityTree allowDelete={true} />
         </Grid>
      </Grid>
   );
}
