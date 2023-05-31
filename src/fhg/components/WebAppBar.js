import Menu from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import FormControl from '@material-ui/core/FormControl';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Person from '@material-ui/icons/Person';
import {Auth} from 'aws-amplify';
import React, {useState, Fragment} from 'react';
import {useHistory} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useRecoilState, atom, useRecoilValue} from 'recoil';
import {LOGO, APPBAR_HEIGHT, APPBAR_SMALL_HEIGHT, DEFAULT_PATH} from '../../Constants';
import Grid from './Grid';
import {drawerIsOpenStatus} from './ResponsiveMobileDrawer';
import {userStatus} from './security/AuthenticatedUser';
import Typography from './Typography';
import useWidthRule from '../hooks/useWidthRule';

export const titleStatus = atom({
   key: 'titleStatus',
   default: {
      titleKey: undefined,
      titleValues: undefined,
      titleUrl: undefined,
      subtitleKey: undefined,
      subtitleValues: undefined,
      showTitles: false,
      videoId: undefined,
      helpKey: undefined,
      showSelect: true,
   },
});

const useStyles = makeStyles((theme) => ({
   appBar: {
      zIndex: theme.zIndex.drawer + 1,
      flex: '0 0 auto',
      height: APPBAR_HEIGHT,
      [theme.breakpoints.down('sm')]: {
         height: APPBAR_SMALL_HEIGHT,
         paddingLeft: theme.spacing(0),
         paddingRight: theme.spacing(0),
      },
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(1),
      },
   },
   toolBarStyle: {
      [theme.breakpoints.up('md')]: {
         height: APPBAR_HEIGHT,
         minHeight: APPBAR_HEIGHT,
      },
      [theme.breakpoints.down('sm')]: {
         height: APPBAR_SMALL_HEIGHT,
         minHeight: APPBAR_SMALL_HEIGHT,
      },
      [theme.breakpoints.down('sm')]: {
         paddingLeft: 2,
         paddingRight: 2,
      },
   },
   imageStyle: {
      display: 'block',
      height: 'calc(4vw + 18px)',
      maxHeight: 58,
      minHeight: 38,
   },
   iconStyle: {
      [theme.breakpoints.down('sm')]: {
         fontSize: '2rem',
      },
   },
   titleStyle: {
      // width: '100%',
      color: theme.palette.text.primary,
   },
   subtitleStyle: {
      width: '100%',
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
      marginTop: theme.spacing(3),
   },
}));

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function WebAppBar({children}) {
   const classes = useStyles();
   const history = useHistory();
   const isSmallWidth = useWidthRule('down', 'xs');
   const user = useRecoilValue(userStatus);
   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);

   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
   const [{titleKey, titleValues, titleUrl, subtitleKey, subtitleValues, showTitles}] = useRecoilState(titleStatus);

   const handleClose = () => {
      setIsAccountMenuOpen(false);
   };

   const handleMenu = () => {
      setIsAccountMenuOpen(true);
   };

   const handleLogoutChange = (event) => {
      if (event.target.value === 'logout') {
         Auth.signOut();
      }
   };

   const handleClick = (event) => {
      event.stopPropagation();
      event.preventDefault();

      history.push(DEFAULT_PATH);
   };

   const handleMenuClick = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };

   const LinkComponent = titleUrl ? Link : Fragment;
   const toProp = titleUrl ? {to: titleUrl} : {};

   return (
      <AppBar position='relative' color={'inherit'} className={classes.appBar}>
         <Toolbar className={classes.toolBarStyle}>
            <Grid container justify={'space-between'} alignItems={'center'} direction={'row'} wrap={'nowrap'}>
               <Grid
                  item
                  container
                  fullWidth={false}
                  alignItems={'center'}
                  direction={'row'}
                  wrap={'nowrap'}
                  resizable={false}
               >
                  <Grid item>
                     <Hidden mdUp implementation='css'>
                        <IconButton edge='start' size='small' color='primary' onClick={handleMenuClick}>
                           <Menu />
                        </IconButton>
                     </Hidden>
                  </Grid>
                  <Grid item fullHeight resizable={false}>
                     <img alt='' className={classes.imageStyle} src={LOGO} onClick={handleClick} />
                  </Grid>
                  <Hidden xsDown>
                     <Grid item resizable={false}>
                        {process.env.REACT_APP_VERSION}
                     </Grid>
                  </Hidden>
               </Grid>
               {showTitles && titleKey && (
                  <Grid name={'TitleCard-title'} item className={classes.titleGridStyle} resizable fullWidth={false}>
                     <LinkComponent {...toProp}>
                        <Typography
                           id={titleKey}
                           values={titleValues}
                           className={classes.titleStyle}
                           variant={'h5'}
                           align={'center'}
                        />
                     </LinkComponent>
                     {subtitleKey && (
                        <Typography
                           id={subtitleKey}
                           values={subtitleValues}
                           className={classes.subtitleStyle}
                           variant={'subtitle1'}
                           noWrap
                           align={'center'}
                        />
                     )}
                  </Grid>
               )}
               {children}
               <Grid
                  container
                  alignItems={'center'}
                  fullWidth={false}
                  direction={'column'}
                  wrap={'nowrap'}
                  resizable={false}
               >
                  <FormControl className={classes.formControl}>
                     <Select
                        open={isAccountMenuOpen}
                        className={classes.selectStyle}
                        onClose={handleClose}
                        onOpen={handleMenu}
                        renderValue={() => (
                           <Grid container wrap={'nowrap'} direction={'row'} alignItems={'center'}>
                              <Person fontSize={isSmallWidth ? 'default' : 'large'} color={'primary'} />
                              <Hidden mdDown>
                                 <Typography variant={'body2'} color={'primary'}>
                                    {user?.name}
                                 </Typography>
                              </Hidden>
                           </Grid>
                        )}
                        disableUnderline={true}
                        displayEmpty={true}
                        value={''}
                        onChange={handleLogoutChange}
                     >
                        <MenuItem value='logout'>
                           <Typography id='path.logout' />
                        </MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
            </Grid>
         </Toolbar>
      </AppBar>
   );
}
