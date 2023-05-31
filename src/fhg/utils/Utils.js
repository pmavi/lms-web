import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {indexOf} from 'lodash';
// import compact from 'lodash/compact';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import {isNaN} from 'lodash/lang';
// import forOwn from 'lodash/forOwn';
import _toNumber from 'lodash/toNumber';
// import castArray from 'lodash/castArray';
import get from 'lodash/get';
// import isEqual from 'lodash/isEqual';
import isObjectLike from 'lodash/isObjectLike';
// import moment from 'moment';
import React from 'react';
// import {DATE_DB_FORMAT} from '../../Constants';

/**
 * Format the message for localization. The default message has the id appended in non-production versions.
 *
 * @param intl             // Intl for localization.
 * @param id               // Message ID from localization file.
 * @param defaultMessage   // Default message to use if id cannot be found in localization file.
 * @param values           // Values to insert in the localized message.
 * @return {string}        // Localized message.
 */
export function formatMessage(intl, id, defaultMessage, values) {
   const newDefaultMessage = process.env.NODE_ENV === 'production' ? defaultMessage : `${defaultMessage} (${id})`;

   if (id) {
      return intl ? intl.formatMessage({id, defaultMessage: newDefaultMessage}, values) : newDefaultMessage;
   } else {
      return '';
   }
}

// /**
//  * Converts any boolean type string to a boolean value.
//  * @param string The string to convert.
//  * @return {*} The boolean value or the original string if the string wasn't a boolean type string.
//  */
// export const stringToBoolean = (string) => {
//    if (string) {
//       switch (string.toLocaleLowerCase().trim()) {
//          case 'true':
//          case 'yes':
//             return true;
//          case 'false':
//          case 'no':
//             return false;
//          default:
//             return string;
//       }
//    } else {
//       return string;
//    }
// };
//
// /**
//  * b64 encoding for a string containing unicode characters.
//  * @param str The string to encode.
//  * @return {string} The encoded string.
//  */
// export function b64EncodeUnicode(str) {
//    // first we use encodeURIComponent to get percent-encoded UTF-8,
//    // then we convert the percent encodings into raw bytes which
//    // can be fed into btoa.
//    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
//       function toSolidBytes(match, p1) {
//          return String.fromCharCode('0x' + p1);
//       }));
// }
//
// /**
//  * Sorts the dates using date-fns.
//  * @param a
//  * @param b
//  * @return {number}
//  */
// export const sortDate = (a, b) => {
//    if (a === b) {
//       return 0;
//    }
//    if (a === undefined || b === undefined) {
//       return (a === undefined) ? -1 : 1;
//    }
//    const aMoment = moment(a);
//    const bMoment = moment(b);
//
//    if (aMoment.isSame(bMoment)) {
//       return 0;
//    }
//    return aMoment.isAfter(bMoment) ? 1 : -1;
// };
//
// /**
//  * Sorts the dates firestore timestamp objects.
//  * @param a
//  * @param b
//  * @return {number}
//  */
// export const sortTimestamp = (a, b) => {
//
//    if (isEqual(a, b)) {
//       return 0;
//    }
//    if (a === undefined || b === undefined) {
//       return a === undefined ? -1 : 1;
//    }
//    return ((a.seconds > b.seconds) || ((a.seconds === b.seconds) && (a.nanoseconds > b.nanoseconds))) ? 1 : -1
//
// };
//
export function removeOne(array, index) {
   if (index >= 0 && array && array.length) {
      let len = array.length;
      if (!len) {
         return;
      }
      len -= 1;
      while (index < len) {
         array[index] = array[index + 1];
         index++;
      }
      array.length--;
   }
   return array;
}

// export const emptyFunction = () => {};
//
// export function isFullScreenMode() {
//    return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || window.innerHeight ===
//       window.screen.height;
// }
//
// export function isMobileDevice() {
//    let check = false;
//    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
//    return check;
// }
//
/**
 * Determines if the item has a value (i.e. not undefined, not null, nor empty string).
 *
 * @param item The item to check.
 * @return {boolean} True if the item is not undefined, not null, and not the empty string.
 */
