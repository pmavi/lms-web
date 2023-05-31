import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {MODULES_QUERY_WHERE, getModelCacheQueries, MODULES_CREATE_UPDATE, MODULE_DELETE} from '../../data/QueriesGL';
import {MODULE_EDIT, ADMIN_COURSE_PATH, APPBAR_SMALL_HEIGHT, ADMIN_DRAWER, ADMIN_COURSES_PATH} from '../../Constants';
import usePageTitle from '../hooks/usePageTitle';
import { sortBy, defer } from 'lodash';
import {Link, useHistory, useParams, useLocation} from 'react-router-dom';
import React, {useState, useEffect , useMemo } from 'react';
import {Add} from '@material-ui/icons';
import ButtonFHG from '../components/ButtonFHG';
import {v4 as uuid} from 'uuid';
import Form from '../components/edit/Form';
import Grid from '../components/Grid';
import ProgressButton from '../components/ProgressButton';
import TypographyFHG from '../components/Typography';
import useMutationFHG from '../hooks/data/useMutationFHG';
import useQueryFHG from '../hooks/data/useQueryFHG';
import {cacheDelete, cacheUpdate} from '../utils/DataUtil';
import TextFieldLF from '../../components/TextFieldLF';
import ModulesEdit from './ModulesEdit';
import IconButton from '@material-ui/core/IconButton';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import ConfirmIconButton from '../components/ConfirmIconButton';
import clsx from 'clsx';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import axios from "axios";

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         height: `100%`,
         maxHeight: '100%',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         height: `100%`,
         maxHeight: `100%`,
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
      tableMain: {
         maxHeight: '592px',
         // height: 100%
      },
      table: {
         height: '100%',
         overflow: 'auto'
      },
      tableHeading:{
         position: 'sticky',
         top: '0',
         backgroundColor: '#85AC5B',
         zIndex: '10',
         color: '#fff !important',
      },
      tableCell: {
         "$hover:hover &": {
           color: "pink"
         },
         color: '#fff !important',
      },
      tableWidth: {
         width: '90px'
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
            // textDecoration: 'underline',
         },
      },
      selectedTrBox: {
         // background: '#cce5b0'
         background: '#cce5b0 !important'
      },
      // MuiTableRow-root. MuiTableRow-hover:hover {
      //    background-color: rgba(0, 0, 0, 0.04);
      // }
      trHover:{
         '&:hover': {
            // backgroundColor: '#cce5b0'
            backgroundColor: 'rgb(0 0 0 / 11%)'
         }
      },
      moduleHeading: {
         textDecoration: 'none', 
      },
      drawerStyle: {
         padding: theme.spacing(0, 2),
         border:' 1px solid black'
      },

      paper: {
         position: 'absolute',
         width: 800,
         backgroundColor: theme.palette.background.paper,
         border: '2px solid #000',
         boxShadow: theme.shadows[5],
         padding: theme.spacing(2, 4, 3),
      },
   }),
   {name: 'ModuleEditStyles'}
);

function getModalStyle() {
   const top = 50;
   const left = 50;
   return {
     top: `${top}%`,
     left: `${left}%`,
     transform: `translate(-${top}%, -${left}%)`,
   };
}
const DEFAULT_EXPANDED = ['course'];
const TREE_CONTENT_WIDTH = 420;

