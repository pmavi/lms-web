import {ApolloProvider, InMemoryCache, ApolloLink, HttpLink} from '@apollo/client';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {ApolloClient} from '@apollo/client';
import {setContext} from 'apollo-link-context';
import {RetryLink} from '@apollo/client/link/retry';

import {Auth} from 'aws-amplify';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {CompatRouter} from 'react-router-dom-v5-compat';
import {RecoilRoot} from 'recoil';
import App from './App';
import {ENDPOINT} from './Constants';
import './index.css';
import reportWebVitals from './reportWebVitals';

/*
Auth: {
         // REQUIRED - Amazon Cognito Identity Pool ID
         identityPoolId: 'us-east-2:fc2ef06e-cf67-4b73-9da8-090e59828afe',
         // REQUIRED - Amazon Cognito Region
         region: 'us-east-2',
         // OPTIONAL - Amazon Cognito User Pool ID
         userPoolId: 'us-east-2_juU9d1lC5',
         // OPTIONAL - Amazon Cognito Web Client ID
         userPoolWebClientId: '730rts1ddvhja0k0nv09hvthm2',
},
 */

const retryLink = new RetryLink();

const getAccessToken = () => {
   return Auth.currentSession()
      .then((session) => {
         return session.accessToken.jwtToken;
      })
      .catch((error) => {
         console.log(error);
         throw error;
      });
};

/**
 * Header for all graphql calls to add the access token.
 */
const authLink = setContext(async (_, {headers}) => {
   let token = await getAccessToken();

   return {
      headers: {
         ...headers,
         accesstoken: token || '',
      },
   };
});

const client = new ApolloClient({
   link: ApolloLink.from([retryLink, authLink, new HttpLink({uri: ENDPOINT})]),
   cache: new InMemoryCache(),
});

// Add the format command for adding parameters to strings. For Example:
//    'This is a test: {testName}'.format({testName: 'Test Hello World'})
if (!String.prototype.format) {
   // eslint-disable-next-line
   String.prototype.format = function (values) {
      return this.replace(/{(\w+)}/g, function (match, key) {
         return typeof values[key] !== 'undefined' ? values[key] : match;
      });
   };
}

ReactDOM.render(
   <DndProvider backend={HTML5Backend}>
      <RecoilRoot>
         <ApolloProvider client={client}>
            <BrowserRouter>
               <CompatRouter>
                  <App />
               </CompatRouter>
            </BrowserRouter>
         </ApolloProvider>
      </RecoilRoot>
   </DndProvider>,
   document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
