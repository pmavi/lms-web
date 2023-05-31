import {TextField} from '@material-ui/core';
import {FormControlLabel} from '@material-ui/core';
import {Switch} from '@material-ui/core';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import {sumBy} from 'lodash';
import capitalize from 'lodash/capitalize';
import debounce from 'lodash/debounce';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useRef} from 'react';
import {useState} from 'react';
import {useMemo} from 'react';
import React from 'react';
import {FormattedNumber} from 'react-intl';
import AutocompleteLF2 from '../../components/AutocompleteLF2';
import TextFieldLF from '../../components/TextFieldLF';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import useEditData from '../../fhg/components/edit/useEditData';
import Grid from '../../fhg/components/Grid';
import KeyboardDatePickerFHG from '../../fhg/components/KeyboardDatePickerFHG';
import TableFHG from '../../fhg/components/table/TableFHG';
import TypographyFHG from '../../fhg/components/Typography';
import {round} from '../../fhg/utils/DataUtil';
import {PMT} from '../../fhg/utils/DataUtil';

const LOAN_FREQUENCY = [
   'Annual',
   'Semi-Annual',
   'Quarterly',
   'Bi-Monthly',
   'Monthly',
   'Semi-Monthly',
   'Bi-Weekly',
   'Weekly',
];
const PERIODS_PER_YEAR = {
   Annual: 1,
   'Semi-Annual': 2,
   Quarterly: 4,
   'Bi-Monthly': 6,
   Monthly: 12,
   'Semi-Monthly': 24,
   'Bi-Weekly': 26,
   Weekly: 52,
};

const PAYMENTS_UNIT = {
   Annual: 'year',
   'Semi-Annual': 'month', //6
   Quarterly: 'quarters', //
   'Bi-Monthly': 'month', // 2
   Monthly: 'month',
   'Semi-Monthly': 'month', // 1/2,
   'Bi-Weekly': 'week', //2
   Weekly: 'week',
};

const PAYMENTS_MULTIPLIER = {
   Annual: 1,
   'Semi-Annual': 6, //6
   Quarterly: 1, //
   'Bi-Monthly': 2, // 2
   Monthly: 1,
   'Semi-Monthly': 0.5, // 1/2,
   'Bi-Weekly': 2, //2
   Weekly: 1,
};

