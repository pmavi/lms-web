import {TreeItem} from '@material-ui/lab';
import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '../fhg/components/Grid';
import EntityCard from './EntityCard';

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
}));

export default function CardTreeItem({entity, color, bgColor, headerActions, cardActions, onTitleClick, ...other}) {
   const classes = useTreeItemStyles();

   return (
      <TreeItem
         label={
            <Grid container justify={'center'} fullWidth>
               <EntityCard
                  backgroundColor={bgColor}
                  entity={entity}
                  onClick={onTitleClick}
                  action={headerActions}
                  cardActions={cardActions}
               />
            </Grid>
         }
         style={{
            '--tree-view-color': color,
            '--tree-view-bg-color': '#F4f4f4',
         }}
         classes={{
            root: classes.root,
            content: classes.content,
            expanded: classes.expanded,
            selected: classes.selected,
            group: classes.group,
            label: classes.label,
         }}
         {...other}
      />
   );
}

CardTreeItem.propTypes = {
   bgColor: PropTypes.string,
   color: PropTypes.string,
};
