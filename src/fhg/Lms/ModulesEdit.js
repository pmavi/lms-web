import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {MODULES_QUERY_WHERE, getModelCacheQueries, MODULES_CREATE_UPDATE, MODULE_QUERY} from '../../data/QueriesGL';
import {MODULE_EDIT, ADMIN_COURSE_PATH, APPBAR_SMALL_HEIGHT, ADMIN_DRAWER, ADMIN_COURSES_PATH} from '../../Constants';
import usePageTitle from '../hooks/usePageTitle';
import { sortBy, defer } from 'lodash';
import {Link, useHistory, useParams, useLocation} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {Add} from '@material-ui/icons';
import ButtonFHG from '../components/ButtonFHG';
import {v4 as uuid} from 'uuid';
import Form from '../components/edit/Form';
import Grid from '../components/Grid';
import ProgressButton from '../components/ProgressButton';
import TypographyFHG from '../components/Typography';
import useMutationFHG from '../hooks/data/useMutationFHG';
import useQueryFHG from '../hooks/data/useQueryFHG';
import { cacheUpdate } from '../utils/DataUtil';
import TextFieldLF from '../../components/TextFieldLF';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)}px)`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'hidden',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 1),
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      addButton:{
         width: '100%',
      },
      btnRight:{
         float: 'right',
      },
      textCenter: {
         textAlign: 'center'
      },
      main: {
         width: '100%'
      },

      inputStyle: {
         backgroundColor: theme.palette.background.default,
      },
      frameStyle: {
         padding: theme.spacing(4, 2),
      },
      expand: {
         transform: 'rotate(0deg)',
         marginLeft: 'auto',
         transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
         }),
      },
      expandOpen: {
         transform: 'rotate(180deg)',
      },
      titleStyle: {
         paddingTop: theme.spacing(2),
         // position: 'relative',
      },
      fadeArea: {
         marginTop: theme.spacing(1),
         padding: '5px 0px 0px 6px',
         '&:hover $fadeIn': {
            opacity: 1,
            textDecoration: 'underline',
         },
      },
      fadeIn: {
         opacity: 1,
      },
      labelRoot: {
         '&:hover $fadeIn': {
            opacity: 1,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      buttonStyle: {
         height: 42,
         backgroundColor: '#F4F4F4',
         position: 'absolute',
         right: 0,
         top: 16,
         zIndex: 1000,
      },
      treeLabelStyle: {
         textDecoration: 'none',
         cursor: 'pointer',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      selectedBox: {
         background: 'rgba(0, 0, 0, 0.04)'
      },

      moduleHeading: {
         textDecoration: 'none', 
      },
      drawerStyle: {
         padding: theme.spacing(0, 2),
         border:' 1px solid black'
      },
   }),
   {name: 'ModuleEditStyles'}
);
const DEFAULT_EXPANDED = ['course'];
const TREE_CONTENT_WIDTH = 420;

export default function ModuleEdit({isAdmin = false, moduleId}) {
   const classes = useStyles();
   const theme = useTheme();
   const [editValues, setEditValues] = useState({
      name: '',
      order_no: null,
   });
   const [isSaving, setIsSaving] = useState(false);
   const [moduleCreateUpdate] = useMutationFHG(MODULES_CREATE_UPDATE);
   const location = useLocation();
   const history = useHistory();

   const params = useParams();
   const courseId = params.courseId;

   const [moduleData] = useQueryFHG(MODULE_QUERY, {variables: {id: moduleId, isDeleted: false}}, 'module.type');
   usePageTitle({titleKey: 'module.title2.label'});
   console.log('moduleData ::::::::', moduleData)
   useEffect(() => {
      if (moduleData?.modules?.length > 0) {
         setEditValues(moduleData.modules[0]);
      }
   }, [moduleData]);

   const handleClose = () => {
      setEditValues({
         name: '',
         order_no: null,
      });
      defer(() => {
         if (!isAdmin) {
            location.state = {edit: undefined};
            location.pathname = `/admin/course/${courseId}`;
            history.replace(location);
         } else {
            history.replace(`/admin/course/${courseId}`);
         }
      });
   }

   const handleChange = (e) => {
      const target = e.target.name
      const value = e.target.value
      setEditValues({
         ...editValues,
         [target]: value
      })
   }

   const handleSubmit = (async () => {
      try {
         setIsSaving(true);
         var variables = null
         if(typeof editValues.id !== 'undefined' ){
            variables = {id: editValues.id, course_id: editValues.course_id, order_no: parseInt(editValues.order_no), name: editValues.name};
         }

         await moduleCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               modules: {
                  __typename: 'Modules',
                  id: editValues.id, 
                  course_id: editValues.course_id, 
                  order_no: parseInt(editValues.order_no), 
                  name: editValues.name
               },
            },
            update: cacheUpdate(getModelCacheQueries(courseId, false), editValues.id, 'modules'),

         });
         setIsSaving(false);
         // setIsChanged(false);
         handleClose();
      } catch (e) {
         setIsSaving(false);
      }

   });

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         {!isAdmin && (
            <Grid item resizable={false} className={classes.infoInnerStyle}>
               <TypographyFHG variant={'h5'} id={'lms.title.label'} color={'textSecondary'} gutterBottom />
            </Grid>
         )}
         <Grid item container resizable>
            <Form onSubmit={handleSubmit} className={classes.formStyle}>
               <Grid name={'Module Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid name={'Module Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                        <div className={classes.addButton}>
                           <TypographyFHG
                              variant='h5'
                              color={'textPrimary'}
                              className={classes.moduleHeading}
                              // onClick={handleEditClient}
                              button
                              component={Link}
                           >
                              Edit Module
                           </TypographyFHG>
                        </div>
                        <div className={classes.main}>
                           <TextFieldLF
                              key={'name'}
                              name={'name'}
                              autoFocus
                              labelTemplate={'lms.{name}.label'}
                              onChange={(e) => handleChange(e)}
                              // defaultValue={defaultValues.name}
                              value={editValues.name}
                              required
                           />
                           <TextFieldLF
                              key={'order_no'}
                              name={'order_no'}
                              type='number'
                              labelTemplate={'lms.{name}.label'}
                              onChange={(e) => handleChange(e)}
                              value={editValues.order_no}
                              required
                           />
                           <Grid container item direction={'row'} fullWidth className={classes.buttonPanelStyle} justify={'space-between'} overflow={'visible'} resizable={false} alignItems={'center'} >
                              <Grid item>
                                 <ProgressButton
                                    isProgress={isSaving}
                                    variant='text'
                                    color='primary'
                                    type={'submit'}
                                    size='large'
                                    labelKey='save.label'
                                    disabled={isSaving}
                                 />
                                 <ButtonFHG
                                    variant='text'
                                    size={'large'}
                                    labelKey={'cancel.button'}
                                    disabled={isSaving}
                                    onClick={() => handleClose()}
                                 />
                              </Grid>
                           </Grid>
                        </div>
                  </Grid>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