export function hasValue(item) {
   return (
      !isNil(item) &&
      item !== '' &&
      (!isArray(item) || item.length > 0) &&
      (!isObjectLike(item) || Object.keys(item).length > 0)
   );
}

// /**
//  * Determines if the item has a value (i.e. not undefined, not null, nor empty string).
//  *
//  * @param item The item to check.
//  * @return {boolean} True if the item is not undefined, not null, and not the empty string.
//  */
// export function hasElements(item, path) {
//    const array = path ? get(item, path) : item;
//    return (isArray(array) && array.length > 0);
// }
//
// /**
//  * If items both have values and they are equal or if they both don't have values, they are equivalent.
//  * @param item1 First item to check
//  * @param item2 Second item to check.
//  * @return {boolean} True if the two items have the same value or both don't have a value.
//  */
// export function isEquivalent(item1, item2) {
//    return (!hasValue(item1) && !hasValue(item2)) || isEqual(item1, item2);
// }
//
// /**
//  * Get an object with the property set to the changed value or undefined, if the property hasn't changed.
//  *
//  * @param changedItem The possibly changed object to compare properties.
//  * @param originalItem The original object to compare properties.
//  * @param changedProperty The property of the changed item to compare.
//  * @param originalProperty The property of the original item to compare.
//  * @param isCompactArray True to compact the array type properties.
//  * @return {boolean|{}} The new object with the property set if changed, or undefined if not changed.
//  */
// export function getChangedProperty(changedItem, originalItem, changedProperty, originalProperty,
//    isCompactArray = false) {
//    originalProperty = originalProperty || changedProperty;
//    const changedItemProperty = isCompactArray && isArray(changedItem[changedProperty]) ?
//       compact(changedItem[changedProperty]) : changedItem[changedProperty];
//    return !isEquivalent(changedItemProperty, originalItem[originalProperty]) &&
//       {[originalProperty]: changedItemProperty};
// }
//
// /**
//  * Get an object with the property set to the changed value or undefined, if the property hasn't changed. The changed
//  * property is passed directly instead of as part of an object for getChangedProperty.
//  *
//  * @param changedProperty The possibly changed property to compare.
//  * @param originalItem The original object to compare properties.
//  * @param originalProperty The property of the original item to compare.
//  * @return {boolean|{}} The new object with the property set if changed, or undefined if not changed.
//  */
// export function getCustomChanged(changedProperty, originalItem, originalProperty) {
//    return !isEquivalent(changedProperty, originalItem[originalProperty]) && {[originalProperty]: changedProperty};
// }
//
// /**
//  * Get an object with all the properties set to the changed properties. Only changed properties will be in the returned
//  * object.
//  *
//  * @param changedItem The possibly changed object to compare properties.
//  * @param originalItem The original object to compare properties.
//  * @param changedProperties The list of properties of the changed item to compare.
//  * @param convertCallback The function to convert from the view value to the save object type.
//  * @param mapChangedPropertiesToOriginal The mapping from changed property names to original properties. For example:
//  *    {
//  *       changedItemPropertyName: 'originalPropertyName',
//  *       changedItemPropertyName2: 'originalPropertyName2',
//  *    }
//  */
// export function getChangedObject(changedItem, originalItem, changedProperties, convertCallback,
//    mapChangedPropertiesToOriginal = {}) {
//    const changed = {};
//    for (const property of changedProperties) {
//       const originalProperty = mapChangedPropertiesToOriginal[property] || property;
//       const changedField = getChangedProperty(changedItem, originalItem, property, originalProperty);
//       if (changedField) {
//          changed[originalProperty] = convertCallback ? convertCallback(changedItem[property]) : changedItem[property];
//       }
//    }
//    return changed;
// }
//
// export function hasOwnToObject(object) {
//    const result = {};
//
//    forOwn(object, function (value, key) {
//       if (key !== 'undefined') {
//          result[key] = value;
//       }
//    });
//
//    return result;
// }
//
// export function blobToBase64(blob) {
//    return new Promise(async (resolve, reject) => {
//       var reader = new FileReader();
//       reader.onload = function () {
//          var dataUrl = reader.result;
//          var base64 = dataUrl.split(',')[1];
//          resolve(base64);
//       };
//       reader.onerror = function (error) {
//          reject(error);
//       };
//       reader.readAsDataURL(blob);
//    });
// }
//
// export function dataURItoBlob(dataURI) {
//    // convert base64 to raw binary data held in a string
//    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
//    var byteString = atob(dataURI.split(',')[1]);
//
//    // separate out the mime component
//    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
//
//    // write the bytes of the string to an ArrayBuffer
//    var ab = new ArrayBuffer(byteString.length);
//
//    // create a view into the buffer
//    var ia = new Uint8Array(ab);
//
//    // set the bytes of the buffer to the correct values
//    for (var i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//    }
//
//    // write the ArrayBuffer to a blob, and you're done
//    var blob = new Blob([ab], {type: mimeString});
//    return blob;
//
// }
//
// export async function fetchData(url = '', method = 'GET', data) {
//    const response = await fetch(url, {
//       method,
//       headers: {
//          // 'x-api-key': 'AIzaSyA35411U4UavTPdKVW-HTbY8HWvdny_QSA',
//          'Content-Type': 'application/json',
//       },
//       body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
//    });
//    return response.json(); // parses JSON response into native JavaScript objects
// }

