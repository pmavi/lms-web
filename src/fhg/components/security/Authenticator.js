import {Heading} from '@aws-amplify/ui-react';
import {Image} from '@aws-amplify/ui-react';
import {useTheme} from '@aws-amplify/ui-react';
import {Text} from '@aws-amplify/ui-react';
import {View} from '@aws-amplify/ui-react';
import {Authenticator} from '@aws-amplify/ui-react';
import {I18n} from 'aws-amplify';
import './Authenticator.css';
import {AmplifyProvider} from '@aws-amplify/ui-react';
import {LOGO_MEDIUM} from '../../../Constants';

I18n.putVocabulariesForLanguage('en', {
   Username: 'Enter your username', // Username label
   Password: 'Enter your password', // Password label
});

const defaultComponents = {
   Header() {
      const {tokens} = useTheme();

      return (
         <View
            textAlign='center'
            style={{marginLeft: 'auto', marginRight: 'auto', backgroundColor: 'white'}}
            padding={tokens.space.large}
            className={'amplify-view'}
            width={'100%'}
            height={'100%'}
         >
            <Image
               alt='logo'
               src={LOGO_MEDIUM}
               width={{small: '80.5px', large: '161px'}}
               height={{small: '99.5px', large: '199px'}}
            />
            <Heading color={'#828282'} padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
               Sign In to Legacy Farmer
            </Heading>
         </View>
      );
   },

   Footer() {
      const {tokens} = useTheme();

      return (
         <View textAlign='center' padding={tokens.space.large} style={{backgroundColor: 'white'}}>
            <Text color={`${tokens.colors.neutral['80']}`}>&copy; All Rights Reserved</Text>
         </View>
      );
   },
};

/**
 * Authenticator for the app. The children won't be displayed until the user has logged in.
 *
 * @param theme The theme for the AWS authentication.
 * @param components The components for the AWS authentication.
 * @param children
 * @return {JSX.Element}
 * @constructor
 */
export default function AuthenticatorFHG({theme, components = defaultComponents, children}) {
   return (
      <AmplifyProvider theme={theme}>
         <Authenticator components={components} style={{backgroundColor: 'lightblue'}}>
            {children}
         </Authenticator>
      </AmplifyProvider>
   );
}
