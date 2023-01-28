import { useEffect, useState } from 'react';
import { setLocalStorage } from '../store/async-storage';

import { checkToken } from '../store/config-slice/config-api-actions';
import { configActions } from '../store/config-slice/config-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import useOfflineCredentials from './useOfflineCredentials';

const useOnlineCredentials = () => {
  const dispatch = useAppDispatch();
  const { deviceId, deviceIdError, token, tokenError } = useOfflineCredentials();
  const [credentialsError, setCredentialsError] = useState<string>('');
  const isLoggedin = useAppSelector((state) => state.config.isLoggedin);
  const checkTokenError = useAppSelector((state) => state.config.tokenError);

  useEffect(() => {
    const checkCredentials = async () => {
      let error: string;

      if (!deviceId || deviceIdError || !token || tokenError || isLoggedin || checkTokenError)
        return;

      if (deviceId !== 'NONE' && token !== 'NONE') {
        try {
          await dispatch(checkToken({ deviceId, token }));
          await setLocalStorage({ config: { isLoggedin: true } });
        } catch (err) {
          dispatch(configActions.setTokenError(true));
          error = err.message;
        }

        setCredentialsError(error);
      }
    };

    checkCredentials();
  }, [checkTokenError, deviceId, deviceIdError, dispatch, isLoggedin, token, tokenError]);

  return [credentialsError];
};

export default useOnlineCredentials;