export const getBase64FromUrl = async (url) => {
   const data = await fetch(url);
   const blob = await data.blob();
   return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
         const base64data = reader.result;
         resolve(base64data);
      };
   });
};

export const editChange = (event, value, reason, isComponent = true, newValue, name) => {
   let nextValue;
   let componentName = name;

   if (newValue === undefined) {
      if (value && (reason === 'blur' || reason === 'create-option' || reason === 'select-option')) {
         nextValue = typeof value === 'string' ? value : value.id;
         componentName =
            name ||
            get(event, 'target.parentElement.dataset.optionname') ||
            get(event, 'target.firstElementChild.dataset.optionname') ||
            event.target.name;
      } else if (value && reason === 'date-picker') {
         nextValue = value;
         componentName = event.target.name;
      } else {
         if (event && event.target) {
            switch (event.target.type) {
               case 'number':
                  nextValue = event.target.valueAsNumber;
                  break;
               case 'checkbox':
                  nextValue = event.target.checked;
                  break;
               case 'date-range':
                  nextValue = event.target.date;
                  break;
               case 'react-select':
                  nextValue = event.target.value;
                  break;
               case 'react-number-format':
                  nextValue = toNumber(event.target.value);
                  break;
               default:
                  const type = get(event, 'target.dataset.type');
                  if (type === 'number') {
                     nextValue = toNumber(event.target.value);
                  } else {
                     nextValue = event.target.value;
                  }
                  break;
            }
            componentName = event.target.name;
         } else {
            console.log('event.target is null');
         }
      }
   }

   if (newValue) {
      return isComponent ? newValue : {componentName, newValue: newValue[name]};
   } else if (isComponent) {
      return {[componentName]: nextValue};
   }
   return {componentName, newValue: nextValue};
};

// export const renderOptions = (option, {inputValue}) => {
//    if (!option) {
//       return 'Untitled';
//    }
//    const matches = match(option, inputValue);
//    const parts = parse(option, matches);
//
//    return (
//       <div>
//          {parts.map((part, index) => (
//             <span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>
//                                     {part.text}
//                                  </span>
//          ))}
//       </div>
//    );
// };
//
// export const renderOptionsName = (option, {inputValue}) => {
//    if (option.name === null) {
//       return 'Untitled';
//    }
//    const matches = match(option.name, inputValue);
//    const parts = parse(option.name, matches);
//
//    return (
//       <div>
//          {parts.map((part, index) => (
//             <span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>
//                                     {part.text}
//                                  </span>
//          ))}
//       </div>
//    );
// };

export const renderOptionsKey =
   (name) =>
   (option, {inputValue}) => {
      const useOption = typeof option === 'string' ? option : option[name];
      if (useOption === null) {
         return 'Untitled';
      }

      const matches = match(useOption, inputValue);
      const parts = parse(useOption, matches);

      return (
         <div>
            {parts.map((part, index) => {
               if (part.text) {
                  return (
                     <span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>
                        {part.text}
                     </span>
                  );
               } else {
                  return (
                     <span key={index} style={{fontWeight: 400, color: '#A6A6A6'}}>
                        Untitled
                     </span>
                  );
               }
            })}
         </div>
      );
   };

