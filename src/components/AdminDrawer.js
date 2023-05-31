import {IconButton} from '@material-ui/core';
import {lighten} from '@material-ui/core/styles';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {CloudUpload} from '@material-ui/icons';
import {Add} from '@material-ui/icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import TreeView from '@material-ui/lab/TreeView';
import {Storage} from 'aws-amplify';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import * as PropTypes from 'prop-types';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useRecoilState} from 'recoil';
import {atom} from 'recoil';
import {FILE_BUCKET} from '../Constants';
import {CLIENT_EDIT} from '../Constants';
import {USER_EDIT} from '../Constants';
import {TASK_EDIT} from '../Constants';
import {BUCKET_NAME} from '../Constants';
import {FILE_MIME_TYPES} from '../Constants';
import {ADMIN_SETUP_PATH} from '../Constants';
import {APPBAR_SMALL_HEIGHT} from '../Constants';
import {ADMIN_DRAWER} from '../Constants';
import {FILE_ENTITY_QUERY} from '../data/QueriesGL';
import {FILE_CREATE} from '../data/QueriesGL';
import {getFileCacheQueries} from '../data/QueriesGL';
import {TASK_CLIENT_QUERY} from '../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import {CLIENT_ALL_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import AutocompleteFHG from '../fhg/components/edit/AutocompleteFHG';
import Grid from '../fhg/components/Grid';
import Loading from '../fhg/components/Loading';
import ResponsiveMobileDrawer from '../fhg/components/ResponsiveMobileDrawer';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import {cacheAdd} from '../fhg/utils/DataUtil';
import {ClientTreeContent} from './ClientTreeContent';
import EstatePlanTreeContent from './EstatePlanTreeContent';
import StyledTreeItem from './StyledTreeItem';
import TaskTreeContent from './TaskTreeContent';
import UserTreeContent from './UserTreeContent';
import filter from 'lodash/filter';
import {v4 as uuid, validate} from 'uuid';

export const ESTATE_PLAN_NODE = 'estatePlan';
export const HUSBAND_PLAN_NODE = 'husbandPlan';
export const WIFE_PLAN_NODE = 'wifePlan';
export const TASK_NODE = 'tasks';
export const USER_NODE = 'users';
export const CLIENT_NODE = 'client';
const DEFAULT_EXPANDED = [CLIENT_NODE, USER_NODE];

export const estatePlanState = atom({
   key: 'estatePlanState',
   default: false,
});

