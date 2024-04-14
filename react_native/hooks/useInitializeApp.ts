import { useNetInfo } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { queryKeys } from '../api/keys';
import { useCheckToken } from '../api/queries/useCheckToken';
import { useItems } from '../api/queries/useItems';
import { useStores } from '../api/queries/useStores';
import { tokenAtom } from '../atoms/token';

export function useInitializeApp() {
  const { isInternetReachable } = useNetInfo();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    isPending: isUserPending,
  } = useCheckToken();

  const {
    data: stores,
    isLoading: isStoresLoading,
    isPending: isStoresPending,
  } = useStores();

  const {
    data: items,
    isLoading: isItemsLoading,
    isPending: isItemsPending,
  } = useItems();

  const { token, isPasswordExpired } = useAtomValue(tokenAtom);

  useEffect(() => {
    if (
      !user &&
      isInternetReachable &&
      !!token &&
      !isPasswordExpired &&
      !isUserLoading &&
      !isUserPending
    ) {
      queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    }
  }, [
    isInternetReachable,
    isPasswordExpired,
    isUserLoading,
    isUserPending,
    queryClient,
    token,
    user,
  ]);

  useEffect(() => {
    if (
      user?.state === 'L' &&
      isInternetReachable &&
      !!token &&
      !isPasswordExpired
    ) {
      if (!stores && !isStoresLoading && !isStoresPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stores });
      }

      if (!items && !isItemsLoading && !isItemsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.items });
      }
    }
  }, [
    isInternetReachable,
    isItemsLoading,
    isItemsPending,
    isPasswordExpired,
    isStoresLoading,
    isStoresPending,
    items,
    queryClient,
    stores,
    token,
    user?.state,
  ]);

  // Kör közbeni refetch
}
