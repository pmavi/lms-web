import {useState} from 'react';
import {useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {useSetRecoilState, atom} from 'recoil';
import {ADMIN_GROUP} from '../../../Constants';
import {userRoleState} from '../../../pages/Main';

export const userGroupsState = atom({
   key: 'userGroupsStateKey',
   default: {groups: [], signOut: undefined},
});

export const authenticationDataStatus = atom({
   key: 'authenticationData',
   default: {},
});

export const userStatus = atom({
   key: 'userStatus',
   default: {},
});

export default function AuthenticatedUser({authState, children}) {
   const setUserGroups = useSetRecoilState(userGroupsState);
   const [userRole, setUserRole] = useRecoilState(userRoleState);
   const [authStateData, setAuthStateData] = useRecoilState(authenticationDataStatus);
   const [isInitialized, setIsInitialized] = useState(false);

   useEffect(() => {
      if (authState) {
         const groups = authState?.user?.signInUserSession?.idToken?.payload?.['cognito:groups'] ?? [];
         setUserGroups({groups, signOut: authState.signOut});

         const isAdmin = groups.indexOf(ADMIN_GROUP) >= 0;

         if (isAdmin !== userRole.isAdmin || userRole.isClient === isAdmin) {
            setUserRole({isAdmin: isAdmin, isClient: !isAdmin});
         }

         if (authStateData.username !== authState?.user?.username) {
            setAuthStateData({username: authState?.user?.username, cognitoSub: authState?.user?.attributes?.sub});
         }
         setIsInitialized(true);
      }
   }, [authState]);

   if (authState && isInitialized) {
      return children;
   } else {
      return null;
   }
}
