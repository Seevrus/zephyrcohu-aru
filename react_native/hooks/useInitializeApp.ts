import { useNetInfo } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';
import { useEffect } from 'react';

import { queryKeys } from '../api/keys';
import { useCheckToken } from '../api/queries/useCheckToken';
import { useItems } from '../api/queries/useItems';
import { useOtherItems } from '../api/queries/useOtherItems';
import { usePartnerLists } from '../api/queries/usePartnerLists';
import { usePartners } from '../api/queries/usePartners';
import { usePriceLists } from '../api/queries/usePriceLists';
import { useStoreDetails } from '../api/queries/useStoreDetails';
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
    data: items,
    isLoading: isItemsLoading,
    isPending: isItemsPending,
  } = useItems();

  const {
    data: otherItems,
    isLoading: isOtherItemsLoading,
    isPending: isOtherItemsPending,
  } = useOtherItems();

  const {
    data: partnerLists,
    isLoading: isPartnerListsLoading,
    isPending: isPartnerListsPending,
  } = usePartnerLists();

  const {
    data: partners,
    isLoading: isPartnersLoading,
    isPending: isPartnersPending,
  } = usePartners();

  const {
    data: priceLists,
    isLoading: isPriceListsLoading,
    isPending: isPriceListsPending,
  } = usePriceLists();

  const {
    data: stores,
    isLoading: isStoresLoading,
    isPending: isStoresPending,
  } = useStores();

  const {
    data: storeDetails,
    isLoading: isStoreDetailsLoading,
    isPending: isStoreDetailsPending,
  } = useStoreDetails(user?.storeId);

  const { token, isPasswordExpired } = useAtomValue(tokenAtom);

  useEffect(() => {
    if (
      !user &&
      isInternetReachable === true &&
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
      isInternetReachable === true &&
      !!token &&
      !isPasswordExpired
    ) {
      if (!items && !isItemsLoading && !isItemsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.items });
      }

      if (!stores && !isStoresLoading && !isStoresPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stores });
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

  useEffect(() => {
    if (
      user?.state === 'R' &&
      isInternetReachable === true &&
      !!token &&
      !isPasswordExpired
    ) {
      if (!items && !isItemsLoading && !isItemsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.items });
      }

      if (!otherItems && !isOtherItemsLoading && !isOtherItemsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.otherItems });
      }

      if (!partnerLists && !isPartnerListsLoading && !isPartnerListsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.partnerLists });
      }

      if (!partners && !isPartnersLoading && !isPartnersPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.partners });
      }

      if (!priceLists && !isPriceListsLoading && !isPriceListsPending) {
        queryClient.invalidateQueries({ queryKey: queryKeys.priceLists });
      }

      if (
        !storeDetails &&
        isNotNil(user?.storeId) &&
        !isStoreDetailsLoading &&
        !isStoreDetailsPending
      ) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.storeDetails(user.storeId),
        });
      }
    }
  }, [
    isInternetReachable,
    isItemsLoading,
    isItemsPending,
    isOtherItemsLoading,
    isOtherItemsPending,
    isPartnerListsLoading,
    isPartnerListsPending,
    isPartnersLoading,
    isPartnersPending,
    isPasswordExpired,
    isPriceListsLoading,
    isPriceListsPending,
    isStoreDetailsLoading,
    isStoreDetailsPending,
    items,
    otherItems,
    partnerLists,
    partners,
    priceLists,
    queryClient,
    storeDetails,
    token,
    user?.state,
    user?.storeId,
  ]);
}