const useStyles = makeStyles(
   (theme) => ({
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
         '&:hover $fadeIn': {
            opacity: 1,
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
         cursor: 'pointer',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      progressStyle: {},
   }),
   {name: 'AdminDrawerStyles'}
);

export const WIFE_TAG = 'wife';
export const HUSBAND_TAG = 'husband';

const TREE_CONTENT_WIDTH = 260;

export default function AdminDrawer() {
   const {clientId} = useParams();
   const classes = useStyles();
   const history = useHistory();
   const theme = useTheme();

   const location = useLocation();
   const nodeIdOpen = location?.state?.nodeIdOpen;

   const [data] = useQueryFHG(CLIENT_ALL_QUERY, undefined, 'client.type');

   const clients = useMemo(() => data?.clients || [], [data]);
   const [clientIdState, setClientIdState] = useState(clientId);
   const [selectedClient, setSelectedClient] = useState();

   const [userData] = useQueryFHG(
      USER_CLIENT_QUERY,
      {variables: {clientId: clientIdState}, skip: !validate(clientIdState)},
      'user.type'
   );
   const [taskData] = useQueryFHG(
      TASK_CLIENT_QUERY,
      {variables: {clientId: clientIdState}, skip: !validate(clientIdState)},
      'task.type'
   );
   const [fileData] = useQueryFHG(
      FILE_ENTITY_QUERY,
      {variables: {clientId, tag: [HUSBAND_TAG, WIFE_TAG]}, skip: !validate(clientId)},
      'entity.type'
   );
   const [fileUploading, setFileUploading] = useState();

   const [fileCreate] = useMutationFHG(FILE_CREATE);

   const users = useMemo(() => filter(userData?.users || [], (user) => !!user?.username), [userData?.users]);
   const tasks = useMemo(() => taskData?.tasks || [], [taskData?.tasks]);

   const [hasEstatePlan, setHasEstatePlan] = useRecoilState(estatePlanState);
   const husbandFiles = useMemo(() => filter(fileData?.files, {tag: HUSBAND_TAG}), [fileData]);
   const wifeFiles = useMemo(() => filter(fileData?.files, {tag: WIFE_TAG}), [fileData]);

   const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

   useEffect(() => {
      if (!hasEstatePlan && (husbandFiles?.length > 0 || wifeFiles?.length > 0)) {
         setHasEstatePlan(true);
      }
   }, [husbandFiles, wifeFiles, hasEstatePlan, setHasEstatePlan]);

   useEffect(() => {
      if (nodeIdOpen) {
         setExpanded((expanded) => uniq([...expanded, nodeIdOpen]));
         location.state = undefined;
         history.replace(location);
      }
   }, [nodeIdOpen, setExpanded, location, history]);

   useEffect(() => {
      setClientIdState(clientId);
      setSelectedClient(clientId ? find(clients, {id: clientId}) : undefined);
   }, [clientId, clients]);

   const handleChange = (event, value, reason, newValue, name) => {
      setClientIdState(newValue[name]);
      history.push(ADMIN_SETUP_PATH.replace(':clientId?', newValue[name]));
   };

   const handleNewClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: CLIENT_EDIT};
      history.replace(location);
   };

   const handleNewUser = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: USER_EDIT};
      history.replace(location);
   };

   const handleNewTask = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: TASK_EDIT};
      history.replace(location);
   };

   const handleNodeToggle = (event, expandedNodeIds) => {
      setExpanded(expandedNodeIds);
   };

   /**
    * When the list of files is changed, add the files to be uploaded.
    * @param tag The tag for the file.
    */
   const handleFileChange = (tag) => async (event) => {
      const filesToAdd = event.target.files;
      // setNewFiles([...newFiles, ...filesToAdd]);

      if (filesToAdd?.length > 0) {
         setFileUploading(tag);
         setExpanded((expanded) => uniq([...expanded, tag === HUSBAND_TAG ? HUSBAND_PLAN_NODE : WIFE_PLAN_NODE]));

         try {
            for (const file of filesToAdd) {
               const imageKey = `upload/${file.name}`;
               await Storage.put(imageKey, file, {level: 'public', bucket: FILE_BUCKET, contentType: file.type});
               const variables = {
                  id: uuid(),
                  tag,
                  clientId,
                  fileLocation: `${BUCKET_NAME}/${imageKey}`,
                  originalFilename: file.name,
               };

               await fileCreate({
                  variables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     file: {
                        __typename: 'FileUpload',
                        id: variables.id,
                        clientId,
                        entityId: '',
                        tag,
                        fileData: {
                           id: uuid(),
                           fileFilename: file.name,
                           fileS3: '',
                           __typename: 'FileData',
                        },
                     },
                  },
                  update: cacheAdd(getFileCacheQueries(clientId, undefined, [HUSBAND_TAG, WIFE_TAG]), 'file'),
               });
            }
         } finally {
            setFileUploading(undefined);
         }
         location.state = {nodeIdOpen: tag === HUSBAND_TAG ? HUSBAND_PLAN_NODE : WIFE_PLAN_NODE};
         history.replace(location);
      }
   };

   return (
      <ResponsiveMobileDrawer
         backgroundColor={theme.palette.background.default}
         width={ADMIN_DRAWER}
         ModalProps={{BackdropProps: {style: {marginTop: APPBAR_SMALL_HEIGHT}}}}
      >
         <Grid container isScrollable fullWidth className={classes.frameStyle}>
            <Grid item fullWidth>
               <AutocompleteFHG
                  name={'clientId'}
                  labelKey={'setup.client.label'}
                  options={clients}
                  autoFocus={false}
                  disableClearable
                  onChange={handleChange}
                  value={clientIdState}
                  variant='standard'
                  noOptionsText={
                     <div>
                        <div>No Clients.</div>
                        <div>Create a new client.</div>
                     </div>
                  }
                  inputProps={{style: {backgroundColor: theme.palette.background.default}}}
               />
               {selectedClient ? (
                  <Grid container direction={'row'} justify={'flex-start'} fullHeight>
                     <TreeView
                        className={classes.treeStyle}
                        defaultExpanded={DEFAULT_EXPANDED}
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
                              onClick={handleNewClient}
                              labelKey={'client.new.button'}
                              className={classes.buttonStyle}
                           />
                           <StyledTreeItem nodeId={CLIENT_NODE} labelText={'Client'} className={classes.titleStyle}>
                              <ClientTreeContent classes={classes} client={selectedClient} />
                           </StyledTreeItem>
                        </div>
                        <div style={{position: 'relative', width: TREE_CONTENT_WIDTH}}>
                           <ButtonFHG
                              labelKey='user.new.button'
                              startIcon={<Add />}
                              className={classes.buttonStyle}
                              onClick={handleNewUser}
                           />
                           <StyledTreeItem nodeId={USER_NODE} labelText='Users' className={classes.titleStyle}>
                              {users.map((user) => (
                                 <UserTreeContent key={'User ' + user?.id} classes={classes} user={user} />
                              ))}
                           </StyledTreeItem>
                        </div>
                        <div style={{position: 'relative', width: TREE_CONTENT_WIDTH}}>
                           <ButtonFHG
                              labelKey='task.new.button'
                              startIcon={<Add />}
                              className={classes.buttonStyle}
                              onClick={handleNewTask}
                           />
                           <StyledTreeItem nodeId={TASK_NODE} labelText='Tasks' className={classes.titleStyle}>
                              {tasks.map((task) => (
                                 <TaskTreeContent key={'Task ' + task?.id} classes={classes} task={task} />
                              ))}
                           </StyledTreeItem>
                        </div>
                        <div style={{position: 'relative', width: TREE_CONTENT_WIDTH}}>
                           {(hasEstatePlan || husbandFiles?.length > 0 || wifeFiles?.length > 0) && (
                              <StyledTreeItem
                                 nodeId={ESTATE_PLAN_NODE}
                                 labelText='Estate Plan'
                                 className={classes.titleStyle}
                              >
                                 <StyledTreeItem
                                    nodeId={HUSBAND_PLAN_NODE}
                                    labelText="Husband's Plan"
                                    className={classes.titleStyle}
                                    action={
                                       <>
                                          <input
                                             key={'fileInputHusband'}
                                             id='husbandUploadId'
                                             type='file'
                                             style={{display: 'none'}}
                                             multiple
                                             onChange={handleFileChange(HUSBAND_TAG)}
                                             accept={`${[...FILE_MIME_TYPES]}`}
                                          />
                                          <label htmlFor='husbandUploadId'>
                                             {fileUploading === HUSBAND_TAG ? (
                                                <Loading
                                                   size={25}
                                                   thickness={3}
                                                   classes={{progressStyle: classes.progressStyle}}
                                                />
                                             ) : (
                                                <IconButton color='primary' component='span'>
                                                   <CloudUpload />
                                                </IconButton>
                                             )}
                                          </label>
                                       </>
                                    }
                                 >
                                    {husbandFiles.map((file) => (
                                       <EstatePlanTreeContent key={'File ' + file?.id} classes={classes} file={file} />
                                    ))}
                                 </StyledTreeItem>
                                 <StyledTreeItem
                                    nodeId={WIFE_PLAN_NODE}
                                    labelText="Wife's Plan"
                                    className={classes.titleStyle}
                                    action={
                                       <>
                                          <input
                                             key={'fileInputWife'}
                                             id='wifeUploadId'
                                             type='file'
                                             style={{display: 'none'}}
                                             multiple
                                             onChange={handleFileChange(WIFE_TAG)}
                                             accept={`${[...FILE_MIME_TYPES]}`}
                                          />
                                          <label htmlFor='wifeUploadId'>
                                             {fileUploading === WIFE_TAG ? (
                                                <Loading
                                                   size={20}
                                                   thickness={3}
                                                   classes={{progressStyle: classes.progressStyle}}
                                                />
                                             ) : (
                                                <IconButton color='primary' component='span'>
                                                   <CloudUpload />
                                                </IconButton>
                                             )}
                                          </label>
                                       </>
                                    }
                                 >
                                    {wifeFiles.map((file) => (
                                       <EstatePlanTreeContent key={'File ' + file?.id} classes={classes} file={file} />
                                    ))}
                                 </StyledTreeItem>
                              </StyledTreeItem>
                           )}
                        </div>
                     </TreeView>
                  </Grid>
               ) : (
                  <ButtonFHG
                     labelKey='client.new.button'
                     startIcon={<Add />}
                     onClick={handleNewClient}
                     style={{height: 42, backgroundColor: '#F4F4F4', borderRadius: 0}}
                  />
               )}
            </Grid>
         </Grid>
      </ResponsiveMobileDrawer>
   );
}

AdminDrawer.propTypes = {
   replaceValue: PropTypes.any,
   location: PropTypes.any,
   onClick: PropTypes.func,
};
