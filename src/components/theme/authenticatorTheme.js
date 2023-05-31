import {PRIMARY_COLOR} from '../../Constants';

export const authenticatorTheme = {
   name: 'my-theme',
   tokens: {
      colors: {
         font: {
            primary: {value: PRIMARY_COLOR},
         },
      },
      components: {
         button: {
            // this will affect the font weight of all button variants
            fontWeight: {value: '{fontWeights.black.value}'},
            // style the primary variation
            primary: {
               backgroundColor: {value: PRIMARY_COLOR},
               _hover: {
                  backgroundColor: {value: '#527928'},
               },
            },
            _hover: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
            _focus: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
            _active: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
         },
      },
   },
};
