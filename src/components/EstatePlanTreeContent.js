import LinkMUI from '@material-ui/core/Link';
import useTheme from '@material-ui/core/styles/useTheme';
import {Delete} from '@material-ui/icons';
import * as PropTypes from 'prop-types';
import React from 'react';
import {useParams} from 'react-router-dom';
import {getFileCacheQueries} from '../data/QueriesGL';
import {FILE_DELETE} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import Grid from '../fhg/components/Grid';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {convertImageToWrapper} from '../fhg/utils/Utils';
import {HUSBAND_TAG, WIFE_TAG} from './AdminDrawer';

EstatePlanTreeContent.propTypes = {
   classes: PropTypes.any,
   estatePlan: PropTypes.any,
};

export default function EstatePlanTreeContent({file, classes}) {
   const {clientId} = useParams();
   const theme = useTheme();

   const [fileDelete] = useMutationFHG(FILE_DELETE);

   const handleDeleteEstatePlan = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      if (file.id) {
         await fileDelete({
            variables: {id: file.id},
            optimisticResponse: {fileUpload_Delete: 1},
            update: cacheDelete(getFileCacheQueries(clientId, undefined, [HUSBAND_TAG, WIFE_TAG]), file.id),
         });
      }
   };

   return <Grid container direction={'row'} justify={'space-between'} className={classes.fadeArea} wrap={'nowrap'}>
      <Grid item>
         <LinkMUI href={convertImageToWrapper(file)} rel='noreferrer' target='_blank'>
            <TypographyFHG variant={'subtitle1'} color={'textPrimary'}>
               {file?.fileData?.fileFilename}
            </TypographyFHG>
         </LinkMUI>
      </Grid>
      <Grid item resizable={false}>
         <ConfirmIconButton
            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
            onConfirm={handleDeleteEstatePlan}
            values={{type: 'estatePlan', name: file?.fileData?.fileFilename}}
            messageKey={'confirmRemoveValue.message'}
            buttonLabelKey={'delete.button'}
            size={'small'}
            submitStyle={classes.deleteColorStyle}
            style={{float: 'right'}}
            buttonTypographyProps={{
               color: theme.palette.error.dark,
               style: {textDecoration: 'underline'}
            }}
         >
            <Delete fontSize={'small'}/>
         </ConfirmIconButton>
      </Grid>
   </Grid>;
}
