import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {defer} from 'lodash';
import React, {useState, useCallback} from 'react';
import usePageTitle from '../hooks/usePageTitle';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {ADMIN_COURSES_PATH} from '../../Constants';
import {USER_DELETE, COURSE_QUERY, getUserCacheQueries, COURSE_CREATE_UPDATE} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import Form from '../../fhg/components/edit/Form';
import Prompt from '../../fhg/components/edit/Prompt';
import Grid from '../../fhg/components/Grid';
import ProgressButton from '../../fhg/components/ProgressButton';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import {cacheDelete, cacheUpdate} from '../../fhg/utils/DataUtil';
import {USER_NODE} from '../../components/AdminDrawer';
import TextFieldLF from '../../components/TextFieldLF';
import TextAreaField from '../../components/TextAreaField';
import {useLocation} from 'react-router-dom';
import {getCourseCacheQueries} from '../../data/QueriesGL';

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
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
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
   }),
   {name: 'CourseEditStyles'}
);

export default function CourseEdit({isAdmin = false}) {
   const classes = useStyles();
   const theme = useTheme();
   const [isChanged, setIsChanged] = useState(false);
   const [editValues, setEditValues] = useState({
      name: '',
      description: '',
   });
   const [isSaving, setIsSaving] = useState(false);
   const [courseCreateUpdate] = useMutationFHG(COURSE_CREATE_UPDATE);
   const location = useLocation();
   const history = useHistory();


   const params = useParams();
   const courseId = params.courseId;

   usePageTitle({titleKey: 'lms.title2.label'});

   const [courseData] = useQueryFHG( COURSE_QUERY, {variables: {id: courseId || null, active: true}}, 'lms.type' );
   console.log('courseData', courseData)
   useEffect(() => {
      if (courseData?.courses?.length > 0) {
         setEditValues(courseData.courses[0]);
      }
   }, [courseData]);

   // const [userDelete] = useMutationFHG(USER_DELETE);

   // const [isSaving, setIsSaving] = useState(false);
   // const [
   //    editValues,
   //    handleChange,
   //    {isChanged = false, setIsChanged, defaultValues, setDefaultValues, resetValues, getValue},
   // ] = useEditData(isNew ? editItem : undefined, ['id', 'clientId']);

   // const authState = useRecoilValue(authenticationDataStatus);

   const handleClose = () => {
      // onClose?.(clientId);
      setEditValues({
         name: '',
         description: '',
      });

      defer(() => {
         if (!isAdmin) {
            location.state = {edit: undefined, nodeIdOpen: USER_NODE};
            history.replace(location);
         } else {
            history.replace(ADMIN_COURSES_PATH);
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
            variables = {...editValues};
         }else{
            variables = {id: uuid(), ...editValues};
         }

         await courseCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               courses: {
                  __typename: 'Courses',
                  ...editValues,
               },
            },
            update: cacheUpdate(getCourseCacheQueries(), editValues.id, 'courses'),
         });
         setIsSaving(false);
         // setIsChanged(false);
         handleClose();
      } catch (e) {
         setIsSaving(false);
      }

   });

   // const handleDelete = async (event) => {
   //    if (event) {
   //       event.stopPropagation();
   //       event.preventDefault();
   //    }
   //    setIsSaving(true);

   //    await userDelete({
   //       variables: {id: userId},
   //       optimisticResponse: {user_Delete: 1},
   //       update: cacheDelete(getUserCacheQueries(clientId || null), userId),
   //    });
   //    setIsSaving(false);
   //    handleClose();
   // };

   // /**
   //  * Handle onChange events for the password. Check if the password and confirm match.
   //  *
   //  * @param event The event that changed the input.
   //  * @param value The value if the component is an Autocomplete
   //  * @param name
   //  * @param reason The reason of the value change if Autocomplete
   //  */

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
               <Prompt when={isChanged} />
               <Grid name={'Course Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid name={'Course Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                     <TypographyFHG variant={'h5'} id={'lms.title.label'} color={'textSecondary'} gutterBottom />
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
                     <TextAreaField
                        key={'description'}
                        name={'description'}
                        labelTemplate={'lms.{name}.label'}
                        onChange={(e) => handleChange(e)}
                        // defaultValue={defaultValues.description}
                        value={editValues.description}
                        required
                     />
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  justify={'space-between'}
                  overflow={'visible'}
                  resizable={false}
                  alignItems={'center'}
               >
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
            </Form>
         </Grid>
      </Grid>
   );
}
