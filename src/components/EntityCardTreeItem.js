import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {lighten} from '@material-ui/core/styles';
import {Delete} from '@material-ui/icons';
import {Edit} from '@material-ui/icons';
import {Add} from '@material-ui/icons';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {useParams} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import {ENTITY_EDIT} from '../Constants';
import {getEntityCacheQueries} from '../data/QueriesGL';
import {ENTITY_DELETE} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';
import CardTreeItem from './CardTreeItem';
import filter from 'lodash/filter';
import {useLocation} from 'react-router-dom';

const useTreeItemStyles = makeStyles((theme) => ({
   root: {
      color: theme.palette.text.secondary,
      '&:hover > $content': {
         // backgroundColor: theme.palette.action.hover,
      },
      '&:focus > $content, &$selected > $content': {
         backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
         color: 'var(--tree-view-color)',
      },
      '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
         backgroundColor: 'transparent',
      },
   },
   content: {
      color: theme.palette.text.secondary,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      // paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
         fontWeight: theme.typography.fontWeightRegular,
      },
   },
   group: {
      marginLeft: 0,
      // '& $content': {
      //    paddingLeft: theme.spacing(2),
      // },
   },
   expanded: {},
   selected: {},
   label: {
      fontWeight: 'inherit',
      color: 'inherit',
   },
   labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
   },
   labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
   },
   headerStyle: {
      padding: theme.spacing(1, 1, 0.5, 1),
   },
   fadeArea: {
      '&:hover  $fadeIn': {
         opacity: 1,
      },
   },
   fadeIn: {
      opacity: 0,
   },
   deleteColorStyle: {
      backgroundColor: lighten(theme.palette.error.light, 0.7),
      '&:hover': {
         backgroundColor: lighten(theme.palette.error.light, 0.8),
      },
   },
   deleteButtonStyle: {
      '&:hover': {
         color: theme.palette.error.main,
      },
   },
}));
CardTreeItem.propTypes = {
   bgColor: PropTypes.string,
   color: PropTypes.string,
   labelInfo: PropTypes.string,
   labelText: PropTypes.string.isRequired,
};

function EntityCardTreeItem({entity, color, bgColor = '#F0F6EA', onDelete, entityList = [], ...other}) {
   const classes = useTreeItemStyles();
   const location = useLocation();
   const history = useHistory();
   const {clientId} = useParams();

   const [entityDelete] = useMutationFHG(ENTITY_DELETE);

   const childrenEntities = filter(entityList, (e) => e.entityId === entity.id);

   const handleClick = (event) => {
      event.stopPropagation();
      event.preventDefault();

      location.state = {edit: ENTITY_EDIT, parentEntityId: entity?.id, id: undefined, isActive: entity?.isActive};
      history.replace(location);
   };

   const handleEdit = (event) => {
      event.stopPropagation();
      event.preventDefault();
      location.state = {edit: ENTITY_EDIT, id: entity?.id};
      history.replace(location);
   };

   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      if (entity) {
         await entityDelete({
            variables: {id: entity?.id},
            optimisticResponse: {entity_Delete: 1},
            update: cacheDelete(getEntityCacheQueries(clientId, entity.isActive), entity.id),
         });
      }
   };

   return (
      <CardTreeItem
         {...other}
         color={color}
         bgColor={bgColor}
         labelText={entity?.name}
         onTitleClick={handleEdit}
         headerActions={[
            <IconButton key={'editButton'} size={'small'} onClick={handleEdit}>
               <Edit fontSize={'small'} />
            </IconButton>,
            <Fragment key={'deleteHeaderButton'}>
               {entity?.id && (
                  <ConfirmIconButton
                     key={'deleteHeaderButtonConfirmButton'}
                     className={`${classes.deleteButtonStyle}`}
                     onConfirm={handleDelete}
                     values={{type: 'entity', name: entity?.name}}
                     messageKey={'confirmRemoveValue.message'}
                     buttonLabelKey={'delete.button'}
                     size={'small'}
                     submitStyle={classes.deleteColorStyle}
                  >
                     <Delete fontSize={'small'} />
                  </ConfirmIconButton>
               )}
            </Fragment>,
         ]}
         cardActions={
            <Button onClick={handleClick}>
               <Add fontSize={'small'} />
               New Entity
            </Button>
         }
      >
         {childrenEntities?.map((childEntity, index) => (
            <EntityCardTreeItem
               key={childEntity.id + ' ' + index}
               nodeId={childEntity.id}
               entity={childEntity}
               entityList={entityList}
            />
         ))}
      </CardTreeItem>
   );
}
