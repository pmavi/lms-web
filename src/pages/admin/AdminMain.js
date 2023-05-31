import {defer} from 'lodash';
import {lazy} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';
import EditDrawer from '../../components/EditDrawer';
import {FOLDER_PATH} from '../../Constants';
import {CLIENT_EDIT} from '../../Constants';
import {ENTITY_EDIT} from '../../Constants';
import {TASK_EDIT} from '../../Constants';
import {USER_EDIT} from '../../Constants';
import {ADMIN_USERS_PATH} from '../../Constants';
import {ADMIN_USER_PATH} from '../../Constants';
import {ADMIN_SETUP_PATH} from '../../Constants';
import {ADMIN_PATH} from '../../Constants';
import ClientSetup from './ClientSetup';
import {ADMIN_COURSES_PATH, ADMIN_COURSE_PATH} from '../../Constants';

const ClientEdit = lazy(() => import('../../components/ClientEdit'));
const EntityEdit = lazy(() => import('../../components/EntityEdit'));
const TaskEdit = lazy(() => import('../../components/TaskEdit'));
const UserEdit = lazy(() => import('../../components/UserEdit'));
const Users = lazy(() => import('../../components/Users'));
const LMS = lazy(() => import('../../fhg/Lms'));
const Folders = lazy(() => import('../../components/folders/Folders'));

/**
 * Main component accessible only if the user has been authenticated as an admin. Contains the routing for the admin
 * paths.
 *
 * Reviewed:
 */
export default function AdminMain() {
   const history = useHistory();
   const {entityId} = useParams();
   const location = useLocation();
   const parentEntityId = !entityId && location?.state?.parentEntityId;
   const isActive = !entityId && location?.state?.isActive;

   const handleClose = () => {
      defer(() => {
         location.state = {selectEntityId: parentEntityId, isActive};
         history.push(location);
      });
   };

   return (
      <Switch>
         <Route path={[FOLDER_PATH]}>
            <Folders />
         </Route>
         <Route exact path={[ADMIN_USERS_PATH, ADMIN_USER_PATH]}>
            <Users />
         </Route>
         <Route exact path={[ADMIN_COURSES_PATH, ADMIN_COURSE_PATH]}>
            <LMS />
         </Route>
         <Route exact path={[ADMIN_PATH, ADMIN_SETUP_PATH]}>
            <ClientSetup />
            {location?.state?.edit && (
               <EditDrawer open={true} onClose={location?.state?.edit === ENTITY_EDIT && handleClose}>
                  {
                     {
                        [USER_EDIT]: <UserEdit />,
                        [TASK_EDIT]: <TaskEdit />,
                        [ENTITY_EDIT]: <EntityEdit />,
                        [CLIENT_EDIT]: <ClientEdit />,
                     }[location?.state?.edit]
                  }
               </EditDrawer>
            )}
         </Route>
      </Switch>
   );
}
