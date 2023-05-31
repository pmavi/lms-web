import {Menu, MenuItem} from '@material-ui/core';
import {Breadcrumbs} from '@material-ui/core';
import {Link} from '@material-ui/core';
import {Snackbar} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import {lighten} from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Typography from '@material-ui/core/Typography';
import {CloudDownload} from '@material-ui/icons';
import {FileCopy} from '@material-ui/icons';
import {CreateNewFolder} from '@material-ui/icons';
import {Edit} from '@material-ui/icons';
import {Delete} from '@material-ui/icons';
import {CloudUpload} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import {Storage} from 'aws-amplify';
import 'file-icon-vectors/dist/file-icon-square-o.min.css';
import {forOwn} from 'lodash';
import {keys} from 'lodash';
import {isEqual} from 'lodash';
import {clone} from 'lodash';
import {map} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import sortBy from 'lodash/sortBy';
import uniqueId from 'lodash/uniqueId';
import values from 'lodash/values';
import moment from 'moment';
import {useRef} from 'react';
import React, {useState, useCallback, useMemo, Fragment} from 'react';
import {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';
import {useParams} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useSetRecoilState} from 'recoil';
import {DIRECTORY_FILE_NAME} from '../Constants';
import {PRIMARY_COLOR} from '../Constants';
import {DATE_MEDIUM_FORMAT} from '../Constants';
import {FOLDER_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ConfirmButton from '../fhg/components/ConfirmButton';
import ConfirmMenuItem from '../fhg/components/ConfirmMenuItem';
import ModalDialog from '../fhg/components/dialog/ModalDialog';
import Grid from '../fhg/components/Grid';
import ModalButton from '../fhg/components/ModalButton';
import ProgressIndicator from '../fhg/components/ProgressIndicator';
import {dragCellResults} from '../fhg/components/table/DragCell';
import TableDragAndDropFHG from '../fhg/components/table/TableDragAndDropFHG';
import TypographyWithHover from '../fhg/components/table/TypographyWithHover';
import TypographyFHG from '../fhg/components/Typography';
import {titleStatus} from '../fhg/components/WebAppBar';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import useKeyDownLX from '../fhg/hooks/useKeyDownLX';
import usePageTitle from '../fhg/hooks/usePageTitle';
import useProgress from '../fhg/hooks/useProgress';
import {progressGlobal} from '../fhg/hooks/useProgress';
import {escapeRegExp} from '../fhg/utils/Utils';
import {getExtensionIcon} from '../fhg/utils/Utils';
import {humanFileSize, getExtension} from '../fhg/utils/Utils';
import {downloadBlob} from '../fhg/utils/Utils';
import {userRoleState} from '../pages/Main';
import TextFieldLF from './TextFieldLF';
import get from 'lodash/get';

export const FILE_TYPE = 'file';
export const FOLDER_TYPE = 'folder';
const TOP_LEVEL_NAME = 'My Files';

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
      root: {
         maxWidth: `${theme.breakpoints.values.sm}px !important`,
         minWidth: 300,
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      dividerStyle: {
         marginBottom: theme.spacing(2),
         width: '100%',
      },
      rowStyle: {
         '& tr:nth-of-type(odd):not(.Mui-selected)': {
            backgroundColor: '#fafafa',
         },
         '& tr:nth-of-type(even):not(.Mui-selected)': {
            backgroundColor: 'white',
         },
      },
      rowStyleDrop: {
         backgroundColor: '#EDEDED',
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.7),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.8),
         },
      },
      deleteButtonStyle: {
         color: PRIMARY_COLOR,
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      menuItemStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      linkStyle: {
         cursor: 'pointer',
      },
      dropStyle: {
         position: 'relative',
         height: 'calc(100% - 80px)',
         '&:hover:before': {
            content: '""',
            border: `2px solid ${PRIMARY_COLOR}`,
            paddingLeft: 'calc(50% - 64px)',
            paddingTop: '8%',
            marginRight: '5%',
            width: 'calc(100% - 16px)',
            height: '100%',
            transition: '1s',
            display: 'block',
            verticalAlign: 'middle',
            position: 'fixed',
            zIndex: 5,
         },
      },
      normalStyle: {
         height: 'calc(100% - 80px)',
      },
      tableStyle: {
         backgroundColor: 'green',
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 18,
         userSelect: 'none',
         cursor: 'pointer',
      },
      cellStyleDragging: {
         backgroundColor: '#EDEDED',
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 18,
      },
   }),
   {name: 'EntityFilesStyles'}
);

const initialState = {
   mouseX: null,
   mouseY: null,
};

