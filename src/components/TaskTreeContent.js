import IconButton from '@material-ui/core/IconButton';
import useTheme from '@material-ui/core/styles/useTheme';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import * as PropTypes from 'prop-types';
import React from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {TASK_EDIT} from '../Constants';
import {TASK_DELETE} from '../data/QueriesGL';
import {getTaskCacheQueries} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import Grid from '../fhg/components/Grid';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';

TaskTreeContent.propTypes = {
   classes: PropTypes.any,
   task: PropTypes.any,
};

export default function TaskTreeContent({task, classes}) {
   const {clientId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const theme = useTheme();

   const [taskDelete] = useMutationFHG(TASK_DELETE);

   const handleDeleteTask = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await taskDelete({
         variables: {id: task.id},
         optimisticResponse: {task_Delete: 1},
         update: cacheDelete(getTaskCacheQueries(clientId), task.id),
      });
   };

   const handleEditTask = event => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      location.state = {edit: TASK_EDIT, id: task.id};
      history.replace(location);
   };

   return <Grid container direction={'row'} justify={'space-between'} className={classes.fadeArea} wrap={'nowrap'}>
      <Grid item>
         <TypographyFHG variant='subtitle1' color={'textPrimary'} className={classes.treeLabelStyle} onClick={handleEditTask}>
            {task?.subject}
         </TypographyFHG>
      </Grid>
      <Grid item resizable={false}>
         <ConfirmIconButton
            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
            onConfirm={handleDeleteTask}
            values={{type: 'task', name: task?.subject}}
            messageKey={'confirmRemoveValue.message'}
            buttonLabelKey={'delete.button'}
            size={'small'}
            submitStyle={classes.deleteColorStyle}
            style={{float: 'right'}}
            buttonTypographyProps={{
               color: theme.palette.error.dark,
               style: {textDecoration: 'underline'}
            }}
         >
            <Delete fontSize={'small'}/>
         </ConfirmIconButton>
         <IconButton size={'small'} onClick={handleEditTask} className={classes.fadeIn}>
            <Edit fontSize={'small'}/>
         </IconButton>
      </Grid>
   </Grid>;
}
