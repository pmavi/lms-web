import InputAdornment from '@material-ui/core/InputAdornment';
import {fade, makeStyles} from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import TextField from '../../../components/TextField';
import {formatMessage} from '../../utils/Utils';

const useStyles = makeStyles(
   (theme) => ({
      searchStyle: {
         position: 'relative',
         borderRadius: theme.shape.borderRadius,
         backgroundColor: fade(theme.palette.common.white, 0.15),
         '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
         },
         width: '100%',
         [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(0),
            width: 'auto',
         },
      },
      inputRoot: {
         width: '100%',
      },
      '::placeholder': {
         color: '#1796a4 !important',
      },
      textFieldStyle: {
         marginTop: 0,
         marginBottom: 0,
         '& input': {
            transition: theme.transitions.create('width'),
            [theme.breakpoints.up('sm')]: {
               width: 180,
               '&:focus': {
                  width: 200,
               },
            },
            // padding: 8,
         },
      },
      inputAdornmentStyle: {
         height: 'unset',
      },
      iconStyle: {
         cursor: 'pointer',
      },
   }),
   {name: 'searchFilterStyles'}
);

/**
 * The search header for a TableFHG.
 *
 * Reviewed: 3/26/20
 *
 * @param globalFilter The current global filter for the table.
 * @param setGlobalFilter The callback when the global filter changes.
 * @param placeholder The placeholder text for the search.
 * @return {*}
 * @constructor
 */
export default function SearchFilter({globalFilter, setGlobalFilter, placeholder}) {
   const classes = useStyles();
   const [showClose, setShowClose] = useState(false);
   const intl = useIntl();

   /**
    * Handle the changes to the search TextField.
    * @param e The change event.
    */
   const handleChange = (e) => {
      setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
   };

   /**
    * Handle the cancel of the search.
    */
   const handleCancelSearch = () => {
      setGlobalFilter(undefined);
   };

   return (
      <div className={`${classes.searchStyle} searchStyle`}>
         <TextField
            name={'search'}
            margin={'normal'}
            value={globalFilter || ''}
            variant={'standard'}
            className={classes.textFieldStyle}
            // inputProps={{onKeyDown: this.onKeyDown}}
            onChange={handleChange}
            placeholder={placeholder || formatMessage(intl, 'search.placeholder', 'Search…')}
            classes={{
               root: classes.inputRoot,
            }}
            InputProps={{
               'aria-label': 'Search',
               style: {paddingRight: 0},
               className: classes.textFieldStyle,
               onFocus: () => setShowClose(true),
               onBlur: () => setShowClose(false),
               endAdornment: (
                  <InputAdornment position='end' className={classes.inputAdornmentStyle}>
                     {showClose ? (
                        <CloseIcon className={classes.iconStyle} onMouseDown={handleCancelSearch} />
                     ) : (
                        <SearchIcon />
                     )}
                  </InputAdornment>
               ),
            }}
         />
      </div>
   );
}

SearchFilter.propTypes = {
   globalFilter: PropTypes.string,
   setGlobalFilter: PropTypes.func.isRequired,
   placeholder: PropTypes.string,
};
