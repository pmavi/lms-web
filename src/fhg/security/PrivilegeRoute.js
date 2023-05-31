import React from 'react';
import PropTypes from 'prop-types';
import {Redirect, Route} from 'react-router-dom';

/**
 * Route that is protected by hasPrivilege. Redirects to the base URL ('/') if no privilege.
 *
 * @param hasPrivilege Indicates if the user has the privilege for the route.
 * @param children The children elements.
 * @param rest The other props.
 * @return {JSX.Element} The element to use based on privilege.
 * @constructor
 */
export default function PrivilegeRoute({hasPrivilege, children, ...rest}) {
   if (hasPrivilege) {
      return <Route {...rest}>{children}</Route>
   }
   return <Redirect to='/'/>
}

PrivilegeRoute.propTypes = {
   hasPrivilege: PropTypes.bool.isRequired,  //Function that returns true if the user can access the route.
};
