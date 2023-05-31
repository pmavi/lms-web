import {CardActions} from '@material-ui/core';
import {CardHeader} from '@material-ui/core';
import {Card} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(
   (theme) => ({
      cardStyle: (props) => ({
         marginTop: 12,
         fontSize: 20,
         backgroundColor: props?.backgroundColor,
         width: 320,
         minHeight: 80,
         borderRadius: 8,
         margin: 12,
         cursor: 'default',
      }),
      headerStyle: {
         padding: theme.spacing(1, 1, 0.5, 1),
         cursor: 'pointer',
         '&:hover': {
            textDecoration: 'underline',
         },
         '&:hover  $fadeIn': {
            opacity: 1,
         },
      },
      fadeIn: {
         opacity: 0,
      },
   }),
   {name: 'EntityCardStyles'}
);

EntityCard.propTypes = {
   backgroundColor: PropTypes.any,
   title: PropTypes.any,
   classes: PropTypes.any,
   onClick: PropTypes.func,
   onCardClick: PropTypes.func,
   action: PropTypes.any,
   label: PropTypes.any,
};

export default function EntityCard({
   backgroundColor,
   entity,
   action,
   cardActions,
   onClick,
   onCardClick,
   classes: classesProp = {},
}) {
   const classes = {...useStyles({backgroundColor}), ...classesProp};

   return (
      <Card className={classes.cardStyle} onClick={onCardClick}>
         <CardHeader
            title={entity?.name}
            classes={{root: classes.headerStyle}}
            onClick={onClick}
            titleTypographyProps={{
               variant: 'h6',
               style: {fontWeight: 600, borderRadius: 8, textAlign: 'center'},
            }}
            action={<div className={classes.fadeIn}>{action}</div>}
         />
         <CardActions>{cardActions}</CardActions>
      </Card>
   );
}