// https://stackoverflow.com/questions/44759750/how-can-i-create-a-nested-object-representation-of-a-folder-structure
function add(source, target, item, isFile) {
   const elements = source.split('/');
   const element = elements.shift();
   if (!element) return; // blank

   target[element] = target[element] || {
      __data: {...item, name: element, type: isFile ? FILE_TYPE : FOLDER_TYPE},
   }; // element;

   if (elements.length) {
      target[element] = typeof target[element] === 'object' ? target[element] : {};
      add(elements.join('/'), target[element], item, elements?.length === 1);
   }
}

export default function EntityFiles() {
   const classes = useStyles();
   const theme = useTheme();
   const {clientId} = useParams();

   const itemMove = useRecoilValue(dragCellResults);
   const {isAdmin} = useRecoilValue(userRoleState);

   const [isUploading, setIsUploading] = useState(false);

   const [existingFiles, setExistingFiles] = useState([]);
   const [currentPath, setCurrentPath] = useState(`${clientId}/`);
   const [selected, setSelected] = useState();
   const [fileSystem, setFileSystem] = useState({});
   const levels = currentPath.substring(0, currentPath.length - 1).split('/');
   const [state, setState] = useState(initialState);
   const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
   const [error, setError] = useState();
   const [renameValue, setRenameValue] = useState();
   const [refreshTime, setRefreshTime] = useState(Date.now());

   const theUniqueId = useRef(uniqueId()).current;
   const setProgressGlobal = useSetRecoilState(progressGlobal);
   setProgressGlobal(false);
   const [, /*Unused*/ setProgress] = useProgress(theUniqueId);

   const pathConverted = currentPath?.replaceAll('/', '.');

   const currentDirectory = get(fileSystem, pathConverted?.substring(0, pathConverted?.length - 1));
   const selectedItem = currentDirectory?.[selected?.name];

   const [folderData] = useQueryFHG(FOLDER_QUERY, undefined, 'folder.type');

   const isTemplateFolder = useCallback(
      (folder, level) => {
         if (folder?.type === FOLDER_TYPE) {
            return isTemplateFolderName(folder?.name, level);
         }
         return false;
      },
      [isAdmin, folderData]
   );

   const isTemplateFolderName = useCallback(
      (name, level) => {
         return !isAdmin && level === 1 && !!find(folderData?.folders, {name});
      },
      [isAdmin, folderData]
   );

   useEffect(() => {
      if (folderData?.folders?.length > 0) {
         forOwn(fileSystem[clientId], (file, name) => {
            if (file?.__data?.type === FOLDER_TYPE && name !== DIRECTORY_FILE_NAME && name !== '__data') {
               file.__data.isTemplatefolder = isTemplateFolder(file.__data, 1);
            }
         });
      }
   }, [folderData, fileSystem, clientId, isTemplateFolder]);

   useEffect(() => {
      setProgressGlobal(false);
      return () => {
         setProgressGlobal(true);
      };
      // eslint-disable-next-line
   }, []);

   // noinspection JSUnusedGlobalSymbols
   useKeyDownLX(!isRenameDialogOpen, {
      // noinspection JSUnusedGlobalSymbols
      ArrowUp: ({ctrlKey, metaKey}) => {
         if (ctrlKey || metaKey) {
            handleMoveUp();
         } else {
            let selectedIndex;

            if (existingFiles?.length > 0 && selected) {
               selectedIndex = findIndex(existingFiles, {key: selected?.key});

               if (selectedIndex > 0) {
                  selectedIndex -= 1;
               }
            } else {
               selectedIndex = 0;
            }
            setSelected(existingFiles[selectedIndex]);
         }
      },
      // noinspection JSUnusedGlobalSymbols
      ArrowDown: ({ctrlKey, metaKey}) => {
         if (ctrlKey || metaKey) {
            handleOpenFolder();
         } else {
            let selectedIndex;

            if (existingFiles?.length > 0 && selected) {
               selectedIndex = findIndex(existingFiles, {key: selected?.key});

               if (selectedIndex >= 0 && selectedIndex < existingFiles?.length - 1) {
                  selectedIndex += 1;
               }
            } else {
               selectedIndex = 0;
            }
            setSelected(existingFiles[selectedIndex]);
         }
      },
      Enter: () => {
         if (!isRenameDialogOpen) {
            if (selected?.name === DIRECTORY_FILE_NAME) {
               handleMoveUp();
            } else if (selected?.type === FOLDER_TYPE) {
               handleOpenFolder();
            }
         }
      },
   });

   function getFromPath(item, path, defaultValue) {
      function getFolder(item, path) {
         const paths = path.split('/');

         let index = 0,
            test = item,
            length = paths[paths.length - 1] ? paths.length : paths.length - 1;

         while (item != null && index < length) {
            test = test[paths[index++]];
         }
         return index && index === length ? test : undefined;
      }

      const result = item == null ? undefined : getFolder(item, path);
      return result === undefined ? defaultValue : result;
   }

   function processStorageList(path, fileSystem) {
      const newFolder = getFromPath(fileSystem, path);
      let files = values(newFolder);
      files = filter(files, (file) => file.hasOwnProperty('__data'));
      files = map(files, (file) => file.__data);
      files = sortBy(files, 'name');

      setCurrentPath(path);
      setExistingFiles(files);
      return newFolder;
   }

   const setTitleStatus = useSetRecoilState(titleStatus);
   usePageTitle({titleKey: 'files.title.label'});

   /**
    * Open a folder by finding the path of the folder and selecting the folder.
    */
   const handleOpenFolder = () => {
      if (selected?.type === FOLDER_TYPE) {
         const key = selected.key;
         const path = key.substring(0, key.lastIndexOf('/') + 1);
         const newFolder = processStorageList(path, fileSystem);

         setSelected(newFolder['...'].__data);
      }
   };

   /**
    * Move up to the parent directory. Find the path of the new folder and select it.
    */
   const handleMoveUp = () => {
      const index = levels.length - 2;

      if (index >= 0) {
         const levels = currentPath.split('/');
         const path = levels.slice(0, index + 1).join('/') + '/';
         const newFolder = processStorageList(path, fileSystem);
         setSelected(newFolder[levels[levels.length - 2]]?.__data);
      }
   };

   useEffect(() => {
      setTitleStatus((status) => ({
         ...status,
         showSelect: false,
      }));
   }, [setTitleStatus]);

   /**
    * Create the new fileSystem object from the files in AWS storage.
    * fileSystem: {
    *   [folder]: {
    *     [childFolder]: {
    *        [file]: {
    *          __data: {
    *            // File information
    *          }
    *        }
    *       __data: {
    *         //Folder information
    *       }
    *     }
    *   },
    *   __data: {
    *     // Folder information
    *   }
    * }
    */
   useEffect(() => {
      async function fetchStorageList(path) {
         const filesystem = {};
         try {
            const results = await Storage.list(path, {
               // bucket: FILE_BUCKET,
               level: 'public',
            });

            if (results?.length > 0) {
               results.forEach((item) => add(item.key, filesystem, item));
            } else {
               const key = path.substring(0, path.length - 1);
               filesystem[key] = {
                  __data: {
                     key: undefined,
                     eTag: undefined,
                     lastModified: new Date().toString(),
                     size: 1,
                     name: key,
                     isTemplateFolder: isTemplateFolderName(key, 1),
                     type: FOLDER_TYPE,
                  },
               };
            }
         } catch (e) {
            console.log(e);
         }

         setFileSystem(filesystem);
         processStorageList(path, filesystem);
      }
      fetchStorageList(`${clientId}/`);
   }, [clientId]);

   /**
    * Delete the selected file from AWS storage. Delete the file from the fileSystem's current directory.
    * @returns {Promise<void>}
    */
   const handleDeleteFile = async () => {
      handleClose();
      if (selected) {
         setProgress(true);
         await Storage.remove(selected.key, {level: 'public'});

         delete currentDirectory[selected.name];
         processStorageList(currentPath, fileSystem);
         setSelected(undefined);
         setProgress(false);
      }
   };

   /**
    * Rename the folder. To rename the files and folders are copied to the new name and the old file deleted.
    * @param path
    * @param newPath
    * @returns {Promise<void>}
    */
   const handleRenameFolder = async (path, newPath) => {
      async function rename(file) {
         const key = file.key.replace(path, newPath);
         await Storage.copy({key: file.key, level: 'public'}, {key, level: 'public'});
         await Storage.remove(file.key, {level: 'public'});
         let name = key.substr(key.lastIndexOf('/') + 1) || '';

         return {...file, key, name};
      }

      if (path && newPath) {
         try {
            // Get all files that start with the path, including folder files and sub folder files.
            const results = await Storage.list(path, {
               level: 'public',
            });

            // Delete from the fileSystem object.
            delete currentDirectory[selected.name];

            if (results?.length > 0) {
               for (const file of results) {
                  const newFile = await rename(file);
                  // Add the renamed file into the fileSystem.
                  add(newFile.key, fileSystem, newFile);
               }
            }
            processStorageList(currentPath, fileSystem);
         } catch (e) {
            console.log(e);
         }
      } else {
         console.log('Paths not specified for handleRenameFolder', path, newPath);
      }
   };

   /**
    * Get the directory in the fileSystem at the path.
    * @param path Path of the directory.
    * @returns {{}|*}
    */
   const getDirectoryFromPath = (path) => {
      if (path?.length > 0) {
         const pathNoFileName = path.replace(DIRECTORY_FILE_NAME, '');
         const pathConverted = pathNoFileName.replaceAll('/', '.');
         return get(fileSystem, pathConverted.substring(0, pathConverted.length - 1));
      }
      return {};
   };

   /**
    * Transfer (move or copy) the selected folder to the given folder.
    * @param selected The selected folder
    * @param folder The folder to transfer the selected folder to.
    * @param isCopy Indicates if the transfer is a copy (false is a move).
    * @returns {Promise<void>}
    */
   const transferFolder = async (selected, folder, isCopy) => {
      /**
       * Transfer the file to the new path.
       * @param file The file to transfer
       * @param path The path of the file.
       * @param newPath The new path of the file.
       * @returns {Promise<*&{name: (string|string), key: *}>} The file with the new key and new name.
       */
      async function transfer(file, path, newPath) {
         const key = file.key.replace(path, newPath);
         await Storage.copy({key: file.key, level: 'public'}, {key, level: 'public'});
         if (!isCopy) {
            await Storage.remove(file.key, {level: 'public'});
         }
         let name = key.substr(key.lastIndexOf('/') + 1) || '';

         return {...file, key, name};
      }

      let newFolderKey;
      // Don't let item be dropped on itself.
      if (selected.key !== folder.key) {
         // Was the folder dropped on the folder file to move it up to the parent?
         if (folder.name === DIRECTORY_FILE_NAME) {
            // Index right before the current directory name.
            const indexOfPath = folder.key.lastIndexOf('/', folder.key.length - DIRECTORY_FILE_NAME.length - 2);
            // Path of the parent directory.
            newFolderKey = folder.key.substring(0, indexOfPath + 1);
         } else {
            newFolderKey = folder.key.replace(DIRECTORY_FILE_NAME, '');
         }

         const newDirectory = getDirectoryFromPath(newFolderKey);
         const newName = isNameUnique(selected.name, newDirectory)
            ? selected.name
            : createUniqueName(selected.name, newDirectory);
         const newKey = newFolderKey + newName + '/';

         if (selected && folder) {
            try {
               const path = selected.key.replace(DIRECTORY_FILE_NAME, '');
               const results = await Storage.list(path, {
                  level: 'public',
               });

               if (!isCopy) {
                  delete currentDirectory[selected.name];
               }

               if (results?.length > 0) {
                  for (const file of results) {
                     const newFile = await transfer(file, path, newKey);
                     add(newFile.key, fileSystem, newFile, folderData?.folders);
                  }
               }
               processStorageList(currentPath, fileSystem);
            } catch (e) {
               console.log(e);
            }
         }
      }
   };

   /**
    * Transfer (move or copy) a file or folder to another folder.
    * @param selected The file or folder selected.
    * @param folder The folder to transfer the item to.
    * @param isCopy Indicates if the item should be copied (false moves the item).
    * @returns {Promise<void>}
    */
   const transferItem = async (selected, folder, isCopy) => {
      if (selected.type === FOLDER_TYPE) {
         await transferFolder(selected, folder, isCopy);
      } else {
         let newFolderKey;

         if (folder.name === DIRECTORY_FILE_NAME) {
            // Index right before the current directory name.
            const indexOfPath = folder.key.lastIndexOf('/', folder.key.length - DIRECTORY_FILE_NAME.length - 2);
            // Path of the parent directory.
            newFolderKey = folder.key.substring(0, indexOfPath + 1);
         } else {
            newFolderKey = folder.key.replace(DIRECTORY_FILE_NAME, '');
         }
         const newDirectory = getDirectoryFromPath(newFolderKey);
         const newName = isNameUnique(selected.name, newDirectory)
            ? selected.name
            : createUniqueName(selected.name, newDirectory);
         const newKey = newFolderKey + newName;

         await Storage.copy({key: selected.key, level: 'public'}, {key: newKey, level: 'public'});
         if (!isCopy) {
            await Storage.remove(selected.key, {level: 'public'});
         }

         const selectedName = selected.name;
         const newData = cloneDeep(currentDirectory[selectedName]);
         newData.__data.key = newKey;
         newData.__data.lastModified = new Date().toString();
         newData.__data.name = newName;

         newDirectory[newName] = newData;

         setSelected(folder);
         if (!isCopy) {
            delete currentDirectory[selectedName];
         }
         processStorageList(currentPath, fileSystem);
      }
   };

   /**
    * Rename the file or folder. If the selected item is a folder handleRenameFolder will be called.
    * @returns {Promise<void>}
    */
   const handleRenameFile = async () => {
      handleClose();
      if (selected) {
         try {
            let newKey = `${currentPath}${renameValue}`;
            if (selected.type === FOLDER_TYPE) {
               await handleRenameFolder(currentPath + selected.name, newKey);
            } else {
               const copied = await Storage.copy({key: selected.key, level: 'public'}, {key: newKey, level: 'public'});
               await Storage.remove(selected.key, {level: 'public'});
               const here = getDirectoryFromPath(currentPath);

               const selectedName = selected.name;
               const newData = clone(here[selectedName]);
               selected.key = copied.key;
               selected.name = renameValue;
               selected.lastModified = new Date().toString();
               delete here[selectedName];
               here[renameValue] = newData;
               processStorageList(currentPath, fileSystem);
            }
         } catch (e) {
            console.log(e);
         } finally {
            setRenameValue(null);
         }
      }
   };

   /**
    * Listen for item drops and transfer the item.
    */
   useEffect(() => {
      if (itemMove?.item && itemMove?.folder) {
         const {dropEffect} = itemMove.folder;

         if (dropEffect) {
            transferItem(itemMove.item, itemMove.folder, dropEffect === 'copy');
         }
      }
   }, [itemMove]);

   /**
    * Creates a new unique filename from the selectedName in the directory.
    *
    * NOTICE: This function assumes the selectedName is NOT unique (i.e. a copy is being made). If the name might be
    * unique, call isUnique first before calling this function.
    *
    * @param selectedName The name to create a unique name from.
    * @param directory The directory to create the new unique name in.
    * @returns {string} The unique name in the directory.
    */
   const createUniqueName = (selectedName, directory = currentDirectory) => {
      const extensionIndex = selectedName.lastIndexOf('.');
      let justName = extensionIndex >= 0 ? selectedName.substr(0, extensionIndex) : selectedName;
      let extension = extensionIndex >= 0 ? selectedName.substr(extensionIndex) : '';
      let newName = justName + ' Copy';

      // Search for [newName] Copy ([number]) OR [newName] Copy.
      const copyNameMore = '^' + escapeRegExp(newName) + '(\\(\\d+\\))?$';
      const matchingFiles = filter(keys(directory), (key) => {
         if (key?.length > 0 && key !== '__data') {
            const extensionIndex2 = key.lastIndexOf('.');
            let thisName = extensionIndex2 >= 0 ? key.substr(0, extensionIndex2) : key;
            let thisExtension = extensionIndex2 >= 0 ? key.substr(extensionIndex2) : '';

            return thisName.search(copyNameMore) >= 0 && (extensionIndex2 < 0 || isEqual(extension, thisExtension));
         }
         return false;
      });

      if (matchingFiles?.length > 0) {
         let index = matchingFiles?.length;
         newName += `(${index})` + extension;

         while (!isNameUnique(newName)) {
            index += 1;
            newName = `${justName} Copy(${index})` + extension;
         }
      } else {
         newName += extension;
      }

      return newName;
   };

   /**
    * Makes a copy of the selected file (folders are not allowed).
    * @returns {Promise<void>}
    */
   const handleMakeCopy = async () => {
      handleClose();
      if (selected && selected.type === FILE_TYPE) {
         try {
            const here = getDirectoryFromPath(currentPath);

            const selectedName = selected.name;
            const newName = createUniqueName(selectedName);

            let newKey = `${currentPath}${newName}`;

            const copied = await Storage.copy({key: selected.key, level: 'public'}, {key: newKey, level: 'public'});

            const newData = cloneDeep(here[selectedName]);
            newData.__data.key = copied.key;
            newData.__data.name = newName;
            newData.__data.lastModified = new Date().toString();
            here[newName] = newData;
            processStorageList(currentPath, fileSystem);
         } catch (e) {
            console.log(e);
         }
      }
   };

   /**
    * When the list of files is changed, add the files to be uploaded.
    * @param filesToAdd The files to add to the fileSystem.
    */
   const handleFileChange = async (filesToAdd) => {
      if (filesToAdd?.length > 0) {
         try {
            setIsUploading(true);

            for (const file of filesToAdd) {
               const newName = isNameUnique(file.name) ? file.name : createUniqueName(file.name);
               const imageKey = `${currentPath}${newName}`;
               await Storage.put(imageKey, file, {
                  // bucket: FILE_BUCKET,
                  level: 'public',
                  contentType: file.type,
               });
               currentDirectory[newName] = {
                  __data: {
                     key: imageKey,
                     eTag: undefined,
                     lastModified: file.lastModifiedDate,
                     size: file.size,
                     name: newName,
                     type: FILE_TYPE,
                  },
               };
               processStorageList(currentPath, fileSystem);
            }
         } catch (e) {
            console.log(e);
         } finally {
            setIsUploading(false);
         }
      }
   };

   const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
      onDrop: handleFileChange,
      noClick: true,
      noKeyboard: true,
   });

   /**
    * On row select, navigate to show the edit drawer for the asset.
    * @param original
    */
   const handleRowSelect = (original) => {
      setSelected(original);
   };

   /**
    * Is the currently selected item, a template folder.
    * @type {unknown} True if item is a template folder and false otherwise.
    */
   const isSelectedTemplateFolder = useMemo(
      () => isTemplateFolder(selected, levels?.length),
      [folderData?.folders, isAdmin, selected?.name, selected?.type]
   );

   const columns = useMemo(() => {
      return [
         {
            id: 'name',
            Header: <TypographyFHG id={'files.name.column'} />,
            accessor: 'name',
            minWidth: 200,
            width: 1000,
            maxWidth: 1000,
            isDraggable: true,
            Cell: (row) => {
               const extension = getExtension(row.row.original.name);
               return (
                  <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                     {row.row.original.type === FOLDER_TYPE ? (
                        <span className='fiv-sqo fiv-icon-folder' style={{marginRight: 8, cursor: 'pointer'}} />
                     ) : // <Folder style={{marginRight: 8}} />
                     row.row.original.name !== DIRECTORY_FILE_NAME ? (
                        <span className={getExtensionIcon(extension)} style={{marginRight: 8, cursor: 'pointer'}} />
                     ) : (
                        ''
                     )}
                     <TypographyWithHover style={{cursor: 'pointer'}}> {row.value}</TypographyWithHover>
                  </Box>
               );
            },
         },
         {
            id: 'lastModified',
            Header: <TypographyFHG id={'files.lastModified.column'} />,
            accessor: 'lastModified',
            minWidth: 200,
            width: 200,
            maxWidth: 200,
            Cell: (row) => {
               return row.value && row.row.original.type === FILE_TYPE && row.row.original.name !== DIRECTORY_FILE_NAME
                  ? moment(row.value).format(DATE_MEDIUM_FORMAT)
                  : '-';
            },
         },
         {
            id: 'fileSize',
            Header: <TypographyFHG id={'files.fileSize.column'} />,
            accessor: 'size',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: (row) => (row.row.original.type === FILE_TYPE ? humanFileSize(row.value, true) : '-'),
         },
      ];
   }, []);

   const handleUploadFile = () => {
      open();
   };

   /**
    * Indicates if the name unique in the directory.
    * @param name The name to check for unique.
    * @param directory The directory to check.
    * @returns {boolean} True if the name is unique.
    */
   const isNameUnique = (name, directory = currentDirectory) => {
      const copyNameMore = '^' + escapeRegExp(name) + '$';
      const matchingFiles = filter(keys(directory), (key) => {
         if (key?.length > 0 && key !== '__data') {
            return key.search(copyNameMore) >= 0;
         }
         return false;
      });
      return matchingFiles?.length <= 0;
   };

   /**
    * Handle a name change. Ensure the name is unique and doesn't have illegal characters.
    * @param event The change event.
    */
   const handleChange = (event) => {
      const newName = event.target.value;
      if (newName?.length > 0 && (newName.includes('/') || newName.split('.')?.length > 2)) {
         setError("Names cannot contain '/' or '.' ");
      } else if (selected?.name !== newName && !isNameUnique(newName)) {
         setError('Name already used.');
      } else if (error) {
         setError(undefined);
      }
      setRenameValue(newName);
   };

   /**
    * Handle folder name change. Ensure the name is unique and doesn't have illegal characters.
    * @param event The change event.
    */
   const handleFolderChange = (event) => {
      const newName = event.target.value;
      if (newName?.length > 0 && (newName.includes('/') || newName.split('.')?.length > 1)) {
         setError("Names cannot contain '/' or '.' ");
      } else if (selected?.name !== newName && !isNameUnique(newName)) {
         setError('Name already used.');
      } else if (error) {
         setError(undefined);
      }
      setRenameValue(newName);
   };

   const handleClose = useCallback(() => {
      handleCloseMenu();
      setIsRenameDialogOpen(false);
      setRenameValue(undefined);
   }, []);

   const handleCreateFolder = useCallback(() => {
      async function createFolder() {
         try {
            const imageKey = `${currentPath}${renameValue}/...`;
            await Storage.put(imageKey, ' ', {
               // bucket: FILE_BUCKET,
               level: 'public',
               contentType: 'text/plain',
            });
            const newFolder = {
               __data: {
                  key: imageKey,
                  eTag: undefined,
                  lastModified: new Date().toString(),
                  size: 1,
                  name: renameValue,
                  type: FOLDER_TYPE,
               },
               [DIRECTORY_FILE_NAME]: {
                  __data: {
                     key: imageKey,
                     eTag: undefined,
                     lastModified: new Date().toString(),
                     size: 1,
                     name: DIRECTORY_FILE_NAME,
                     type: FILE_TYPE,
                  },
               },
            };
            const cloneFileSystem = {...fileSystem};
            let item = getFromPath(fileSystem, currentPath);
            if (item) {
               item[renameValue] = newFolder;

               setFileSystem(cloneFileSystem);
               processStorageList(currentPath, cloneFileSystem);
               setRefreshTime(Date.now());
            } else {
               console.log('Could not find the folder the new folder is added to.', currentPath, renameValue);
            }
         } catch (e) {
            console.log(e);
         }
      }

      handleClose();
      setSelected(undefined);
      createFolder();
   }, [renameValue, fileSystem, currentPath, handleClose]);

   const handleDownloadFile = async (event, file) => {
      handleClose();
      const useFile = file || selected;
      if (useFile?.name === DIRECTORY_FILE_NAME) {
         let path = currentPath.substring(0, currentPath.length - 1);
         path = currentPath.substring(0, path.lastIndexOf('/') + 1);
         processStorageList(path, fileSystem);
         setSelected(undefined);
      } else if (useFile.type === FILE_TYPE) {
         const result = await Storage.get(useFile.key, {
            // bucket: FILE_BUCKET,
            level: 'public',
            download: true,
         });
         downloadBlob(result.Body, useFile.name);
      } else if (useFile?.key) {
         const key = useFile.key;
         const path = key.substring(0, key.lastIndexOf('/') + 1);
         processStorageList(path, fileSystem);
         setSelected(undefined);
      }
   };

   const handleOpen = async (original, index, event) => {
      await handleDownloadFile(event, original);
   };

   const handleClick = (name, index) => () => {
      if (name === TOP_LEVEL_NAME) {
         processStorageList(`${clientId}/`, fileSystem);
      } else {
         const levels = currentPath.split('/');
         const path = levels.slice(0, index + 1).join('/') + '/';
         processStorageList(path, fileSystem);
      }
      setSelected(undefined);
   };

   const handleClickMenu = (event, row) => {
      event.preventDefault();

      if (row?.original?.name !== DIRECTORY_FILE_NAME) {
         setSelected(row.original);
         setState({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
         });
      }
   };

   const handleCloseMenu = () => {
      setState(initialState);
   };

   const handleClickRename = () => {
      setIsRenameDialogOpen(true);
      handleCloseMenu();
   };

   const renameFileDialog = (
      <ModalDialog
         open={true}
         onClose={handleClose}
         onSubmit={handleRenameFile}
         titleKey={'files.renameFile.title'}
         submitKey={'files.renameFile.label'}
         maxWidth={'sm'}
         fullWidth={true}
         isEnabled={!error && selected?.name !== renameValue}
      >
         <TextFieldLF
            name={'name'}
            autoFocus
            onFocus={({target}) => target.select()}
            labelKey='files.fileName.label'
            defaultValue={selected?.name}
            value={renameValue}
            helperText={error}
            onChange={handleChange}
         />
      </ModalDialog>
   );

   return (
      <Grid name={'EntityFiles '} item fullWidth style={{margin: theme.spacing(2), height: 'calc(100% - 16px'}}>
         {isRenameDialogOpen && renameFileDialog}
         <ProgressIndicator isGlobal={false} />
         <Button color='primary' onClick={handleUploadFile} style={{marginRight: theme.spacing(2)}}>
            <CloudUpload style={{marginRight: theme.spacing(1)}} />
            Upload File
         </Button>
         <Button
            color='primary'
            onClick={handleDownloadFile}
            style={{marginRight: theme.spacing(2)}}
            disabled={!selected || selected.name === DIRECTORY_FILE_NAME || selected.type === FOLDER_TYPE}
         >
            <CloudDownload style={{marginRight: theme.spacing(1)}} />
            Download File
         </Button>
         <ButtonFHG
            color={'primary'}
            labelKey={'files.renameFile.label'}
            style={{marginRight: theme.spacing(2)}}
            startIcon={<Edit />}
            onClick={() => setIsRenameDialogOpen(true)}
            disabled={!selected || selected.name === DIRECTORY_FILE_NAME || isSelectedTemplateFolder}
         />

         <ConfirmButton
            className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
            onConfirm={handleDeleteFile}
            values={{type: selected?.type, name: selected?.name}}
            messageKey={'confirmRemoveValue.message'}
            // buttonLabelKey={null}
            size={'small'}
            submitStyle={classes.deleteColorStyle}
            style={{marginRight: 20}}
            startIcon={<Delete fontSize={'small'} />}
            disabled={
               !selectedItem ||
               selected.name === DIRECTORY_FILE_NAME ||
               Object.keys(selectedItem)?.length > 2 ||
               isSelectedTemplateFolder
            }
         />
         <ModalButton
            color='primary'
            onSubmit={handleCreateFolder}
            onCancel={handleClose}
            style={{marginRight: theme.spacing(2)}}
            titleKey={'files.createFolder.title'}
            buttonLabelKey={'files.createFolder.title'}
            startIcon={<CreateNewFolder />}
            confirmProps={{maxWidth: 'sm', fullWidth: true}}
            isModalButtonEnabled={!error && renameValue?.length > 0}
         >
            <TextFieldLF
               name={'name'}
               autoFocus
               labelKey='files.folderName.label'
               value={renameValue}
               helperText={(renameValue?.length > 0 && error) || undefined}
               onChange={handleFolderChange}
            />
         </ModalButton>
         <Breadcrumbs aria-label='breadcrumb' style={{marginLeft: 4}}>
            {levels?.map((level, index) => (
               <Fragment key={'breadcrumb ' + index}>
                  {level === clientId ? (
                     <>
                        {levels.length > 1 ? (
                           <Link
                              color='inherit'
                              className={classes.linkStyle}
                              onClick={handleClick(TOP_LEVEL_NAME, index)}
                           >
                              {TOP_LEVEL_NAME}
                           </Link>
                        ) : (
                           <Typography color='textPrimary'>{TOP_LEVEL_NAME}</Typography>
                        )}
                     </>
                  ) : index < levels.length - 1 ? (
                     <Link color='inherit' className={classes.linkStyle} onClick={handleClick(level, index)}>
                        {level}
                     </Link>
                  ) : (
                     <Typography color='textPrimary'>{level}</Typography>
                  )}
               </Fragment>
            ))}
         </Breadcrumbs>
         <div
            className={isDragActive ? classes.dropStyle : classes.normalStyle}
            style={{
               marginBottom: theme.spacing(2),
               height: 'calc (100% - 80px)',
               overflow: 'hidden',
            }}
            {...getRootProps()}
         >
            <input {...getInputProps()} />
            {isDragActive && (
               <>
                  <Snackbar open={true} onClose={handleClose}>
                     <Alert severity='info'>
                        Drop file(s) to instantly upload to{' '}
                        <b>{levels?.length === 1 ? TOP_LEVEL_NAME : levels[levels.length - 1]}</b>
                     </Alert>
                  </Snackbar>
               </>
            )}

            {isUploading && (
               <>
                  <Snackbar open={true} onClose={handleClose}>
                     <Alert severity='info'>
                        Uploading file(s) to&nbsp;
                        <b>{levels?.length === 1 ? TOP_LEVEL_NAME : levels[levels.length - 1]}</b>
                     </Alert>
                  </Snackbar>
               </>
            )}

            <TableDragAndDropFHG
               id={currentPath + refreshTime}
               key={currentPath + refreshTime}
               refreshTime={refreshTime}
               name={'Files'}
               columns={columns}
               data={existingFiles}
               title={'Files'}
               classes={{
                  headerTextStyle: classes.headerTextStyle,
                  tableStyle: classes.tableStyle,
                  rowStyle: isDragActive ? classes.rowStyleDrop : classes.rowStyle,
                  selected: isDragActive ? classes.rowStyleDrop : undefined,
                  cellStyle: isDragActive ? classes.cellStyleDragging : classes.cellStyle,
               }}
               onSelect={!isDragActive ? handleRowSelect : undefined}
               selectId={!isDragActive ? selected?.key : undefined}
               onDoubleClick={handleOpen}
               onContextMenu={localStorage.hasContextMenu !== 'false' ? handleClickMenu : undefined}
               stickyExternal={false}
               emptyTableMessageKey={'files.na.label'}
            />
            <Menu
               keepMounted
               open={state.mouseY !== null && localStorage.hasContextMenu !== 'false'}
               onClose={handleCloseMenu}
               anchorReference='anchorPosition'
               anchorPosition={
                  state.mouseY !== null && state.mouseX !== null ? {top: state.mouseY, left: state.mouseX} : undefined
               }
            >
               {selected?.type === FILE_TYPE && (
                  <MenuItem onClick={handleDownloadFile}>
                     <CloudDownload fontSize={'small'} style={{marginRight: theme.spacing(1)}} />
                     Download
                  </MenuItem>
               )}
               <MenuItem onClick={handleClickRename} disabled={isSelectedTemplateFolder}>
                  <Edit fontSize={'small'} style={{marginRight: theme.spacing(1)}} />
                  Rename
               </MenuItem>
               {selected?.type === FILE_TYPE && (
                  <MenuItem onClick={handleMakeCopy} disabled={selected?.type === FOLDER_TYPE}>
                     <FileCopy fontSize={'small'} style={{marginRight: theme.spacing(1)}} />
                     Make a copy
                  </MenuItem>
               )}

               <ConfirmMenuItem
                  messageKey='confirmRemoveValue.message'
                  onConfirm={handleDeleteFile}
                  values={{type: selected?.type, name: selected?.name}}
                  size='small'
                  submitStyle={classes.deleteColorStyle}
                  startIcon={Delete}
                  className={classes.menuItemStyle}
                  onMenuClose={handleCloseMenu}
                  disabled={
                     !selectedItem ||
                     selected.name === DIRECTORY_FILE_NAME ||
                     Object.keys(selectedItem)?.length > 2 ||
                     isSelectedTemplateFolder
                  }
               />
            </Menu>
         </div>
      </Grid>
   );
}
