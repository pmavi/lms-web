import moment from 'moment';
import {DAYS_TO_DISPLAY_COMPLETED_TASKS} from '../Constants';

export const completedDuringLastInterval = (task) => {
   if (task?.repeatTask && task?.repeatInterval && task?.repeatAmount && task?.dueDate) {
      return moment().diff(moment(task.lastCompletionDateTime), 'days') <= DAYS_TO_DISPLAY_COMPLETED_TASKS;
   }
   return false;
};
