import React, { useState } from 'react';
import Grid from '../../components/Grid';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmIconButton from '../../components/ConfirmIconButton';
import {Add} from '@material-ui/icons';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextFieldLF from '../../../components/TextFieldLF';
import AddIcon from "@material-ui/icons/Add";

function ChooseFile({handleUrl, handleRadioChange, handleResourcesLabel, removeFieldData, LinearProgressWithLabel, classes, theme, inputFields, accept, addFields, uploadingResources, totalFiles, handleResources, uploadedFiles, uploadingResourcesPercentage, removeFields}) {
      return (
            <>
                  {inputFields.map((input, index) => {
                        return (  
                        <div className={classes.resourcesdiv}>
                              <RadioGroup className={classes.radioButton} name="Resourse" value={input.selectedValue} onChange={(e) => handleRadioChange(e, index)}>
                                    <FormControlLabel value="pdf" control={<Radio />} label="Pdf" />
                                    <FormControlLabel value="xlsx" control={<Radio />} label="xlsx" />
                                    <FormControlLabel value="url" control={<Radio />} label="url" />
                              </RadioGroup>
                              <div style={{textAlign: 'center'}}>
                                <div className={classes.resources}>
                                    <table className={classes.resourcesTable}>
                                          <tr>
                                                <td className={classes.labelTd}>
                                                      {/* <input 
                                                            required 
                                                            id='resources' 
                                                            type='text' 
                                                            placeholder='Enter Label'
                                                            value={input?.label}
                                                            onChange={(e) => handleResourcesLabel(index, e)} 
                                                            accept={accept}
                                                      /> */}
                                                      <TextFieldLF
                                                            key={'label'}
                                                            name={'label'}
                                                            // autoFocus
                                                            labelTemplate={'lms.{name}.label'}
                                                            value={input?.label}
                                                            onChange={(e) => handleResourcesLabel(index, e)} 
                                                            required
                                                      />
                                                </td>
                                                <td className={classes.fileTd}>
                                                      {input?.type !== '' && input?.original_filename !== '' ? 
                                                            <>
                                                                  <span>{input?.original_filename}</span>
                                                            </>
                                                            :
                                                            <>
                                                                  {input.selectedValue === 'pdf' &&
                                                                        <Button variant="contained" component="label" color="primary">
                                                                              <AddIcon /> Upload a file
                                                                              <input type="file" hidden accept='.pdf' required onChange={(e) => handleResources(index, e, input.selectedValue)}/>
                                                                        </Button>
                                                                  }
                                                                  {input.selectedValue === 'xlsx' &&
                                                                        <Button variant="contained" component="label" color="primary">
                                                                              <AddIcon /> Upload a file
                                                                              <input type="file" hidden accept='.xlsx,.xls' required onChange={(e) => handleResources(index, e, input.selectedValue)}/>
                                                                        </Button>
                                                                  }
                                                                  {input.selectedValue === 'url' &&
                                                                        <>
                                                                              {/* <input 
                                                                                    required 
                                                                                    id='resources' 
                                                                                    type='text' 
                                                                                    placeholder='Enter Url'
                                                                                    value={input?.path_url}
                                                                                    onChange={(e) => handleUrl(index, e, input.selectedValue)} 
                                                                              /> */}
                                                                              <TextFieldLF
                                                                                    key={'url'}
                                                                                    name={'url'}
                                                                                    type="url"
                                                                                    // autoFocus
                                                                                    labelTemplate={'lms.{name}.label'}
                                                                                    value={input?.path_url}
                                                                                    onChange={(e) => handleUrl(index, e, input.selectedValue)} 
                                                                                    required
                                                                              />
                                                                        </>
                                                                  }
                                                            </>
                                                      }
                                                </td>
                                                <td>
                                                      {index > 0 ?
                                                            <ConfirmIconButton
                                                                  className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                                  onConfirm={() => removeFields(index)}
                                                                  values={{type: 'unit resource', name: input['label'] !== '' ?  input['label'] : 'this field' }}
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
                                                            :
                                                            input?.label !== '' ?
                                                                  <ConfirmIconButton
                                                                        className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                                        onConfirm={() => removeFieldData(index)}
                                                                        values={{type: 'unit resource', name: input['label'] !== '' ?  input['label'] : 'this field' }}
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
                                                                  :
                                                                  <ConfirmIconButton
                                                                        className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                                        onConfirm={() => removeFields(index)}
                                                                        values={{type: 'unit resource', name: input['label'] !== '' ?  input['label'] : 'field' }}
                                                                        messageKey={'confirmRemoveValue.message'}
                                                                        buttonLabelKey={'delete.button'}
                                                                        size={'small'}
                                                                        disabled
                                                                        submitStyle={classes.deleteColorStyle}
                                                                        buttonTypographyProps={{
                                                                              float: 'right',
                                                                              color: theme.palette.error.dark,
                                                                              style: {textDecoration: 'underline'},
                                                                        }}
                                                                  >
                                                                        <DeleteIcon />
                                                                  </ConfirmIconButton>
                                                      }
                                                </td>
                                          </tr>
                                          {input?.error !== null &&  input?.error !== 'null' &&
                                                <tr>
                                                      <td colSpan='3' className={classes.errorMessage}>{input?.errorMessage}</td>
                                                </tr>
                                          }
                                    </table>
                                    </div>
                                    {input.uploadingResources ?
                                          <div className={classes.processingRoot}>
                                                <p>{`${ input.uploadingResourcesPercentage === 100 ? 'Completed' : 'Processing...' }`}</p>
                                                <LinearProgressWithLabel value={input?.uploadingResourcesPercentage} />
                                          </div>
                                          : null
                                    }
                              </div>
                        </div>
                        )
                  })}
                  
            </>
      );
}

export default ChooseFile;