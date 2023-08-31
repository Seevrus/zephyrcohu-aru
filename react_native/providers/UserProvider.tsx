import AsyncStorage from '@react-native-async-storage/async-storage';
import { omit } from 'ramda';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Login } from '../api/response-mappers/mapLoginResponse';
import { CompanyType } from '../api/response-types/common/CompanyType';
import { UserType } from '../api/response-types/common/UserType';

type User = UserType & {
  company: CompanyType;
};

type UserContextType = {
  user: User | null;
  saveLoginResponse(response: Login): void;
  clearUserFromContext(): void;
};

const UserContext = createContext<UserContextType>({} as UserContextType);
const userContextStorageKey = 'boreal-user-context';

export default function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Initialize from local storage
   */
  useEffect(() => {
    async function setUserFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(userContextStorageKey);
      const localStorageUser = jsonData ? JSON.parse(jsonData) : null;
      setUser(localStorageUser);
    }

    setUserFromLocalStorage();
  }, []);

  /**
   * Save login response to local storage and reinitialize context
   */
  function saveLoginResponse(response: Login) {
    const responseUser: User = omit(['token'], response);
    AsyncStorage.setItem(userContextStorageKey, JSON.stringify(responseUser)).then(() => {
      setUser(responseUser);
    });
  }

  /**
   * Clear local storage and context on logout
   */
  function clearUserFromContext() {
    AsyncStorage.removeItem(userContextStorageKey).then(() => {
      setUser(null);
    });
  }

  const userContextValue = useMemo(
    () => ({ user, saveLoginResponse, clearUserFromContext }),
    [user]
  );

  return <UserContext.Provider value={userContextValue}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const userContext = useContext(UserContext);

  if (userContext === undefined) {
    throw new Error('useUserContext must be used within UserProvider.');
  }

  return userContext;
}
