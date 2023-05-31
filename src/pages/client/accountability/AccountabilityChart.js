import makeStyles from '@material-ui/core/styles/makeStyles';
import {reduce} from 'lodash';
import {delay} from 'lodash';
import moment from 'moment';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import {ACCOUNTABILITY_CHART_INDEX} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {SEAT_EDIT} from '../../../Constants';
import {ADMIN_DRAWER} from '../../../Constants';
import {SEAT_DELETE} from '../../../data/QueriesGL';
import {SEAT_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {getSeatCacheQueries} from '../../../data/QueriesGL';
import Grid from '../../../fhg/components/Grid';
import ScalePanel from '../../../fhg/components/ScalePanel';
import {moveState} from '../../../fhg/components/tree/TreeItemFHG';
import TreeViewFHG from '../../../fhg/components/tree/TreeViewFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import SeatCard from './SeatCard';
import useGetRoot from './useGetRoot';

const ROOT_ID = 'root';
const DEFAULT_ACTIVE_EXPANDED = [ROOT_ID];

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         height: '100%',
         position: 'relative',
      },
      drawerStyle: {
         // width: drawerWidth,
         flexShrink: 0,
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(4, 3),
         [theme.breakpoints.up('md')]: {
            padding: `${theme.spacing(2)}px 3px`,
         },
         overflow: 'auto',
         maxHeight: '100%',
      },
      contentStyle2: {
         position: 'relative',
         overflow: 'auto',
      },
      innerGridStyle: {
         width: `calc(100% + ${ADMIN_DRAWER}px)`,
         paddingLeft: ADMIN_DRAWER,
      },
      cardStyle: {
         fontSize: 20,
         backgroundColor: '#F9F9E6',
         width: 280,
         minHeight: 80,
         borderRadius: 8,
         margin: 12,
      },
      cardTitleStyle: {
         fontWeight: 600,
         borderRadius: 8,
         textAlign: 'center',
      },
      exportButtonStyle: {
         zIndex: theme.zIndex.drawer,
         position: 'absolute',
         top: theme.spacing(2),
         left: theme.spacing(2),
         background: '#FAFAFA',
      },
   }),
   {name: 'ClientSetupStyles'}
);

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed:
 */
export default function AccountabilityChart() {
   const {entityId, clientId} = useParams();
   const classes = useStyles();
   const history = useHistory();
   const location = useLocation();

   const [move, setMove] = useRecoilState(moveState);
   const [seatData] = useQueryFHG(SEAT_ALL_WHERE_QUERY, {variables: {entityId}, skip: !validate(entityId)});
   const getRoot = useGetRoot();
   const [seatDelete] = useMutationFHG(SEAT_DELETE);
   const [seatCreateUpdate] = useMutationFHG(SEAT_CREATE_UPDATE);

   const [root, setRoot] = useState();

   usePageTitle({titleKey: 'accountability.title.label'});

   const handleSubmit = useCallback(
      (item, order) => {
         if (item && order !== undefined) {
            let variables = {id: item.id, order};
            seatCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  seat: {
                     __typename: 'Seat',
                     ...item,
                     ...variables,
                     entityId,
                     isDeleted: false,
                  },
               },
            });
         }
      },
      [entityId, seatCreateUpdate]
   );

   useEffect(() => {
      delay(() => {
         if (move?.length > 0) {
            for (const moveItem of move) {
               handleSubmit(moveItem.seat, moveItem.order);
            }
            setMove([]);
         }
      }, 900);
   }, [handleSubmit, move, setMove]);

   useEffect(() => {
      const root = getRoot(entityId, seatData?.seats);

      setRoot(root?.[0]);
   }, [entityId, getRoot, seatData?.seats]);

   const handleAdd = (seat) => {
      if (!seat.seats) {
         seat.seats = [];
      }
      const newSeat = {
         name: 'Untitled',
         responsibilities: [],
         seatId: seat.id,
         userIdList: [],
         entityId,
      };
      seat.seats.push(newSeat);
      location.state = {edit: SEAT_EDIT, parentSeatId: seat?.id, id: undefined};
      history.replace(location);
   };

   const handleEdit = (seat) => {
      location.state = {edit: SEAT_EDIT, id: seat?.id};
      history.replace(location);
   };

   const handleDelete = async (seat) => {
      if (seat) {
         await seatDelete({
            variables: {id: seat?.id},
            optimisticResponse: {seat_Delete: 1},
            update: cacheDelete(getSeatCacheQueries(entityId), seat.id),
         });
      } else {
         console.log('Cannot delete seat', seat);
      }
   };

   const handleMoveX = (move) => {
      if (move?.length > 0) {
         for (const moveItem of move) {
            handleSubmit(moveItem.seat, moveItem.order);
         }
      }
   };

   const handleMove = async (droppedItem, parentItem) => {
      let highestOrder = reduce(parentItem?.seats, (highest, value) => Math.max(value.order, highest), 0);

      try {
         let variables = {id: droppedItem?.id, seatId: parentItem?.id, order: highestOrder + 1};
         seatCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               seat: {
                  __typename: 'Seat',
                  ...droppedItem,
                  ...variables,
                  isDeleted: false,
               },
            },
         });
      } catch (e) {
         //Intentionally left blank
      }
   };
   const historyDate = moment().startOf('month').format(DATE_DB_FORMAT);

   return (
      <Grid container className={classes.root} fullHeight>
         <ExportPdfChoiceButton
            className={classes.exportButtonStyle}
            clientId={clientId}
            selectedIndex={ACCOUNTABILITY_CHART_INDEX}
            entityIds={entityId}
            historyDate={historyDate}
         />

         <Grid name='Accountability Chart Grid' container item resizable className={classes.contentStyle}>
            <ScalePanel name={'accountabilityChart'}>
               <TreeViewFHG
                  key={'TreeView' + entityId}
                  defaultExpanded={DEFAULT_ACTIVE_EXPANDED}
                  expandAll={true}
                  ContentComponent={SeatCard}
                  item={root}
                  labelKey={'name'}
                  itemsKey={'seats'}
                  parentKey={'seatId'}
                  onEdit={handleEdit}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onMoveX={handleMoveX}
               />
            </ScalePanel>
         </Grid>
      </Grid>
   );
}
