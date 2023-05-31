import {Divider, Badge, Collapse} from '@material-ui/core';
import {List, ListItem, ListItemText, ListSubheader} from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import {sortBy} from 'lodash';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import React, {useState, useEffect, useMemo} from 'react';
import {useHistory, Link, useParams, useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import {TAXABLE_INCOME_PATH} from '../Constants';
import {CLIENT_ENTITY_DASHBOARD_PATH} from '../Constants';
import {ACCOUNTABILITY_CLIENT_ENTITY_PATH} from '../Constants';
import {FILES_PATH} from '../Constants';
import {CLIENT_TASK_NOTES_PATH} from '../Constants';
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import {
   ENTITY_ASSET_PATH,
   LIABILITIES_PATH,
   LOAN_ANALYSIS_PATH,
   BALANCE_SHEET_PATH,
   CASH_FLOW_PATH,
   LOAN_AMORTIZATION_PATH,
   CONTRACT_PATH,
} from '../Constants';
import {TASK_CURRENT_QUERY, COURSE_ALL_QUERY_WHERE} from '../data/QueriesGL';
import Grid from '../fhg/components/Grid';
import ResponsiveMobileDrawer, {drawerIsOpenStatus} from '../fhg/components/ResponsiveMobileDrawer';
import TypographyFHG from '../fhg/components/Typography';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {userRoleState} from '../pages/Main';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(2, 0, 2, 2),
      },
      drawerStyle: {
         flexShrink: 0,
      },
      linkPadding: {
         paddingRight: 0,
      },
      primaryLinkStyle: {
         paddingLeft: theme.spacing(1),
      },
      badgeStyle: {
         '& .MuiBadge-dot': {
            top: 8,
            right: -4,
         },
      },
   }),
   {name: 'ClientDrawerStyles'}
);