const PAYMENT_TYPE = ['End of Period', 'Beginning of Period'];
const PAYMENT_TYPE_VALUE = {
   'End of Period': 0,
   'Beginning of Period': 1,
};

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)}px)`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
         maxWidth: 400,
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 3, 3, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
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
      headerTextStyle: {
         fontWeight: 500,
         // height: 36,
      },
      tableRoot: {
         margin: '0 !important',
         overflow: 'auto',
      },
      tableFrameStyle: {
         padding: 3,
         minHeight: 80,
      },
   }),
   {name: 'LoanAmortizationStyles'}
);

LoanAmortization.propTypes = {};

export default function LoanAmortization() {
   const classes = useStyles();
   const theme = useTheme();

   const [additionalPayments, setAdditionalPayments] = useState([]);

   const cachedValues = useMemo(() => {
      return localStorage.loanAmortization ? JSON.parse(localStorage.loanAmortization) : {};
   }, []);

   const [, /*unused*/ handleChange, {getValue}] = useEditData(
      {paymentType: PAYMENT_TYPE[0], rounding: true, ...cachedValues},
      undefined,
      false,
      (changedEditValues, editValue) => {
         if (changedEditValues?.termYears || changedEditValues?.paymentFrequency) {
            setAdditionalPayments([]);
         }
         handleSubmitDebounced(editValue);
      }
   );

   const handleSubmit = (editValue) => {
      localStorage.loanAmortization = JSON.stringify(editValue);
   };

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   let compoundPeriod = PERIODS_PER_YEAR[getValue('compoundPeriod', LOAN_FREQUENCY[0])];
   let periodsPerYear = PERIODS_PER_YEAR[getValue('paymentFrequency', LOAN_FREQUENCY[0])];

   const loanAmount = getValue('loanAmount', 0);
   const annualInterestRate = getValue('annualInterestRate', 0) / 100;
   const termOfLoanInYears = getValue('termYears', 0);
   const paymentType = PAYMENT_TYPE_VALUE[getValue('paymentType', PAYMENT_TYPE[0])];
   const isRounding = getValue('rounding');

   // E5 - Annual Interest Rate
   // E6 - Term of loan in years
   // E12 - Periods per year
   // E13 -Compound Period

   // Interest Rate Per Period
   //((1+E5/E13)^(E13/E12))-1
   const ratePerPeriod = Math.pow(1 + annualInterestRate / compoundPeriod, compoundPeriod / periodsPerYear) - 1;

   //Scheduled # Payments
   //=$E$6*$E$12
   const scheduledNumberOfPayments = termOfLoanInYears * periodsPerYear;

   // =IF('Loan Calculator'!roundOpt,ROUND(-PMT('Loan Calculator'!rate,'Loan Calculator'!nper,$E$4,,'Loan
   // Calculator'!pmtType),2),-PMT('Loan Calculator'!rate,'Loan Calculator'!nper,$E$4,,'Loan Calculator'!pmtType))
   let unRoundedPayment = -PMT(ratePerPeriod, scheduledNumberOfPayments, loanAmount, undefined, paymentType) || 0;
   const payment = round(unRoundedPayment, isRounding);

   // =IF(B58="","",IF('Loan Calculator'!roundOpt,IF(OR(B58='Loan Calculator'!nper,'Loan
   // Calculator'!payment>ROUND((1+'Loan Calculator'!rate)*I57,2)),ROUND((1+'Loan Calculator'!rate)*I57,2),'Loan
   // Calculator'!payment),IF(OR(B58='Loan Calculator'!nper,'Loan Calculator'!payment>(1+'Loan
   // Calculator'!rate)*I57),(1+'Loan Calculator'!rate)*I57,'Loan Calculator'!payment)))

   // =IF(B58="","",IF('Loan Calculator'!roundOpt,IF(OR(B58='actualNumberOfPayments,'Loan
   // Calculator'!payment>ROUND((1+'annualInterestRate)*I57,2)),ROUND((1+'annualInterestRate)*I57,2),'Loan
   // Calculator'!payment),IF(OR(B58='actualNumberOfPayments,'Loan
   // Calculator'!payment>(1+'annualInterestRate)*I57),(1+'annualInterestRate)*I57,'Loan Calculator'!payment)))
   const data = useMemo(() => {
      if (loanAmount > 0 && ratePerPeriod > 0 && payment > 0 && scheduledNumberOfPayments > 0) {
         const paymentEntries = [];
         const paymentFrequency = getValue('paymentFrequency', LOAN_FREQUENCY[0]);
         const firstPaymentDate = getValue('firstPaymentDate');
         const unit = PAYMENTS_UNIT[paymentFrequency];
         const multiplier = PAYMENTS_MULTIPLIER[paymentFrequency];

         let paymentDue = payment;
         let previousBalance = loanAmount;

         for (let i = 0; i < scheduledNumberOfPayments; i++) {
            const interest = i === 0 && paymentType === 1 ? 0 : round(previousBalance * ratePerPeriod, isRounding);
            let dueDate;

            if (paymentFrequency === LOAN_FREQUENCY[5]) {
               if (i % 2 === 1) {
                  dueDate = moment(firstPaymentDate).add((1 / 2) * i, 'month');
               } else {
                  dueDate = moment(firstPaymentDate)
                     .add((1 / 2) * i, 'month')
                     .subtract(2, 'weeks');
               }
            } else {
               dueDate = moment(firstPaymentDate).add(i * multiplier, unit);
            }
            const additionalPayment = additionalPayments[i] || '';
            let principal = payment - interest + Number(additionalPayment || 0);
            let balance = previousBalance - principal;
            previousBalance = balance;

            if (i + 1 === scheduledNumberOfPayments || balance < 0) {
               paymentDue += balance;
               principal = paymentDue - interest + Number(additionalPayment || 0);
               balance = 0;
            }
            paymentEntries.push({number: i + 1, dueDate, additionalPayment, paymentDue, interest, principal, balance});
            if (balance <= 0) {
               break;
            }
         }

         return paymentEntries;
      }
   }, [
      loanAmount,
      ratePerPeriod,
      payment,
      scheduledNumberOfPayments,
      getValue,
      paymentType,
      isRounding,
      additionalPayments,
   ]);

   // Actual # of Payments
   // =MAX(B56:B838) Maximum number on the payments in the table. Highest payment number
   const actualNumberOfPayments = data?.length || 0;

   // Total Interest
   // =SUM(G55:G837) Sum of Interest
   const totalInterest = sumBy(data, 'interest');

   const totalPrincipal = sumBy(data, 'principal');

   // Total Payments
   // =SUM(G55:G837)+SUM(H55:H837)
   // Sum of Interest table column + sum of principal table column
   const totalPayments = totalInterest + totalPrincipal;

   // Est Interest Savings
   // E58:E837 is sum the additional payments
   // nper is actual number of payments;  Loan Calculator'!nper = actualNumberOfPayments
   // rate is annual interest rate; 'Loan Calculator'!rate = annualInterestRate
   // loan_amount is loan amount; 'Loan Calculator'!loan_amount  = loanAmount;
   // pmtType is the Payment Type; 'Loan Calculator'!pmtType = paymentType;
   // I8 is total interest
   // =IF(AND(SUM(E58:E837)=0,'Loan Calculator'!roundOpt)," - ",('Loan Calculator'!nper*(-PMT('Loan
   // Calculator'!rate,'Loan Calculator'!nper,'Loan Calculator'!loan_amount,,'Loan Calculator'!pmtType))-'Loan
   // Calculator'!loan_amount)-I8)

   // =IF(AND(SUM(E58:E837)=0,'isRounding)," -
   // ",('actualNumberOfPayments*(-PMT(totalInterest,actualNumberOfPayments,'loanAmount,,'paymentType))-'loanAmount)-I8)

   const additionalPaymentsCount = additionalPayments?.length || 0;
   let estimatedInterestSavings;

   if (additionalPaymentsCount > 0) {
      estimatedInterestSavings =
         actualNumberOfPayments * -PMT(annualInterestRate, actualNumberOfPayments, loanAmount, undefined, paymentType) -
         loanAmount -
         totalInterest;
   } else {
      estimatedInterestSavings = 0;
   }

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(() => {
      let columnIndex = 0;

      return [
         {
            Header: <TypographyFHG id={'amortization.number.column'} />,
            ___index: columnIndex++,
            accessor: 'number',
         },
         {
            Header: <TypographyFHG id={'amortization.dueDate.column'} />,
            ___index: columnIndex++,
            accessor: 'dueDate',
            Cell: ({row}) => row.values?.dueDate?.format(DATE_FORMAT_KEYBOARD) || '',
         },
         {
            Header: <TypographyFHG id={'amortization.paymentDue.column'} />,
            ___index: columnIndex++,
            accessor: 'paymentDue',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.paymentDue)}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.additionalPayment.column'} />,
            accessor: 'additionalPayment',
            ___index: columnIndex++,
            isEditable: true,
            prefix: '',
            format: CURRENCY_FULL_FORMAT,
            allowNegative: false,
            minWidth: 111,
            tableCellProps: {align: 'right'},
         },
         {
            Header: <TypographyFHG id={'amortization.interest.column'} />,
            ___index: columnIndex++,
            accessor: 'interest',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.interest))}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.principal.column'} />,
            ___index: columnIndex++,
            accessor: 'principal',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.principal))}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.balance.column'} />,
            ___index: columnIndex++,
            accessor: 'balance',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.balance))}
                  </div>
               );
            },
         },
      ];
   }, []);

   const digitLimit = (minimum, maximum) => (inputObj) => {
      const {value} = inputObj;

      if (value <= maximum) {
         if (minimum === undefined || value >= minimum) {
            return inputObj;
         }
      }
   };

   const handleUpdate = (index, id, value) => {
      const useAdditionalPayments = [...additionalPayments];
      useAdditionalPayments[index] = value;
      setAdditionalPayments(useAdditionalPayments);
   };

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         <Grid item container resizable direction={'column'}>
            <Grid
               name={'Loan Amortization Root'}
               container
               directin={'row'}
               item
               fullWidth
               className={classes.infoRootStyle}
               flex={'2 2'}
            >
               <Grid
                  name={'Loan Amortization Left Column'}
                  container
                  item
                  xs={12}
                  sm={6}
                  className={classes.infoInnerStyle}
               >
                  <TextFieldLF
                     isFormattedNumber
                     inputProps={{prefix: '$', allowNegative: false}}
                     name={'loanAmount'}
                     autoFocus
                     labelKey={'amortization.loanAmount.label'}
                     onChange={handleChange}
                     value={getValue('loanAmount')}
                     required
                  />
                  <TextFieldLF
                     isFormattedNumber
                     inputProps={{suffix: '%', allowNegative: false, isAllowed: digitLimit(1, 100)}}
                     name={'annualInterestRate'}
                     labelKey={'amortization.annualInterestRate.label'}
                     onChange={handleChange}
                     value={getValue('annualInterestRate')}
                     required
                  />
                  <TextFieldLF
                     isFormattedNumber
                     inputProps={{allowNegative: false, isAllowed: digitLimit(1, 100)}}
                     name={'termYears'}
                     labelKey={'amortization.termYears.label'}
                     onChange={handleChange}
                     value={getValue('termYears')}
                     required
                  />
                  <KeyboardDatePickerFHG
                     name={'firstPaymentDate'}
                     format={DATE_FORMAT_KEYBOARD}
                     labelKey={'amortization.firstPaymentDate.label'}
                     value={getValue('firstPaymentDate')}
                     onChange={handleChange}
                     required={getValue('firstPaymentDate')}
                  />
                  <AutocompleteLF2
                     name={'paymentFrequency'}
                     labelKey={'amortization.paymentFrequency.label'}
                     value={capitalize(getValue('paymentFrequency', LOAN_FREQUENCY[0]))}
                     freeSolo={false}
                     autoHighlight
                     onChange={handleChange}
                     valueKey={false}
                     options={LOAN_FREQUENCY}
                     fullWidth
                     required
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label={<TypographyFHG id={'amortization.paymentFrequency.label'} />}
                           variant={'outlined'}
                           size={'small'}
                           margin={'normal'}
                        />
                     )}
                  />
                  <AutocompleteLF2
                     key={'compoundPeriod'}
                     name={'compoundPeriod'}
                     labelKey={'amortization.compoundPeriod.label'}
                     value={capitalize(getValue('compoundPeriod', LOAN_FREQUENCY[0]))}
                     freeSolo={false}
                     autoHighlight
                     onChange={handleChange}
                     valueKey={false}
                     options={LOAN_FREQUENCY}
                     fullWidth
                     required
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label={<TypographyFHG id={'amortization.compoundPeriod.label'} />}
                           variant={'outlined'}
                           size={'small'}
                           margin={'normal'}
                        />
                     )}
                  />
                  <AutocompleteLF2
                     key={'paymentType'}
                     name={'paymentType'}
                     labelKey={'amortization.paymentType.label'}
                     value={getValue('paymentType')}
                     freeSolo={false}
                     autoHighlight
                     onChange={handleChange}
                     valueKey={false}
                     options={PAYMENT_TYPE}
                     fullWidth
                     required
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label={<TypographyFHG id={'amortization.paymentType.label'} />}
                           variant={'outlined'}
                           size={'small'}
                           margin={'normal'}
                        />
                     )}
                  />
                  <Grid item fullWidth>
                     <FormControlLabel
                        control={
                           <Switch
                              checked={getValue('rounding')}
                              onChange={handleChange}
                              name='rounding'
                              color='primary'
                           />
                        }
                        label='Rounding'
                        fullWidth
                     />
                  </Grid>
               </Grid>
               <Grid
                  name={'Loan Amortization Right Column'}
                  container
                  item
                  fullWidth
                  xs={12}
                  sm={6}
                  className={classes.infoInnerStyle}
                  fullHeight={false}
                  spacing={1}
                  direction={'column'}
                  style={{marginTop: 16, height: 'fit-content'}}
               >
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.annualPayment.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={payment} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.ratePerPeriod.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber
                           value={ratePerPeriod}
                           // eslint-disable-next-line react/style-prop-object
                           style='percent'
                           minimumFractionDigits={1}
                           maximumFractionDigits={4}
                        />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.scheduledPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={scheduledNumberOfPayments} />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.actualPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={actualNumberOfPayments} />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.totalPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={totalPayments} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.totalInterest.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={totalInterest} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
                  <Grid item container justify={'space-between'} style={{maxWidth: 480}}>
                     <TypographyFHG
                        id={'amortization.estimatedInterestSavings.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={estimatedInterestSavings} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Grid>
               </Grid>
            </Grid>
            <Grid
               name={'Loan Amortization table'}
               item
               flex={'1 1'}
               fullWidth
               fullHeight
               className={classes.tableFrameStyle}
            >
               {data?.length > 0 && (
                  <div
                     style={{boxShadow: theme.shadows[3], backgroundColor: 'white', margin: '1px 1px', height: '100%'}}
                  >
                     <TableFHG
                        name={'Loan Amortization'}
                        columns={columns}
                        data={data || [{}]}
                        updateMyData={handleUpdate}
                        classes={{
                           root: classes.tableRoot,
                        }}
                        allowCellSelection={true}
                        hasShadow
                        isEditOnSingleClick={true}
                     />
                  </div>
               )}
            </Grid>
         </Grid>
      </Grid>
   );
}
