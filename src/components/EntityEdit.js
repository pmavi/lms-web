import makeStyles from '@material-ui/core/styles/makeStyles';
import {defer} from 'lodash';
import React, {useState, useCallback} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {ENTITY_BY_ID_QUERY} from '../data/QueriesGL';
import {getEntityCacheQueries} from '../data/QueriesGL';
import {ENTITY_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import Form from '../fhg/components/edit/Form';
import Prompt from '../fhg/components/edit/Prompt';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import ProgressButton from '../fhg/components/ProgressButton';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../fhg/hooks/useKeyDown';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import TextFieldLF from './TextFieldLF';

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
   }),
   {name: 'EntityEditStyles'}
);

export default function EntityEdit() {
   const classes = useStyles();
   const {clientId} = useParams();
   const history = useHistory();
   const location = useLocation();
   const entityId = location?.state?.id;
   const isNew = !entityId;
   const parentEntityId = !entityId && location?.state?.parentEntityId;
   const isActive = !entityId && location?.state?.isActive;

   const editItem = {
      id: uuid(),
      name: '',
      ein: '',
      isActive,
      clientId,
      entityId: parentEntityId,
      isDeleted: false,
   };
   const [isSaving, setIsSaving] = useState(false);

   const [
      editValues,
      handleChange,
      {setEditValues, isChanged = false, setIsChanged, defaultValues, setDefaultValues, resetValues},
   ] = useEditData(isNew ? editItem : undefined, isNew ? ['isActive', 'entityId', 'clientId'] : undefined);

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type'
   );
   const [entityCreateUpdate] = useMutationFHG(ENTITY_CREATE_UPDATE);

   useEffect(() => {
      if (entityData?.entity) {
         setDefaultValues(entityData?.entity);
      }
   }, [entityData, setDefaultValues]);

   const handleClose = useCallback(() => {
      resetValues();
      defer(() => {
         location.state = {edit: undefined, id: undefined, selectEntityId: parentEntityId, isActive};
         history.replace(location);
      });
   }, [resetValues, history, isActive, location, parentEntityId]);

   useKeyDown(handleClose);

   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            let variables = {...editValues};
            setIsSaving(true);
            await entityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  entity: {
                     __typename: 'Entity',
                     ...defaultValues,
                     ...variables,
                     clientId,
                     entityId: parentEntityId || '',
                     isDeleted: false,
                  },
               },
               update: isNew
                  ? cacheUpdate(getEntityCacheQueries(clientId, isActive), editValues.id, 'entity')
                  : undefined,
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
         // handleClose();
      }
   }, [
      isChanged,
      editValues,
      entityCreateUpdate,
      defaultValues,
      clientId,
      parentEntityId,
      isNew,
      isActive,
      location,
      history,
      setIsChanged,
      setEditValues,
      setDefaultValues,
      handleClose,
   ]);

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
            id={'entity.title.label'}
            color={'textSecondary'}
            gutterBottom
            className={classes.titleStyle}
         />
         <Form onSubmit={handleSubmit} className={classes.formStyle}>
            <Prompt when={isChanged} />
            <Grid name={'Entity Edit Root'} container item fullWidth className={classes.infoRootStyle}>
               <Grid name={'Entity Edit Root'} container item fullWidth className={classes.infoInnerStyle}>
                  <TextFieldLF
                     key={'name' + defaultValues.id}
                     name={'name'}
                     autoFocus
                     required
                     labelKey='entity.name.label'
                     defaultValue={defaultValues.name}
                     value={editValues.name}
                     onChange={handleChange}
                  />
                  <TextFieldLF
                     key={'description' + defaultValues.id}
                     name={'description'}
                     labelKey='entity.description.label'
                     defaultValue={defaultValues.description}
                     value={editValues.description}
                     onChange={handleChange}
                     multiline
                     maxRows={4}
                     minRows={2}
                  />
                  <TextFieldLF
                     key={'ein' + defaultValues.id}
                     name={'ein'}
                     labelKey={'entity.ein.label'}
                     defaultValue={defaultValues.ein}
                     value={editValues.ein}
                     onChange={handleChange}
                  />
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
               <Grid item>
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
            </Grid>
         </Form>
      </Grid>
   );
}
