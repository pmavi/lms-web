import {ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import responsiveFontSizes from '@material-ui/core/styles/responsiveFontSizes';
import React from 'react';
import {ERROR_COLOR, WARNING_COLOR, SUCCESS_COLOR, PRIMARY_COLOR} from '../Constants';

export default function ThemeProvider({children}) {

   let useTheme = React.useMemo(
      () => {
         let materialTheme;

         materialTheme = {
            overrides: {
               MuiButton: {
                  textSizeLarge: {
                     fontSize: '1rem',
                  },
               },
            },
            palette: {
               primary: {
                  light: '#85AC5B',
                  main: PRIMARY_COLOR,
                  dark: '#527928',
               },
               secondary: {
                  main: '#000000',
               },
               background: {
                  default: '#F4F4F4',
               },
               text: {
                  primary: '#707070',
                  secondary: '#527928',
               },
               table: {
                  header: {
                     primary: '#FFFFFF',
                     secondary: '#F0F5EA',
                     // secondary: 'rgba(223,235,209,0.41)',
                  },
               },
               error: {
                  main: ERROR_COLOR,
               },
               warning: {
                  main: WARNING_COLOR,
               },
               success: {
                  main: SUCCESS_COLOR,
               }
            },
            typography: {
               fontFamily: '"Tahoma", "Roboto", "Helvetica", "Arial", sans-serif',
               subtitle1: {
                  fontSize: '1.125rem',
               },
               button: {
                  textTransform: 'none',
               }
            },
            shape: {
               borderRadius: 4,
            }
         };
         return responsiveFontSizes(createMuiTheme(materialTheme));
      },
      []);

   return (
      <MuiThemeProvider theme={useTheme}>
         {children}
      </MuiThemeProvider>
   );
}
