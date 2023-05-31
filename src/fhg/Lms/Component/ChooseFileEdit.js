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

function ChooseFile({handleRemoveResources, handleUrl, handleRadioChange, handleResourcesLabel, type, length, removeFieldData, LinearProgressWithLabel, saveFile, classes, theme, inputFields, accept, addFields, uploadingResources, totalFiles, handleResources, uploadedFiles, uploadingResourcesPercentage, removeFields}) {
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
                              <div style={{textAlign: 'left'}}>
                                <div className={classes.resources}>
                                    <table className={classes.resourcesTable}>
                                          <tr>
                                                <td className={classes.labelTd} >
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
                                                      {input?.type !== '' && input?.original_filename !== ''  ? 
                                                            <>
                                                                  {input?.type === 'v' &&
                                                                        <video width="100%" height="150" controls>
                                                                              <source src={`https://legacy-farmer-test-temp-public.s3.us-east-2.amazonaws.com/${input.path_url}`} />
                                                                        </video>
                                                                  }
                                                                  {input?.type === 'i' &&
                                                                        <img src={`https://legacy-farmer-test-temp-public.s3.us-east-2.amazonaws.com/${input.path_url}`} height="150" alt={'image'}/>
                                                                  }
                                                                  {input?.type === 'pdf'  &&
                                                                        <span className={classes.pdfCursor} onClick={() => saveFile(input?.path_url, input?.original_filename) }>{input?.original_filename}</span>
                                                                  }
                                                                  {input?.type === 'xlsx' &&
                                                                        <span className={classes.pdfCursor} onClick={() => saveFile(input?.path_url, input?.original_filename) }>{input?.original_filename}</span>
                                                                  }
                                                                  {input?.type === 'url' &&
                                                                        <TextFieldLF
                                                                              key={'url'}
                                                                              name={'url'}
                                                                              // autoFocus
                                                                              labelTemplate={'lms.{name}.label'}
                                                                              value={input?.path_url}
                                                                              onChange={(e) => handleUrl(index, e, input.selectedValue)} 
                                                                              required
                                                                        />
                                                                  }
                                                            </>
                                                            :
                                                            <>
                                                                  {input.selectedValue === 'pdf' &&
                                                                        <Button variant="contained" component="label" color="primary">
                                                                              {" "}
                                                                              <AddIcon /> Upload a file
                                                                              <input type="file" hidden accept='.pdf' required onChange={(e) => handleResources(index, e, input.selectedValue)}/>
                                                                        </Button>
                                                                  }
                                                                  {input.selectedValue === 'xlsx' &&
                                                                        <Button variant="contained" component="label" color="primary">
                                                                              {" "}
                                                                              <AddIcon /> Upload a file
                                                                              <input type="file" hidden required accept='.xlsx,.xls' onChange={(e) => handleResources(index, e, input.selectedValue)}/>
                                                                        </Button>
                                                                  }
                                                                  {input.selectedValue === 'url' &&
                                                                        <TextFieldLF
                                                                              key={'url'}
                                                                              name={'url'}
                                                                              autoFocus
                                                                              type="url"
                                                                              labelTemplate={'lms.{name}.label'}
                                                                              value={input?.path_url}
                                                                              onChange={(e) => handleUrl(index, e, input.selectedValue)} 
                                                                              required
                                                                        />
                                                                  }
                                                            </>
                                                      }
                                                </td>
                                                <td>
                                                  {length > 0  && input?.type !== '' && input?.original_filename !== '' && input?.db === true ? 
                                                      <ConfirmIconButton
                                                            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                            onConfirm={() => handleRemoveResources(input, index)}
                                                            values={{type: 'unit resource', name: index.original_filename !== '' ?  index.original_filename : 'this field' }}
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
                                                      input?.type === 'url' ?
                                                            <ConfirmIconButton
                                                                  className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                                  onConfirm={() => input?.db === false ? removeFields(index) : handleRemoveResources(input, index)}
                                                                  values={{type: 'unit resource', name: input?.db === true && index.path_url !== '' ?  index.path_url : 'this field' }}
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
                                                            length > 0 || index > 0 ?
                                                                  <ConfirmIconButton
                                                                        className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                                        onConfirm={() => removeFields(index)}
                                                                        values={{type: 'unit resource', name: input['original_filename'] !== '' ?  input['original_filename'] : 'this field' }}
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
                                                                              values={{type: 'unit resource', name: input['original_filename'] !== '' ?  input['original_filename'] : 'this field' }}
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
                                                                              values={{type: 'unit resource', name: input['original_filename'] !== '' ?  input['original_filename'] : 'field' }}
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