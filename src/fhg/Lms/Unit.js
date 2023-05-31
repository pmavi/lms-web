import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Modal from '@material-ui/core/Modal';
import {RESOURCES_QUERY_WHERE, UNITS_QUERY_WHERE, getUnitCacheQueries, getResourcesCacheQueries, RESOURCES_CREATE_UPDATE, UNIT_CREATE_UPDATE, UNIT_DELETE, RESOURCES_EDIT, RESOURCES_DELETE, UNIT_VIDEO_DELETE, UNIT_SORT } from '../../data/QueriesGL';
import { FILE_BUCKET } from '../../Constants';
import usePageTitle from '../hooks/usePageTitle';
import { sortBy, defer } from 'lodash';
import {Storage} from 'aws-amplify';
import {Link, useHistory, useParams, useLocation } from 'react-router-dom';
import React, {useState, useCallback , useMemo, useEffect } from 'react';
import {Add, ContactSupportSharp} from '@material-ui/icons';
import ButtonFHG from '../components/ButtonFHG';
import {v4 as uuid} from 'uuid';
import Grid from '../components/Grid';
import TypographyFHG from '../components/Typography';
import useMutationFHG from '../hooks/data/useMutationFHG';
import useQueryFHG from '../hooks/data/useQueryFHG';
import {cacheDelete, cacheUpdate} from '../utils/DataUtil';
import ViewUnitModal from './Component/ViewUnitModal';
import AddEditUnitModal from './Component/AddUnitModal';
import EditUnitModal from './Component/EditUnitModal';
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
import moment from 'moment'
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import { ADMIN_COURSES_PATH, COURSE_EDIT, MODULE_EDIT, ADMIN_COURSE_PATH, APPBAR_SMALL_HEIGHT, ADMIN_DRAWER } from '../../Constants';
import axios from "axios";
import './index.css'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         height: `100%`,
         maxHeight: '100%',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      errorMessage: {
         color: 'red'
      },
      resourcesdiv: {
         borderBottom: '1px solid #e8e3e3',
         padding: '5px 0px'
      },
      labelTd:{
         width: "300px" 
      },
      fileTd:{
         width: "400px"      
      },
      pdfCursor: {
         color: 'rgb(107,146,65)',
         cursor: 'pointer',
         wordBreak: 'break-all'
      },
      processingRoot: {
         clear: 'both',
         width: '100%',
         textAlign: 'center'
      },
      resources: {
         textAlign: 'center',
         justifyContent: 'center',
         display: 'flex'
      },
      resourcesViewTable: {
         maxWidth: '800px',
         marginLeft: '50px',
         textAlign: 'center'
      },
      resourcesTable: {
         maxWidth: '550px',
         textAlign: 'center'
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
         // marginLeft: -8,
         // borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         // padding: theme.spacing(1, 2, 0),
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
      textFieldHidden: {
         background: 'white',
         color: 'white',
         marginTop: '30px',
         zIndex: '-9999',
         position: 'absolute',
      },
      height:"500px",
      paper: {
         position: 'absolute',
         width: 800,
         backgroundColor: theme.palette.background.paper,
         border: '2px solid #000',
         boxShadow: theme.shadows[5],
         padding: theme.spacing(2, 4, 3),
         maxHeight: '700px',
         overflow: 'auto',
      },
      ckEditorEdit: {
         height: '100%',
         minHeight: '400px'
      },
      errorMessage: {
         color: 'red'
      },
      textAreaEditor:{
         borderColor: 'rgba(0, 0, 0, 0.23)',
         border: '0.5px solid',
         borderRadius: '6px'
      },
      legendColor:{
         color: '#527928',
         fontSize: '13px'
      },
      maxWidthEditor:{
         maxHeight: '400px',
         height: '100%',
         width: '100%',
         // maxWidth: '728px',
         wordBreak: 'break-all',
         overflow: 'auto'
      },
      modalHeading: {
         borderBottom: '1px solid lightgray',
      },
      dialogBody:{
         color: '#707070'
      },
      viewHeading: {
         marginTop: '10px',
         // textAlign: 'center'
      },
      viewDescription: {
         margin: '20px 0px'
      },
      viewTranscript: {
         // marginTop: '10px'
      },
      button: {
         float: 'right'
      },
      floatRight: {
         float: 'right'
      },
      radioButton:{
         display: 'inline-block !important'
      }
   }),
   {name: 'ModuleEditStyles'}
);

const DEFAULT_EXPANDED = ['course'];
const TREE_CONTENT_WIDTH = 420;

