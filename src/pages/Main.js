import CssBaseline from '@material-ui/core/CssBaseline';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import StylesProvider from '@material-ui/styles/StylesProvider';
import {useState} from 'react';
import React, {Suspense, lazy} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {Route} from 'react-router-dom';
import {Redirect} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {LOAN_ANALYSIS_PATH} from '../Constants';
import {CLIENT_ENTITY_DASHBOARD_PATH} from '../Constants';
import {APPBAR_HEIGHT} from '../Constants';
import {CLIENT_DASHBOARD_PATH} from '../Constants';
import {ADMIN_PATH} from '../Constants';
import {DEFAULT_PATH} from '../Constants';
import {ADMIN_SETUP_PATH} from '../Constants';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import Loading from '../fhg/components/Loading';
import ProgressIndicator from '../fhg/components/ProgressIndicator';
import ErrorStateSnackbar from '../fhg/components/ErrorStateSnackbar';
import {authenticationDataStatus} from '../fhg/components/security/AuthenticatedUser';
import useLazyQueryFHG from '../fhg/hooks/data/useLazyQueryFHG';
import {useEffect} from 'react';
import PrivilegeRoute from '../fhg/security/PrivilegeRoute';
import {Switch} from 'react-router-dom';
import {atom} from 'recoil';
import UndeleteSnackbar from '../fhg/UndeleteSnackbar';

const AdminMain = lazy(() => import('./admin/AdminMain'));
const ClientMain = lazy(() => import('./client/ClientMain'));
const WebAppBarLF = lazy(() => import('../components/WebAppBarLF'));

export const userRoleState = atom({
   key: 'userRole',
   default: {isClient: false, isAdmin: false},
});

export const errorState = atom({
   key: 'error',
   default: {
      errorKey: undefined,
      errorMessage: undefined,
      errorInfo: undefined,
      error: undefined,
      values: undefined,
      enableRefresh: true,
   },
});

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed: 5/28/21
 */
export default function Main() {
   const userRole = useRecoilValue(userRoleState);
   const authDataState = useRecoilValue(authenticationDataStatus);
   const [clientId, setClientId] = useState();
   const history = useHistory();
   const routeMatch = useRouteMatch({path: CLIENT_ENTITY_DASHBOARD_PATH, strict: false, sensitive: true});

   const [loadData, {data}] = useLazyQueryFHG(USER_CLIENT_QUERY, undefined, 'user.type');

   const {isAdmin, isClient} = userRole;

   useEffect(() => {
      if (!isAdmin && clientId && routeMatch?.params?.clientId && clientId !== routeMatch?.params?.clientId) {
         localStorage.entityId = ' ';
         let defaultPath = LOAN_ANALYSIS_PATH.replace(':clientId', clientId).replace(
            ':entityId',
            localStorage.entityId
         );
         history.replace(defaultPath);
      }
   }, [clientId, history, isAdmin, routeMatch?.params?.clientId]);

   useEffect(() => {
      if (authDataState?.cognitoSub && isClient) {
         loadData({variables: {cognitoSub: authDataState.cognitoSub}});
      }
   }, [authDataState, isClient, loadData]);

   useEffect(() => {
      if (data) {
         const user = data?.users?.[0] || {};
         setClientId(user.clientId);
      }
   }, [data]);

   if (isAdmin || (isClient && clientId)) {
      let defaultPath = isAdmin
         ? ADMIN_PATH
         : LOAN_ANALYSIS_PATH.replace(':clientId', clientId).replace(':entityId', localStorage.entityId);

      return (
         <Suspense fallback={<Loading isLoading />}>
            <StylesProvider>
               <MuiPickersUtilsProvider utils={MomentUtils}>
                  <CssBaseline />
                  <ProgressIndicator isGlobal={true} />
                  <UndeleteSnackbar />
                  <ErrorStateSnackbar />
                  <PrivilegeRoute
                     hasPrivilege={isClient || isAdmin}
                     path={[CLIENT_ENTITY_DASHBOARD_PATH, CLIENT_DASHBOARD_PATH, ADMIN_SETUP_PATH]}
                  >
                     <WebAppBarLF />
                  </PrivilegeRoute>
                  <main style={{height: `calc(100% - ${APPBAR_HEIGHT}px`}}>
                     <Switch>
                        <PrivilegeRoute hasPrivilege={isClient || isAdmin} path={CLIENT_DASHBOARD_PATH}>
                           <ClientMain />
                        </PrivilegeRoute>
                        <PrivilegeRoute hasPrivilege={isAdmin} path={ADMIN_SETUP_PATH}>
                           <AdminMain />
                        </PrivilegeRoute>
                        <Route path={DEFAULT_PATH} render={() => <Redirect to={defaultPath} />} />
                     </Switch>
                  </main>
               </MuiPickersUtilsProvider>
            </StylesProvider>
         </Suspense>
      );
   } else {
      return null;
   }
}
