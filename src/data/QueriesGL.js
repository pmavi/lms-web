import gql from 'graphql-tag';
import {DAYS_TO_DISPLAY_COMPLETED_TASKS} from '../Constants';
import {UNDELETE_ACTION, DELETE_ACTION, SORT_ACTION, CREATE_UPDATE_ACTION} from '../fhg/hooks/data/useMutationFHG';
import {CLIENT_REPORT_FRAGMENT} from './FragmentsGL';
import {FOLDER_FRAGMENT} from './FragmentsGL';
import {HEDGE_CONTRACT_FRAGMENT} from './FragmentsGL';
import {FUTURE_CONTRACT_FRAGMENT} from './FragmentsGL';
import {CASH_CONTRACT_FRAGMENT} from './FragmentsGL';
import {SEAT_FRAGMENT} from './FragmentsGL';
import {COURSE_FRAGMENT, MODULES_FRAGMENT, UNITS_FRAGMENT, RESOURCES_FRAGMENT} from './FragmentsGL';
import {ENTITY_CASH_FLOW_FRAGMENT} from './FragmentsGL';
import {CASH_FLOW_FRAGMENT} from './FragmentsGL';
import {LOAN_ANALYSIS_FRAGMENT} from './FragmentsGL';
import {BALANCE_REPORT_FRAGMENT} from './FragmentsGL';
import {EXPENSE_TYPE_FRAGMENT} from './FragmentsGL';
import {INCOME_TYPE_FRAGMENT} from './FragmentsGL';
import {EXPENSE_FRAGMENT} from './FragmentsGL';
import {INCOME_FRAGMENT} from './FragmentsGL';
import {LIABILITY_FRAGMENT} from './FragmentsGL';
import {UNIT_TYPE_FRAGMENT} from './FragmentsGL';
import {TASK_HISTORY_FRAGMENT} from './FragmentsGL';
import {ASSET_FRAGMENT} from './FragmentsGL';
import {FILE_FRAGMENT} from './FragmentsGL';
import {ENTITY_FRAGMENT} from './FragmentsGL';
import {USER_FRAGMENT} from './FragmentsGL';
import {TASK_FRAGMENT} from './FragmentsGL';
import {CLIENT_FRAGMENT} from './FragmentsGL';

export const CITY_STATE_QUERY = gql`
   query getCityState {
      cities: city_All {
         id
         name
         isDeleted
      }
      states: state_All {
         id
         name
         abbreviation
         isDeleted
      }
   }
`;

export const getCityCacheQueries = () => {
   return [{query: CITY_STATE_QUERY, queryPath: 'cities'}];
};

