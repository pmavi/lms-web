import {Popover} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {filter} from 'lodash';
import {map} from 'lodash';
import {join} from 'lodash';
import {castArray} from 'lodash';
import {some} from 'lodash';
import {fill} from 'lodash';
import find from 'lodash/find';
import moment from 'moment/moment';
import {useRef} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import {useMemo, Fragment} from 'react';
import React from 'react';
import {useIntl} from 'react-intl';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {PDF_COUNT} from '../Constants';
import {TAXABLE_INCOME_INDEX} from '../Constants';
import {ACCOUNTABILITY_CHART_INDEX} from '../Constants';
import {CONTRACTS_INDEX} from '../Constants';
import {CASH_FLOW_INDEX} from '../Constants';
import {BALANCE_SHEET_INDEX} from '../Constants';
import {LOAN_ANALYSIS_INDEX} from '../Constants';
import {LIABILITY_INDEX} from '../Constants';
import {ASSET_INDEX} from '../Constants';
import {DATE_FORMAT_KEYBOARD} from '../Constants';
import {CLIENT_BY_ID_REPORT_QUERY} from '../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import CheckboxFHG from '../fhg/components/CheckboxFHG';
import Prompt from '../fhg/components/edit/Prompt';
import ProgressButton from '../fhg/components/ProgressButton';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {formatMessage} from '../fhg/utils/Utils';
import useMultiplePdf from '../pages/client/useMultiplePdf';
import {userRoleState} from '../pages/Main';
import ButtonLF from './ButtonLF';
import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';

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
 * @param clientId The client ID for the document.
 * @param entityIds The entity IDs to include in the document.
 * @param historyDate The date on which to base the report.
 * @param selectedIndex The default selection.
 * @param disabled Indicates if the button should be disabled.
 * @param className The className for the button.
 * @return {JSX.Element}
 * @constructor
 */
export default function ExportPdfChoiceButton({
   titleKey = 'export.pdf.message',
   clientId,
   entityIds,
   historyDate,
   selectedIndex,
   disabled,
   className,
}) {
   const classes = useStyles();
   const intl = useIntl();
   const entityIdList = castArray(entityIds);
   const [open, setOpen] = useState(false);
   const anchorRef = useRef(null);
   const [selectedNames, setSelectedNames] = useState(Array(PDF_COUNT));
   const [isProgress, setIsProgress] = useState(false);
   const {isAdmin} = useRecoilValue(userRoleState);

   const exportPdf = useMultiplePdf(intl, 'landscape', clientId, entityIds, historyDate, 'seats');
   const [entityData] = useQueryFHG(
      ENTITY_CLIENT_QUERY,
      {variables: {clientId}, skip: !validate(clientId)},
      'entity.type'
   );

   const entityNames = useMemo(() => {
      const entities = filter(entityData?.entities, (entity) =>
         find(entityIdList, (entityId) => entityId === entity.id)
      );
      return join(map(entities, 'name'), ', ');
   }, [entityData?.entities, entityIdList]);

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_REPORT_QUERY,
      {fetchPolicy: 'network-only', variables: {clientId}},
      'client.type'
   );

   const messageKey = 'pdf.leave.error';

   /**
    * Names to be displayed for the user to select.
    */
   const names = useMemo(() => {
      const names = [];

      names[ACCOUNTABILITY_CHART_INDEX] = formatMessage(intl, 'export.accountabilityChart.title');
      names[LOAN_ANALYSIS_INDEX] = formatMessage(intl, 'export.loanAnalysis.title');
      names[ASSET_INDEX] = formatMessage(intl, 'export.asset.title');
      names[LIABILITY_INDEX] = formatMessage(intl, 'export.liability.title');
      names[BALANCE_SHEET_INDEX] = formatMessage(intl, 'export.balanceSheet.title');
      names[CASH_FLOW_INDEX] = formatMessage(intl, 'export.cashFlow.title');
      names[CONTRACTS_INDEX] = formatMessage(intl, 'export.contracts.title');

      if (isAdmin) {
         names[TAXABLE_INCOME_INDEX] = formatMessage(intl, 'export.taxableIncome.title');
      }

      return names;
   }, [intl]);

   /**
    * Select the PDF document at selected index.
    */
   useEffect(() => {
      if (selectedIndex !== undefined) {
         selectedNames[selectedIndex] = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedIndex]);
   // }, [selectedIndex, selectedNames]);

   /**
    * Callback for when the PDF document is selected.
    * @param index The index of the PDF document.
    * @return {(function(): void)|*}
    */
   const handleClickCheckbox = (index) => () => {
      const selected = [...selectedNames];
      selected[index] = !selected[index];
      setSelectedNames(selected);
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
    */
   const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
         return;
      }

      setOpen(false);
   };

   /**
    * Callback when the export button is selected.
    * @return {Promise<void>}
    */
   const handleExport = async () => {
      setOpen(false);
      setIsProgress(true);
      const title = `${entityNames}_${moment().format(DATE_FORMAT_KEYBOARD)}`;
      const pdfDocument = await exportPdf(selectedNames, title, entityNames, clientData?.client);
      const blob = await pdf(pdfDocument).toBlob();
      saveAs(blob, title + '.pdf');
      setIsProgress(false);
   };

   /**
    * Select all the PDF documents.
    */
   const handleSelectAll = () => {
      const selected = [...selectedNames];
      fill(selected, true);
      setSelectedNames(selected);
   };

   /**
    * Clear all the selected PDF documents.
    */
   const handleClear = () => {
      const selected = [...selectedNames];
      fill(selected, false);
      setSelectedNames(selected);
   };

   return (
      <Fragment>
         <Prompt when={isProgress} messageKey={messageKey} />
         <ProgressButton
            isProgress={isProgress}
            disabled={disabled}
            ref={anchorRef}
            component={'a'}
            labelKey={'asset.exportPdf.button'}
            variant='text'
            color='primary'
            size='large'
            className={`${classes.buttonStyleLF} ${className}`}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleToggle}
         />

         <Popover
            open={open}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
            anchorEl={anchorRef.current}
         >
            <Paper>
               <ClickAwayListener onClickAway={handleClose}>
                  <Box display={'flex'} flexDirection={'column'} padding={1}>
                     <TypographyFHG variant={'body2'} id={titleKey} />
                     <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <ButtonLF labelKey={'export.selectAll.button'} onClick={handleSelectAll} />
                        <ButtonLF labelKey={'export.clear.button'} onClick={handleClear} />
                     </Box>
                     {names.map((name, index) => (
                        <CheckboxFHG
                           key={name + '' + selectedNames[index]}
                           name={name}
                           checked={selectedNames[index]}
                           onChange={handleClickCheckbox(index)}
                           color={'default'}
                           label={name}
                           marginTop={0}
                           marginLeft={0}
                        />
                     ))}
                     <Box>
                        <ButtonFHG
                           size='small'
                           variant='contained'
                           color='primary'
                           style={{width: 'max-content', margin: '16px 8px 16px 8px'}}
                           labelKey={'export.label.button'}
                           disabled={!some(selectedNames)}
                           onClick={handleExport}
                        />
                        <ButtonLF labelKey={'cancel.button'} onClick={handleClose} />
                     </Box>
                  </Box>
               </ClickAwayListener>
            </Paper>
         </Popover>
      </Fragment>
   );
}
