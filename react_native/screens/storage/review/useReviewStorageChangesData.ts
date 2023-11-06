import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';

import { useSaveSelectedItems } from '../../../api/mutations/useSaveSelectedItems';
import {
  isStorageSavedToApiAtom,
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
  const { mutateAsync: saveSelectedItems } = useSaveSelectedItems();

  const [, setIsStorageSavedToApi] = useAtom(isStorageSavedToApiAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const storageListItems = useAtomValue(storageListItemsAtom);

  const changedItems = useMemo(
    () =>
      (storageListItems ?? []).filter(
        (item) => item.currentQuantity !== item.originalQuantity
      ),
    [storageListItems]
  );

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
    handleSendChanges,
  };
}