export const CITY_CREATE_UPDATE = {
   mutation: gql`
      mutation cityCreateUpdate($id: UUID!, $name: String) {
         city: city_CreateUpdate(city: {id: $id, name: $name}) {
            id
            name
            isDeleted
         }
      }
   `,
   typeKey: 'city.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// CLIENT
export const CLIENT_ALL_QUERY = gql`
   query getAllClients {
      clients: client_All {
         ...clientInfo
      }
   }
   ${CLIENT_FRAGMENT}
`;

export const CLIENT_BY_ID_QUERY = gql`
   query getClientById($clientId: UUID!) {
      client: client_ById(clientId: $clientId) {
         ...clientInfo
      }
   }
   ${CLIENT_FRAGMENT}
`;

export const CLIENT_BY_ID_REPORT_QUERY = gql`
   query getClientById($clientId: UUID!) {
      client: client_ById(clientId: $clientId) {
         ...clientReportInfo
      }
   }
   ${CLIENT_REPORT_FRAGMENT}
`;

export const getClientCacheQueries = () => {
   return [{query: CLIENT_ALL_QUERY, queryPath: 'clients'}];
};

export const CLIENT_CREATE_UPDATE = {
   mutation: gql`
      mutation clientCreateUpdate(
         $id: UUID!
         $cityId: UUID
         $stateId: UUID
         $name: String
         $addressLineOne: String
         $addressLineTwo: String
         $email: String
         $phone: String
         $zipCode: Int
         $contactName: String
         $note: String
         $startMonth: String
      ) {
         client: client_CreateUpdate(
            client: {
               id: $id
               cityId: $cityId
               stateId: $stateId
               name: $name
               addressLineOne: $addressLineOne
               addressLineTwo: $addressLineTwo
               email: $email
               phone: $phone
               zipCode: $zipCode
               contactName: $contactName
               note: $note
               startMonth: $startMonth
            }
         ) {
            ...clientInfo
         }
      }
      ${CLIENT_FRAGMENT}
   `,
   typeKey: 'client.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the client on the server.
export const CLIENT_DELETE = {
   mutation: gql`
      mutation ClientDelete($id: UUID!) {
         client_Delete(clientId: $id)
      }
   `,
   typeKey: 'client.type',
   actionKey: DELETE_ACTION,
};

// User

export const USER_CREATE_UPDATE = {
   mutation: gql`
      mutation userCreateUpdate(
         $id: UUID!
         $clientId: UUID
         $contactName: String
         $email: String
         $username: String
         $password: String
      ) {
         user: user_CreateUpdate(
            user: {
               id: $id
               clientId: $clientId
               contactName: $contactName
               email: $email
               username: $username
               password: $password
            }
         ) {
            ...userInfo
         }
      }
      ${USER_FRAGMENT}
   `,
   typeKey: 'user.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the user on the server.
export const USER_DELETE = {
   mutation: gql`
      mutation UserDelete($id: UUID!) {
         user_Delete(userId: $id)
      }
   `,
   typeKey: 'user.type',
   actionKey: DELETE_ACTION,
};

export const USER_CLIENT_QUERY = gql`
   query getUserAllWhere($clientId: [UUID], $id: [UUID], $cognitoSub: [String]) {
      users: user_AllWhere(userSearch: {clientId: $clientId, id: $id, cognitoSub: $cognitoSub}) {
         ...userInfo
      }
   }
   ${USER_FRAGMENT}
`;

export const USER_ADMIN_QUERY = gql`
   query getAdminUser {
      users: user_AllWhere(userSearch: {clientId: null}) {
         ...userInfo
      }
   }
   ${USER_FRAGMENT}
`;

export const getUserCacheQueries = (clientId = null) => {
   return [{query: USER_CLIENT_QUERY, variables: {clientId}, queryPath: 'users'}];
};

// course
export const COURSE_QUERY_WHERE = gql`
   query getCourse($active: Boolean!) {
      courses: course_AllWhere(courseSearch: {active: $active}) {
         ...courseInfo
      }
   }
   ${COURSE_FRAGMENT}
`;
export const COURSE_ALL_QUERY_WHERE = gql`
   query getCourseAll {
      courses: course_All_with_modules {
         id
         name
         description
         active
         modules {
            id
            course_id
            name
            order_no
            units {
               id
               module_id
               name
               description
               introVideo
               transcript
            }
         }
      }
   }
`;
export const COURSE_ALL_QUERY_WHERE_ID = gql`
   query getCourseById($id: UUID, $active: Boolean!) {
      courses: course_All_with_id(courseSearch: {id: $id, active: $active}) {
         id
         name
         description
         keywords
         active
         modules {
            id
            course_id
            name
            order_no
            units {
               id
               module_id
               name
               description
               introVideo
               transcript
               markAsRead {
                  id
                  unit_id
                  user_id
               }
            }
         }
      }
   }
`;
export const COURSE_QUERY = gql`
   query getCourseById($id: UUID, $active: Boolean!) {
      courses: course_AllWhere(courseSearch: {id: $id, active: $active}) {
         ...courseInfo
      }
   }
   ${COURSE_FRAGMENT}
`;
export const getCourseCacheQueries = () => {
   return [{query: COURSE_QUERY_WHERE, variables: {active: true}, queryPath: 'courses'}];
};
export const COURSE_CREATE_UPDATE = {
   mutation: gql`
      mutation courseCreateUpdate($id: UUID!, $name: String!, $description: String!, $keywords: String!) {
         courses: course_CreateUpdate(course: {id: $id, name: $name, description: $description, keywords: $keywords}) {
            ...courseInfo
         }
      }
      ${COURSE_FRAGMENT}
   `,
   typeKey: 'lms.type',
   actionKey: CREATE_UPDATE_ACTION,
};
// Delete the course.
export const COURSE_DELETE = {
   mutation: gql`
      mutation CourseDelete($id: UUID!) {
         course_Delete(courseId: $id)
      }
   `,
   typeKey: 'lms.type',
   actionKey: DELETE_ACTION,
};
// mark as read
export const MARK_AS_READ_QUERY = gql`
   query getMarkAsRead_All($isDeleted: Boolean) {
      markAsRead: markAsRead_AllWhere(markAsReadSearch: {isDeleted: $isDeleted}) {
         id
         unit_id
         user_id
      }
   }
`;

export const MARK_AS_READ_WHERE = gql`
   query getCourseById($unit_id: UUID, $isDeleted: Boolean) {
      markAsRead: markAsRead_AllWhere(markAsReadSearch: {unit_id: $unit_id, isDeleted: $isDeleted}) {
         id
         unit_id
         user_id
      }
   }
`;
export const getMarkAsReadQueries = (unit_id, isDeleted) => {
   return [
      {query: MARK_AS_READ_WHERE, variables: {unit_id: unit_id, isDeleted: isDeleted}, queryPath: 'markAsRead.type'},
   ];
};
export const MARK_AS_READ_CREATE = {
   mutation: gql`
      mutation markAsRead_CreateUpdate($id: UUID, $unit_id: UUID) {
         markAsRead: markAsRead_CreateUpdate(markAsRead: {id: $id, unit_id: $unit_id}) {
            id
            unit_id
            user_id
         }
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};
export const MARK_AS_READ_DELETE = {
   mutation: gql`
      mutation markAsReadDelete($id: UUID!) {
         markAsRead_Delete(id: $id)
      }
   `,
   typeKey: 'unit.type',
   actionKey: DELETE_ACTION,
};
// modules
export const MODULES_QUERY_WHERE = gql`
   query getModuleAllWhere($course_id: UUID!, $isDeleted: Boolean!) {
      modules: modules_AllWhere(moduleSearch: {course_id: $course_id, isDeleted: $isDeleted}) {
         ...moduleInfo
      }
   }
   ${MODULES_FRAGMENT}
`;
export const getModelCacheQueries = (course_id, isDeleted) => {
   return [{query: MODULES_QUERY_WHERE, variables: {course_id: course_id, isDeleted: isDeleted}, queryPath: 'modules'}];
};
export const MODULE_QUERY = gql`
   query getCourseById($id: UUID, $isDeleted: Boolean!) {
      modules: modules_AllWhere(moduleSearch: {id: $id, isDeleted: $isDeleted}) {
         ...moduleInfo
      }
   }
   ${MODULES_FRAGMENT}
`;
export const MODULES_CREATE_UPDATE = {
   mutation: gql`
      mutation moduleCreateUpdate($course_id: UUID!, $id: UUID!, $name: String!, $order_no: Int!) {
         modules: module_CreateUpdate(module: {id: $id, course_id: $course_id, name: $name, order_no: $order_no}) {
            ...moduleInfo
         }
      }
      ${MODULES_FRAGMENT}
   `,
   typeKey: 'module.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const MODULE_DELETE = {
   mutation: gql`
      mutation ModuleDelete($id: UUID!) {
         modules_Delete(moduleId: $id)
      }
   `,
   typeKey: 'module.type',
   actionKey: DELETE_ACTION,
};
// Unit
export const UNITS_QUERY_WHERE = gql`
   query getUnitsAllWhere($module_id: UUID!, $isDeleted: Boolean!) {
      units: units_AllWhere(unitSearch: {module_id: $module_id, isDeleted: $isDeleted}) {
         ...unitInfo
         resources {
            id
            unit_id
            label
            type
            path_url
            isDeleted
            original_filename
         }
      }
   }
   ${UNITS_FRAGMENT}
`;

export const getUnitCacheQueries = (module_id, isDeleted) => {
   return [{query: UNITS_QUERY_WHERE, variables: {module_id: module_id, isDeleted: isDeleted}, queryPath: 'units'}];
};
export const UNIT_QUERY = gql`
   query getUnitById($id: UUID, $isDeleted: Boolean!) {
      units: units_AllWhere(unitSearch: {id: $id, isDeleted: $isDeleted}) {
         ...unitInfo
      }
   }
   ${UNITS_FRAGMENT}
`;
export const UNIT_RESOURCES_QUERY = gql`
   query getUnitAndResourcesById($id: UUID, $isDeleted: Boolean!) {
      units: units_Resources_AllWhere(unitSearch: {id: $id, isDeleted: $isDeleted}) {
         ...unitInfo
         resources {
            id
            unit_id
            label
            type
            path_url
            isDeleted
            original_filename
         }
         markAsRead {
            id
            unit_id
            user_id
         }
      }
   }
   ${UNITS_FRAGMENT}
`;
export const getUnitAllCacheQueries = (id, isDeleted) => {
   return [{query: UNIT_RESOURCES_QUERY, variables: {id: id, isDeleted: isDeleted}, queryPath: 'units'}];
};
export const UNIT_CREATE_UPDATE = {
   mutation: gql`
      mutation unitCreateUpdate(
         $module_id: UUID!
         $id: UUID!
         $name: String!
         $description: String!
         $transcript: String!
         $fileLocation: String!
         $originalFilename: String
         $resources: String
      ) {
         units: unit_CreateUpdate(
            unit: {
               id: $id
               module_id: $module_id
               name: $name
               description: $description
               transcript: $transcript
               fileS3Data: {fileLocation: $fileLocation, originalFilename: $originalFilename}
               resources: $resources
            }
         ) {
            ...unitInfo
         }
      }
      ${UNITS_FRAGMENT}
   `,
   typeKey: 'unit.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// export const UNIT_CREATE_UPDATE = {
//    mutation: gql`
//       mutation unitCreateUpdate($module_id: UUID!, $id: UUID!, $name: String!, $description: String!, $file: Upload!, $transcript: String!)
//       {
//          units: unit_CreateUpdate(unit: {id: $id, module_id: $module_id, name: $name, description: $description, file: $file, transcript: $transcript }) {
//             ...unitInfo
//          }
//       }
//       ${UNITS_FRAGMENT}
//    `,
//    typeKey: 'unit.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };

export const UNIT_DELETE = {
   mutation: gql`
      mutation UnitDelete($id: UUID!) {
         units_Delete(unitId: $id)
      }
   `,
   typeKey: 'unit.type',
   actionKey: DELETE_ACTION,
};

export const UNIT_VIDEO_DELETE = {
   mutation: gql`
      mutation UnitVideoDelete($id: UUID!) {
         video_Delete(unitId: $id)
      }
   `,
   typeKey: 'unit.type',
   actionKey: DELETE_ACTION,
};

export const UNIT_SORT = {
   mutation: gql`
      mutation UnitSort($id: UUID!, $type: String!, $nearestId: UUID!) {
         unit_sort(unitId: $id, type: $type, nearestId: $nearestId)
      }
   `,
   typeKey: 'unit.type',
   actionKey: SORT_ACTION,
};
// resources
export const RESOURCES_QUERY_WHERE = gql`
   query getResourcesAllWhere($unit_id: UUID, $isDeleted: Boolean) {
      resources: resources_AllWhere(resourceSearch: {unit_id: $unit_id, isDeleted: $isDeleted}) {
         ...resourcesInfo
      }
   }
   ${RESOURCES_FRAGMENT}
`;
export const RESOURCES_CREATE_UPDATE = {
   mutation: gql`
      mutation resourceCreateUpdate($unit_id: UUID!, $label: String!) {
         resources: resources_CreateUpdate(resources: {unit_id: $unit_id, label: $label}) {
            ...resourcesInfo
         }
      }
      ${RESOURCES_FRAGMENT}
   `,
   typeKey: 'resources.type',
   actionKey: CREATE_UPDATE_ACTION,
};
export const getResourcesCacheQueries = (unit_id, isDeleted) => {
   return [{query: RESOURCES_QUERY_WHERE, variables: {unit_id: unit_id, isDeleted: isDeleted}, queryPath: 'resources'}];
};
export const RESOURCES_DELETE = {
   mutation: gql`
      mutation ResourceDelete($id: UUID!) {
         resources_Delete(resourse_id: $id)
      }
   `,
   typeKey: 'resources.type',
   actionKey: DELETE_ACTION,
};
export const RESOURCES_EDIT = {
   mutation: gql`
      mutation ResourceEdit($unit_id: UUID!, $label: String!) {
         resources: resources_edit_label(resourcesLabel: {unit_id: $unit_id, label: $label}) {
            ...resourcesInfo
         }
      }
      ${RESOURCES_FRAGMENT}
   `,
   typeKey: 'resources.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Tasks
export const TASK_CREATE_UPDATE = {
   mutation: gql`
      mutation TaskCreateUpdate(
         $id: UUID!
         $clientId: UUID!
         $dueDate: DateOnly
         $description: String
         $isCompleted: Boolean
         $subject: String
         $userId: UUID
         $entityId: UUID
         $repeatAmount: Int
         $repeatDayOf: Int
         $repeatInterval: String
         $repeatTask: Boolean
      ) {
         task: task_CreateUpdate(
            task: {
               id: $id
               clientId: $clientId
               subject: $subject
               description: $description
               isCompleted: $isCompleted
               dueDate: $dueDate
               userId: $userId
               entityId: $entityId
               repeatAmount: $repeatAmount
               repeatDayOf: $repeatDayOf
               repeatInterval: $repeatInterval
               repeatTask: $repeatTask
            }
         ) {
            ...taskInfo
         }
      }
      ${TASK_FRAGMENT}
   `,
   typeKey: 'task.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const TASK_CLIENT_QUERY = gql`
   query getTaskAllWhere($clientId: [UUID], $entityId: [UUID]) {
      tasks: task_AllWhere(taskSearch: {clientId: $clientId, entityId: $entityId}) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

export const TASK_QUERY = gql`
   query getTask($taskId: UUID!) {
      task: task_ById(taskId: $taskId) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

// Delete the task on the server.
export const TASK_DELETE = {
   mutation: gql`
      mutation TaskDelete($id: UUID!) {
         task_Delete(taskId: $id)
      }
   `,
   typeKey: 'task.type',
   actionKey: DELETE_ACTION,
};

export const TASK_CURRENT_QUERY = gql`
   query getTasksCurrent($clientId: UUID!, $entityId: [UUID], $completedDays: Int) {
      tasks: task_AllCurrent(clientId: $clientId, completedDays: $completedDays, taskSearch: {entityId: $entityId}) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

export const getTaskCacheQueries = (clientId, taskId) => {
   const queries = [
      {query: TASK_CLIENT_QUERY, variables: {clientId}, queryPath: 'tasks'},
      {
         query: TASK_CURRENT_QUERY,
         variables: {clientId, completedDays: DAYS_TO_DISPLAY_COMPLETED_TASKS},
         queryPath: 'tasks',
      },
      {query: TASK_CURRENT_QUERY, variables: {clientId, completedDays: 0}, queryPath: 'tasks'},
   ];

   if (taskId) {
      queries.push({query: TASK_HISTORY_TASK_QUERY, variables: {taskId}, queryPath: 'taskHistory'});
   }

   return queries;
};

export const TASK_HISTORY_TASK_QUERY = gql`
   query getTaskHistoryAllWhere($taskId: [UUID], $limit: Int, $offset: Int, $completionDateTime: [Timestamp]) {
      taskHistory: taskHistory_AllWhere(
         limit: $limit
         offset: $offset
         taskHistorySearch: {taskId: $taskId, completionDateTime: $completionDateTime}
      ) {
         ...taskHistoryInfo
      }
   }
   ${TASK_HISTORY_FRAGMENT}
`;

export const TASK_HISTORY_DELETE = {
   mutation: gql`
      mutation taskHistoryDelete($id: UUID!) {
         taskHistory_Delete(taskHistoryId: $id)
      }
   `,
   typeKey: 'taskHistory.type',
   actionKey: DELETE_ACTION,
};

export const getTaskHistoryCacheQueries = (taskId, completionDateTime) => {
   const queries = [{query: TASK_HISTORY_TASK_QUERY, variables: {taskId}, queryPath: 'taskHistory'}];

   if (completionDateTime) {
      queries.push({query: TASK_HISTORY_TASK_QUERY, variables: {taskId, completionDateTime}, queryPath: 'taskHistory'});
   }

   return queries;
};
// Entities

export const ENTITY_CREATE_UPDATE = {
   mutation: gql`
      mutation entityCreateUpdate(
         $id: UUID!
         $name: String
         $ein: String
         $clientId: UUID
         $entityId: UUID
         $description: String
         $isActive: Boolean
      ) {
         entity: entity_CreateUpdate(
            entity: {
               id: $id
               name: $name
               ein: $ein
               entityId: $entityId
               clientId: $clientId
               description: $description
               isActive: $isActive
            }
         ) {
            ...entityInfo
         }
      }
      ${ENTITY_FRAGMENT}
   `,
   typeKey: 'entity.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the entity on the server.
export const ENTITY_DELETE = {
   mutation: gql`
      mutation EntityDelete($id: UUID!) {
         entity_Delete(entityId: $id)
      }
   `,
   typeKey: 'entity.type',
   actionKey: DELETE_ACTION,
};

export const ENTITY_CLIENT_QUERY = gql`
   query getEntityAllWhere($clientId: [UUID], $entityId: [UUID], $id: [UUID], $isActive: [Boolean]) {
      entities: entity_AllWhere(
         entitySearch: {clientId: $clientId, entityId: $entityId, id: $id, isActive: $isActive}
      ) {
         ...entityInfo
      }
   }
   ${ENTITY_FRAGMENT}
`;

export const ENTITY_BY_ID_QUERY = gql`
   query getEntityById($entityId: UUID!) {
      entity: entity_ById(entityId: $entityId) {
         ...entityInfo
      }
   }
   ${ENTITY_FRAGMENT}
`;

export const getEntityCacheQueries = (clientId) => {
   return [{query: ENTITY_CLIENT_QUERY, variables: {clientId}, queryPath: 'entities'}];
};

// Create or update a file with the given properties.
export const FILE_CREATE = {
   mutation: gql`
      mutation FileCreate(
         $id: UUID!
         $clientId: UUID!
         $entityId: UUID
         $tag: String
         $userId: UUID
         $fileLocation: String!
         $originalFilename: String
      ) {
         file: fileUpload_CreateUpdate(
            fileUpload: {
               id: $id
               clientId: $clientId
               entityId: $entityId
               userId: $userId
               tag: $tag
               fileS3Data: {fileLocation: $fileLocation, originalFilename: $originalFilename}
            }
         ) {
            ...fileInfo
         }
      }
      ${FILE_FRAGMENT}
   `,
   typeKey: 'file.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete a client .
export const FILE_DELETE = {
   mutation: gql`
      mutation FileDelete($id: UUID!) {
         fileUpload_Delete(fileUploadId: $id)
      }
   `,
   typeKey: 'file.type',
   actionKey: DELETE_ACTION,
};

export const FILE_ENTITY_QUERY = gql`
   query getFileAllWhere($clientId: [UUID], $entityId: [UUID], $tag: [String], $userId: [UUID]) {
      files: fileUpload_AllWhere(
         fileUploadSearch: {clientId: $clientId, entityId: $entityId, tag: $tag, userId: $userId}
      ) {
         ...fileInfo
      }
   }
   ${FILE_FRAGMENT}
`;

export const getFileCacheQueries = (clientId, entityId, tag) => {
   return [{query: FILE_ENTITY_QUERY, variables: {clientId, entityId, tag}, queryPath: 'files'}];
};

// Assets
export const ASSETS_ENTITY_QUERY = gql`
   query getAssetsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      assets: asset_AllWhere(assetSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...assetInfo
      }
   }
   ${ASSET_FRAGMENT}
`;

export const ASSET_QUERY = gql`
   query getAssetById($assetId: UUID!, $historyDate: DateOnly) {
      asset: asset_ById(assetId: $assetId, historyDate: $historyDate) {
         ...assetInfo
      }
   }
   ${ASSET_FRAGMENT}
`;

export const getAssetRefetchQueries = (entityId, assetId, historyDate) => {
   return [
      {query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'},
      {query: ASSET_QUERY, variables: {assetId, historyDate}, queryPath: 'asset'},
      {query: BALANCE_SHEET_QUERY, variables: {entityId, historyDate}, queryPath: 'balanceSheet'},
   ];
};

export const ASSET_CREATE_UPDATE = {
   mutation: gql`
      mutation assetCreateUpdate(
         $id: UUID!
         $assetCategoryId: UUID
         $assetCategory: String
         $entityId: UUID
         $amount: Float
         $acres: Float
         $head: Int
         $weight: Float
         $price: Float
         $quantity: Float
         $year: Int
         $description: String
         $isCollateral: Boolean
         $unitTypeId: UUID
         $isRemoved: Boolean
         $startDate: DateOnly
         $removedDate: DateOnly
         $historyDate: DateOnly
      ) {
         asset: asset_CreateUpdate(
            historyDate: $historyDate
            asset: {
               id: $id
               assetCategoryId: $assetCategoryId
               assetCategory: $assetCategory
               entityId: $entityId
               amount: $amount
               head: $head
               weight: $weight
               price: $price
               quantity: $quantity
               description: $description
               year: $year
               isCollateral: $isCollateral
               unitTypeId: $unitTypeId
               acres: $acres
               isRemoved: $isRemoved
               startDate: $startDate
               removedDate: $removedDate
            }
         ) {
            ...assetInfo
         }
      }
      ${ASSET_FRAGMENT}
   `,
   typeKey: 'asset.type',
};

export const ASSET_DELETE = {
   mutation: gql`
      mutation assetDelete($id: UUID!) {
         asset_Delete(assetId: $id)
      }
   `,
   typeKey: 'asset.type',
   actionKey: DELETE_ACTION,
};

export const ASSET_CATEGORY_QUERY = gql`
   query getAssetsCategories {
      assetCategories: assetCategory_All {
         id
         name
         term
      }
   }
`;

export const UNIT_TYPE_QUERY = gql`
   query getUnitTypes {
      unitList: unitType_All {
         id
         name
      }
   }
`;

// Create or update a file with the given properties.
export const UNIT_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation UnitTypeCreate($id: UUID!, $name: String) {
         unitType: unitType_CreateUpdate(unitType: {id: $id, name: $name}) {
            ...unitTypeInfo
         }
      }
      ${UNIT_TYPE_FRAGMENT}
   `,
   typeKey: 'unitType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const getUnitTypeCacheQueries = () => {
   return [{query: UNIT_TYPE_QUERY}];
};

//Liabilities
export const LIABILITIES_ENTITY_QUERY = gql`
   query getLiabilitiesAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      liabilities: liability_AllWhere(liabilitySearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...liabilityInfo
      }
   }
   ${LIABILITY_FRAGMENT}
`;

export const LIABILITY_QUERY = gql`
   query getLiabilityById($liabilityId: UUID!, $historyDate: DateOnly) {
      liability: liability_ById(liabilityId: $liabilityId, historyDate: $historyDate) {
         ...liabilityInfo
      }
   }
   ${LIABILITY_FRAGMENT}
`;

export const getLiabilityRefetchQueries = (entityId, liabilityId, historyDate) => {
   return [
      {query: LIABILITIES_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'liabilities'},
      {query: LIABILITY_QUERY, variables: {liabilityId, historyDate}, queryPath: 'liability'},
      {query: LIABILITY_TYPE_QUERY},
      {query: BANK_QUERY},
      {query: BALANCE_SHEET_QUERY, variables: {entityId, historyDate}, queryPath: 'balanceSheet'},
   ];
};

export const LIABILITY_CREATE_UPDATE = {
   mutation: gql`
      mutation liabilityCreateUpdate(
         $id: UUID!
         $liabilityCategoryId: UUID
         $liabilityCategory: String
         $entityId: UUID
         $amount: Float
         $description: String
         $isCollateral: Boolean
         $date: DateOnly
         $interestRate: Float
         $note: String
         $bank: String
         $bankId: UUID
         $payment: Float
         $paymentDueDate: String
         $paymentMaturityDate: DateOnly
         $isRemoved: Boolean
         $startDate: DateOnly
         $removedDate: DateOnly
         $historyDate: DateOnly
      ) {
         liability: liability_CreateUpdate(
            liability: {
               id: $id
               liabilityCategoryId: $liabilityCategoryId
               liabilityCategory: $liabilityCategory
               entityId: $entityId
               amount: $amount
               description: $description
               isCollateral: $isCollateral
               date: $date
               interestRate: $interestRate
               note: $note
               bankId: $bankId
               bank: $bank
               payment: $payment
               paymentDueDate: $paymentDueDate
               paymentMaturityDate: $paymentMaturityDate
               isRemoved: $isRemoved
               startDate: $startDate
               removedDate: $removedDate
            }
            historyDate: $historyDate
         ) {
            ...liabilityInfo
         }
      }
      ${LIABILITY_FRAGMENT}
   `,
   typeKey: 'liability.type',
};

export const LIABILITY_DELETE = {
   mutation: gql`
      mutation liabilityDelete($id: UUID!) {
         liability_Delete(liabilityId: $id)
      }
   `,
   typeKey: 'liability.type',
   actionKey: DELETE_ACTION,
};

export const LIABILITY_CATEGORY_QUERY = gql`
   query getLiabilitiesCategories {
      liabilityCategories: liabilityCategory_All {
         id
         name
      }
   }
`;

export const LIABILITY_TYPE_QUERY = gql`
   query getLiabilitiesTypes {
      liabilityTypes: liabilityType_All {
         id
         name
      }
   }
`;

export const BANK_QUERY = gql`
   query getBanks {
      banks: bank_All {
         id
         name
      }
   }
`;

// Income
export const INCOME_CREATE_UPDATE = {
   mutation: gql`
      mutation incomeCreateUpdate(
         $entityId: UUID!
         $incomeTypeId: UUID!
         $description: String
         $date: DateOnly!
         $noteActual: String
         $noteExpected: String
         $expected: Float
         $actual: Float
      ) {
         income: income_CreateUpdate(
            income: {
               entityId: $entityId
               incomeTypeId: $incomeTypeId
               description: $description
               date: $date
               noteActual: $noteActual
               noteExpected: $noteExpected
               expected: $expected
               actual: $actual
            }
         ) {
            ...incomeInfo
         }
      }
      ${INCOME_FRAGMENT}
   `,
   typeKey: 'income.type',
};

export const INCOME_DELETE = {
   mutation: gql`
      mutation incomeDelete($id: UUID!) {
         income_Delete(incomeId: $id)
      }
   `,
   typeKey: 'income.type',
   actionKey: DELETE_ACTION,
};

export const getIncomeUpdateQueries = () => {
   return [
      // {query: INCOME_TYPE_QUERY},
      // {query: INCOME_QUERY, variables: {entityId, firstDate, lastDate}, queryPath: 'income'},
   ];
};

// Create or update an income type.
export const INCOME_TYPE_ALL_WHERE_QUERY = gql`
   query getIncomeTypeAllWhere($id: [UUID], $entityId: [UUID], $isTaxable: [Boolean]) {
      incomeTypes: incomeType_AllWhere(incomeTypeSearch: {id: $id, entityId: $entityId, isTaxable: $isTaxable}) {
         ...incomeTypeInfo
      }
   }
   ${INCOME_TYPE_FRAGMENT}
`;

export const INCOME_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation IncomeTypeCreateUpdate($id: UUID!, $name: String, $entityId: UUID, $isTaxable: Boolean) {
         incomeType: incomeType_CreateUpdate(
            incomeType: {id: $id, name: $name, entityId: $entityId, isTaxable: $isTaxable}
         ) {
            ...incomeTypeInfo
         }
      }
      ${INCOME_TYPE_FRAGMENT}
   `,
   typeKey: 'incomeType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const INCOME_TYPE_DELETE = {
   mutation: gql`
      mutation incomeTypeDelete($id: UUID!) {
         incomeType_Delete(incomeTypeId: $id)
      }
   `,
   typeKey: 'incomeType.type',
   actionKey: DELETE_ACTION,
};

export const INCOME_TYPE_UNDELETE = {
   mutation: gql`
      mutation incomeTypeUndelete($id: UUID!) {
         incomeType_UnDelete(incomeTypeId: $id)
      }
   `,
   typeKey: 'incomeType.type',
   actionKey: UNDELETE_ACTION,
};

export const getIncomeTypeUpdateQueries = () => {
   return [
      // {query: INCOME_TYPE_QUERY, queryPath: 'incomeTypes',},
   ];
};

// Expense
export const EXPENSE_TYPE_ALL_WHERE_QUERY = gql`
   query getExpenseTypeAllWhere($id: [UUID], $entityId: [UUID], $isTaxable: [Boolean]) {
      expenseTypes: expenseType_AllWhere(expenseTypeSearch: {id: $id, entityId: $entityId, isTaxable: $isTaxable}) {
         ...expenseTypeInfo
      }
   }
   ${EXPENSE_TYPE_FRAGMENT}
`;

export const EXPENSE_CREATE_UPDATE = {
   mutation: gql`
      mutation expenseCreateUpdate(
         $entityId: UUID!
         $expenseTypeId: UUID!
         $description: String
         $date: DateOnly!
         $noteActual: String
         $noteExpected: String
         $expected: Float
         $actual: Float
      ) {
         expense: expense_CreateUpdate(
            expense: {
               entityId: $entityId
               expenseTypeId: $expenseTypeId
               description: $description
               date: $date
               noteActual: $noteActual
               noteExpected: $noteExpected
               expected: $expected
               actual: $actual
            }
         ) {
            ...expenseInfo
         }
      }
      ${EXPENSE_FRAGMENT}
   `,
   typeKey: 'expense.type',
};

export const EXPENSE_DELETE = {
   mutation: gql`
      mutation expenseDelete($id: UUID!) {
         expense_Delete(expenseId: $id)
      }
   `,
   typeKey: 'expense.type',
   actionKey: DELETE_ACTION,
};

// Create or update an expense type.
export const EXPENSE_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation ExpenseTypeCreateUpdate($id: UUID!, $name: String, $entityId: UUID, $isTaxable: Boolean) {
         expenseType: expenseType_CreateUpdate(
            expenseType: {id: $id, name: $name, entityId: $entityId, isTaxable: $isTaxable}
         ) {
            ...expenseTypeInfo
         }
      }
      ${EXPENSE_TYPE_FRAGMENT}
   `,
   typeKey: 'expenseType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const EXPENSE_TYPE_DELETE = {
   mutation: gql`
      mutation expenseTypeDelete($id: UUID!) {
         expenseType_Delete(expenseTypeId: $id)
      }
   `,
   typeKey: 'expenseType.type',
   actionKey: DELETE_ACTION,
};

export const EXPENSE_TYPE_UNDELETE = {
   mutation: gql`
      mutation expenseTypeUndelete($id: UUID!) {
         expenseType_UnDelete(expenseTypeId: $id)
      }
   `,
   typeKey: 'expenseType.type',
   actionKey: UNDELETE_ACTION,
};

export const getExpenseUpdateQueries = () => {
   return [
      // {query: EXPENSE_QUERY, variables: {entityId, firstDate, lastDate}, queryPath: 'expenses'},
   ];
};

export const getExpenseTypeUpdateQueries = () => {
   return [
      // {query: EXPENSE_TYPE_QUERY, variables: {entityId}, queryPath: 'expenseTypes'},
   ];
};

export const BALANCE_SHEET_QUERY = gql`
   query getBalanceReportQuery($date: DateOnly, $entityId: [UUID]) {
      balanceSheet: balanceReport(date: $date, entityId: $entityId) {
         ...balanceReportInfo
      }
   }
   ${BALANCE_REPORT_FRAGMENT}
`;

export const LOAN_ANALYSIS_QUERY = gql`
   query getLoanAnalysisQuery($date: DateOnly, $entityId: [UUID]) {
      loanAnalysis: loanAnalysis(date: $date, entityId: $entityId) {
         ...loanAnalysisInfo
      }
   }
   ${LOAN_ANALYSIS_FRAGMENT}
`;

export const CASH_FLOW_QUERY = gql`
   query getCashFlowQuery($year: Int, $entityId: [UUID]) {
      cashFlow: cashFlowReport(year: $year, entityId: $entityId, expenseTypeExclusions: ["Depreciation"]) {
         ...cashFlowInfo
      }
   }
   ${CASH_FLOW_FRAGMENT}
`;

export const TAXABLE_CASH_FLOW_QUERY = gql`
   query getCashFlowQuery(
      $year: Int
      $entityId: [UUID]
      $expenseTypeExclusions: [String]
      $incomeTypeExclusions: [String]
   ) {
      cashFlow: cashFlowReport(
         year: $year
         entityId: $entityId
         expenseTypeExclusions: $expenseTypeExclusions
         incomeTypeExclusions: $incomeTypeExclusions
      ) {
         ...cashFlowInfo
      }
   }
   ${CASH_FLOW_FRAGMENT}
`;

export const ENTITY_CASH_FLOW_ALL_WHERE_QUERY = gql`
   query getEntityCashFlowAllWhere($entityId: [UUID], $year: [Int]) {
      entityCashFlow: entityCashFlow_AllWhere(entityCashFlowSearch: {entityId: $entityId, year: $year}) {
         ...entityCashFlowInfo
      }
   }
   ${ENTITY_CASH_FLOW_FRAGMENT}
`;

// const ENTITY_CASH_FLOW_ = gql`
//    mutation entityCashFlow($: String, $: String, $: String, $: String, $: String)
//    {
//       entityCashFlow: entityCashFlow_(entityCashFlow: {: $, : $, : $, : $, : $}) {
//          ...entityCashFlow
//       }
//    }
//    ${ENTITY_CASH_FLOW_FRAGMENT}
// `;

export const ENTITY_CASH_FLOW_CREATE_UPDATE = {
   mutation: gql`
      mutation entityCashFlowCreateUpdate(
         $id: UUID!
         $year: Int!
         $entityId: UUID!
         $actualOperatingLoanBalance: Float
         $expectedOperatingLoanBalance: Float
         $targetIncome: Float
         $operatingLoanLimit: Float
         $carryoverIncome: Float
      ) {
         entityCashFlow: entityCashFlow_CreateUpdate(
            entityCashFlow: {
               id: $id
               year: $year
               entityId: $entityId
               actualOperatingLoanBalance: $actualOperatingLoanBalance
               expectedOperatingLoanBalance: $expectedOperatingLoanBalance
               targetIncome: $targetIncome
               operatingLoanLimit: $operatingLoanLimit
               carryoverIncome: $carryoverIncome
            }
         ) {
            ...entityCashFlowInfo
         }
      }
      ${ENTITY_CASH_FLOW_FRAGMENT}
   `,
   typeKey: 'cashFlow.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const getCashFlowReportRefetchQueries = (entityId, year) => () => {
   return [
      {query: ENTITY_CASH_FLOW_ALL_WHERE_QUERY, variables: {entityId, year}, queryPath: 'entityCashFlow'},
      {query: CASH_FLOW_QUERY, variables: {entityId, year}, queryPath: 'entityCashFlow'},
   ];
};

export const SEAT_ALL_WHERE_QUERY = gql`
   query getSeatAllWhere($id: [UUID], $entityId: [UUID]) {
      seats: seat_AllWhere(seatSearch: {id: $id, entityId: $entityId}) {
         ...seatInfo
      }
   }
   ${SEAT_FRAGMENT}
`;

export const SEAT_BY_ID_QUERY = gql`
   query getSeatById($seatId: UUID!) {
      seat: seat_ById(seatId: $seatId) {
         ...seatInfo
      }
   }
   ${SEAT_FRAGMENT}
`;
export const SEAT_DELETE = {
   mutation: gql`
      mutation seatDelete($id: UUID!) {
         seat_Delete(seatId: $id)
      }
   `,
   typeKey: 'accountability.type',
   actionKey: DELETE_ACTION,
};

export const SEAT_CREATE_UPDATE = {
   mutation: gql`
      mutation seatCreateUpdate(
         $id: UUID!
         $entityId: UUID
         $userIdList: [UUID]
         $seatId: UUID
         $name: String
         $order: Int
         $responsibilities: [String]
      ) {
         seat: seat_CreateUpdate(
            seat: {
               id: $id
               entityId: $entityId
               userIdList: $userIdList
               seatId: $seatId
               name: $name
               order: $order
               responsibilities: $responsibilities
            }
         ) {
            ...seatInfo
         }
      }
      ${SEAT_FRAGMENT}
   `,
   typeKey: 'accountability.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const getSeatCacheQueries = (entityId) => {
   return [{query: SEAT_ALL_WHERE_QUERY, variables: {entityId}, queryPath: 'seats'}];
};

// Folder

export const FOLDER_CREATE_UPDATE = {
   mutation: gql`
      mutation folderCreateUpdate($id: UUID!, $name: String, $description: String) {
         folder: folderTemplate_CreateUpdate(folderTemplate: {id: $id, name: $name, description: $description}) {
            ...folderInfo
         }
      }
      ${FOLDER_FRAGMENT}
   `,
   typeKey: 'folder.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the folder on the server.
export const FOLDER_DELETE = {
   mutation: gql`
      mutation folderDelete($id: UUID!) {
         folderTemplate_Delete(folderTemplateId: $id)
      }
   `,
   typeKey: 'folder.type',
   actionKey: DELETE_ACTION,
};

export const FOLDER_UNDELETE = {
   mutation: gql`
      mutation expenseTypeUndelete($id: UUID!) {
         folderTemplate_UnDelete(folderTemplateId: $id)
      }
   `,
   typeKey: 'folder.type',
   actionKey: UNDELETE_ACTION,
};

export const FOLDER_QUERY = gql`
   query getFolderAll {
      folders: folderTemplate_All {
         ...folderInfo
      }
   }
   ${FOLDER_FRAGMENT}
`;

export const FOLDER_BY_ID_QUERY = gql`
   query getFolderById($folderId: UUID!) {
      folder: folderTemplate_ById(folderTemplateId: $folderId) {
         ...folderInfo
      }
   }
   ${FOLDER_FRAGMENT}
`;

export const getFolderCacheQueries = () => {
   return [{query: FOLDER_QUERY, queryPath: 'folders'}];
};

// Contracts & Hedges
export const CASH_CONTRACTS_ENTITY_QUERY = gql`
   query getCashContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      cashContracts: cashContract_AllWhere(cashContractSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...cashContractInfo
      }
   }
   ${CASH_CONTRACT_FRAGMENT}
`;

export const FUTURE_CONTRACTS_ENTITY_QUERY = gql`
   query getFutureContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      futureContracts: futuresContract_AllWhere(
         futuresContractSearch: {entityId: $entityId}
         historyDate: $historyDate
      ) {
         ...futureContractInfo
      }
   }
   ${FUTURE_CONTRACT_FRAGMENT}
`;

export const HEDGE_CONTRACTS_ENTITY_QUERY = gql`
   query getHedgeContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      hedgeContracts: hedgesContract_AllWhere(hedgesContractSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...hedgeContractInfo
      }
   }
   ${HEDGE_CONTRACT_FRAGMENT}
`;

export const CASH_CONTRACT_BY_ID_QUERY = gql`
   query getCashContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: cashContract_ById(cashContractId: $contractId, historyDate: $historyDate) {
         ...cashContractInfo
      }
   }
   ${CASH_CONTRACT_FRAGMENT}
`;

export const FUTURE_CONTRACT_BY_ID_QUERY = gql`
   query getFutureContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: futuresContract_ById(futuresContractId: $contractId, historyDate: $historyDate) {
         ...futureContractInfo
      }
   }
   ${FUTURE_CONTRACT_FRAGMENT}
`;

export const HEDGE_CONTRACT_BY_ID_QUERY = gql`
   query getHedgeContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: hedgesContract_ById(hedgesContractId: $contractId, historyDate: $historyDate) {
         ...hedgeContractInfo
      }
   }
   ${HEDGE_CONTRACT_FRAGMENT}
`;

export const getCashContractRefetchQueries = (entityId, historyDate) => {
   return [{query: CASH_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'cashContracts'}];
};

export const getFutureContractRefetchQueries = (entityId, historyDate) => {
   return [{query: FUTURE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'futureContracts'}];
};

export const getHedgeContractRefetchQueries = (entityId, historyDate) => {
   return [{query: HEDGE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'hedgeContracts'}];
};

// export const getContractRefetchQueries = (entityId, contractId, historyDate) => {
//    return [
//       {query: CASH_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'cashContracts'},
//       {query: FUTURE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'futureContracts'},
//       {query: HEDGE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'hedgeContracts'},
//    ];
// };

export const CASH_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation cashContractCreateUpdate(
         $contractId: UUID!
         $bushelsSold: Int
         $contractNumber: Int
         $crop: String
         $date: DateOnly
         $deliveryLocation: String
         $deliveryMonth: Int
         $description: String
         $entityId: UUID
         $isDelivered: Boolean
         $isNew: Boolean
         $isRemoved: Boolean
         $price: Float
         $removedDate: DateOnly
         $startDate: DateOnly
         $historyDate: DateOnly
      ) {
         cashContract: cashContract_CreateUpdate(
            historyDate: $historyDate
            cashContract: {
               id: $contractId
               bushelsSold: $bushelsSold
               contractNumber: $contractNumber
               crop: $crop
               date: $date
               deliveryLocation: $deliveryLocation
               deliveryMonth: $deliveryMonth
               description: $description
               entityId: $entityId
               isDelivered: $isDelivered
               isNew: $isNew
               isRemoved: $isRemoved
               price: $price
               removedDate: $removedDate
               startDate: $startDate
            }
         ) {
            ...cashContractInfo
         }
      }
      ${CASH_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const FUTURE_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation futureContractCreateUpdate(
         $id: UUID!
         $bushels: Int
         $cashPrice: Float
         $contractNumber: Int
         $crop: String
         $date: DateOnly
         $deliveryLocation: String
         $description: String
         $entityId: UUID
         $estimatedBasis: Float
         $futuresPrice: Float
         $isRemoved: Boolean
         $month: Int
         $note: String
         $removedDate: DateOnly
         $startDate: DateOnly
         $historyDate: DateOnly
         $year: Int
      ) {
         futureContract: futuresContract_CreateUpdate(
            historyDate: $historyDate
            futuresContract: {
               id: $id
               bushels: $bushels
               cashPrice: $cashPrice
               contractNumber: $contractNumber
               crop: $crop
               date: $date
               deliveryLocation: $deliveryLocation
               description: $description
               entityId: $entityId
               estimatedBasis: $estimatedBasis
               futuresPrice: $futuresPrice
               isRemoved: $isRemoved
               month: $month
               note: $note
               removedDate: $removedDate
               startDate: $startDate
               year: $year
            }
         ) {
            ...futureContractInfo
         }
      }
      ${FUTURE_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const HEDGE_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation hedgeContractCreateUpdate(
         $id: UUID!
         $bushels: Int
         $contractNumber: Int
         $crop: String
         $currentMarketValue: Float
         $description: String
         $entityId: UUID
         $isRemoved: Boolean
         $month: Int
         $note: String
         $removedDate: DateOnly
         $startDate: DateOnly
         $strikeCost: Float
         $strikePrice: Float
         $historyDate: DateOnly
         $year: Int
      ) {
         hedgeContract: hedgesContract_CreateUpdate(
            historyDate: $historyDate
            hedgesContract: {
               id: $id
               bushels: $bushels
               contractNumber: $contractNumber
               crop: $crop
               currentMarketValue: $currentMarketValue
               description: $description
               entityId: $entityId
               isRemoved: $isRemoved
               month: $month
               note: $note
               removedDate: $removedDate
               startDate: $startDate
               strikeCost: $strikeCost
               strikePrice: $strikePrice
               year: $year
            }
         ) {
            ...hedgeContractInfo
         }
      }
      ${HEDGE_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const CASH_CONTRACT_DELETE = {
   mutation: gql`
      mutation cashContractDelete($contractId: UUID!) {
         cashContract_Delete(cashContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};

export const FUTURE_CONTRACT_DELETE = {
   mutation: gql`
      mutation futureContractDelete($contractId: UUID!) {
         futuresContract_Delete(futuresContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};

export const HEDGE_CONTRACT_DELETE = {
   mutation: gql`
      mutation hedgeContractDelete($contractId: UUID!) {
         hedgesContract_Delete(hedgesContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};
