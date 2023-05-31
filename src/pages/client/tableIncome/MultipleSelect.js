import {Popover} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {useRef} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import {Fragment} from 'react';
import React from 'react';
import {useIntl} from 'react-intl';
import ButtonLF from '../../../components/ButtonLF';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import {formatMessage} from '../../../fhg/utils/Utils';
import './MultipleSelect.scss';

const useStyles = makeStyles(
   {
      buttonStyleLF: {
         textDecoration: 'underline',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
   },
   {name: 'ExportChoiceButtonStyles'}
);

/**
 * Component to choose the PDF file types to export into a single document.
 *
 * @param titleKey The localization key for the title.
 * @param buttonKey The localization key for the button.
 * @param onSelect Callback when the user has finished selecting items.
 * @param onClose Callback when the menu is closed and the user didn't select any items.
 * @param selectedDefaults The default selection of items (i.e {[id]: [boolean]}.
 * @param disabled Indicates if the button should be disabled.
 * @param className The className for the button.
 * @param menuItemLabels
 * @return {JSX.Element}
 * @constructor
 */
export default function MultipleSelect({
   titleKey = 'export.pdf.message',
   buttonKey,
   onSelect,
   onClose,
   selectedDefaults,
   disabled,
   className,
   menuItems,
}) {
   const classes = useStyles();
   const intl = useIntl();
   const [open, setOpen] = useState(false);
   const anchorRef = useRef(null);
   const [selected, setSelected] = useState({});
   const [changed, setChanged] = useState(false);

   /**
    * Select the PDF document at selected index.
    */
   useEffect(() => {
      if (selectedDefaults !== undefined) {
         setSelected({...selectedDefaults});
      } else {
         setSelected({});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedDefaults]);
   // }, [selectedIndex, selected]);

   /**
    * Callback for when the item is clicked.
    * @param item The item clicked.
    * @return {(function(): void)|*}
    */
   const handleClickCheckbox = (item) => () => {
      const selectedItems = {...selected};
      selectedItems[item?.id] = !selectedItems[item?.id];
      setSelected(selectedItems);
      setChanged(true);
   };

   /**
    * Toggle showing the PDF document selection popover.
    */
   const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
   };

   /**
    * Close the PDF document selection popover.
    * @param event The click event.
    * @param reason The reason description of the close event.
    */
   const handleClose = (event, reason) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
         return;
      }

      if (changed && reason !== 'escapeKeyDown') {
         onSelect?.(selected);
      } else {
         setSelected({...selectedDefaults});
         onClose?.();
      }
      setChanged(false);
      setOpen(false);
   };

   /**
    * Select all the PDF documents.
    */
   const handleSelectAll = () => {
      const selectedItems = {};

      for (const menuItem of menuItems) {
         selectedItems[menuItem?.id] = true;
      }
      setSelected(selectedItems);
      setChanged(true);
   };

   /**
    * Clear all the selected PDF documents.
    */
   const handleClear = () => {
      setSelected({});
      setChanged(true);
   };

   /**
    * Callback when a key is down on the Popper. If Enter, close the Popper and accept changes.
    * @param event The keydown event.
    */
   const handleKey = (event) => {
      if (event.key === 'Enter') {
         handleClose(event);
      } else if (event.key === 'Escape') {
         handleClose(event, 'escapeKeyDown');
      }
   };

   return (
      <Fragment>
         <Button
            disabled={disabled}
            ref={anchorRef}
            component={'a'}
            variant='text'
            color='primary'
            size='large'
            className={`${classes.buttonStyleLF} ${className}`}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleToggle}
            disableRipple
         >
            {formatMessage(intl, buttonKey)}
         </Button>

         <Popover
            open={open}
            anchorOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
            anchorEl={anchorRef.current}
            onClose={handleClose}
            onKeyDown={handleKey}
         >
            <Paper style={{overflowX: 'hidden', overflowY: 'hidden'}}>
               <ClickAwayListener onClickAway={handleClose}>
                  <Box display={'flex'} flexDirection={'column'} padding={1} overflow={'hidden'} height={'100%'}>
                     <Box flex={'0 0'}>
                        <TypographyFHG variant={'body2'} id={titleKey} />
                        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                           <ButtonLF labelKey={'export.selectAll.button'} onClick={handleSelectAll} />
                           <ButtonLF labelKey={'export.clear.button'} onClick={handleClear} />
                        </Box>
                     </Box>
                     <Box flex={'1 1'} overflow={'auto'} display={'flex'} flexDirection={'column'}>
                        {menuItems?.map((item) => (
                           <CheckboxFHG
                              key={item?.name + '' + selected?.[item?.id]}
                              name={item?.name}
                              checked={selected?.[item?.id]}
                              onChange={handleClickCheckbox(item)}
                              color={'default'}
                              label={item?.name}
                              marginTop={0}
                              marginLeft={0}
                           />
                        ))}
                     </Box>
                  </Box>
               </ClickAwayListener>
            </Paper>
         </Popover>
      </Fragment>
   );
}
