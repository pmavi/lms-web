import {List} from '@material-ui/core';
import {ListItem} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {Delete} from '@material-ui/icons';
import {Edit} from '@material-ui/icons';
import {clone} from 'lodash';
import {defer} from 'lodash';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import {getSeatCacheQueries} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SEAT_BY_ID_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import Form from '../../../fhg/components/edit/Form';
import Prompt from '../../../fhg/components/edit/Prompt';
import useEditData from '../../../fhg/components/edit/useEditData';
import Grid from '../../../fhg/components/Grid';
import ProgressButton from '../../../fhg/components/ProgressButton';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {removeOne} from '../../../fhg/utils/Utils';

const useStyles = makeStyles(
   (theme) => ({
      paperStyle: {
         maxHeight: `calc(100% - 1px)`,
         margin: theme.spacing(0, 0, 0, 2),
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'hidden',
         // minHeight: 320,
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         height: 'fit-content',
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      fileFrameStyle: {
         height: 'fit-content',
         // minHeight: 180,
         // maxHeight: '50%',
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
         // minHeight: 200,
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         padding: theme.spacing(2),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      titleStyle: {
         padding: theme.spacing(3, 2, 0),
      },
      frameStyle: {
         // padding: theme.spacing(4, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      dividerStyle: {
         marginBottom: theme.spacing(2),
         width: '100%',
      },
      uploadStyle: {
         position: 'sticky',
         bottom: 0,
         backgroundColor: theme.palette.background.paper,
         marginTop: theme.spacing(2),
         padding: theme.spacing(0, 2),
      },
      fadeArea: {
         cursor: 'default',
         '&:hover $fadeIn': {
            opacity: 1,
            transition: '1s',
            transitionDelay: '0.2s',
         },
      },
      fadeIn: {
         opacity: 0,
         marginTop: 'auto',
         marginBottom: 'auto',
      },
   }),
   {name: 'SeatEditStyles'}
);

export default function SeatEdit() {
   const classes = useStyles();
   const {entityId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const seatId = location?.state?.id;
   const isNew = !seatId;
   const parentSeatId = !seatId && location?.state?.parentSeatId;

   const editItem = {
      id: uuid(),
      name: '',
      responsibilities: [],
      seatId: parentSeatId,
      userIdList: null,
      entityId,
   };
   const [isSaving, setIsSaving] = useState(false);

   const [
      editValues,
      handleChange,
      {
         setEditValues,
         isChanged = false,
         getValue,
         setValue,
         setIsChanged,
         defaultValues,
         setDefaultValues,
         resetValues,
      },
   ] = useEditData(isNew ? editItem : undefined, isNew ? ['id', 'seatId', 'entityId'] : undefined);
   const [isEditing, setEditing] = useState(undefined);
   const [
      ,
      handleRoleChange,
      {getValue: getRoleValue, setDefaultValues: setDefaultRoleValues, resetValues: resetRoleValues},
   ] = useEditData();

   const [seatData] = useQueryFHG(SEAT_BY_ID_QUERY, {variables: {seatId}, skip: !validate(seatId)}, 'seat.type');

   const [seatCreateUpdate] = useMutationFHG(SEAT_CREATE_UPDATE);

   useEffect(() => {
      if (seatData?.seat) {
         setDefaultValues(seatData?.seat);
      }
   }, [seatData, setDefaultValues]);

   const handleClose = useCallback(() => {
      resetValues();
      defer(() => {
         location.state = {edit: undefined, id: undefined, selectSeatId: parentSeatId};
         history.replace(location);
      });
   }, [resetValues, history, location, parentSeatId]);

   useKeyDown(handleClose);

   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            let variables = {...editValues};
            setIsSaving(true);
            await seatCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  seat: {
                     __typename: 'Seat',
                     ...defaultValues,
                     ...variables,
                     entityId,
                     seatId: parentSeatId || '',
                     isDeleted: false,
                  },
               },
               update: isNew ? cacheUpdate(getSeatCacheQueries(entityId), editValues.id, 'seat') : undefined,
            });
            location.state = {...location.state, id: editValues.id};
            history.replace(location);
            setIsChanged(false);
            setEditValues({});
            setDefaultValues(editValues);
            handleClose();
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      isChanged,
      editValues,
      seatCreateUpdate,
      defaultValues,
      entityId,
      parentSeatId,
      isNew,
      location,
      history,
      setIsChanged,
      setEditValues,
      setDefaultValues,
      handleClose,
   ]);

   const handleDeleteRole = (index) => () => {
      const responsibilities = clone(getValue('responsibilities'));
      removeOne(responsibilities, index);
      setValue('responsibilities', responsibilities, true);
   };

   const handleRoleEdit = (index) => () => {
      const responsibilities = getValue('responsibilities');
      setDefaultRoleValues({role: responsibilities[index]});
      setEditing(index);
   };

   const handleRoleClose = () => {
      resetRoleValues();
      setEditing(undefined);
   };

   const handleAddResponsibility = () => {
      const responsibilities = [...(getValue('responsibilities') || [])];
      responsibilities.push('');
      setValue('responsibilities', responsibilities, true);
      setEditing(responsibilities.length - 1);
   };

   const handleRoleSubmit = () => {
      const responsibilityEdit = getRoleValue('role');

      if (responsibilityEdit === '' || responsibilityEdit === undefined) {
         handleDeleteRole(isEditing)();
      } else {
         const responsibilities = clone(getValue('responsibilities'));
         responsibilities[isEditing] = responsibilityEdit;
         setValue('responsibilities', responsibilities, true);
         resetRoleValues();
      }
      setEditing(undefined);
   };

   const handleKey = (event) => {
      if (event.key === 'Escape') {
         event.preventDefault();
         handleRoleClose();
      } else if (event.key === 'Enter') {
         event.preventDefault();
         const index = isEditing;
         handleRoleSubmit();
         if (index < getValue('responsibilities')?.length - 1) {
            handleRoleEdit(index + 1)();
         }
      } else if (event.key === 'Tab') {
         event?.preventDefault();
         event?.stopPropagation();
         const index = isEditing;

         handleRoleSubmit();
         if (index < getValue('responsibilities')?.length - 1) {
            handleRoleEdit(index + 1)();
         }
      }
   };
   useKeyDown(handleClose);

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
         <TypographyFHG
            variant={'h5'}
            id={'seat.title.label'}
            color={'textSecondary'}
            gutterBottom
            className={classes.titleStyle}
         />
         <Form onSubmit={handleSubmit} className={classes.formStyle}>
            <Prompt when={isChanged} />
            <Grid name={'Seat Edit Root'} container item fullWidth className={classes.infoRootStyle}>
               <Grid name={'Seat Edit Root'} container item fullWidth className={classes.infoInnerStyle}>
                  <TextFieldLF
                     key={'name' + defaultValues.id}
                     name={'name'}
                     autoFocus
                     required
                     labelKey='seat.name.label'
                     defaultValue={defaultValues.name}
                     value={editValues.name}
                     onChange={handleChange}
                  />
               </Grid>
               <Grid
                  name={'Task Edit Root'}
                  container
                  item
                  fullWidth
                  className={classes.fileFrameStyle}
                  overflow={'visible'}
                  resizable
               >
                  <Divider light className={classes.dividerStyle} />
                  <Box justifyContent='space-between' display='flex' flexDirection='row' flexWrap='nowrap'>
                     <TypographyFHG
                        variant={'h6'}
                        color='textSecondary'
                        id={'seat.responsibilities.label'}
                        className={classes.infoInnerStyle}
                     />
                  </Box>
                  <List dense style={{width: '100%'}}>
                     {getValue('responsibilities')?.length > 0 &&
                        getValue('responsibilities').map((responsibility, index) => (
                           <ListItem
                              key={'ListItem' + responsibility}
                              className={classes.fadeArea}
                              onDoubleClick={handleRoleEdit(index)}
                           >
                              {isEditing === index ? (
                                 <TextFieldLF
                                    name='role'
                                    onChange={handleRoleChange}
                                    value={getRoleValue('role')}
                                    onBlur={handleRoleSubmit}
                                    onKeyDown={handleKey}
                                    autoFocus
                                    margin='none'
                                    size='small'
                                 />
                              ) : (
                                 <Box
                                    justifyContent='space-between'
                                    display='flex'
                                    flexDirection='row'
                                    flexWrap='nowrap'
                                    width={'100%'}
                                 >
                                    {responsibility || 'Untitled'}
                                    <Box
                                       justifyContent='space-between'
                                       display='flex'
                                       flexDirection='row'
                                       flexWrap='nowrap'
                                       className={classes.fadeIn}
                                    >
                                       <IconButton
                                          size={'small'}
                                          style={{marginRight: 8}}
                                          onClick={handleRoleEdit(index)}
                                       >
                                          <Edit style={{fontSize: 16}} />
                                       </IconButton>
                                       <IconButton size={'small'} onClick={handleDeleteRole(index)}>
                                          <Delete style={{fontSize: 16}} />
                                       </IconButton>
                                    </Box>
                                 </Box>
                              )}
                           </ListItem>
                        ))}
                     <ListItem onClick={handleAddResponsibility} style={{color: '#A3A3A3', cursor: 'pointer'}}>
                        {!isEditing && 'Click to add Role & Responsibility'}
                     </ListItem>
                  </List>
               </Grid>
            </Grid>
            <Grid
               container
               item
               direction={'row'}
               fullWidth
               className={classes.buttonPanelStyle}
               overflow={'visible'}
               resizable={false}
            >
               <ProgressButton
                  isProgress={isSaving}
                  variant='text'
                  color='primary'
                  type={'submit'}
                  size='large'
                  labelKey='save.label'
                  disabled={isSaving || !isChanged}
               />
               <ButtonFHG
                  variant='text'
                  size={'large'}
                  labelKey={'cancel.button'}
                  disabled={isSaving}
                  onClick={() => handleClose()}
               />
            </Grid>
         </Form>
      </Grid>
   );
}
