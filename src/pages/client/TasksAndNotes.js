import makeStyles from '@material-ui/core/styles/makeStyles';
import {sortBy} from 'lodash';
import debounce from 'lodash/debounce';
import moment from 'moment';
import {useEffect} from 'react';
import {useCallback} from 'react';
import {useRef} from 'react';
import React, {useMemo} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {validate} from 'uuid';
import ButtonLF from '../../components/ButtonLF';
import TextFieldLF from '../../components/TextFieldLF';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {DAYS_TO_DISPLAY_COMPLETED_TASKS} from '../../Constants';
import {TASK_EDIT} from '../../Constants';
import {CLIENT_CREATE_UPDATE} from '../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../data/QueriesGL';
import {getTaskCacheQueries} from '../../data/QueriesGL';
import {TASK_CREATE_UPDATE} from '../../data/QueriesGL';
import {TASK_CURRENT_QUERY} from '../../data/QueriesGL';
import {completedDuringLastInterval} from '../../data/TaskUtil';
import CheckboxFHG from '../../fhg/components/CheckboxFHG';
import useEditData from '../../fhg/components/edit/useEditData';
import Grid from '../../fhg/components/Grid';
import ProgressIndicator from '../../fhg/components/ProgressIndicator';
import TableFHG from '../../fhg/components/table/TableFHG';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import {cacheUpdate} from '../../fhg/utils/DataUtil';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         padding: theme.spacing(4, 3, 4, 0),
      },
      headerTextStyle: {
         fontWeight: 500,
      },
      tableStyle: {
         cursor: 'pointer',
         maxWidth: 980,
         minWidth: 400,
         overflow: 'auto',
      },

      selectEntityStyle: {
         textAlign: 'center',
      },
      treeLabelStyle: {
         cursor: 'pointer',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      taskCompletedStyle: {
         cursor: 'pointer',
         color: theme.palette.grey[500],
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      taskDisabledStyle: {
         cursor: 'default',
         color: theme.palette.action.disabled,
      },
      checkboxStyle: {
         marginTop: 0,
         marginRight: theme.spacing(0),
         marginLeft: theme.spacing(0),
      },
      checkboxDisabledStyle: {
         marginTop: 0,
         marginRight: theme.spacing(0),
         marginLeft: theme.spacing(0),
         '& .MuiCheckbox-colorSecondary.Mui-checked': {
            color: theme.palette.grey[500],
         },
      },
      headerStyle: {
         padding: theme.spacing(1, 1, 0.5, 1),
         cursor: 'pointer',
      },
      cardStyle: {
         cursor: 'pointer',
         marginTop: 12,
         fontSize: 20,
         backgroundColor: '#F0F6EA',
         minWidth: 280,
         minHeight: 80,
         borderRadius: 8,
         margin: 12,
      },
      progressStyle: {
         position: 'relative',
         top: '50%',
         left: '50%',
         zIndex: 5000,
      },
      noteStyle: {
         maxWidth: 980,
      },
   }),
   {name: 'TaskAndNotesStyles'}
);

/**
 * Task and Notes component for the clients. Display tasks for a client (all entities).
 *
 * Reviewed:
 */
