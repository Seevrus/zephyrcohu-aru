import { useNetInfo } from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';
import SpInAppUpdates from 'sp-react-native-in-app-updates';

import { type AlertButton } from '../components/alert/Alert';

const isDevelopment = process.env.EXPO_PUBLIC_IS_DEV === 'yes';

type UseAppUpdates = {
  alert?: {
    isAlertVisible: boolean;
    alertTitle: string;
    alertMessage: string | null;
    cancelButton: AlertButton | null;
    onBackdropPress: () => void;
  };
};

export function useAppUpdates(): UseAppUpdates {
  const { isInternetReachable } = useNetInfo();

  const inAppUpdates = useRef(new SpInAppUpdates(isDevelopment));

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [lastChecked, setLastChecked] = useState(0);

  useEffect(() => {
    if (
      !isDevelopment &&
      isInternetReachable === true &&
      Date.now() - lastChecked > 1 * 24 * 60 * 60 * 1000
    ) {
      inAppUpdates.current.checkNeedsUpdate().then(({ shouldUpdate }) => {
        if (shouldUpdate) {
          setIsUpdateAvailable(true);
          setLastChecked(Date.now());
        }
      });
    }
  }, [isInternetReachable, lastChecked]);

  const resetAlertHandler = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  return {
    alert: isUpdateAvailable
      ? {
          isAlertVisible: isUpdateAvailable,
          alertTitle: 'Frissítés érhető el',
          alertMessage:
            'Új programverzió érhető el. Kérem, frissítse a programot a Play Áruházban.',
          cancelButton: {
            text: 'Értem',
            variant: 'neutral',
            onPress: resetAlertHandler,
          },
          onBackdropPress: resetAlertHandler,
        }
      : undefined,
  };
}
