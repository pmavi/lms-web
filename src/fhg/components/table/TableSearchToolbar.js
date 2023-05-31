import React from 'react';

import Typography from '../Typography';
import {lighten, makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import SearchFilter from './SearchFilter';

const useToolbarStyles = makeStyles((theme) => ({
   root: {
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(1),
      width: '100%',
      flex: '0 0 auto',
      cursor: 'default',
      justifyContent: 'space-between',
   },
   highlight:
      theme.palette.type === 'light'
         ? {
              color: theme.palette.secondary.main,
              backgroundColor: lighten(theme.palette.secondary.light, 0.85),
           }
         : {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.secondary.dark,
           },
   title: {
      flex: '0 0 auto',
      position: 'sticky',
      left: theme.spacing(1.5),
   },
}));

/**
 * Component to show the search (filter) for the table.
 *
 * Reviewed: 4/14/20
 *
 * @param (optional)numSelected The number of items selected.
 * @param (optional) titleKey The message key for the table.
 * @param setGlobalFilter The global filter callback to change the filtered rows in the table.
 * @param globalFilter The current global filter.
 * @param (optional)children The children to be placed after the search.
 * @return {*}
 * @constructor
 */
export default function TableSearchToolbar({
   numSelected = 0,
   titleKey,
   title,
   allowSearch,
   setGlobalFilter,
   globalFilter,
   children,
}) {
   const classes = useToolbarStyles();

   return (
      <Toolbar className={`${classes.root} ${numSelected > 0 ? classes.highlight : undefined}`}>
         {(titleKey || title) && (
            <Typography className={`${classes.title} searchBarTitleStyle`} variant='h5' id={titleKey}>
               {title}
            </Typography>
         )}
         {children}
         {allowSearch && <SearchFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />}
      </Toolbar>
   );
}

TableSearchToolbar.propTypes = {
   setGlobalFilter: PropTypes.func.isRequired,
   globalFilter: PropTypes.string,
   titleKey: PropTypes.string,
   numSelected: PropTypes.number,
};
