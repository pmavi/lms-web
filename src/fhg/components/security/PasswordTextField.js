import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React, {useState, Fragment, useEffect} from 'react';
import TextFieldFHG from '../../../components/TextFieldLF';
import {editChange} from '../../utils/Utils';

/**
 * The TextField with preset formats.
 */
export default function PasswordTextField({password, confirm, margin, onChange, isNew, disabled}) {
   const [showPassword, setShowPassword] = useState(false);
   const [editValues, setEditValues] = useState({});

   useEffect(() => {
      const target = document.getElementById('confirm_password');
      if (target) {
         target.setCustomValidity(
            editValues.confirm !== editValues.password ? 'Confirm does not match the password.' : ''
         );
      }
   }, [editValues.confirm, editValues.password, password, confirm]);

   const handleShowPasswordClick = () => {
      setShowPassword(!showPassword);
   };

   const handleChange = (event) => {
      setEditValues({...editValues, ...editChange(event)});
      onChange && onChange(event);
   };

   return (
      <Fragment>
         <TextFieldFHG
            name='password'
            inputProps={{
               pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&-]{8,}$',
               title: 'Password must contain at least 8 characters with one or more uppercase, lowercase, number and symbol.',
            }}
            labelKey={isNew ? 'user.password.label' : 'user.changePassword.label'}
            fullWidth
            required={isNew}
            disabled={disabled}
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            onChange={handleChange}
            value={password}
            margin={margin}
            // eslint-disable-next-line
            InputProps={{
               'aria-label': 'Password',
               endAdornment: (
                  <InputAdornment position='end'>
                     <IconButton
                        aria-label='Toggle password visibility'
                        onMouseDown={handleShowPasswordClick}
                        disabled={disabled}
                     >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                     </IconButton>
                  </InputAdornment>
               ),
            }}
         />
         {!showPassword && (
            <TextFieldFHG
               name='confirm'
               labelKey={'user.confirm.label'}
               type={'password'}
               required={isNew}
               onChange={handleChange}
               value={confirm}
               autoComplete='current-password'
               fullWidth
               disabled={disabled}
               InputProps={{id: 'confirm_password'}}
            />
         )}
      </Fragment>
   );
}
