import React, { useState } from 'react';
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
import useTheme from '@material-ui/core/styles/useTheme';
import {Add} from '@material-ui/icons';
import ChooseFile from './ChooseFile';

const AddModal = ({handleResourcesLabel, removeFieldData, selectedValue, handleRadioChange, removeFields, addFields, inputFields, uploadingResources, uploadingResourcesPercentage, totalFiles, uploadedFiles, handleResources, processing, handleRemove, remove, handleFile, uploading, uploadingPercentage, isSaving,  editValues, LinearProgressWithLabel, addNew, handleSubmit, classes, handleChange, handleEditorChange, handleClose}) => {
      console.log('selectedValue', selectedValue)
      const theme = useTheme();

      const handleClick = async (video, unit_id) => {
            handleRemove(video, unit_id)
      };

      return (
            <>
                  <Dialog
                        open={addNew}
                        onClose={(_, reason) => {
                              if (reason !== "backdropClick") {
                                    handleClose();
                              }
                        }}
                        scroll={'paper'}
                        fullWidth={true}
                        maxWidth={'md'}
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                  >
                        <DialogTitle id="scroll-dialog-title">Add Unit</DialogTitle>
                        <Form onSubmit={handleSubmit} className={classes.formStyle}>
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
                                          <input type='file' required name={'file'} accept='.mp4,.mov' onChange={(e) => handleFile(e)}/>
                                          {uploading ?
                                                <div className={classes.processingRoot}>
                                                      <LinearProgressWithLabel value={uploadingPercentage} />
                                                </div>
                                                : null
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
                                    <div >
                                          <fieldset aria-hidden="true" className={classes.textAreaEditor} ><legend  className={classes.legendColor}><span>Resourse Type&nbsp;*</span></legend>
                                                <RadioGroup className={classes.radioButton} name="Resourse" value={selectedValue} onChange={handleRadioChange}>
                                                      {/* <FormControlLabel value="v" control={<Radio />} label="Video" />
                                                      <FormControlLabel value="i" control={<Radio />} label="Image" /> */}
                                                      <FormControlLabel value="pdf" control={<Radio />} label="Pdf" />
                                                </RadioGroup>
                                                <div style={{textAlign: 'center'}}>
                                                      {/* {selectedValue === 'v' && <h4>Upload Video Files</h4>}
                                                      {selectedValue === 'i' && <h4>Upload Image Files</h4>}
                                                      {selectedValue === 'pdf' && <h4>Upload Pdf Files</h4>} */}
                                                      <div className={classes.resources}>
                                                            <table className={classes.resourcesTable}>
                                                                  {/* {selectedValue === 'v' &&
                                                                        <>
                                                                              <ChooseFile
                                                                                    theme={theme}
                                                                                    accept={'.mp4,.mov'}
                                                                                    LinearProgressWithLabel={LinearProgressWithLabel}
                                                                                    classes={classes}
                                                                                    inputFields={inputFields}
                                                                                    addFields={addFields}
                                                                                    uploadingResources={uploadingResources}
                                                                                    totalFiles={totalFiles}
                                                                                    handleResources={handleResources}
                                                                                    uploadedFiles={uploadedFiles}
                                                                                    selectedValue={selectedValue}
                                                                                    uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                                    removeFields={removeFields}
                                                                                    removeFieldData={removeFieldData}
                                                                                    handleResourcesLabel={handleResourcesLabel}                                                            
                                                                              /> 
                                                                        </>
                                                                  }
                                                                  {selectedValue === 'i' &&
                                                                        <>
                                                                              <ChooseFile
                                                                                    theme={theme}
                                                                                    accept={'image/*'}
                                                                                    LinearProgressWithLabel={LinearProgressWithLabel}
                                                                                    classes={classes}
                                                                                    inputFields={inputFields}
                                                                                    addFields={addFields}
                                                                                    uploadingResources={uploadingResources}
                                                                                    totalFiles={totalFiles}
                                                                                    handleResources={handleResources}
                                                                                    uploadedFiles={uploadedFiles}
                                                                                    selectedValue={selectedValue}
                                                                                    uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                                    removeFields={removeFields}
                                                                                    removeFieldData={removeFieldData}
                                                                                    handleResourcesLabel={handleResourcesLabel}                                                            
                                                                              /> 
                                                                        </>
                                                                  } */}
                                                                  {selectedValue === 'pdf' &&
                                                                  <>
                                                                        <ChooseFile
                                                                              theme={theme}
                                                                              accept={'.pdf'}
                                                                              LinearProgressWithLabel={LinearProgressWithLabel}
                                                                              classes={classes}
                                                                              inputFields={inputFields}
                                                                              addFields={addFields}
                                                                              uploadingResources={uploadingResources}
                                                                              totalFiles={totalFiles}
                                                                              handleResources={handleResources}
                                                                              uploadedFiles={uploadedFiles}
                                                                              selectedValue={selectedValue}
                                                                              uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                              removeFields={removeFields}
                                                                              removeFieldData={removeFieldData}
                                                                              handleResourcesLabel={handleResourcesLabel}                                                            
                                                                        /> 
                                                                  </>
                                                                  }
                                                            </table>
                                                      </div>
                                                      <Button
                                                            variant="contained"
                                                            color="default"
                                                            className={classes.button}
                                                            onClick={addFields}
                                                      >
                                                            <Add />
                                                      </Button>
                                                      {uploadingResources ?
                                                            <div className={classes.processingRoot}>
                                                                  {/* <p>{`${totalFiles === uploadedFiles ? 'Completed' : 'Processing' } ${totalFiles} of ${uploadedFiles}`}</p> */}
                                                                  <p>{`${totalFiles === uploadedFiles ? 'Completed' : 'Processing...' }`}</p>
                                                                  <LinearProgressWithLabel value={uploadingResourcesPercentage} />
                                                            </div>
                                                            : null
                                                      }
                                                </div>
                                                <RadioGroup className={classes.radioButton} name="Resourse" value={selectedValue} onChange={handleRadioChange}>
                                                      {/* <FormControlLabel value="v" control={<Radio />} label="Video" />
                                                      <FormControlLabel value="i" control={<Radio />} label="Image" /> */}
                                                      <FormControlLabel value="pdf" control={<Radio />} label="Pdf" />
                                                </RadioGroup>
                                                <div style={{textAlign: 'center'}}>
                                                      {/* {selectedValue === 'v' && <h4>Upload Video Files</h4>}
                                                      {selectedValue === 'i' && <h4>Upload Image Files</h4>}
                                                      {selectedValue === 'pdf' && <h4>Upload Pdf Files</h4>} */}
                                                      <div className={classes.resources}>
                                                            <table className={classes.resourcesTable}>
                                                                  {/* {selectedValue === 'v' &&
                                                                        <>
                                                                              <ChooseFile
                                                                                    theme={theme}
                                                                                    accept={'.mp4,.mov'}
                                                                                    LinearProgressWithLabel={LinearProgressWithLabel}
                                                                                    classes={classes}
                                                                                    inputFields={inputFields}
                                                                                    addFields={addFields}
                                                                                    uploadingResources={uploadingResources}
                                                                                    totalFiles={totalFiles}
                                                                                    handleResources={handleResources}
                                                                                    uploadedFiles={uploadedFiles}
                                                                                    selectedValue={selectedValue}
                                                                                    uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                                    removeFields={removeFields}
                                                                                    removeFieldData={removeFieldData}
                                                                                    handleResourcesLabel={handleResourcesLabel}                                                            
                                                                              /> 
                                                                        </>
                                                                  }
                                                                  {selectedValue === 'i' &&
                                                                        <>
                                                                              <ChooseFile
                                                                                    theme={theme}
                                                                                    accept={'image/*'}
                                                                                    LinearProgressWithLabel={LinearProgressWithLabel}
                                                                                    classes={classes}
                                                                                    inputFields={inputFields}
                                                                                    addFields={addFields}
                                                                                    uploadingResources={uploadingResources}
                                                                                    totalFiles={totalFiles}
                                                                                    handleResources={handleResources}
                                                                                    uploadedFiles={uploadedFiles}
                                                                                    selectedValue={selectedValue}
                                                                                    uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                                    removeFields={removeFields}
                                                                                    removeFieldData={removeFieldData}
                                                                                    handleResourcesLabel={handleResourcesLabel}                                                            
                                                                              /> 
                                                                        </>
                                                                  } */}
                                                                  {selectedValue === 'pdf' &&
                                                                  <>
                                                                        <ChooseFile
                                                                              theme={theme}
                                                                              accept={'.pdf'}
                                                                              LinearProgressWithLabel={LinearProgressWithLabel}
                                                                              classes={classes}
                                                                              inputFields={inputFields}
                                                                              addFields={addFields}
                                                                              uploadingResources={uploadingResources}
                                                                              totalFiles={totalFiles}
                                                                              handleResources={handleResources}
                                                                              uploadedFiles={uploadedFiles}
                                                                              selectedValue={selectedValue}
                                                                              uploadingResourcesPercentage={uploadingResourcesPercentage}
                                                                              removeFields={removeFields}
                                                                              removeFieldData={removeFieldData}
                                                                              handleResourcesLabel={handleResourcesLabel}                                                            
                                                                        /> 
                                                                  </>
                                                                  }
                                                            </table>
                                                      </div>
                                                      <Button
                                                            variant="contained"
                                                            color="default"
                                                            className={classes.button}
                                                            onClick={addFields}
                                                      >
                                                            <Add />
                                                      </Button>
                                                      {uploadingResources ?
                                                            <div className={classes.processingRoot}>
                                                                  {/* <p>{`${totalFiles === uploadedFiles ? 'Completed' : 'Processing' } ${totalFiles} of ${uploadedFiles}`}</p> */}
                                                                  <p>{`${totalFiles === uploadedFiles ? 'Completed' : 'Processing...' }`}</p>
                                                                  <LinearProgressWithLabel value={uploadingResourcesPercentage} />
                                                            </div>
                                                            : null
                                                      }
                                                </div>
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
                                                      disabled={isSaving || uploadingPercentage !== 100 ||  uploadingResourcesPercentage !== 100}
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

export default AddModal;