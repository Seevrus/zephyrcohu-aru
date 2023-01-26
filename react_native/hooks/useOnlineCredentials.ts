import { useEffect, useState } from 'react';

import { checkToken } from '../store/config-slice/config-api-actions';
import { useAppDispatch } from '../store/hooks';
import useOfflineCredentials from './useOfflineCredentials';

type CredentialsStateT = {
  isValid: boolean;
  errorMessage: string;
};

const useOnlineCredentials = () => {
  const dispatch = useAppDispatch();
  const { deviceId, token } = useOfflineCredentials();

  const [credentials, setCredentials] = useState<CredentialsStateT>({
    isValid: false,
    errorMessage: '',
  });

  useEffect(() => {
    const checkCredentials = async () => {
      let { isValid, errorMessage } = credentials;
      if (deviceId !== 'NONE' && token !== 'NONE') {
        try {
          await dispatch(checkToken({ deviceId, token }));
          isValid = true;
        } catch (err) {
          errorMessage = err.message;
        }

        setCredentials({ isValid, errorMessage });
      }
    };

    checkCredentials();
  }, [credentials, deviceId, dispatch, token]);

  return [credentials.isValid, credentials.errorMessage];
};

export default useOnlineCredentials;
