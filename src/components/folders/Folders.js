import {List} from '@material-ui/core';
import {ListItemText} from '@material-ui/core';
import {ListItem} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Add} from '@material-ui/icons';
import {sortBy} from 'lodash';
import {useMemo} from 'react';
import React from 'react';
import {Link} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {FOLDERS_DRAWER} from '../../Constants';
import {FOLDERS_PATH} from '../../Constants';
import {FOLDER_EDIT} from '../../Constants';
import {FOLDER_PATH} from '../../Constants';
import {APPBAR_SMALL_HEIGHT} from '../../Constants';
import {FOLDER_QUERY} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import Grid from '../../fhg/components/Grid';
import ResponsiveMobileDrawer from '../../fhg/components/ResponsiveMobileDrawer';
import TypographyFHG from '../../fhg/components/Typography';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import FolderEdit from './FolderEdit';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(0, 2),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
      },
      frameStyle: {
         padding: theme.spacing(3, 0),
      },
      drawerStyle: {
         padding: theme.spacing(3, 2),
      },
   }),
   {name: 'FoldersStyles'}
);

/**
 * Component to show the list of template folders.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Folders() {
   const classes = useStyles();
   const history = useHistory();
   const theme = useTheme();
   const {folderId} = useParams();
   const location = useLocation();

   const [folderData] = useQueryFHG(FOLDER_QUERY, undefined, 'folder.type');
   usePageTitle({titleKey: 'folder.title2.label'});

   /**
    * Sort the list of template folders.
    * @type {unknown}
    */
   const sortedFolders = useMemo(() => {
      if (folderData?.folders) {
         return sortBy(folderData?.folders, 'name');
      }
      return [];
   }, [folderData]);

   /**
    * Create a new template folder.
    * @param event The event for creating the new folder.
    */
   const handleNewFolder = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      location.state = {edit: FOLDER_EDIT};
      location.pathname = FOLDERS_PATH;
      history.push(location);
   };

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'row'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         <Grid item fullHeight resizable={false}>
            <ResponsiveMobileDrawer
               backgroundColor={theme.palette.background.default}
               width={FOLDERS_DRAWER}
               ModalProps={{BackdropProps: {style: {height: '100%', marginTop: APPBAR_SMALL_HEIGHT}}}}
            >
               <Grid container fullWidth className={classes.drawerStyle}>
                  <Grid container item resizable={false} direction={'row'}>
                     <Grid item resizable={false} className={classes.infoInnerStyle}>
                        <TypographyFHG variant={'h5'} id={'folder.title.label'} color={'textSecondary'} />
                     </Grid>
                     <Grid item>
                        <ButtonFHG labelKey='folder.new.button' startIcon={<Add />} onClick={handleNewFolder} />
                     </Grid>
                  </Grid>
                  <Grid isScrollable className={classes.root}>
                     <List dense>
                        {sortedFolders.map((folder) => (
                           <ListItem
                              button
                              component={Link}
                              to={FOLDER_PATH.replace(':folderId', folder.id)}
                              selected={folderId === folder.id}
                           >
                              <ListItemText
                                 primary={folder.name}
                                 primaryTypographyProps={{variant: 'subtitle1'}}
                                 secondary={folder.description}
                              />
                           </ListItem>
                        ))}
                     </List>
                  </Grid>
               </Grid>
            </ResponsiveMobileDrawer>
         </Grid>
         {(folderId || location?.state?.edit === FOLDER_EDIT) && (
            <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 480}}>
               <FolderEdit />
            </Grid>
         )}
      </Grid>
   );
}