export default function TasksAndNotes() {
   const {clientId} = useParams();
   const classes = useStyles();
   const history = useHistory();
   const location = useLocation();

   const [clientCreateUpdate] = useMutationFHG(CLIENT_CREATE_UPDATE);

   const editItem = {
      subject: '',
      description: '',
      isCompleted: false,
      dueDate: null,
      clientId,
      entityId: 0,
      lastCompletionDateTime: Date.now(),
      userId: 0,
      repeatTask: false,
      repeatAmount: 1,
      repeatInterval: 'Month',
      isDeleted: false,
   };

   const handleChangeCallback = (changed) => {
      handleSubmitDebounced(changed);
   };

   const [
      editValues,
      handleChange,
      {
         defaultValues,
         setDefaultValues,
         // getValue
      },
   ] = useEditData(undefined, undefined, undefined, handleChangeCallback);

   const [taskData] = useQueryFHG(
      TASK_CURRENT_QUERY,
      {
         variables: {clientId, completedDays: DAYS_TO_DISPLAY_COMPLETED_TASKS},
         skip: !validate(clientId),
      },
      'task.type',
      false
   );
   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {variables: {clientId}, skip: !validate(clientId)},
      'client.type'
   );

   const [taskCreateUpdate] = useMutationFHG(TASK_CREATE_UPDATE);

   /**
    * Submit the client to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (changes) => {
         try {
            await clientCreateUpdate({variables: changes});
         } catch (e) {
            //Intentionally left blank
         }
      },
      [clientCreateUpdate]
   );

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   /**
    * Get the list of tasks that should be displayed based on client or entity.
    */
   const tasks = useMemo(() => {
      if (taskData?.tasks?.length > 0) {
         let tasks = [];
         for (const task of taskData.tasks) {
            tasks.push(task);

            if (completedDuringLastInterval(task)) {
               tasks.push({...task, isCompleted: true, id: 'dup' + task.id});
            }
         }
         return sortBy(tasks, ['isCompleted', 'nextDueDate']);
      } else {
         return [];
      }
   }, [taskData]);
   // const [taskCreateUpdate] = useMutationFHG(TASK_CREATE_UPDATE);

   usePageTitle({titleKey: 'task.tasksNotes.title'});

   useEffect(() => {
      if (clientData) {
         setDefaultValues({id: clientData.client.id, note: clientData.client.note});
      }
   }, [clientData, setDefaultValues]);

   /**
    * Toggles a task completed state.
    *
    * @param task The task to toggle
    * @return {(function(): Promise<void>)|*}
    */
   const handleTaskToggle = useCallback(
      (task) => async () => {
         const variables = {id: task?.id, clientId, isCompleted: !task?.isCompleted};
         if (!task.repeatTask) {
            variables.lastCompletionDateTime = undefined;
         }
         await taskCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               task: {
                  __typename: 'Task',
                  ...editItem,
                  ...task,
                  isCompleted: !task?.isCompleted,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getTaskCacheQueries(clientId, task.id), task.id, 'task'),
         });
      },
      [clientId, taskCreateUpdate]
   );

   /**
    * On row select, navigate to show the edit drawer for the task.
    * @param original
    */
   const handleRowSelect = (original) => {
      if (!original.isCompleted || !original.repeatTask) {
         location.state = {edit: TASK_EDIT, id: original.id};
         history.replace(location);
      }
   };

   /**
    * Handle the Is Completed click. Prevent the event from being sent to the row for selection.
    * @param event the click event.
    */
   const handleClick = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
   };

   /**
    * Create the columns for the tasks table.
    */
   const columns = useMemo(() => {
      return [
         {
            accessor: 'subject',
            Header: <TypographyFHG id={'task.subject.label'} />,
            minWidth: 100,
            width: 1000,
            maxWidth: 1000,
            style: {whiteSpace: 'normal'},
         },
         {
            accessor: 'dueDate',
            width: 100,
            maxWidth: 100,
            Header: <TypographyFHG id={'task.dueDate.label'} />,
            Cell: ({row}) => {
               if (row.original.isCompleted && row.original.repeatTask) {
                  return moment(row.original.lastCompletionDateTime).format(DATE_FORMAT_KEYBOARD);
               } else {
                  return moment(row.original.dueDate).format(DATE_FORMAT_KEYBOARD);
               }
            },
         },
         {
            accessor: 'isCompleted',
            Header: <TypographyFHG id={'task.isCompleted.label'} />,

            width: 50,
            maxWidth: 80,
            tableCellProps: {align: 'center', style: {padding: 0}},
            Cell: ({row}) => {
               return (
                  // <Grid container justify={'center'}>
                  //    <Grid item>
                  <CheckboxFHG
                     key={'isCompleted'}
                     name={'isCompleted'}
                     size={'small'}
                     // onClickCapture={handleChangeCallback}
                     onClick={handleClick}
                     onChange={handleTaskToggle(row?.original)}
                     color={'default'}
                     // labelKey={'cashFlow.locked.label'}
                     value={'isCompleted'}
                     // defaultChecked={getValue('isCompleted')}
                     checked={row.values.isCompleted}
                     marginTop={0}
                     marginLeft={0}
                     // fullWidth
                     disabled={row.original.isCompleted && row.original.repeatTask}
                  />
                  //    </Grid>
                  // </Grid>
               );
            },
         },
      ];
   }, [handleTaskToggle]);

   const handleNewTask = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      location.state = {edit: TASK_EDIT};
      history.replace(location);
   };

   const getCellProps = (cell) => {
      return {
         color: cell?.row?.original?.isCompleted && cell?.row?.original?.repeatTask ? '#ababab' : undefined,
      };
   };

   return (
      <Grid container fullWidth fullHeight direction={'column'} spacing={2} wrap={'nowrap'} className={classes.root}>
         <Grid item name={'Task Table'} className={classes.tableStyle}>
            <ProgressIndicator isGlobal={false} />
            <TableFHG
               name={'Tasks'}
               columns={columns}
               data={tasks}
               allowSearch
               getCellProps={getCellProps}
               classes={{headerTextStyle: classes.headerTextStyle, tableStyle: classes.tableStyle}}
               emptyTableMessageKey={'task.na.label'}
               onSelect={handleRowSelect}
            >
               <Grid item fullWidth>
                  <ButtonLF labelKey={'task.new.button'} onClick={handleNewTask} />
               </Grid>
            </TableFHG>
         </Grid>
         <Grid
            name={'Notes grid'}
            container
            item
            className={classes.noteStyle}
            direction={'column'}
            wrap={'nowrap'}
            resizable={false}
         >
            <TextFieldLF
               key={'note' + defaultValues.id}
               name={'note'}
               labelKey={'task.notes.label'}
               onChange={handleChange}
               defaultValue={defaultValues.note}
               value={editValues.note}
               multiline
               rows={8}
               // disabled={isSaving}
               onBlur={handleSubmitDebounced.flush}
            />
         </Grid>
      </Grid>
   );
}
