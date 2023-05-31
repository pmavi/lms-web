import makeStyles from '@material-ui/core/styles/makeStyles';
import {lazy} from 'react';
import React from 'react';
import {useRouteMatch} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {Switch, Route, useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import AssetEdit from '../../components/assets/AssetEdit';
import ClientDrawer from '../../components/ClientDrawer';
import EditDrawer from '../../components/EditDrawer';
import EntityEdit from '../../components/EntityEdit';
import EntityFiles from '../../components/EntityFiles';
import LiabilityEdit from '../../components/liabilities/LiabilityEdit';
import TaskEdit from '../../components/TaskEdit';
import {TAXABLE_INCOME_PATH} from '../../Constants';
import {CONTRACT_EDIT_DRAWER_WIDTH} from '../../Constants';
import {CONTRACT_PATH} from '../../Constants';
import {SEAT_EDIT} from '../../Constants';
import {ACCOUNTABILITY_CLIENT_ENTITY_PATH} from '../../Constants';
import {CLIENT_TASK_NOTES_PATH} from '../../Constants';
import {ENTITY_EDIT} from '../../Constants';
import {CLIENT_ENTITY_DASHBOARD_PATH} from '../../Constants';
import {CLIENT_ENTITY_PATH} from '../../Constants';
import {
   ENTITY_ASSET_PATH,
   CLIENT_DASHBOARD_PATH,
   LIABILITIES_PATH,
   LOAN_ANALYSIS_PATH,
   BALANCE_SHEET_PATH,
   CASH_FLOW_PATH,
   LOAN_AMORTIZATION_PATH,
   FILES_PATH,
   LMS_DASHBOARD_PATH,
   LMS_SEARCH_PATH,
} from '../../Constants';
import PrivilegeRoute from '../../fhg/security/PrivilegeRoute';
import {userRoleState} from '../Main';
import CashContract from './contracts/CashContract';
import {HEDGE_CONTRACTS_CATEGORY} from './contracts/Contracts';
import {FUTURE_CONTRACTS_CATEGORY} from './contracts/Contracts';
import {CASH_CONTRACTS_CATEGORY} from './contracts/Contracts';
import FutureContract from './contracts/FutureContract';
import HedgeContract from './contracts/HedgeContract';
import Lms from './Lms';
import LmsSearch from './LmsSearch';
import Grid from '../../fhg/components/Grid';
import SeatEdit from './accountability/SeatEdit';
import Assets from './assets/Assets';
import BalanceSheet from './balanceSheet/BalanceSheet';
import CashFlow from './cashFlow/CashFlow';
import ClientEntities from './ClientEntities';
import Contracts from './contracts/Contracts';
import Liabilities from './Liabilities';
import LoanAmortization from './LoanAmortization';
import LoanAnalysis from './loanAnalysisComponents/LoanAnalysis';
import TasksAndNotes from './TasksAndNotes';

const AccountabilityChart = lazy(() => import('./accountability/AccountabilityChart'));
const TaxableIncome = lazy(() => import('./tableIncome/TaxableIncome'));

const useStyles = makeStyles(
   {
      root: {
         display: 'flex',
         height: '100%',
      },
      drawerStyle: {
         flexShrink: 0,
      },
   },
   {name: 'ClientMainStyles'}
);

/**
 * Main component for clients, accessible only if the user has been authenticated. Contains the routing for the client
 * paths.
 *
 * Reviewed: 5/28/21
 */
export default function ClientMain() {
   const classes = useStyles();
   const history = useHistory();
   const location = useLocation();
   const routeMatch = useRouteMatch({path: CLIENT_ENTITY_DASHBOARD_PATH, strict: false, sensitive: true});
   const {isAdmin} = useRecoilValue(userRoleState);

   /**
    * Close the edit drawer. The edit is information is removed from the location.state.
    */
   const handleClose = () => {
      location.state = undefined;
      history.replace(location);
   };

   return (
      <div className={classes.root}>
         <Switch>
            <Route
               exact
               path={[
                  ENTITY_ASSET_PATH,
                  LIABILITIES_PATH,
                  LOAN_ANALYSIS_PATH,
                  BALANCE_SHEET_PATH,
                  CASH_FLOW_PATH,
                  LOAN_AMORTIZATION_PATH,
                  CLIENT_ENTITY_DASHBOARD_PATH,
                  CLIENT_TASK_NOTES_PATH,
                  CLIENT_DASHBOARD_PATH,
                  FILES_PATH,
                  ACCOUNTABILITY_CLIENT_ENTITY_PATH,
                  LMS_DASHBOARD_PATH,
                  LMS_SEARCH_PATH,
                  CONTRACT_PATH,
                  TAXABLE_INCOME_PATH,
               ]}
               component={ClientDrawer}
            />
         </Switch>
         <Grid container justify={'center'}>
            <Switch>
               <Route exact path={ACCOUNTABILITY_CLIENT_ENTITY_PATH}>
                  <AccountabilityChart />
                  {location?.state?.edit && (
                     <EditDrawer open={true} onClose={location?.state?.edit === SEAT_EDIT && handleClose}>
                        <SeatEdit />
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={ENTITY_ASSET_PATH}>
                  <Assets />
                  {location?.state?.edit && (
                     <EditDrawer open={true}>
                        <AssetEdit />
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={LIABILITIES_PATH}>
                  <Liabilities />
                  {location?.state?.edit && (
                     <EditDrawer open={true}>
                        <LiabilityEdit />
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={CONTRACT_PATH}>
                  <Contracts />
                  {location?.state?.edit && (
                     <EditDrawer open={true} width={CONTRACT_EDIT_DRAWER_WIDTH}>
                        {
                           {
                              [CASH_CONTRACTS_CATEGORY]: <CashContract />,
                              [FUTURE_CONTRACTS_CATEGORY]: <FutureContract />,
                              [HEDGE_CONTRACTS_CATEGORY]: <HedgeContract />,
                           }[location?.state?.category]
                        }
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={LOAN_ANALYSIS_PATH}>
                  <LoanAnalysis />
               </Route>
               <Route exact path={BALANCE_SHEET_PATH}>
                  <BalanceSheet />
               </Route>
               <Route exact path={CASH_FLOW_PATH}>
                  <CashFlow key={`client${routeMatch?.params?.clientId} entity${routeMatch?.params?.entityId}`} />
               </Route>
               <PrivilegeRoute hasPrivilege={isAdmin} exact path={TAXABLE_INCOME_PATH}>
                  <TaxableIncome key={`client${routeMatch?.params?.clientId} entity${routeMatch?.params?.entityId}`} />
               </PrivilegeRoute>
               <Route exact path={LOAN_AMORTIZATION_PATH}>
                  <LoanAmortization />
               </Route>
               <Route exact path={[CLIENT_ENTITY_DASHBOARD_PATH, CLIENT_DASHBOARD_PATH, CLIENT_ENTITY_PATH]}>
                  <ClientEntities allowDelete={false} />
                  {location?.state?.edit && (
                     <EditDrawer open={true}>
                        <EntityEdit />
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={CLIENT_TASK_NOTES_PATH}>
                  <TasksAndNotes />
                  {location?.state?.edit && (
                     <EditDrawer open={true} onClose={location?.state?.edit === ENTITY_EDIT && handleClose}>
                        <TaskEdit />,
                     </EditDrawer>
                  )}
               </Route>
               <Route exact path={FILES_PATH}>
                  <EntityFiles />
               </Route>
               <Route exact path={LMS_DASHBOARD_PATH}>
                  <Lms />
               </Route>
               <Route exact path={LMS_SEARCH_PATH}>
                  <LmsSearch />
               </Route>
            </Switch>
         </Grid>
      </div>
   );
}
