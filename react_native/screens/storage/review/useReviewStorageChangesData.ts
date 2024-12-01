import { useNetInfo } from '@react-native-community/netinfo';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom, useAtomValue } from 'jotai';
import { filter, isNil, isNotNil, pipe, prop, sortBy } from 'ramda';
import { useCallback, useMemo, useState } from 'react';

import { useSaveSelectedItems } from '../../../api/mutations/useSaveSelectedItems';
import { useStores } from '../../../api/queries/useStores';
import {
  isStorageSavedToApiAtom,
  type StorageListItem,
  storageListItemsAtom,
} from '../../../atoms/storageFlow';
import { type StackParams } from '../../../navigators/screen-types';

export function useReviewStorageChangesData(
  navigation: NativeStackNavigationProp<
    StackParams,
    'ReviewStorageChanges',
    undefined
  >
) {
  const { isInternetReachable } = useNetInfo();

  const { data: stores } = useStores();
  const { mutateAsync: saveSelectedItems } = useSaveSelectedItems();

  const [, setIsStorageSavedToApi] = useAtom(isStorageSavedToApiAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const storageListItems = useAtomValue(storageListItemsAtom);

  const changedItems = useMemo(
    () =>
      pipe(
        filter<StorageListItem>(pipe(prop('quantityChange'), isNotNil)),
        sortBy<StorageListItem>(prop('name'))
      )(storageListItems ?? []),
    [storageListItems]
  );

  const changedQuantities = useMemo(
    () =>
      changedItems.reduce(
        (previousQuantities, item) => {
          const quantityChange = item.quantityChange ?? 0;

          if (quantityChange > 0) {
            return {
              up: previousQuantities.up + quantityChange,
              down: previousQuantities.down,
            };
          }

          return {
            up: previousQuantities.up,
            down: previousQuantities.down - quantityChange,
          };
        },
        { up: 0, down: 0 }
      ),
    [changedItems]
  );

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;
  const canConfirmStorageChanges =
    isInternetReachable === true && isNotNil(primaryStoreId);

  const reallyUnexpectedBlocker = isNil(primaryStoreId);

  const handleSendChanges = useCallback(async () => {
    try {
      if (storageListItems) {
        setIsLoading(true);

        if (changedItems.length > 0) {
          await saveSelectedItems(changedItems);
        }

        setIsStorageSavedToApi(true);

        navigation.reset({
          index: 1,
          routes: [{ name: 'Index' }, { name: 'StorageChangesSummary' }],
        });
      }
    } catch {
      setIsLoading(false);
      setIsError(true);
    }
  }, [
    changedItems,
    navigation,
    saveSelectedItems,
    setIsStorageSavedToApi,
    storageListItems,
  ]);

  return {
    isLoading,
    isError,
    changedItems,
    reallyUnexpectedBlocker,
    canConfirmStorageChanges,
    changedQuantities,
    handleSendChanges,
  };
}
