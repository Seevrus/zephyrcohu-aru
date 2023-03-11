import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import useToken from './useToken';

import { useAppDispatch } from '../store/hooks';
import { upsertReceipts } from '../store/round-slice/round-api-actions';

export default function useUpsertReceipts() {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable } = useToken();

  const [loading, setLoading] = useState<boolean>(isInternetReachable && credentialsAvailable);
  const [upsertReceiptSuccess, setUpsertReceiptSuccess] = useState<string>('');
  const [upsertReceiptError, setUpsertReceiptError] = useState<string>('');

  useEffect(() => {
    const dispatchReceipts = async () => {
      setLoading(true);
      try {
        await dispatch(upsertReceipts({ deviceId, token }));
        setUpsertReceiptError('');
        setUpsertReceiptSuccess('Számla beküldése sikeres.');
      } catch (err) {
        setUpsertReceiptSuccess('');
        setUpsertReceiptError(err.message);
      }
      setLoading(false);
    };

    if (isInternetReachable && credentialsAvailable) {
      dispatchReceipts();
    }
  }, [credentialsAvailable, deviceId, dispatch, isInternetReachable, token]);

  return {
    loading,
    upsertReceiptSuccess,
    upsertReceiptError,
  };
}
