import makeStyles from '@material-ui/core/styles/makeStyles';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {validate} from 'uuid';
import {PASSIVE_ROOT_ID} from '../../Constants';
import {ACTIVE_ROOT_ID} from '../../Constants';
import {ROOT_ID} from '../../Constants';
import {ENTITY_EDIT} from '../../Constants';
import {ENTITY_CREATE_UPDATE} from '../../data/QueriesGL';
import {ENTITY_DELETE} from '../../data/QueriesGL';
import {getEntityCacheQueries} from '../../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../../data/QueriesGL';
import TreeViewFHG from '../../fhg/components/tree/TreeViewFHG';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import {cacheDelete} from '../../fhg/utils/DataUtil';
import EntityCard from '../admin/EntityCard';

const STATIC_NODE_HEIGHT = 120;

const useStyles = makeStyles(
   (theme) => ({
      root: {
         padding: theme.spacing(4, 3),
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
   }),
   {name: 'DashboardStyles'}
);

/**
 * ClientEntityTree component for the clients. Displays two levels at the client level and at the entity level.
 *
 * Reviewed: 5/28/21
 */
export default function ClientEntityTree({allowDelete}) {
   const {clientId} = useParams();
   const classes = useStyles();
   const history = useHistory();
   const location = useLocation();

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const [entityDelete] = useMutationFHG(ENTITY_DELETE);
   const [entityCreateUpdate] = useMutationFHG(ENTITY_CREATE_UPDATE);

   const [rootEntity, setRootEntity] = useState({
      id: ROOT_ID,
      name: 'Legacy Game Plan',
      isEditable: false,
      hasAdd: false,
      height: 220,
      entities: [
         {
            id: ACTIVE_ROOT_ID,
            name: 'Active',
            height: STATIC_NODE_HEIGHT,
            isActive: true,
            isEditable: false,
            entities: [],
         },
         {
            id: PASSIVE_ROOT_ID,
            name: 'Passive Income',
            height: STATIC_NODE_HEIGHT,
            isActive: false,
            isEditable: false,
            entities: [],
         },
      ],
   });

   useEffect(() => {
      if (entitiesData?.entities) {
         const entities = cloneDeep(entitiesData.entities);
         const entitiesGroupBy = groupBy(entities, 'entityId');

         for (const [id, childEntities] of Object.entries(entitiesGroupBy)) {
            if (id !== null && id !== 'null') {
               const entitiesGroupByElement = find(entities, {id});

               if (entitiesGroupByElement) {
                  entitiesGroupByElement.entities = childEntities;
               } else {
                  console.log('Could not find element.', id);
               }
            }
         }

         const topGroupBy = groupBy(entitiesGroupBy['null'], 'isActive');
         setRootEntity({
            id: ROOT_ID,
            name: 'Legacy Game Plan',
            isEditable: false,
            hasAdd: false,
            height: STATIC_NODE_HEIGHT,
            entities: [
               {
                  id: ACTIVE_ROOT_ID,
                  name: 'Active',
                  isActive: true,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.true,
               },
               {
                  id: PASSIVE_ROOT_ID,
                  name: 'Passive Income',
                  isActive: false,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.false,
               },
            ],
         });
      }
   }, [entitiesData?.entities]);

   const handleAdd = (entity) => {
      const parentEntityId = entity?.id !== ACTIVE_ROOT_ID && entity?.id !== PASSIVE_ROOT_ID ? entity?.id : undefined;
      const newEntity = {
         clientId,
         ein: '',
         entityId: parentEntityId,
         isActive: entity?.isActive,
         isDeleted: false,
         name: 'Untitled',
         files: [],
      };

      if (!entity.entities) {
         entity.entities = [newEntity];
      } else {
         entity.entities.push(newEntity);
      }

      location.state = {edit: ENTITY_EDIT, parentEntityId, id: undefined, isActive: entity?.isActive};
      // setDefaultExpanded([entity?.id]);
      history.replace(location);
   };

   const handleEdit = (entity) => {
      location.state = {edit: ENTITY_EDIT, id: entity?.id};
      history.replace(location);
   };

   const handleDelete = async (entity) => {
      if (entity?.id) {
         await entityDelete({
            variables: {id: entity?.id},
            optimisticResponse: {entity_Delete: 1},
            update: cacheDelete(getEntityCacheQueries(clientId), entity.id),
         });
      }
   };

   const handleMove = async (droppedItem, parentItem) => {
      if (droppedItem?.id !== parentItem?.id) {
         try {
            const entityId =
               parentItem?.id !== ACTIVE_ROOT_ID && parentItem?.id !== PASSIVE_ROOT_ID ? parentItem?.id : null;
            let variables = {
               id: droppedItem?.id,
               entityId,
               isActive: parentItem?.isActive,
            };

            await entityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  entity: {
                     __typename: 'Entity',
                     ...droppedItem,
                     ...variables,
                     isDeleted: false,
                  },
               },
            });
         } catch (e) {
            //Intentionally left blank
         }
      }
   };

   usePageTitle({titleKey: 'balance.entities.label'});

   return (
      <TreeViewFHG
         key={'TreeView' + clientId}
         className={classes.treeStyle}
         expandAll={true}
         ContentComponent={EntityCard}
         item={rootEntity}
         labelKey={'name'}
         itemsKey={'entities'}
         parentKey={'entityId'}
         onEdit={handleEdit}
         onAdd={handleAdd}
         onMove={handleMove}
         onDelete={allowDelete ? handleDelete : undefined}
         height={220}
         width={260}
      />
   );
}