export default function ClientDrawer({match}) {
   const {clientId, entityId, courseId} = useParams();
   const classes = useStyles();
   const theme = useTheme();
   const location = useLocation();
   const history = useHistory();
   const {isAdmin} = useRecoilValue(userRoleState);

   const setIsDrawerOpen = useSetRecoilState(drawerIsOpenStatus);
   const [openCourse, setOpenCourse] = useState(false); //add
   const [courseData] = useQueryFHG(COURSE_ALL_QUERY_WHERE); //add

   const [isTaskOverDue, setIsTaskOverDue] = useState(false);

   const [taskData] = useQueryFHG(
      TASK_CURRENT_QUERY,
      {variables: {clientId, completedDays: 0}, skip: !validate(clientId)},
      'task.type',
      false
   );

   //add
   const sortedCourses = useMemo(() => {
      if (courseData?.courses) {
         const sortData = sortBy(courseData?.courses, 'name');
         let arr = [];
         sortData.map((itm) => {
            let modules = [];
            itm.modules.map((mod) => {
               modules.push({...mod, open: false});
            });
            const modulesFinal = sortBy(modules, 'order_no');
            arr.push({...itm, modules: modulesFinal, open: false});
         });
         return arr;
      }
      return [];
   }, [courseData]);
   useEffect(() => {
      if (taskData) {
         const tasksByDueDate = sortBy(taskData.tasks, 'dueDate');
         const lastDueDate = tasksByDueDate[0];
         setIsTaskOverDue(moment(lastDueDate?.dueDate).isBefore(moment(), 'day'));
      }
   }, [taskData]);

   //add
   const handleClickLink = (link, week) => {
      location.state = {week: week};
      location.pathname = link;
      history.push(location);
   };

   const onDrawerClose = () => {
      setIsDrawerOpen(false);
   };

   return (
      <div className={classes.drawerStyle}>
         <ResponsiveMobileDrawer backgroundColor={'#F4F4F4'}>
            <Grid isScrollable className={classes.root}>
               <List dense>
                  <ListItem
                     button
                     disableGutters
                     component={Link}
                     className={classes.linkPadding}
                     to={CLIENT_ENTITY_DASHBOARD_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === CLIENT_ENTITY_DASHBOARD_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText
                        disableTypography
                        className={classes.primaryLinkStyle}
                        primary={
                           <TypographyFHG color='textSecondary' variant={'h6'}>
                              Entities
                           </TypographyFHG>
                        }
                     />
                  </ListItem>
                  <ListItem
                     button
                     disableGutters
                     component={Link}
                     className={classes.linkPadding}
                     to={ACCOUNTABILITY_CLIENT_ENTITY_PATH.replace(':clientId', clientId).replace(
                        ':entityId',
                        entityId
                     )}
                     selected={match.path === ACCOUNTABILITY_CLIENT_ENTITY_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText
                        disableTypography
                        className={classes.primaryLinkStyle}
                        primary={
                           <TypographyFHG color='textSecondary' variant={'h6'}>
                              Accountability Chart
                           </TypographyFHG>
                        }
                     />
                  </ListItem>
                  <ListSubheader
                     disableGutters
                     className={classes.primaryLinkStyle}
                     style={{backgroundColor: '#f4f4f4'}}
                  >
                     <TypographyFHG variant={'h6'}>Metrics</TypographyFHG>
                  </ListSubheader>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={LOAN_ANALYSIS_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === LOAN_ANALYSIS_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Loan Analysis'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={ENTITY_ASSET_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === ENTITY_ASSET_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Assets'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={LIABILITIES_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === LIABILITIES_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Liabilities'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={BALANCE_SHEET_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === BALANCE_SHEET_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Balance Sheet'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={CASH_FLOW_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === CASH_FLOW_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Cash Flow'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={CONTRACT_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === CONTRACT_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Contracts'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  <ListSubheader
                     disableGutters
                     className={classes.primaryLinkStyle}
                     style={{backgroundColor: '#f4f4f4'}}
                  >
                     <TypographyFHG variant={'h6'}>Calculators</TypographyFHG>
                  </ListSubheader>
                  <ListItem
                     button
                     component={Link}
                     className={classes.linkPadding}
                     to={LOAN_AMORTIZATION_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === LOAN_AMORTIZATION_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText primary={'Loan Amortization'} primaryTypographyProps={{variant: 'subtitle1'}} />
                  </ListItem>
                  {isAdmin && (
                     <ListItem
                        button
                        component={Link}
                        className={classes.linkPadding}
                        to={TAXABLE_INCOME_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                        selected={match.path === TAXABLE_INCOME_PATH}
                        onClick={onDrawerClose}
                     >
                        <ListItemText primary={'Taxable Income'} primaryTypographyProps={{variant: 'subtitle1'}} />
                     </ListItem>
                  )}
                  <ListItem
                     button
                     disableGutters
                     component={Link}
                     className={classes.linkPadding}
                     to={CLIENT_TASK_NOTES_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === CLIENT_TASK_NOTES_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText
                        disableTypography
                        className={classes.primaryLinkStyle}
                        primary={
                           <Badge
                              classes={{root: classes.badgeStyle}}
                              color='error'
                              invisible={!isTaskOverDue}
                              variant='dot'
                           >
                              <TypographyFHG color='textSecondary' variant={'h6'} id={'task.tasksNotes.title'} />
                           </Badge>
                        }
                     />
                  </ListItem>
                  <ListItem
                     button
                     disableGutters
                     component={Link}
                     className={classes.linkPadding}
                     to={FILES_PATH.replace(':clientId', clientId).replace(':entityId', entityId)}
                     selected={match.path === FILES_PATH}
                     onClick={onDrawerClose}
                  >
                     <ListItemText
                        disableTypography
                        className={classes.primaryLinkStyle}
                        primary={
                           <TypographyFHG color='textSecondary' variant={'h6'}>
                              Files
                           </TypographyFHG>
                        }
                     />
                  </ListItem>
                  <ListItem
                     button
                     disableGutters
                     className={classes.primaryLinkStyle}
                     onClick={() => setOpenCourse((openCourse) => !openCourse)}
                     // selected={match.path === LMS_DASHBOARD_PATH }
                  >
                     <ListItemText
                        disableTypography
                        primary={<TypographyFHG color='textSecondary' variant={'h6'} id={'lms.title'} />}
                     />
                     {openCourse ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={openCourse}>
                     {sortedCourses.map((itm, index) => {
                        const filterCourse = itm.modules.filter((el) => {
                           return el.units.length > 0;
                        });
                        return (
                           filterCourse.length > 0 && (
                              <ListItem
                                 key={'courseId ' + index}
                                 button
                                 // component={Link}
                                 onClick={() => {
                                    handleClickLink(
                                       `/client/${clientId}/course/${itm.id}/${filterCourse[0]?.units[0]?.id}`,
                                       filterCourse[0]?.name
                                    );
                                    onDrawerClose();
                                 }}
                                 className={classes.linkPadding}
                                 // to={`/client/${clientId}/course/${itm.id}/${itm?.modules[0]?.units[0]?.id}`}
                                 selected={itm.id === courseId}
                                 // onClick={onDrawerClose}
                              >
                                 <ListItemText primary={itm.name} primaryTypographyProps={{variant: 'subtitle1'}} />
                              </ListItem>
                           )
                        );
                     })}
                  </Collapse>
                  <Divider />
                  <ListSubheader
                     disableGutters
                     className={classes.primaryLinkStyle}
                     style={{marginTop: theme.spacing(1), backgroundColor: '#f4f4f4'}}
                  >
                     <TypographyFHG variant={'h6'}>Contact Us</TypographyFHG>
                  </ListSubheader>
                  <ListSubheader
                     disableGutters
                     className={classes.primaryLinkStyle}
                     style={{marginLeft: theme.spacing(1)}}
                  >
                     <a
                        href='mailto:support@legacyfarmer.org?subject=Recommendations'
                        style={{color: theme.palette.text.primary}}
                     >
                        <TypographyFHG color='textPrimary' variant={'subtitle1'}>
                           Recommendations
                        </TypographyFHG>
                     </a>
                     <a
                        href='https://calendly.com/andy-legacyfarmer/farmer-metrics'
                        style={{color: theme.palette.text.primary}}
                        target='_blank'
                        rel='noopener noreferrer'
                     >
                        <TypographyFHG color='textPrimary' variant={'subtitle1'}>
                           Schedule a Call
                        </TypographyFHG>
                     </a>
                  </ListSubheader>
               </List>
            </Grid>
         </ResponsiveMobileDrawer>
      </div>
   );
}

ClientDrawer.propTypes = {
   replaceValue: PropTypes.any,
   location: PropTypes.any,
   onClick: PropTypes.func,
};
