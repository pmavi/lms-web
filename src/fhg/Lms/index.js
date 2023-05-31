import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Add} from '@material-ui/icons';
import {sortBy, defer} from 'lodash';
import React, {useMemo, useState} from 'react';
import {Link, useHistory, useParams, useLocation} from 'react-router-dom';
import {ADMIN_COURSES_PATH, COURSE_EDIT, MODULE_EDIT, ADMIN_COURSE_PATH, APPBAR_SMALL_HEIGHT, ADMIN_DRAWER} from '../../Constants';
import {lighten} from '@material-ui/core/styles';
import {COURSE_QUERY_WHERE, COURSE_DELETE, COURSE_CREATE_UPDATE} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import Grid from '../../fhg/components/Grid';
import ResponsiveMobileDrawer from '../../fhg/components/ResponsiveMobileDrawer';
import TypographyFHG from '../../fhg/components/Typography';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import Modules from './Modules';
import ModulesEdit from './ModulesEdit';
import Unit from './Unit';
import TreeView from '@material-ui/lab/TreeView';
import StyledTreeItem from './StyledTreeItem';
import IconButton from '@material-ui/core/IconButton';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import ConfirmIconButton from '../../fhg/components/ConfirmIconButton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { cacheDelete, cacheUpdate } from '../../fhg/utils/DataUtil';
import {getCourseCacheQueries} from '../../data/QueriesGL';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import clsx from 'clsx';
import Modal from '@material-ui/core/Modal';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../components/TextFieldLF';
import TextAreaField from '../../components/TextAreaField';
import Form from '../../fhg/components/edit/Form';
import ProgressButton from '../../fhg/components/ProgressButton';
// import { WithContext as ReactTags } from 'react-tag-input';
import ReactTags from 'react-tag-autocomplete'

