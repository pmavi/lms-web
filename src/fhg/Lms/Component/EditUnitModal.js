import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Form from '../../components/edit/Form';
import Grid from '../../components/Grid';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import TextAreaField from '../../../components/TextAreaField';
import TextFieldLF from '../../../components/TextFieldLF';
import clsx from 'clsx';
import ProgressButton from '../../components/ProgressButton';
import ButtonFHG from '../../components/ButtonFHG';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import {Storage} from 'aws-amplify';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import ConfirmIconButton from '../../components/ConfirmIconButton';
import {Delete} from '@material-ui/icons';
import useTheme from '@material-ui/core/styles/useTheme';
import useQueryFHG from '../../hooks/data/useQueryFHG';
import { RESOURCES_QUERY_WHERE } from '../../../data/QueriesGL';
import ChooseFileEdit from './ChooseFileEdit';
import {Add} from '@material-ui/icons';
import { saveAs } from "file-saver";
import { sortBy, defer } from 'lodash';

const EditModal = ({
      setInputFields,  handleUrl, labels, setLabels,handleRadioChange, 
      selectedValue, handleResourcesLabel, removeFieldData, setResourcesLength, resourcesLength,
      handleRemoveResources, removeFields, addFields, inputFields,handleEditSubmit, 
      uploadingResources, uploadingResourcesPercentage, totalFiles, uploadedFiles, 
      handleResources, processing, handleRemove, remove, handleFile, uploading, 
      uploadingPercentage, isSaving,  editValues, LinearProgressWithLabel, handleSubmit, 
      classes, edit, handleChange, handleEditorChange, handleClose
}) => {
      // const [resourcesData] = useQueryFHG(RESOURCES_QUERY_WHERE, {variables: {unit_id: editValues.id, isDeleted: false}}, 'resources.type');
      // console.log('resourcesData :::::::::::', resourcesData)

      // if(resourcesData && labels[0]?.label === ''){
      //       setResourcesLength(resourcesData?.resources?.length)
      //       let arr = []
      //       if (resourcesData?.resources?.length > 0) {
      //             const data = sortBy(resourcesData?.resources, 'label');
      //             data.map(itm => {
      //                   const {id, unit_id, label, type, path_url, original_filename} = itm
      //                   arr.push({ id, unit_id, label, type, path_url, original_filename, selectedValue: type, uploadingResources: false, uploadingResourcesPercentage: 0 })
      //             })
      //             // data.map(itm => {
      //             //       const {id, unit_id, label, type, path_url, originalFilename} = itm
      //             //       arr.push({ id, unit_id, label, type, path_url, originalFilename })
      //             // })
      //             setLabels(arr)
      //             setInputFields(arr)
      //       }
           
      // }
      
      // console.log('labels :::::::::::', labels)
      // const [selectedValue, setSelectedValue] = useState('v');
      const theme = useTheme();

      const handleClick = async (video, unit_id) => {
            handleRemove(video, unit_id)
      };

      // const handleRadioChange = (event) => {
      //       setSelectedValue(event.target.value);
      // };

      const saveFile = (url, filename) => {
            saveAs( `https://legacy-farmer-test-temp-public.s3.us-east-2.amazonaws.com/${url}`, filename );
      };

      return (
            <>
                  <Dialog open={edit} onClose={(_, reason) => { if (reason !== "backdropClick") { handleClose(); } }} scroll={'paper'} fullWidth={true} maxWidth={'md'} aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" >
                        <DialogTitle id="scroll-dialog-title">Edit Unit</DialogTitle>
                        <Form onSubmit={handleEditSubmit} className={classes.formStyle}>
                              <DialogContent dividers={true}>
                                    <DialogContentText id="scroll-dialog-description" tabIndex={-1} className={classes.dialogBody} >
                                    <TextFieldLF
                                          key={'name'}
                                          name={'name'}
                                          autoFocus
                                          labelTemplate={'lms.{name}.label'}
                                          onChange={(e) => handleChange(e)}
                                          value={editValues.name}
                                          required
                                    />
                                    <fieldset aria-hidden="true" className={clsx(classes.textAreaEditor, classes.maxWidthEditor)} >
                                          <legend className={classes.legendColor}><span>Description&nbsp;*</span></legend>
                                          <input required type='text' className={classes.textFieldHidden} value={editValues.description} />
                                          <CKEditor
                                          editor={ ClassicEditor }
                                                data={editValues.description}
                                                className={classes.ckEditorEdit}
                                                onChange={ ( event, editor ) => {
                                                      const data = editor.getData();
                                                      // console.log( { event, editor, data } );
                                                      handleEditorChange(data)
                                                } }
                                          />
                                    </fieldset>
                                    <fieldset aria-hidden="true" className={classes.textAreaEditor} ><legend  className={classes.legendColor}><span>Intro Video&nbsp;*</span></legend>
                                          {!remove && editValues.introVideo ?
                                                <>
                                                      <video width="100%" height="400" controls>
                                                            <source src={`https://legacy-farmer-test-temp-public.s3.us-east-2.amazonaws.com/lms/upload/${JSON.parse(editValues.introVideo).originalFilename}`} />
                                                      </video>
                                                      <ConfirmIconButton
                                                            className={`${classes.fadeIn} ${classes.deleteButtonStyle} ${classes.floatRight}`}
                                                            onConfirm={() => handleClick(JSON.parse(editValues.introVideo), editValues.id)}
                                                            values={{type: 'unit', name: 'intro video'}}
                                                            messageKey={'confirmRemoveValue.message'}
                                                            buttonLabelKey={'delete.button'}
                                                            size={'small'}
                                                            submitStyle={classes.deleteColorStyle}
                                                            buttonTypographyProps={{
                                                                  float: 'right',
                                                                  color: theme.palette.error.dark,
                                                                  style: {textDecoration: 'underline'},
                                                            }}

                                                      >
                                                            <DeleteIcon />
                                                      </ConfirmIconButton>
                                                </>
                                                :
                                                null
                                          }
                                          {remove || !editValues.introVideo?
                                                <>
                                                      <input type='file' required name={'file'} accept='.mp4,.mov' onChange={(e) => handleFile(e)}/>
                                                      {uploading ?
                                                            <div className={classes.processingRoot}>
                                                                  <LinearProgressWithLabel value={uploadingPercentage} />
                                                            </div>
                                                            : null
                                                      }
                                                </>
                                                :
                                                null
                                          }
                                    </fieldset>
                                    <TextAreaField
                                          key={'transcript'}
                                          name={'transcript'}
                                          labelTemplate={'lms.{name}.label'}
                                          onChange={(e) => handleChange(e)}
                                          value={editValues.transcript}
                                          required
                                          rows={5}
                                    />
                                    
                                    <div>
                                          <fieldset aria-hidden="true" className={classes.textAreaEditor} ><legend  className={classes.legendColor}><span>Resourse Type&nbsp;*</span></legend>
                                                <>
                                                <ChooseFileEdit
                                                      theme={theme}
                                                      LinearProgressWithLabel={LinearProgressWithLabel}
                                                      classes={classes}
                                                      inputFields={inputFields}
                                                      handleRadioChange={handleRadioChange}
                                                      addFields={addFields}
                                                      uploadingResources={uploadingResources}
                                                      totalFiles={totalFiles}
                                                      handleResources={handleResources}
                                                      uploadedFiles={uploadedFiles}
                                                      uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                      removeFields={removeFields}
                                                      removeFieldData={removeFieldData}
                                                      handleUrl={handleUrl}
                                                      saveFile={saveFile}
                                                      length={resourcesLength}
                                                      handleResourcesLabel={handleResourcesLabel}                                                            
                                                      handleRemoveResources={handleRemoveResources}                                                            
                                                /> 
                                                <Button
                                                      variant="contained"
                                                      color="default"
                                                      className={classes.button}
                                                      onClick={addFields}
                                                >
                                                      <Add />
                                                </Button>
                                                </>
                                                     
                                          </fieldset>
                                    </div>
                                    </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                    <Grid container item direction={'row'} fullWidth className={classes.buttonPanelStyle} justify={'space-between'} overflow={'visible'} resizable={false} alignItems={'center'} >
                                          <Grid item>
                                                <ProgressButton
                                                      isProgress={isSaving}
                                                      variant='text'
                                                      color='primary'
                                                      type={'submit'}
                                                      size='large'
                                                      labelKey='save.label'
                                                      disabled={isSaving || ( uploading && uploadingPercentage !== 100 ) ||  (uploadingResources && uploadingResourcesPercentage !== 100) || (resourcesLength === 0 && inputFields.length === 0)}
                                                />
                                                <ButtonFHG
                                                      variant='text'
                                                      size={'large'}
                                                      labelKey={'cancel.button'}
                                                      disabled={isSaving || remove}
                                                      onClick={handleClose}
                                                />
                                          </Grid>
                                    </Grid>
                              </DialogActions>
                        </Form>
                  </Dialog> 
            </>
      );
};

export default EditModal;