export default function ModuleEdit({isAdmin = false}) {
   const classes = useStyles();
   const theme = useTheme();
   const [editValues, setEditValues] = useState({
      name: '',
      order_no: null,
   });
   const [module_id, setModuleId] = useState('');
   const [addNew, setAddNew] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [orderNumber, setOrderNumber] = useState(0);
   const [moduleCreateUpdate] = useMutationFHG(MODULES_CREATE_UPDATE);
   const location = useLocation();
   const history = useHistory();
   const [ModuleDelete] = useMutationFHG(MODULE_DELETE);
   const [modalStyle] = React.useState(getModalStyle);


   const params = useParams();
   const courseId = params.courseId;
   const moduleId = params.moduleId;

   const [moduleData] = useQueryFHG(MODULES_QUERY_WHERE, {variables: {course_id: courseId, isDeleted: false}}, 'module.type');
   usePageTitle({titleKey: 'module.title2.label'});

   
   // console.log('moduleData', moduleData)
   const sortedModules = useMemo(() => {
      if (moduleData?.modules) {
         let number = sortBy(moduleData?.modules, 'order_no');
         number = number[number.length - 1]
         if(typeof number?.order_no !== 'undefined'){
            const OrderNumber = parseInt(number?.order_no + 1)
            setOrderNumber(OrderNumber)
            setEditValues({
               order_no: OrderNumber,
            });
         }else{
            setOrderNumber(1)
            setEditValues({
               order_no: 1,
            });
         }
         return sortBy(moduleData?.modules, 'order_no');
      }
      return [];
   }, [moduleData]);

   // useEffect(() => {
   //    if(orderNumber){
   //       setEditValues({
   //          order_no: orderNumber,
   //       });
   //    }
   // }, [orderNumber])

   const handleClose = () => {
      setEditValues({
         name: '',
         order_no: orderNumber,
      });
      setModuleId('')
      setAddNew(false)
   }

   const handleChange = (e) => {
      // const target = e.target.name
      // const value = e.target.value      
      // setEditValues({
      //    ...editValues,
      //    [target]: value
      // })
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
      try {
         setIsSaving(true);
         var variables = null
         if(typeof editValues.id !== 'undefined' ){
            variables = {id: editValues.id, course_id: editValues.course_id, order_no: parseInt(editValues.order_no), name: editValues.name};
         }else{
            variables = {id: uuid(), course_id: courseId, order_no: parseInt(editValues.order_no), name: editValues.name};
         }

         await moduleCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               modules: {
                  __typename: 'Modules',
                  id: typeof editValues.id !== 'undefined' ? editValues.id : uuid(), 
                  isDeleted: false,
                  course_id: courseId,
                  order_no: parseInt(editValues.order_no),
                  name: editValues.name
               },
            },
            refetchQueries: () => getModelCacheQueries(courseId, false),
            // update: cacheUpdate(getModelCacheQueries(courseId, false), editValues.id, 'modules'),
         });

         if(type === 'edit'){
            // edit data in aws CloudSearch
            var options = {
               method: 'GET',
               // url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
               url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/search?q=${module_id}&q.options=%7Bfields:%5B'module_id'%5D%7D`,
               headers:{
                  'content-type': 'application/json',
                  'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
               },
            };
            axios(options)
               .then((res) => res.data?.hits)
               .then((hits) => hits?.hit)
               .then((dataFound) => {
                  console.log('dataFound ::::::::::::::::::', dataFound)
                  dataFound.map((itm) => {
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
                                 "module_name" : variables.name,
                              },
                              "id" : itm.id,
                              "type" : "add"
                           }
                        ])
                     };
                     axios(options)
                        .then((res) => {
                        console.log('Data update Successfully ::::::::::::::::::')
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

   });

   const handleDeleteModule = async (event, module) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await ModuleDelete({
         variables: {id: module?.id},
         optimisticResponse: {
            __typename: 'Mutation',
            modules_Delete: {
               __typename: 'modules_Delete',
               isDeleted: true,
            },
         },
         update: cacheDelete(getModelCacheQueries(courseId, false),  module?.id, 'modules'),
      });
      history.push(`/admin/course/${courseId}`);
   };

   const handleEditModule = (event, module) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setModuleId(module?.id);
      setEditValues(module);
      setAddNew(addNew => !addNew)
   };
   // const handleNewUser = (event) => {
   //    event?.stopPropagation();
   //    event?.preventDefault();

   //    location.state = {edit: COURSE_EDIT};
   //    location.pathname = ADMIN_COURSES_PATH;
   //    history.push(location);
   // };
   const handleClickLink = (link, module) => {
      location.state = {moduleData: module, courseData: location?.state?.courseData};
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
               <Form onSubmit={() =>  handleSubmit(editValues.id ?  'edit' : null) } className={classes.formStyle} encType={'multipart/form-data'}>
                  <h2> { editValues.id ? 'Edit Module' : 'Add Module' } </h2>
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
                     min={"1"}
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
               </Form>
            </div>
         </Modal>
      <Grid
         container
         fullWidth
         fullHeight
         // className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         {!isAdmin && (
            <Grid item resizable={false} className={classes.infoInnerStyle}>
               <TypographyFHG variant={'h5'} id={'lms.title.label'} color={'textSecondary'} gutterBottom />
            </Grid>
         )}
         <Grid item container resizable >
            {/* <Form onSubmit={handleSubmit} className={classes.formStyle}> */}
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
                           selected={moduleId === module.id}
                        >
                           Modules
                        </TypographyFHG>
                        <ButtonFHG 
                           startIcon={(<Add/>)} 
                           onClick={() => setAddNew(addNew => !addNew) }
                           labelKey={'module.new.button'}
                           className={classes.btnRight}
                        />
                     </div>
                     <div className={classes.main}>
                        <TableContainer className={classes.tableMain} component={Paper}>
                           <Table 
                              className={classes.table} 
                              aria-label="simple table"
                           >
                              <TableHead className={classes.tableHeading}>
                                 <TableRow>
                                    <TableCell className={classes.tableCell} >#</TableCell>
                                    <TableCell className={`${classes.tableCell} ${classes.tableWidth}`}  align="left">Order No</TableCell>
                                    <TableCell className={classes.tableCell}  align="left">Name</TableCell>
                                    <TableCell className={`${classes.tableCell} ${classes.tableWidth}`}  align="left">Action</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {typeof sortedModules !== 'undefined' && sortedModules !== null && sortedModules !== '' && sortedModules && sortedModules.length > 0 ?
                                    sortedModules.map((module, idx) => (
                                       <TableRow key={idx}
                                          className={clsx(classes.treeLabelStyle, classes.trHover, moduleId === module.id && classes.selectedTrBox )}
                                          // to={`/admin/course/${module.course_id}/${module.id}`}
                                          onClick={() => handleClickLink(`/admin/course/${module.course_id}/${module.id}`, module)}
                                          selected={moduleId === module.id}
                                          align="left" 
                                          // component={Link}
                                       >
                                          <TableCell align="left">
                                             <TypographyFHG
                                                variant='subtitle1'
                                                color={'textPrimary'}
                                                // className={classes.treeLabelStyle}
                                                // button
                                                // component={Link}
                                             >
                                                {idx + 1}
                                             </TypographyFHG>
                                          </TableCell>
                                          <TableCell align="left">
                                             <TypographyFHG
                                                variant='subtitle1'
                                                color={'textPrimary'}
                                                // className={classes.treeLabelStyle}
                                                // button
                                                // component={Link}
                                                // to={`/admin/course/${module.course_id}/${module.id}`}
                                                // selected={moduleId === module.id}
                                             >
                                                {module.order_no}
                                             </TypographyFHG>
                                          </TableCell>
                                          <TableCell align="left">
                                             <TypographyFHG
                                                variant='subtitle1'
                                                color={'textPrimary'}
                                                // className={classes.treeLabelStyle}
                                                // button
                                                // component={Link}
                                                // to={`/admin/course/${module.course_id}/${module.id}`}
                                                // selected={moduleId === module.id}
                                             >
                                                {module.name}
                                             </TypographyFHG>
                                          </TableCell>
                                          <TableCell align="left">
                                             <IconButton
                                                size={'small'}
                                                // style={{float: 'right'}}
                                                onClick={(e) => handleEditModule(e, module)}
                                                className={classes.fadeIn}
                                             >
                                                <Edit fontSize={'small'} />
                                             </IconButton>
                                             <ConfirmIconButton
                                                className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                onConfirm={(e) => handleDeleteModule(e, module)}
                                                values={{type: 'module', name: module.name}}
                                                messageKey={'confirmRemoveValue.message'}
                                                buttonLabelKey={'delete.button'}
                                                size={'small'}
                                                submitStyle={classes.deleteColorStyle}
                                                // style={{float: 'right'}}
                                                buttonTypographyProps={{
                                                   float: 'right',
                                                   color: theme.palette.error.dark,
                                                   style: {textDecoration: 'underline'},
                                                }}
                                             >
                                                <Delete fontSize={'small'} />
                                             </ConfirmIconButton>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 :
                                    <TableCell colSpan={4} className={classes.textCenter} >No module are Found</TableCell>
                                 }
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </div>
                  </Grid>
               </Grid>
            {/* </Form> */}
         </Grid>
      </Grid>
      </>
   );
}
