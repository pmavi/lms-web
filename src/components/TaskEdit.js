import {Divider} from '@material-ui/core';
import {List} from '@material-ui/core';
import {ListItemText} from '@material-ui/core';
import {ListItem} from '@material-ui/core';
import {Collapse} from '@material-ui/core';
import {TextField} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {Delete} from '@material-ui/icons';
import {ExpandLess} from '@material-ui/icons';
import {ExpandMore} from '@material-ui/icons';
import moment from 'moment';
import {Fragment} from 'react';
import {useMemo} from 'react';
import React, {useState, useCallback} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {v4 as uuid, validate} from 'uuid';
import {DATE_TIME_FORMAT} from '../Constants';
import {DATE_FORMAT_KEYBOARD} from '../Constants';
import {TASK_DELETE} from '../data/QueriesGL';
import {getTaskHistoryCacheQueries} from '../data/QueriesGL';
import {TASK_HISTORY_DELETE} from '../data/QueriesGL';
import {TASK_QUERY} from '../data/QueriesGL';
import {TASK_HISTORY_TASK_QUERY} from '../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import {getTaskCacheQueries} from '../data/QueriesGL';
import {TASK_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import CheckboxFHG from '../fhg/components/CheckboxFHG';
import ConfirmButton from '../fhg/components/ConfirmButton';
import Form from '../fhg/components/edit/Form';
import Prompt from '../fhg/components/edit/Prompt';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import KeyboardDatePickerFHG from '../fhg/components/KeyboardDatePickerFHG';
import Loading from '../fhg/components/Loading';
import ProgressButton from '../fhg/components/ProgressButton';
import TypographyFHG from '../fhg/components/Typography';
import useLazyQueryFHG from '../fhg/hooks/data/useLazyQueryFHG';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../fhg/hooks/useKeyDown';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import AutocompleteLF from './AutocompleteLF';
import AutocompleteLF2 from './AutocompleteLF2';
import TextFieldLF from './TextFieldLF';
import {useLocation} from 'react-router-dom';
import defer from 'lodash/defer';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import capitalize from 'lodash/capitalize';

const REPEAT_INTERVALS = ['Days', 'Weeks', 'Months', 'Years'];

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
      historyStyle: {
         fontSize: '16px !important',
      },
      buttonStyle: {
         // margin: theme.spacing(1),
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
   {name: 'TaskEditStyles'}
);

export default function TaskEdit() {
   const classes = useStyles();
   const theme = useTheme();
   const {clientId} = useParams();
   const history = useHistory();
   const editItem = {
      id: uuid(),
      subject: '',
      isCompleted: false,
      dueDate: null,
      clientId,
      repeatTask: false,
      repeatAmount: 1,
      repeatInterval: 'Month',
      isDeleted: false,
   };

   const location = useLocation();
   const taskId = location?.state?.id;
   const isNew = !taskId;

   const [userData] = useQueryFHG(USER_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)}, 'user.type');
   const users = useMemo(
      () => map(userData?.users || [], (user) => ({...user, name: user.contactName})),
      [userData?.users]
   );
   const [taskData] = useQueryFHG(TASK_QUERY, {variables: {taskId}, skip: !taskId}, 'task.type');
   const [taskCreateUpdate] = useMutationFHG(TASK_CREATE_UPDATE);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   //Get the last
   const lastHistoryVariables = {taskId, completionDateTime: taskData?.task?.lastCompletionDate};
   const [lastHistoryData] = useQueryFHG(
      TASK_HISTORY_TASK_QUERY,
      {variables: lastHistoryVariables, skip: !taskId || !taskData?.task?.lastCompletionDate},
      'taskHistory.type',
      false
   );
   const [loadHistory, {data: historyData, loading}] = useLazyQueryFHG(
      TASK_HISTORY_TASK_QUERY,
      undefined,
      'taskHistory.type',
      false
   );
   const [taskHistoryDelete] = useMutationFHG(TASK_HISTORY_DELETE);

   const taskHistory = useMemo(() => {
      if (historyData?.taskHistory?.length > 0) {
         return historyData.taskHistory;
      } else if (taskData?.task?.lastCompletionDateTime) {
         return [
            {
               id: 'history' + taskData.task.id,
               completionDateTime: taskData.task.lastCompletionDateTime,
            },
         ];
      } else {
         return [];
      }
   }, [historyData, taskData?.task?.id, taskData?.task?.lastCompletionDateTime]);

   const entities = sortBy(entitiesData?.entities || [], 'name');

   const [isSaving, setIsSaving] = useState(false);
   const [expanded, setExpanded] = React.useState(false);

   useEffect(() => {
      if (taskHistory) {
         const element = document.getElementById('historyId');
         if (element?.scrollIntoViewIfNeeded) {
            element.scrollIntoViewIfNeeded();
         } else {
            element?.scrollIntoView(true);
         }
      }
   }, [taskHistory]);

   const handleExpandClick = () => {
      const currentExpanded = !expanded;
      setExpanded(currentExpanded);
      if (currentExpanded && getValue('repeatTask')) {
         loadHistory({variables: {taskId}});
      }
   };

   const [editValues, handleChange, {isChanged = false, setIsChanged, defaultValues, setDefaultValues, getValue}] =
      useEditData(isNew ? editItem : undefined, ['clientId']);

   const [isPickerOpen, setIsPickerOpen] = useState(false);
   // const [weekdays, setWeekdays] = useState([]);

   const [taskDelete] = useMutationFHG(TASK_DELETE);

   const handleDeleteTask = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsSaving(true);

      if (taskData?.task?.id) {
         await taskDelete({
            variables: {id: taskData?.task?.id},
            optimisticResponse: {task_Delete: 1},
            update: cacheDelete(getTaskCacheQueries(clientId), taskData?.task?.id),
         });
      }
      setIsSaving(false);
      handleClose();
   };

   useEffect(() => {
      if (taskData?.task) {
         setDefaultValues({repeatTask: false, repeatAmount: 1, ...taskData.task});
      }
   }, [taskData, setDefaultValues]);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         history.replace(location);
      });
   }, [history, location, setIsChanged]);

   useKeyDown(handleClose);

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            if (
               lastHistoryData?.taskHistory?.id &&
               getValue('repeatTask') &&
               editValues.isCompleted === false &&
               defaultValues.isCompleted === true
            ) {
               await taskHistoryDelete({
                  variables: {id: lastHistoryData?.taskHistory?.id},
                  optimisticResponse: {taskHistory_Delete: 1},
                  update: cacheDelete(
                     getTaskHistoryCacheQueries(lastHistoryVariables.taskId, lastHistoryVariables.completionDateTime),
                     lastHistoryData?.taskHistory?.id
                  ),
               });
            }
            if (editValues.repeatTask) {
               editValues.repeatAmount = editValues.repeatAmount || 1;
               editValues.repeatInterval = editValues.repeatInterval || REPEAT_INTERVALS[2];
            }
            await taskCreateUpdate({
               variables: editValues,
               optimisticResponse: {
                  __typename: 'Mutation',
                  task: {
                     __typename: 'Task',
                     ...defaultValues,
                     ...editValues,
                     subject: '',
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getTaskCacheQueries(clientId), editValues.id, 'task'),
            });
            setIsChanged(false);
            handleClose();
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      getValue,
      lastHistoryData?.taskHistory?.id,
      lastHistoryVariables.completionDateTime,
      lastHistoryVariables.taskId,
      taskHistoryDelete,
      clientId,
      taskCreateUpdate,
      handleClose,
      isChanged,
      defaultValues,
      editValues,
      setIsChanged,
   ]);

   const handleDisableDate = (day) => {
      return !(day.isSame(moment(defaultValues.dueDate)) || day.isSameOrAfter(moment().startOf('day')));
   };

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
         <Grid item resizable={false} className={classes.infoInnerStyle}>
            <TypographyFHG variant={'h5'} id={'task.title.label'} color={'textSecondary'} gutterBottom />
         </Grid>
         <Grid item container resizable>
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Prompt when={isChanged} />
               <Grid name={'Task Edit Root'} item fullWidth className={classes.infoRootStyle} overflow={'visible'}>
                  <Grid
                     name={'Task Edit Inner'}
                     container
                     item
                     fullWidth
                     className={classes.infoInnerStyle}
                     overflow={'visible'}
                  >
                     <TextFieldLF
                        key={'subject' + defaultValues.id}
                        name={'subject'}
                        labelTemplate={'task.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.subject}
                        value={editValues.subject}
                        required
                        multiline
                        rows={2}
                        disabled={isSaving}
                     />
                     <KeyboardDatePickerFHG
                        key={'dueDate' + defaultValues.id}
                        name={'dueDate'}
                        shouldDisableDate={handleDisableDate}
                        format={DATE_FORMAT_KEYBOARD}
                        labelKey={'task.dueDate.label'}
                        defaultValue={defaultValues.dueDate}
                        value={editValues.dueDate}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                     />
                     <AutocompleteLF
                        key={`'userId ${defaultValues.id} ${users?.length}`}
                        name={'userId'}
                        options={users}
                        labelTemplate={'task.user.label'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        defaultValue={defaultValues.userId}
                        fullWidth
                     />
                     <AutocompleteLF
                        key={`'entityId ${defaultValues.id} ${entities?.length}`}
                        name={'entityId'}
                        options={entities}
                        labelTemplate={'task.entity.label'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        defaultValue={defaultValues.entityId}
                        value={editValues.entityId}
                        fullWidth
                     />
                     <CheckboxFHG
                        key={'repeatTask'}
                        name={'repeatTask'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'task.repeatTask.label'}
                        value={'repeatTask'}
                        defaultChecked={defaultValues.repeatTask}
                        checked={editValues.repeatTask}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                     {getValue('repeatTask') === true && (
                        <Grid container direction={'row'} spacing={1}>
                           <Grid item xs={4}>
                              <TextFieldLF
                                 key={'repeatAmount' + defaultValues.id}
                                 type={'number'}
                                 name={'repeatAmount'}
                                 labelTemplate={'task.{name}.label'}
                                 onChange={handleChange}
                                 defaultValue={defaultValues.repeatAmount || 1}
                                 value={editValues.repeatAmount}
                                 disabled={isSaving}
                                 required
                              />
                           </Grid>
                           <Grid item xs={8}>
                              <AutocompleteLF2
                                 key={'repeat' + defaultValues.id}
                                 name={'repeatInterval'}
                                 value={capitalize(getValue('repeatInterval', REPEAT_INTERVALS[2]))}
                                 freeSolo={false}
                                 autoHighlight
                                 onChange={handleChange}
                                 valueKey={false}
                                 onBlur={() => setIsPickerOpen(false)}
                                 onFocus={() => setIsPickerOpen(true)}
                                 options={REPEAT_INTERVALS}
                                 fullWidth
                                 required
                                 renderInput={(params) => (
                                    <TextField
                                       {...params}
                                       label={<TypographyFHG id={'task.repeat.label'} />}
                                       variant={'outlined'}
                                       size={'small'}
                                       margin={'normal'}
                                    />
                                 )}
                              />
                           </Grid>
                        </Grid>
                     )}
                     <CheckboxFHG
                        key={'isCompleted'}
                        name={'isCompleted'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'task.isCompleted.label'}
                        value={'isCompleted'}
                        defaultChecked={defaultValues.isCompleted}
                        checked={editValues.isCompleted}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                     {!isNew && (
                        <>
                           <Button
                              endIcon={expanded ? <ExpandMore /> : <ExpandLess />}
                              onClick={handleExpandClick}
                              aria-expanded={expanded}
                              aria-label='show more'
                           >
                              <TypographyFHG className={classes.historyStyle}>Show Completed Dates</TypographyFHG>
                           </Button>
                           <Collapse
                              id='historyId'
                              in={expanded}
                              timeout='auto'
                              unmountOnExit
                              style={{width: '100%', marginBottom: 8}}
                           >
                              {loading ? (
                                 <Loading isLoading={loading} />
                              ) : (
                                 <React.Fragment>
                                    {taskHistory?.length > 0 ? (
                                       <Grid container>
                                          <List dense={true} disablePadding style={{width: '100%'}}>
                                             <Divider />
                                             {taskHistory?.map((taskHistoryItem) => (
                                                <ListItem
                                                   key={'list' + taskHistoryItem?.id}
                                                   disableGutters
                                                   style={{paddingLeft: 8}}
                                                >
                                                   <ListItemText
                                                      style={{marginTop: 0, marginBottom: 0}}
                                                      primary={
                                                         <TypographyFHG variant={'subtitle2'} style={{fontSize: 16}}>
                                                            {moment(taskHistoryItem.completionDateTime).format(
                                                               DATE_TIME_FORMAT
                                                            )}
                                                         </TypographyFHG>
                                                      }
                                                   />
                                                </ListItem>
                                             ))}
                                             <Divider />
                                          </List>
                                       </Grid>
                                    ) : (
                                       <Fragment>
                                          <Divider />
                                          <Grid item style={{marginLeft: 8, paddingTop: 8, paddingBottom: 8}}>
                                             <TypographyFHG>No Task History</TypographyFHG>
                                          </Grid>
                                          <Divider />
                                       </Fragment>
                                    )}
                                 </React.Fragment>
                              )}
                           </Collapse>
                        </>
                     )}
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  overflow={'visible'}
                  resizable={false}
                  justify={'space-between'}
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
                  <Grid>
                     <ConfirmButton
                        className={classes.buttonStyle}
                        color={theme.palette.error.dark}
                        onConfirm={handleDeleteTask}
                        values={{type: 'task', name: taskData?.task?.subject}}
                        size='large'
                        submitStyle={classes.deleteColorStyle}
                        startIcon={<Delete />}
                        buttonTypographyProps={{variant: 'inherit'}}
                        disabled={isSaving || isNew}
                     />
                  </Grid>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
