import { isNil } from 'ramda';
import { useEffect, useState } from 'react';

import { checkToken } from '../store/config-slice/config-api-actions';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const useCheckToken = (
  isInternetReachable: boolean,
  canCheckToken: boolean,
  deviceId: string,
  token: string
) => {
  const dispatch = useAppDispatch();
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [tokenValidationError, setTokenValidationError] = useState<boolean>(false);
  const isRoundStarted = !isNil(useAppSelector((state) => state.round.storeId));

  useEffect(() => {
    const checkCredentials = async () => {
      if (!isInternetReachable || !canCheckToken || !deviceId || !token) {
        return;
      }

      if (isRoundStarted) {
        setIsTokenValid(true);
        setTokenValidationError(false);
        return;
      }

      if (deviceId !== 'NONE' && token !== 'NONE') {
        try {
          await dispatch(checkToken({ deviceId, token }));
          setIsTokenValid(true);
          setTokenValidationError(false);
        } catch (err) {
          setIsTokenValid(false);
          setTokenValidationError(true);
        }
      }
    };

    checkCredentials();
  }, [canCheckToken, deviceId, dispatch, isInternetReachable, isRoundStarted, token]);

  return [isTokenValid, tokenValidationError];
};

export default useCheckToken;
