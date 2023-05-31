import {Hidden} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import sortBy from 'lodash/sortBy';
import {useState} from 'react';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {Link, useRouteMatch} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import {FOLDERS_PATH} from '../Constants';
import {
   ADMIN_COURSES_PATH,
   CLIENT_ENTITY_DASHBOARD_PATH,
   CLIENT_TASK_NOTES_PATH,
   ADMIN_PATH,
   ADMIN_USERS_PATH,
   ADMIN_SETUP_PATH,
} from '../Constants';
import {ENTITY_CLIENT_QUERY} from '../data/QueriesGL';
import Grid from '../fhg/components/Grid';
import InfoVideoPopup from '../fhg/components/InfoVideoPopup';
import Typography from '../fhg/components/Typography';
import TypographyFHG from '../fhg/components/Typography';
import {titleStatus} from '../fhg/components/WebAppBar';
import WebAppBar from '../fhg/components/WebAppBar';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import find from 'lodash/find';
import {useEffect} from 'react';
import {userRoleState} from '../pages/Main';

// search
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles(
   (theme) => ({
      buttonStyle: {
         marginRight: theme.spacing(2),
         [theme.breakpoints.down('md')]: {
            marginRight: theme.spacing(1),
            padding: theme.spacing(0.5),
         },
         [theme.breakpoints.down('sm')]: {
            marginRight: theme.spacing(0),
            padding: theme.spacing(0.5),
         },
      },
      titleStyle: {
         color: theme.palette.text.primary,
      },
      hyphenStyle: {
         lineHeight: '44px',
      },
      placeholderStyle: {
         color: '#707070 !important',
      },
      entityStyle: {
         textDecoration: 'underline',
         marginLeft: theme.spacing(1),
      },
      rootSearch: {
         padding: '2px 4px',
         display: 'flex',
         alignItems: 'center',
         width: '90%',
         height: '40px',
         margin: '1px auto',
      },
      searchDiv: {
         width: '100%',
      },
      input: {
         marginLeft: theme.spacing(1),
         flex: 1,
      },
      divider: {
         height: 28,
         margin: 4,
      },
   }),
   {name: 'WebAppBarKLAStyles'}
);

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function WebAppBarLF() {
   const {clientId, entityId} = useParams();
   const classes = useStyles();
   const theme = useTheme();
   const history = useHistory();
   const location = useLocation();
   const [{titleKey, titleValues, videoId, helpKey}] = useRecoilState(titleStatus);

   const [search, setSearch] = useState('');
   const [exact, setExact] = useState(false);
   useEffect(() => {
      if (search?.length > 0) {
         setSearch('');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location?.state?.search]);

   const viewMatch = useRouteMatch({path: CLIENT_ENTITY_DASHBOARD_PATH, strict: true, sensitive: true});
   const adminClientSetupMatch = useRouteMatch({path: ADMIN_SETUP_PATH, strict: true, sensitive: true});
   const usersSetupMatch = useRouteMatch({path: ADMIN_USERS_PATH, strict: true, sensitive: true});
   const lmsSetupMatch = useRouteMatch({path: ADMIN_COURSES_PATH, strict: true, sensitive: true});
   const folderSetupMatch = useRouteMatch({path: FOLDERS_PATH, strict: true, sensitive: true});

   const clientSetupPath =
      usersSetupMatch?.isExact || !validate(clientId) ? ADMIN_PATH : ADMIN_SETUP_PATH.replace(':clientId', clientId);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const entities = sortBy(entitiesData?.entities || [], 'name');

   const isSmallUp = useMediaQuery(theme.breakpoints.up('md'));

   const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false);
   const [selectedEntity, setSelectedEntity] = useState(find(entitiesData?.entities, {id: entityId}));
   const {isAdmin} = useRecoilValue(userRoleState);

   useEffect(() => {
      if (entityId && entitiesData?.entities?.length > 0) {
         setSelectedEntity(find(entitiesData.entities, {id: entityId}));
      } else {
         setSelectedEntity(undefined);
      }
   }, [entityId, entitiesData]);

   const handleMenu = () => {
      setIsEntityMenuOpen(true);
   };

   const handleClose = () => {
      setIsEntityMenuOpen(false);
   };

   const handleEntityChange = (event) => {
      const pathParts = location.pathname.split('/');
      const entityIndex = pathParts.indexOf('entity');

      localStorage.entityId = event.target.value;

      if (entityIndex < 0) {
         //Add the new entityId.
         pathParts.push('entity');
         pathParts.push(event.target.value);
      } else {
         //Replace with the new entityId.
         pathParts[entityIndex + 1] = event.target.value;
      }

      const path = pathParts.join('/');
      history.push(path);
   };

   const handleChangeCheck = () => {
      setExact((exact) => !exact);
   };

   const handleSearchChange = (e) => {
      const value = e.target.value.trimStart();
      if (value?.length > 0) {
         setSearch(value);
      } else {
         setSearch('');
      }
   };

   const keyPress = (e) => {
      if (e.keyCode === 13) {
         e.preventDefault();
         if (search?.length > 0) handleSearchClick(search);
      }
   };

   const handleSearchClick = (value) => {
      location.state = {search: value, exact};
      location.pathname = `/client/${clientId}/search`;
      history.push(location);
   };
   return (
      <WebAppBar>
         <Grid container justify={'space-between'} direction={'row'} alignItems={'center'}>
            <Grid
               name={'TitleCard-title'}
               container
               item
               resizable
               fullWidth={false}
               direction={'row'}
               wrap={'nowrap'}
               justify={'center'}
            >
               <Hidden xsDown>
                  <Grid container item resizable={false} alignItems={'center'} fullWidth={false}>
                     <Typography
                        id={titleKey}
                        values={titleValues}
                        className={classes.titleStyle}
                        variant={'h5'}
                        align={'center'}
                     >
                        {titleKey !== 'lms.title2.label' &&
                        titleKey !== 'lms.admintitle.label' &&
                        titleKey !== 'lms.title.search' ? (
                           <Hidden smDown>
                              {titleKey && !!viewMatch && (
                                 <TypographyFHG variant={'h5'} component={'span'} className={classes.hyphenStyle}>
                                    &nbsp;-&nbsp;
                                 </TypographyFHG>
                              )}
                              {!!viewMatch && (
                                 <FormControl className={classes.formControl}>
                                    <Select
                                       open={isEntityMenuOpen}
                                       className={classes.selectStyle}
                                       onClose={handleClose}
                                       onOpen={handleMenu}
                                       placeholder={'Select Entity'}
                                       renderValue={() => {
                                          if (selectedEntity) {
                                             return (
                                                <Typography variant={'h5'} className={classes.entityStyle}>
                                                   {selectedEntity?.name}
                                                </Typography>
                                             );
                                          } else {
                                             return (
                                                <Typography variant={'h5'} className={classes.placeholderStyle}>
                                                   Select Entity
                                                </Typography>
                                             );
                                          }
                                       }}
                                       disableUnderline={true}
                                       displayEmpty={true}
                                       value={''}
                                       onChange={handleEntityChange}
                                    >
                                       {entities?.length > 0 ? (
                                          entities?.map((entity) => (
                                             <MenuItem key={entity.id} value={entity.id}>
                                                <TypographyFHG>{entity.name}</TypographyFHG>
                                             </MenuItem>
                                          ))
                                       ) : (
                                          <MenuItem key={'No Entity'} value={-1} disabled>
                                             <TypographyFHG>No Entities</TypographyFHG>
                                          </MenuItem>
                                       )}
                                    </Select>
                                 </FormControl>
                              )}
                           </Hidden>
                        ) : (
                           titleKey !== 'lms.admintitle.label' &&
                           titleKey !== 'lms.title.search' && (
                              <Paper component='form' className={classes.rootSearch}>
                                 <InputBase
                                    className={classes.input}
                                    value={search}
                                    onKeyDown={keyPress}
                                    onChange={handleSearchChange}
                                    placeholder='Search'
                                    inputProps={{'aria-label': "search course's"}}
                                 />
                                 <Divider className={classes.divider} orientation='vertical' />
                                 <FormControlLabel
                                    control={
                                       <Checkbox
                                          checked={exact}
                                          onChange={handleChangeCheck}
                                          name='exact'
                                          color='primary'
                                       />
                                    }
                                    label='Exact Match'
                                 />
                                 <Divider className={classes.divider} orientation='vertical' />
                                 <IconButton
                                    disabled={search?.length <= 0}
                                    onClick={() => handleSearchClick(search)}
                                    color='primary'
                                    className={classes.iconButton}
                                    aria-label='directions'
                                 >
                                    <SearchIcon />
                                 </IconButton>
                              </Paper>
                           )
                        )}
                        {videoId && <InfoVideoPopup videoId={videoId} labelKey={helpKey} />}
                     </Typography>
                  </Grid>
               </Hidden>
            </Grid>
            {isAdmin && (
               <Grid item>
                  <Button
                     component={Link}
                     to={CLIENT_TASK_NOTES_PATH.replace(':clientId', clientId).replace(
                        ':entityId',
                        entityId || entities?.[0]?.id
                     )}
                     className={classes.buttonStyle}
                     disabled={!!viewMatch || !validate(clientId) || clientId === 'user'}
                     size={isSmallUp ? 'large' : 'medium'}
                  >
                     <TypographyFHG id='appbar.view.nav' />
                  </Button>
                  <Button
                     component={Link}
                     to={ADMIN_COURSES_PATH}
                     className={classes.buttonStyle}
                     disabled={lmsSetupMatch?.isExact}
                     size={isSmallUp ? 'large' : 'medium'}
                  >
                     <TypographyFHG id='appbar.lms.nav' />
                  </Button>
                  <Button
                     component={Link}
                     to={FOLDERS_PATH}
                     className={classes.buttonStyle}
                     disabled={folderSetupMatch?.isExact}
                     size={isSmallUp ? 'large' : 'medium'}
                  >
                     <TypographyFHG id='appbar.folders.nav' />
                  </Button>
                  <Button
                     component={Link}
                     to={clientSetupPath}
                     className={classes.buttonStyle}
                     disabled={
                        !lmsSetupMatch?.isExact &&
                        !usersSetupMatch?.isExact &&
                        !folderSetupMatch?.isExact &&
                        adminClientSetupMatch?.isExact
                     }
                     size={isSmallUp ? 'large' : 'medium'}
                  >
                     <TypographyFHG id='appbar.client.nav' />
                  </Button>
                  <Button
                     component={Link}
                     to={ADMIN_USERS_PATH}
                     className={classes.buttonStyle}
                     disabled={usersSetupMatch?.isExact}
                     size={isSmallUp ? 'large' : 'medium'}
                  >
                     <TypographyFHG id='appbar.users.nav' />
                  </Button>
               </Grid>
            )}
         </Grid>
      </WebAppBar>
   );
}