function getModalStyle() {
   const top = 50;
   const left = 50;
   return {
     top: `${top}%`,
     left: `${left}%`,
     transform: `translate(-${top}%, -${left}%)`,
   };
}
 
function LinearProgressWithLabel(props) {
   return (
     <Box display="flex" alignItems="center">
       <Box width="100%" mr={1}>
         <LinearProgress variant="determinate" {...props} />
       </Box>
       <Box minWidth={35}>
         <TypographyFHG variant="body2" color="textSecondary">{`${Math.round(
           props.value,
         )}%`}</TypographyFHG>
       </Box>
     </Box>
   );
}
export default function ModuleEdit({isAdmin = false}) {
   const location = useLocation();
   const history = useHistory();
   const classes = useStyles();
   const theme = useTheme();
   const [editValues, setEditValues] = useState({
      defaultId: uuid(),
      name: '',
      description: '',
      fileLocation: '',
      originalFilename: '',
      transcript: ''
   });
   const [formErrors, setFormErrors] = useState({
      // nameValid: false,
      // passwordValid: false,
      // formValid: false
      name: '',
      description: '',
      originalFilename: '',
      transcript: '',
      label: '',
      original_filename: ''
   });
   const [inputFields, setInputFields] = useState([
      {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', selectedValue: 'pdf', uploadingResources: false, uploadingResourcesPercentage: 0, error: '', errorMessage: '',  db: false}
   ])
   const [labels, setLabels] = useState([
      {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', uploadingResources: false, uploadingResourcesPercentage: 0, error: '', errorMessage: '', db: false}
   ])
   const [processing, setProcessing] = useState(false);
   const [remove, setRemove] = useState(false);
   const [addNew, setAddNew] = useState(false);
   const [edit, setEdit] = useState(false);
   const [viewNew, setViewNew] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [uploadingResources, setUploadingResources] = useState(false);
   const [uploadingPercentage, setUploadingPercentage] = useState(0);
   const [uploadingResourcesPercentage, setUploadingResourcesPercentage] = useState(0);
   const [totalFiles, setTotalFiles] = useState(0);
   const [uploadedFiles, setUploadedFiles] = useState(0);
   const [close, setClose] = useState(false);
   const [error, setError] = useState(null);
   const [errorMessage, setErrorMessage] = useState(null);
   const [resourcesData, setResourcesData] = useState(false);

   const [unitCreateUpdate] = useMutationFHG(UNIT_CREATE_UPDATE);
   const [UnitDelete] = useMutationFHG(UNIT_DELETE);
   const [UnitVideoDelete] = useMutationFHG(UNIT_VIDEO_DELETE);
   const [UnitSort] = useMutationFHG(UNIT_SORT);
   const [ResourceDelete] = useMutationFHG(RESOURCES_DELETE);
   const [ResourceEdit] = useMutationFHG(RESOURCES_EDIT);
   const [modalStyle] = React.useState(getModalStyle);
   const [selectedValue, setSelectedValue] = useState('pdf');
   const [resourcesLength, setResourcesLength] = useState(0);
   // const [resourcesData] = useQueryFHG(RESOURCES_QUERY_WHERE, {variables: {unit_id: location?.state?.id, isDeleted: false}}, 'resources.type');

   const params = useParams();
   const moduleId = params.moduleId;
   const courseId = params.courseId;

   const [unitData] = useQueryFHG(UNITS_QUERY_WHERE, {variables: {module_id: moduleId, isDeleted: false}}, 'unit.type');
   usePageTitle({titleKey: 'unit.title.label'});
   useEffect(() => {
      setEditValues({
         defaultId: uuid(),
         name: '',
         description: '',
         fileLocation: '',
         originalFilename: '',
         transcript: ''
      });
      setClose(false)
   }, [close])

   const sortedUnits = useMemo(() => {
      // console.log('unitData', unitData)
      if (unitData?.units) {
         return sortBy(unitData?.units, 'order_no');
      }
      return [];
   }, [unitData]);

   const validateField = (fieldName, value) => {
      let fieldValidationErrors = this.state.formErrors;
      let nameValid = this.state.nameValid;
      let transcriptValid = this.state.transcriptValid;
    
      switch(fieldName) {
        case 'name':
          let name = value.trim()
          nameValid = name.length > 0;
          fieldValidationErrors.name = nameValid ? '' : ' is invalid';
          break;
        case 'password':
          transcriptValid = value.length >= 6;
          fieldValidationErrors.transcript = transcriptValid ? '': ' is too short';
          break;
        default:
          break;
      }
      // this.setState({
      //    formErrors: fieldValidationErrors,
      //    nameValid: nameValid,
      //    transcriptValid: transcriptValid
      // }, this.validateForm);
   }
    
   const validateForm = () => {
      // this.setState({formValid: this.state.nameValid && this.state.transcriptValid});
   }

   const handleRadioChange = (event, index) => {
      let data = [...inputFields];
      if(data[index] !== undefined){
         data[index]['id'] = ''
         data[index]['unit_id'] = ''
         data[index]['label'] = ''
         data[index]['type'] = ''
         data[index]['path_url'] = ''
         data[index]['original_filename'] = ''
         data[index]['selectedValue'] = event.target.value
         data[index]['uploadingResources'] = false
         data[index]['uploadingResourcesPercentage'] = 0
         data[index]['error'] = ''
         data[index]['errorMessage'] = ''
         data[index]['db'] = false
         setInputFields(data);
      }
   };
   
   const handleClose = async () => {
      setEdit(false)
      setClose(true)
      setIsSaving(false)
      setUploading(false)
      setUploadingResources(false)
      setUploadingPercentage(0)
      setUploadingResourcesPercentage(0)
      setUploadedFiles(0)
      setTotalFiles(0)
      setAddNew(false)
      setViewNew(false)
      setRemove(false)
      setEditValues({
         defaultId:  uuid(),
         name: '',
         description: '',
         fileLocation: '',
         originalFilename: '',
         transcript: ''
      });
      setSelectedValue('pdf');
      setLabels([
         {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', error: '', errorMessage: '', db: false}
      ]);
      setInputFields([
         {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', selectedValue: 'pdf', uploadingResources: false, uploadingResourcesPercentage: 0, error: '', errorMessage: '', db: false}
      ]);
      setErrorMessage(null)
      setError(null)
   }
   function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
     return result;
   } 
   const handleRemove = async (video, unit_id) => {
      const removeKey = `lms/upload/${video.originalFilename}`; 
      setRemove(true)
      setProcessing(true)
      await Storage.remove( removeKey );
      setProcessing(false)
      setEditValues({
         ...editValues,
         fileLocation: '',
         originalFilename: ''
      })
      await UnitVideoDelete({
         variables: {id: unit_id},
         optimisticResponse: {introVideo: null},
         update: cacheDelete(getUnitCacheQueries(moduleId, false), unit_id, 'units'),
      });
   };
   const handleFile = async (e) => {
      let upload = null;
      const file = e.target.files[0]
      const ext = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length);
      console.log('ext :::::::::',ext)
      if(ext == 'mov' || ext == 'mp4' ){
         try{
            if(typeof file !== 'undefined' && file && typeof editValues.fileLocation !== 'undefined' && editValues.fileLocation !== '' && editValues.fileLocation !== null){
               const removeKey = `lms/upload/${editValues.originalFilename}`; 
               setUploading(false)
               setUploadingPercentage(0)
               await Storage.remove( removeKey );
            }
            if(typeof file !== 'undefined' && file){
               console.log('file', file)
               const fileName = `${moment().unix() + makeid(5)}.${ext}`
               console.log(fileName);

               const insertKey = `lms/upload/${fileName}`; 
               setUploading(true)
               setEditValues({
                  ...editValues,
                  fileLocation: `${FILE_BUCKET}/${insertKey}`,
                  originalFilename: fileName
               })
               upload = await Storage.put(insertKey, file, {
                  level: 'public', 
                  contentType: file.type,
                  // resumable: true,
                  progressCallback: (progress) => {
                     setUploadingPercentage(progress.loaded / progress.total * 100)
                     console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                  },
                  completeCallback: (event) => {
                     setUploadingPercentage(100)
                     console.log(`Successfully uploaded ${event.key}`);
                  },
                  errorCallback: (err) => {
                     console.error('Unexpected error while uploading', err);
                  }
               })
               // setUploading(false)
            }
         }catch(err){
            setUploading(false)
            setUploadingPercentage(0)
            Storage.cancel(upload);
            console.log(err);
         }
      }else{
         setError('introVideo')
         setErrorMessage('Only .mp4 and .mov are allowed!')
      }
   }
   const handleResourcesLabel = async (index, e ,type = null) => {
      const value = e.target.value
      let trim = value.trim()
      console.log('trim ::::', trim)
      if(type !== null && typeof type !== 'undefined' && type !== ''){
         if(trim.length > 0){
            console.log('hi')
            const data = [...labels]
            data[index]['label'] = trim
            setLabels(data);
         }else{
            console.log('hello')
            const data = [...labels]
            data[index]['label'] = ''
            setLabels(data);
         }
      }else{
         if(trim.length > 0){
            console.log('hi 1')
            let data = [...inputFields];
            data[index]['label'] = trim;
            setInputFields(data);
         }else{
            console.log('hi 2')
            let data = [...inputFields];
            data[index]['label'] = '';
            setInputFields(data);
         }
      }
   }
   const handleUrl = async (index, e, selectedType , type = null ) => {
      if(type !== null && typeof type !== 'undefined' && type !== ''){
         let data = [...labels];
         data[index]['path_url'] = e.target.value;
         setLabels(data);
      }else{
         let data = [...inputFields];
         data[index]['id'] = uuid();
         data[index]['unit_id'] = typeof editValues.id !== 'undefined' && editValues.id ? editValues.id : editValues.defaultId ;
         data[index]['type'] = selectedType;
         data[index]['path_url'] = e.target.value;
         setInputFields(data);
      }
   }
   const handleResources = async (index, e, type, unit_id) => {
      const file = e.target.files[0]
      let upload = null;
      let counter = 0
      let ext = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length);
      console.log('file', file)
      let fileType = file.type.split('/')[1]
      console.log(type, 'fileType', ext)
      let data = [...inputFields];
      console.log('type :::::::::::::', type)
      console.log('ext :::::::::::::', ext)
      if((type === 'xlsx' && ext === 'xlsx') || (type === 'pdf' && ext === 'pdf') || (type === 'xlsx' && ext === 'xls')){
         if(type === 'pdf') {
            data[index]['error'] = '';                        
            data[index]['errorMessage'] = '';
         }else if(type === 'xlsx'){
            data[index]['error'] = '';
            data[index]['errorMessage'] = '';
         }

         data[index]['uploadingResources'] = false
         data[index]['uploadingResourcesPercentage'] = 0
         try{
            if(typeof file !== 'undefined' && e.target.files?.length > 0 && typeof data[index]['path_url'] !== 'undefined' && data[index]['path_url'] !== '' && data[index]['path_url'] !== null){
               if(data[index]['path_url'] !== null && data[index]['path_url'] !== ''){
                  let path = null
                  if(data[index]['type'] === 'v') path = `lms/unit/resources/videos/${data[index]['path_url']}`
                  else if(data[index]['type'] === 'i')  path = `lms/unit/resources/images/${data[index]['path_url']}`
                  else if(data[index]['type'] === 'pdf')  path = `lms/unit/resources/pdf/${data[index]['path_url']}`
                  else if(data[index]['type'] === 'xlsx')  path = `lms/unit/resources/xlsx/${data[index]['path_url']}`
         
                  const removeKey = path; 
                  console.log('removeKey', removeKey)
                  data[index]['uploadingResources'] = false
                  data[index]['uploadingResourcesPercentage'] = 0
                  await Storage.remove( removeKey );
               }
            }
            let name = null
            if(type === 'v') name = 'videos'
            else if(type === 'i')  name = 'images'
            else if(type === 'pdf')  name = 'pdf'
            else if(type === 'xlsx')  name = 'xlsx'
            
            setTotalFiles(file?.length)
            // for (const file of file) {
               if(typeof file !== 'undefined' && file){
                  let fileName = `${moment().unix() + makeid(5)}.${ext}`
                  console.log(fileName);
                  let insertKey = `lms/unit/resources/${name}/${fileName}`; 
                  data[index]['uploadingResources'] = true
                  data[index]['id'] = uuid();
                  data[index]['unit_id'] = typeof editValues.id !== 'undefined' && editValues.id ? editValues.id : editValues.defaultId ;
                  // data[index]['label'] = file.name;
                  data[index]['type'] = type;
                  data[index]['path_url'] = `${insertKey}`;
                  data[index]['original_filename'] = file.name;
                  upload = await Storage.put(insertKey, file, {
                     level: 'public', 
                     contentType: file.type,
                     // resumable: true,
                     progressCallback: (progress) => {
                        data[index]['uploadingResourcesPercentage'] = progress.loaded / progress.total * 100
                        if(progress.loaded / progress.total * 100 === 100){
                           counter++
                        }
                     },
                     completeCallback: (event) => {
                        setUploadingResourcesPercentage(100)
                        data[index]['uploadingResourcesPercentage'] = 100
                     },
                     errorCallback: (err) => {
                        console.error('Unexpected error while uploading', err);
                     }
                  })
                  setUploadedFiles(counter)
               }
            // }
            setInputFields(data);
         }catch(err){
            // setUploadingResources(false)
            // setUploadingResourcesPercentage(0)
            data[index]['uploadingResources'] = false
            data[index]['uploadingResourcesPercentage'] = 0
            Storage.cancel(upload);
            setInputFields(data);
            console.log(err);
         }
      }else {
         if(type === 'pdf') {
            data[index]['error'] = type;                        
            data[index]['errorMessage'] = 'Only pdf are allowed!';
         }else if(type === 'xlsx'){
            data[index]['error'] = type;
            data[index]['errorMessage'] = 'Only .xlsx and .xls are allowed!';
         }
         setInputFields(data);
      }
   }
   const handleEditorChange = (data) => {
      setEditValues({
         ...editValues,
         description: data
      })
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
   const handleEditUnit = (event, unit) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      const introVideo = JSON.parse(unit.introVideo)
      setEditValues({
         ...unit,
         fileLocation: introVideo?.fileLocation,
         originalFilename: introVideo?.originalFilename,
      });
      const resources = unit.resources
      setResourcesLength(resources?.length)
      let arr = []
      if(resources?.length > 0) {
         const data = sortBy(resources, 'label');
         data.map(itm => {
            const {id, unit_id, label, type, path_url, original_filename} = itm
            arr.push({ id, unit_id, label, type, path_url, original_filename, selectedValue: type, uploadingResources: false, uploadingResourcesPercentage: 0, db: true })
         })
         setLabels(arr)
         setInputFields(arr)
      }
      setEdit(true)
      // setAddNew(addNew => !addNew)
   }; 
   const handleViewtUnit = (event, unit) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setEditValues(unit);
      const resources = unit.resources
      setResourcesData(resources)
      setViewNew(true)
   }; 
   const handleEditSubmit = (async () => {
      // const resources = [...inputFields, ...labels]
      const resources = [...inputFields]
      if((uploadingPercentage === 100 || uploadingResourcesPercentage === 100) || editValues.id ){
         try {
            const unit_id = resources[0]?.unit_id

            let variables = null
            setIsSaving(true);
            if(typeof editValues.id !== 'undefined' ){
               if(resources.length > 0 && resources[0].label !== ''){
                  variables = {
                     ...editValues, 
                     module_id: moduleId,
                     resources: JSON.stringify(resources) 
                  };
               }else{
                  variables = {
                     ...editValues, 
                     module_id: moduleId
                  };
               }
            }
            await unitCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  units: {
                     __typename: 'Units',
                     module_id: moduleId,
                     isDeleted: false,
                     introVideo: editValues.fileLocation,
                     ...editValues,
                     resources: JSON.stringify(resources) 
                  },
               },
               refetchQueries: getUnitCacheQueries(moduleId, false),
               // update: cacheUpdate(getUnitCacheQueries(moduleId, false), editValues.id, 'units'),
            });
            
            // uploading data on aws cloud search
            const courseData = location?.state?.courseData
            const moduleData = location?.state?.moduleData
            const { id, name, description, transcript } = variables
            const keywords = []
            // console.log('courseData :::::::::::', courseData)
            // console.log('moduleData :::::::::::', moduleData)
            const keywordsData = JSON.parse(courseData?.keywords)
            if(keywordsData?.length > 0 ){
               await keywordsData.map(itm => {
                  keywords.push(itm.text)
               })
            }
            const des = await removeTags(description)
            let deleteData = false

            // delete data from aws CloudSearch
            var options = {
               method: 'POST',
               url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
               headers:{
                  'content-type': 'application/json',
                  'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
               },
               data: JSON.stringify([
                  {
                     "id" : id,
                     "type" : "delete"
                  }
               ])
            };
            await axios(options)
               .then((res) => {
                  deleteData = true
                  console.log('res ::::::::::::::::::',res.data)
               })
               .catch((err) => {
                  console.log('err :::::::::::::::::: delete',err)
               })
            // end data deleted from aws CloudSearch
            if(deleteData === true){
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
                           "name" : name,
                           "description" : des,
                           "transcript" : transcript,
                           "id" : id,
                           "module_id" : moduleData.id,
                           "module_name" : moduleData.name,
                           "course_description" : courseData.description,
                           "course_keywords" : keywords,
                           "course_name" : courseData.name,
                           "course_id" : courseData.id
                        },
                        "id" : id,
                        "type" : "add"
                     }
                  ])
               };
               axios(options)
                  .then((res) => {
                  console.log('Data update!')
                  })
                  .catch((err) => {
                     console.log('err :::::::::::::::::: edit',err)
                  })
               // end aws CS
            }
            setIsSaving(false);
            // location.state = {unit_id: unit_id};
            // location.pathname = `/admin/course/${courseId}/${moduleId}`;
            // history.push(location);
            handleClose();
         } catch (e) {
            console.log(e);
            setIsSaving(false);
            handleClose();
         }
      }
   });
   const removeTags = (str) => {
      if ((str === null) || (str === ''))
          return false;
      else
          str = str.toString();
            
      return str.replace( /(<([^>]+)>)/ig, '');
   }
   const handleSubmit = (async () => {
      setEditValues({
         ...editValues,
         resources: inputFields
      })
      if(uploadingPercentage === 100 || uploadingResourcesPercentage === 100 ){
         try {
            let variables = null
            setIsSaving(true);
            variables = {
               id: editValues.defaultId, 
               module_id: moduleId, 
               ...editValues,
               resources: JSON.stringify(inputFields)
            };
            await unitCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  units: {
                     __typename: 'Units',
                     id: editValues.defaultId, 
                     module_id: moduleId,
                     isDeleted: false,
                     introVideo: editValues.fileLocation,
                     ...editValues,
                     resources: inputFields
                  },
               },
               refetchQueries: getUnitCacheQueries(moduleId, false),
            });

            // uploading data on aws cloud search
            const courseData = location?.state?.courseData
            const moduleData = location?.state?.moduleData
            const { id, name, description, transcript } = variables
            const keywords = []

            const keywordsData = JSON.parse(courseData?.keywords)
            if(keywordsData?.length > 0 ){
               await JSON.parse(courseData?.keywords).map(itm => {
                  keywords.push(itm.name)
               })
            }
            console.log('keywords :::::::::::', keywords)
            const des = await removeTags(description)

            const data = JSON.stringify([
               {
                  "fields" : {
                     "name" : name,
                     "description" : des,
                     "transcript" : transcript,
                     "id" : id,
                     "module_id" : moduleData.id,
                     "module_name" : moduleData.name,
                     "course_description" : courseData.description,
                     "course_keywords" : keywords,
                     "course_name" : courseData.name,
                     "course_id" : courseData.id
                  },
                  "id" : id,
                  "type" : "add"
               }
            ])
            var options = {
               method: 'POST',
               url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
               headers:{
                  'content-type': 'application/json',
                  'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
               },
               data
            };
            axios(options)
               .then((res) => {
                 console.log('res ::::::::::::::::::',res.data)
               })
               .catch((err) => {
                  console.log('err :::::::::::::::::: add',err)
               })
            // end aws CS
            setIsSaving(false);
            handleClose();
         } catch (e) {
            console.log(e);
            setIsSaving(false);
            handleClose();
         }
      }
   });
   const handleDeleteUnit = async (event, unit) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await UnitDelete({
         variables: {id: unit?.id},
         optimisticResponse: {
            __typename: 'Mutation',
            units_Delete: {
               __typename: 'units_Delete',
               isDeleted: true,
            },
         },
         update: cacheDelete(getUnitCacheQueries(moduleId, false),  unit?.id, 'units'),
      });
      // delete data from aws CloudSearch
      var options = {
         method: 'POST',
         url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/document`,
         headers:{
            'content-type': 'application/json',
            'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
         },
         data: JSON.stringify([
            {
               "id" : unit?.id,
               "type" : "delete"
            }
         ])
      };
      axios(options)
         .then((res) => {
           console.log('res ::::::::::::::::::',res.data)
         })
         .catch((err) => {
            console.log('err :::::::::::::::::: delete',err)
         })
      // end data deleted from aws CloudSearch
      // history.push(`/admin/course/${courseId}/${moduleId}`);
   };
   const addFields = () => {
      let newfield = {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', selectedValue: 'pdf', uploadingResources: false, uploadingResourcesPercentage: 0, error: '', errorMessage: '', db: false}
  
      setInputFields([...inputFields, newfield])
      // setTypes([...type, 0])
   }
   const removeFields = async (index) => {
      let data = [...inputFields];
      if(data[index]['path_url'] !== null && data[index]['path_url'] !== '' && data[index]['type'] !== 'url'){
         const removeKey = data[index]['path_url']; 
         console.log('removeKey', removeKey)
         await Storage.remove( removeKey );
      }
      data.splice(index, 1)
      setInputFields(data)
   }
   const removeFieldData = async (index) => {
      let data = [...inputFields];
      if(data[index]['path_url'] !== null && data[index]['path_url'] !== '' && data[index]['type'] !== 'url'){
         const removeKey = data[index]['path_url']; 
         console.log('removeKey', removeKey)
         await Storage.remove( removeKey );
      }
      data.splice(index, 1)
      let newfield = {  id: '', unit_id: '', label: '', type: '', path_url: '', original_filename: '', selectedValue: 'pdf', uploadingResources: false, uploadingResourcesPercentage: 0, error: '', errorMessage: '', db: false}
      setInputFields([...data, newfield])
   }
   const handleRemoveResources = async (itm, index) => {
      let data = [...inputFields];
      if(itm.type !== 'url'){
         const removeKey = itm.path_url; 
         await Storage.remove( removeKey );
      }
      await ResourceDelete({
         variables: {id: itm.id},
         optimisticResponse: {introVideo: null},
         update: cacheDelete(getResourcesCacheQueries(itm.unit_id, false), itm.id, 'units'),
      });
      data.splice(index, 1)
      setInputFields(data)
   };

   const handleSortUnit = async (event, unit, index, type) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      let nearestId = ''
      if(type === 'add') nearestId = sortedUnits[index - 1].id
      else nearestId = sortedUnits[index + 1].id

      console.log('nearestId ::::', nearestId)
      await UnitSort({
         variables: { id: unit.id, type, nearestId },
         optimisticResponse: {
            __typename: 'Mutation',
            units: {
               __typename: 'Units',
               id: unit.id,
               type,
               nearestId
            },
         },
         refetchQueries: getUnitCacheQueries(moduleId, false),
      });
   };
   
   return (
      <>
         <ViewUnitModal 
            viewNew={viewNew} 
            classes={classes} 
            editValues={editValues}
            resourcesData={resourcesData}
            handleClose={handleClose}
         />
         {addNew ?
            <AddEditUnitModal 
               addNew={addNew} 
               formErrors={formErrors}
               remove={remove} 
               handleSubmit={handleSubmit} 
               processing={processing}
               handleRemove={handleRemove}
               classes={classes} 
               isSaving={isSaving}
               uploading={uploading}
               uploadingPercentage={uploadingPercentage}
               editValues={editValues}
               totalFiles={totalFiles}
               uploadedFiles={uploadedFiles}
               uploadingResources={uploadingResources}
               uploadingResourcesPercentage={uploadingResourcesPercentage}
               handleChange={handleChange} 
               handleEditorChange={handleEditorChange}
               handleClose={handleClose}
               handleFile={handleFile}
               handleResources={handleResources}
               handleResourcesLabel={handleResourcesLabel}
               handleUrl={handleUrl}
               LinearProgressWithLabel={LinearProgressWithLabel}
               inputFields={inputFields}
               addFields={addFields}
               removeFields={removeFields}
               handleRadioChange={handleRadioChange}
               selectedValue={selectedValue}
               removeFieldData={removeFieldData}
               error={error}
               errorMessage={errorMessage}
            />
            :
            null
         }
         {edit ?
            <EditUnitModal 
               edit={edit} 
               remove={remove} 
               handleRadioChange={handleRadioChange}
               selectedValue={selectedValue}
               handleEditSubmit={handleEditSubmit} 
               processing={processing}
               handleRemove={handleRemove}
               classes={classes} 
               isSaving={isSaving}
               uploading={uploading}
               uploadingPercentage={uploadingPercentage}
               editValues={editValues}
               totalFiles={totalFiles}
               uploadedFiles={uploadedFiles}
               uploadingResources={uploadingResources}
               uploadingResourcesPercentage={uploadingResourcesPercentage}
               handleChange={handleChange} 
               handleEditorChange={handleEditorChange}
               handleClose={handleClose}
               handleFile={handleFile}
               handleResources={handleResources}
               LinearProgressWithLabel={LinearProgressWithLabel}
               inputFields={inputFields}
               addFields={addFields}
               removeFields={removeFields}
               removeFieldData={removeFieldData}
               handleRemoveResources={handleRemoveResources}
               // setResourcesLength={setResourcesLength}
               resourcesLength={resourcesLength}
               handleResourcesLabel={handleResourcesLabel}
               // setLabels={setLabels}
               // labels={labels}
               handleUrl={handleUrl}
               setInputFields={setInputFields}

            />
            :
            null
         }
         <Grid container fullWidth fullHeight direction={'column'} overflow={'visible'} wrap={'nowrap'} >
            {!isAdmin && (
               <Grid item resizable={false} className={classes.infoInnerStyle}>
                  <TypographyFHG variant={'h5'} id={'lms.title.label'} color={'textSecondary'} gutterBottom />
               </Grid>
            )}
            <Grid item container resizable >
                  <Grid name={'Unit Edit Root'} item fullWidth className={classes.infoRootStyle}>
                     <Grid name={'Unit Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                        <div className={classes.addButton}>
                           <TypographyFHG
                              variant='h5'
                              color={'textPrimary'}
                              className={classes.moduleHeading}
                              button
                              component={Link}
                           >
                              Units
                           </TypographyFHG>
                           <ButtonFHG 
                              startIcon={(<Add/>)} 
                              onClick={async () => {
                                    await handleClose()
                                    setAddNew(addNew => !addNew)
                                 } 
                              }
                              labelKey={'unit.new.button'}
                              className={classes.btnRight}
                           />
                        </div>
                        <div className={classes.main}>
                           <TableContainer className={classes.tableMain} component={Paper}>
                              <Table className={classes.table} aria-label="simple table">
                                 <TableHead className={classes.tableHeading}>
                                    <TableRow>
                                       <TableCell className={classes.tableCell} >#</TableCell>
                                       <TableCell className={classes.tableCell} align="left">Name</TableCell>
                                       <TableCell className={`${classes.tableCell} ${classes.tableWidth}`}  align="left">Action</TableCell>
                                    </TableRow>
                                 </TableHead>
                                 <TableBody>
                                    {typeof sortedUnits !== 'undefined' && sortedUnits !== null && sortedUnits !== '' && sortedUnits && sortedUnits.length > 0 ?
                                       sortedUnits.map((unit, idx) => (
                                          <TableRow key={idx}
                                             className={clsx(classes.treeLabelStyle, classes.trHover, moduleId === module.id && classes.selectedTrBox )}
                                             selected={moduleId === module.id}
                                             onClick={(e) => handleViewtUnit(e, unit)}
                                             align="left" 
                                          >                                             
                                             <TableCell align="left">
                                                <TypographyFHG
                                                   variant='subtitle1'
                                                   color={'textPrimary'}
                                                >
                                                   {idx + 1}
                                                </TypographyFHG>
                                             </TableCell>
                                             {/* {idx === 0 ?
                                                <TableCell align="left">
                                                   <TypographyFHG
                                                      variant='subtitle1'
                                                      color={'textPrimary'}
                                                   >
                                                      <ArrowDropDownIcon onClick={(e) => handleSortUnit(e, unit, idx, 'add')} />
                                                   </TypographyFHG>
                                                </TableCell>
                                                :
                                                <TableCell align="left">
                                                   <TypographyFHG
                                                      variant='subtitle1'
                                                      color={'textPrimary'}
                                                   >
                                                      <ArrowDropDownIcon onClick={(e) => handleSortUnit(e, unit, idx, 'add')}/>
                                                      <ArrowDropUpIcon onClick={(e) => handleSortUnit(e, unit, idx, 'minus')}/>
                                                   </TypographyFHG>
                                                </TableCell>
                                             } */}
                                            
                                             <TableCell align="left">
                                                <TypographyFHG
                                                   variant='subtitle1'
                                                   color={'textPrimary'}
                                                >
                                                   {unit.name}
                                                </TypographyFHG>
                                             </TableCell>
                                             <TableCell align="left">
                                                <IconButton
                                                   size={'small'}
                                                   onClick={(e) => handleEditUnit(e, unit)}
                                                   className={classes.fadeIn}
                                                >
                                                   <Edit fontSize={'small'} />
                                                </IconButton>
                                                <ConfirmIconButton
                                                   className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                   onConfirm={(e) => handleDeleteUnit(e, unit)}
                                                   values={{type: 'unit', name: unit.name}}
                                                   messageKey={'confirmRemoveValue.message'}
                                                   buttonLabelKey={'delete.button'}
                                                   size={'small'}
                                                   submitStyle={classes.deleteColorStyle}
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
                                       <TableCell colSpan={4} className={classes.textCenter} >No unit are Found</TableCell>
                                    }
                                 </TableBody>
                              </Table>
                           </TableContainer>
                        </div>
                     </Grid>
                  </Grid>
            </Grid>
         </Grid>
      </>
   );
}