/**
 * Convert the fileUpload into the api call to get the file.
 * @param fileUpload The fileUpload to convert.
 *
 * @return {string|undefined|*} The relative file location.
 */
export const convertImageToWrapper = (fileUpload) => {
   if (fileUpload) {
      return `/file?id=${fileUpload.id}`;
   }
   return undefined;
};

export function toNumber(value, isAllowBlank = true) {
   if (value === null || value === undefined || (isAllowBlank && value === '')) {
      return null;
   } else {
      return _toNumber(value);
   }
}

export function toNumberIfString(value, isAllowBlank = true) {
   const result = toNumber(value, isAllowBlank);
   return isNaN(result) ? value : result;
}

// export const areDatesValid = dates => {
//    const checkDates = compact(castArray(dates));
//
//    //There need to be 1 or 2 dates, 0 or less and greater than 2 dates are not valid.
//    if (checkDates.length <= 0 || checkDates.length > 2) {
//       return false;
//    }
//    for (const date of checkDates) {
//       if (date) {
//          if (!date.isValid || !date.isValid()) {
//             return false;
//          }
//       }
//    }
//    return true;
// }
//
// /**
//  * Get arrays of days in the ranges of the date range list of records.
//  *
//  * @param dateRangeList The list of date range records.
//  * @return {[]} The array of  days.
//  */
// export const getDays = (dateRangeList,
//    {startField = 'startDate', endField = 'endDate'} = {startField: 'startDate', endField: 'endDate'}) => {
//    const days = [];
//
//    for (const dateRange of dateRangeList) {
//       const firstDay = moment(dateRange[startField]);
//       const lastDay = moment(dateRange[endField]);
//       days.push(dateRange[startField]);
//       let currentDay = moment(firstDay).add(1, 'day');
//       while (currentDay.isSameOrBefore(lastDay)) {
//          days.push(currentDay.format(DATE_DB_FORMAT));
//          currentDay = moment(currentDay).add(1, 'day');
//       }
//    }
//    return days;
// };

export function resultOf(item, argument, defaultItem) {
   let result = typeof item === 'function' ? item(argument) : item;

   return result || defaultItem;
}

export function stringAvatar(name, style = {}) {
   if (name) {
      return {
         style: {
            backgroundColor: '#000',
            color: '#fff',
            width: 35,
            height: 35,
            marginRight: 8,
            ...style,
         },
         children: `${name.split(' ')[0][0]}${name.split(' ')?.[1]?.[0] || ''}`,
      };
   }
   return {style};
}

export function findById(array = [], idList = []) {
   const result = [];

   for (const arrayElement of array) {
      const index = indexOf(idList, arrayElement?.id);
      if (index >= 0) {
         result.push(arrayElement);
      }
   }
   return result;
}

export function downloadBlob(blob, filename) {
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename || 'download';
   const clickHandler = () => {
      setTimeout(() => {
         URL.revokeObjectURL(url);
         a.removeEventListener('click', clickHandler);
      }, 150);
   };
   a.addEventListener('click', clickHandler, false);
   a.click();
   return a;
}

export function humanFileSize(bytes, si = false, dp = 1) {
   const thresh = si ? 1000 : 1024;

   if (Math.abs(bytes) < thresh) {
      if (bytes <= 1) {
         return '-';
      }
      return bytes + ' bytes';
   }

   const units = si
      ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
   let u = -1;
   const r = 10 ** dp;

   do {
      bytes /= thresh;
      ++u;
   } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

   return bytes.toFixed(dp) + ' ' + units[u];
}

export function getExtension(name) {
   if (name) {
      const lastIndex = name.lastIndexOf('.');
      if (lastIndex >= 0) {
         return name.substring(lastIndex + 1);
      }
   }
   return '';
}

export function getExtensionIcon(extension) {
   return 'fiv-sqo fiv-icon-' + extension;
}

export function escapeRegExp(string) {
   return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