import "./ReactTagsAutoComplete.scss";
import axios from 'axios'
const DEFAULT_EXPANDED = ['course'];

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(0, 2),
      },
      textRight: {
         textAlign: 'right'
      },
      tags: {
         padding: '10px 0',
      },
      floatRight:{
         float: 'right'
      },
      tagInput: {
         padding: '10px 0',
      },
      remove: {
         border: 'none',
         color: 'red',
         margin: '0px 0 0 5px;',
      },
      tag: {
         background: '#527928',
         color: 'white',
         width: '50px', 
         padding: '5px',
         margin: '0 2px',
         borderRadius: '6px',
      },
      tagInputField:{
         // width: '100%',
         paddingTop: '10.5px',
         paddingBottom: '10.5px',
         border: 'none',
         borderBottom: '2px solid green',
         color: '#527928',
         // '&:focus': {
         //    border: 'none',
         //    borderBottom: '2px solid green',
         // },
      },
      textAreaEditor:{
         borderColor: 'rgba(0, 0, 0, 0.23)',
         border: '0.5px solid',
         borderRadius: '6px',
         width: '100%'
      },
      legendColor:{
         color: '#527928',
         fontSize: '13px'
      },
      textDander:{
         color: 'red'
      },
      innerGridStyle: {
         overflowY: 'none !important' 
      },
      drawerStyle: {
         padding: theme.spacing(0, 2),
      },
      inputStyle: {
         backgroundColor: theme.palette.background.default,
      },
      frameStyle: {
         padding: theme.spacing(4, 0, 3, 2),
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
         paddingTop: theme.spacing(3),
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
         opacity: 0,
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
      clearAll: {
         cursor: 'pointer',
         padding: '4px 10px',
         margin: '5px',
         background: '#f88d8d',
         color: '#fff',
         border: 'none',
         float: 'right',
         '&:hover': {
            background: '#f3adad',
         },
      },
      scroller: {
         height: '100%',
         overflow: 'auto'
      },
      paper: {
         position: 'absolute',
         width: 800,
         backgroundColor: theme.palette.background.paper,
         border: '2px solid #000',
         boxShadow: theme.shadows[5],
         padding: theme.spacing(2, 4, 3),
      },
      textDanger: {
         color: 'red'
      }
   }),
   {name: 'UsersStyles'}
);
const TREE_CONTENT_WIDTH = 250;
function getModalStyle() {
   const top = 50;
   const left = 50;
   return {
     top: `${top}%`,
     left: `${left}%`,
     transform: `translate(-${top}%, -${left}%)`,
   };
}
export default function Users() {
   const classes = useStyles();
   const history = useHistory();
   const theme = useTheme();
   const {courseId, moduleId} = useParams();
   const location = useLocation();

   const [isChanged, setIsChanged] = useState(false);
   const [editValues, setEditValues] = useState({
      name: '',
      description: '',
   });
   const [course_id, setCourseId] = useState('');
   const [isSaving, setIsSaving] = useState(false);
   const [courseCreateUpdate] = useMutationFHG(COURSE_CREATE_UPDATE);
   const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);
   const [modalStyle] = React.useState(getModalStyle);
   const [addNew, setAddNew] = useState(false);
   const [CourseDelete] = useMutationFHG(COURSE_DELETE);
   const [courseData] = useQueryFHG(COURSE_QUERY_WHERE, {variables: {active: true}}, 'lms.type');
   const [tags, setTags] = React.useState([]);
   const [error, setError] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   usePageTitle({titleKey: 'lms.admintitle.label'});

   const sortedCourses = useMemo(() => {
      console.log('courseData', courseData);
      if (courseData?.courses) {
         return sortBy(courseData?.courses, 'name');
      }
      return [];
   }, [courseData]);

   const suggestions = []
   const KeyCodes = {
      comma: 188,
      enter: 13
   }

   const delimiters = [KeyCodes.comma, KeyCodes.enter];

   const handleDelete = i => {
      setTags(tags.filter((tag, index) => index !== i));
   };

   const handleAddition = tag => {
      console.log('tag', tag)
      setTags([...tags, tag]);
   };

   const handleDrag = (tag, currPos, newPos) => {
      const newTags = tags.slice();
      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);

      // re-render
      setTags(newTags);
   };
  
    const handleTagClick = index => {
      console.log('The tag at index ' + index + ' was clicked');
    };

   const handleNodeToggle = (event, expandedNodeIds) => {
      setExpanded(expandedNodeIds);
   }

   const handleEditCourse = (event, course) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      if(course?.keywords?.length > 0){
         setTags(JSON.parse(course?.keywords))
         // delete data?.keywords
      }

      setCourseId(course?.id);
      setEditValues(course);
      setAddNew(addNew => !addNew)
   };

   const handleDeleteCourse = async (event, course) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await CourseDelete({
         variables: {id: course?.id},
         optimisticResponse: {
            __typename: 'Mutation',
            course_Delete: {
               __typename: 'course_Delete',
               active: false
            },
         },
         update: cacheDelete(getCourseCacheQueries(), course?.id, 'courses'),
      });
      // edit data in aws CloudSearch
      var options = {
         method: 'GET',
         // url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
         url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/search?q=${course?.id}&q.options=%7Bfields:%5B'course_id'%5D%7D`,
         headers:{
            'content-type': 'application/json',
            'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
         },
      };
      axios(options)
         .then((res) => res.data?.hits)
         .then((hits) => hits?.hit)
         .then((dataFound) => {
            console.log('Data Found ::::::::::::::::::', dataFound.length)
            dataFound.map(async(itm) => {
               var options = {
                  method: 'POST',
                  url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
                  headers:{
                     'content-type': 'application/json',
                     'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
                  },
                  data: JSON.stringify([
                     {
                        "id" : itm?.id,
                        "type" : "delete"
                     }
                  ])
               };
               axios(options)
                  .then((res) => res.data)
                  .then((res) => {
                     if(res.status !==  'error') console.log('Data delete Successfully ::::::::::::::::::')
                     else console.log('error ::::::::::::::::::', res?.message)
                  })
                  .catch((err) => {
                     console.log('error while deleting data::::::::::::::::::',err)
                  })
            })
         })
         .catch((err) => {
            console.log('err ::::::::::::::::::',err)
         })
      // end :- data updated in aws CloudSearch
      history.push(ADMIN_COURSES_PATH);
   };

   const handleClose = () => {
      setEditValues({
         name: '',
         order_no: null,
      });
      setTags([])
      setError(null)
      setCourseId('')
      setErrorMessage(null)
      setAddNew(false)
   }

   const handleChange = (e) => {
      const target = e.target.name
      const value = e.target.value
      let trim = value.trim()
      if(trim.length > 0){
         setEditValues({
            ...editValues,
            [target]: value
         })
      }else{
         setEditValues({
            ...editValues,
            [target]: ''
         })
      }
   }
   const handleSubmit = (async (type = null) => {
      if(tags.length > 0){
         try {
            if(typeof editValues.keywords !== 'undefined' && editValues?.keywords && editValues?.keywords?.length > 0){
               delete editValues.keywords
            }
            setIsSaving(true);
            var variables = null
            if(typeof editValues.id !== 'undefined' ){
               variables = {...editValues, keywords: JSON.stringify(tags)};
            }else{
               variables = {id: uuid(), ...editValues, keywords: JSON.stringify(tags)};
            }
            await courseCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  courses: {
                     __typename: 'Courses',
                     ...editValues,
                     active: false,
                     keywords: JSON.stringify(tags)
                  },
               },
               update: cacheUpdate(getCourseCacheQueries(), editValues.id, 'courses'),
            });
            if(type === 'edit'){
               // edit data in aws CloudSearch
               var options = {
                  method: 'GET',
                  // url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
                  url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/search?q=${course_id}&q.options=%7Bfields:%5B'course_id'%5D%7D`,
                  headers:{
                     'content-type': 'application/json',
                     'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
                  },
               };
               axios(options)
                  .then((res) => res.data?.hits)
                  .then((hits) => hits?.hit)
                  .then((dataFound) => {
                     console.log('found ::::::::::::::::::', dataFound.length)
                     dataFound.map(async(itm) => {
                        console.log('dataFound ::::::::::::::::::', itm.fields)
                        const keywords = []
                        if(tags?.length > 0 ){
                           await tags.map(itm => {
                              keywords.push(itm.text)
                           })
                        }
                        var options = {
                           method: 'POST',
                           url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
                           headers:{
                              'content-type': 'application/json',
                              'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
                           },
                           data: JSON.stringify([
                              {
                                 "fields" : {
                                    ...itm.fields, 
                                    course_name : variables.name,
                                    course_description : variables.description,
                                    course_keywords : keywords,
                                 },
                                 "id" : itm.id,
                                 "type" : "add"
                              }
                           ])
                        };
                        axios(options)
                           .then((res) => res.data)
                           .then((res) => {
                              if(res.status !==  'error') console.log('Data update Successfully ::::::::::::::::::')
                              else console.log('error ::::::::::::::::::', res?.message)
                           })
                           .catch((err) => {
                              console.log('error while uploading data::::::::::::::::::',err)
                           })
                     })
                  })
                  .catch((err) => {
                     console.log('err ::::::::::::::::::',err)
                  })
               // end :- data updated in aws CloudSearch
            }
            setIsSaving(false);
            // setIsChanged(false);
            handleClose();
         } catch (e) {
            setIsSaving(false);
         }
      }else{
         setError(true)
         setErrorMessage('Atleast one Keyword is required')
      }

   });

   const onClearAll = () => {
      setTags([]);
   };
  
   const onTagUpdate = (i, newTag) => {
      const updatedTags = tags.slice();
      updatedTags.splice(i, 1, newTag);
      setTags(updatedTags);
   };

   const handleClickLink = (link, course) => {
      location.state = {courseData: course};
      location.pathname = link;
      history.push(location);
   };
   return (
      <>
         <Modal
            open={addNew}
            onClose={handleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
         >
            <div style={modalStyle} className={classes.paper} >
               <Form onSubmit={() =>  handleSubmit(editValues.id ? 'edit' : null) } className={classes.formStyle} encType={'multipart/form-data'}>
                  <h2> { editValues.id ? 'Edit Course' : 'Add Course' } </h2>
                  <Grid name={'Course Edit Root'} item fullWidth className={classes.infoRootStyle}>
                     <Grid name={'Course Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                        <TypographyFHG variant={'h5'} id={'lms.title.label'} color={'textSecondary'} gutterBottom />
                        <TextFieldLF
                           key={'name'}
                           name={'name'}
                           autoFocus={true}
                           labelTemplate={'lms.{name}.label'}
                           onChange={(e) => handleChange(e)}
                           value={editValues.name}
                           required
                        />
                        <TextAreaField
                           key={'description'}
                           name={'description'}
                           labelTemplate={'lms.{name}.label'}
                           onChange={(e) => handleChange(e)}
                           value={editValues.description}
                           required
                        />
                        <fieldset aria-hidden="true" className={classes.textAreaEditor} ><legend  className={classes.legendColor}><span>Keywords&nbsp;*</span></legend>
                           <div >
                              {/* <ReactTags
                                 handleDelete={handleDelete}
                                 handleAddition={handleAddition}
                                 handleDrag={handleDrag}
                                 handleTagClick={handleTagClick}
                                 delimiters={delimiters}
                                 onClearAll={onClearAll}
                                 suggestions={suggestions}
                                 onTagUpdate={onTagUpdate}
                                 placeholder="Add Keywords..."
                                 // minQueryLength={2}
                                 // maxLength={5}
                                 autofocus={false}
                                 allowDeleteFromEmptyInput={true}
                                 autocomplete={true}
                                 readOnly={false}
                                 allowUnique={true}
                                 allowDragDrop={true}
                                 inline={true}
                                 allowAdditionFromPaste={true}
                                 editable={true}
                                 clearAll={true}
                                 tags={tags}
                              /> */}
                              <ReactTags
                                 tags={tags}
                                 suggestions={suggestions}
                                 onDelete={handleDelete}
                                 onAddition={handleAddition}
                                 allowNew
                                 allowBackspace={false}
                                 removeButtonText="Click to remove keyword"
                                 placeholder="Add Keywords..."
                                 minQueryLength={1}
                              />
                              <ButtonFHG
                                 variant='text'
                                 size={'large'}
                                 className={classes.clearAll}
                                 labelKey={'clear.all'}
                                 onClick={() => onClearAll()}
                              />
                           </div>
                           {error &&
                              <p className={classes.textDanger}>{errorMessage}</p>
                           }
                        </fieldset>
                        <p className={classes.textDanger}> Note:Use Tab or Enter to separate tags. </p>
                     </Grid>
                  </Grid>
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
               </Form>
            </div>
         </Modal>
         <Grid container fullWidth fullHeight className={classes.frameStyle} direction={'row'} overflow={'visible'} wrap={'nowrap'} >
            <Grid item fullHeight resizable={false}>
               <ResponsiveMobileDrawer
                  backgroundColor={theme.palette.background.default}
                  width={ADMIN_DRAWER}
                  ModalProps={{BackdropProps: {style: {height: '100%', marginTop: APPBAR_SMALL_HEIGHT}}}}
               >
                  <Grid item fullWidth className={classes.drawerStyle}>
                     {/* <Grid container item resizable={false} direction={'row'}>
                        <Grid item resizable={false} className={classes.infoInnerStyle}>
                           <TypographyFHG variant={'h5'} id={'lms.course'} color={'textSecondary'} />
                        </Grid>
                        <Grid item>
                           <ButtonFHG labelKey='lms.course.button' startIcon={<Add />} onClick={handleNewUser} />
                        </Grid>
                     </Grid> */}
                     {/* <Grid isScrollable className={classes.root}> */}
                     <Grid isScrollable container direction={'row'} justify={'flex-start'} fullHeight className={classes.innerGridStyle}>
                        <TreeView
                           className={classes.treeStyle}
                           expanded={expanded}
                           disableSelection
                           defaultCollapseIcon={<ArrowDropDownIcon style={{fontSize: 28}} />}
                           defaultExpandIcon={<ArrowRightIcon style={{fontSize: 28}} />}
                           defaultEndIcon={<div style={{width: 24}} />}
                           onNodeToggle={handleNodeToggle}
                        >
                           <div style={{position: 'relative', width: TREE_CONTENT_WIDTH}}>
                              <ButtonFHG
                                 startIcon={<Add />}
                                 // onClick={handleNewUser}
                                 onClick={() => setAddNew(addNew => !addNew) }
                                 labelKey={'lms.course.button'}
                                 className={classes.buttonStyle}
                              />
                              <StyledTreeItem nodeId='course' labelText={'Course'} className={classes.titleStyle}>
                                 {sortedCourses.map((course) => (
                                    <>
                                       <Grid container direction={'row'} justify={'space-between'} className={classes.fadeArea}>
                                          <Grid xs={9} item>
                                             <TypographyFHG 
                                                variant='subtitle1' 
                                                color={'textPrimary'} 
                                                // component={Link}
                                                // button
                                                onClick={() => handleClickLink(`/admin/course/${course.id}`, course)}
                                                // to={`/admin/course/${course.id}`}
                                                selected={courseId === course.id}
                                                className={classes.treeLabelStyle}
                                             >
                                                {course.name}
                                             </TypographyFHG>
                                          </Grid>
                                          <Grid  xs={3} className={classes.textRight} item>
                                             <ConfirmIconButton
                                                className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                onConfirm={(e) => handleDeleteCourse(e, course)}
                                                values={{type: 'course', name: course.name}}
                                                messageKey={'confirmRemoveValue.message'}
                                                buttonLabelKey={'delete.button'}
                                                size={'small'}
                                                submitStyle={classes.deleteColorStyle}
                                                style={{float: 'right'}}
                                                buttonTypographyProps={{
                                                   // float: 'right',
                                                   color: theme.palette.error.dark,
                                                   style: {textDecoration: 'underline'},
                                                }}
                                             >
                                                <Delete fontSize={'small'} />
                                             </ConfirmIconButton>
                                             <IconButton
                                                size={'small'}
                                                // style={{float: 'right'}}
                                                onClick={(e) => handleEditCourse(e, course)}
                                                className={classes.fadeIn}
                                             >
                                                <Edit fontSize={'small'} />
                                             </IconButton>
                                          </Grid>
                                       </Grid>
                                    </>
                                 ))}
                              </StyledTreeItem>
                           </div>
                        </TreeView>
                     </Grid>
                  </Grid>
               </ResponsiveMobileDrawer>
            </Grid>
            {/* {location?.state?.edit === COURSE_EDIT && (
               <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 480}}>
                  <CourseEdit isAdmin />
               </Grid>
            )} */}
            {location?.state?.id !== courseId && courseId && (
               <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 500}}>
                  <Modules isAdmin/>
               </Grid>
            )}
            {/* {location?.state?.edit === MODULE_EDIT &&  (
               <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 500}}>
                  <ModulesEdit isAdmin moduleId={location?.state?.id} />
               </Grid>
            )} */}
            {moduleId && (
               <Grid item container direction={'column'} overflow={'visible'} style={{maxWidth: 500}}>
                  <Unit isAdmin moduleId={moduleId} />
               </Grid>
            )}
         </Grid>
      </>
   );
}








