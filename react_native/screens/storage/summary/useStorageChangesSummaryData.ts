import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';

import { useDeselectStore } from '../../../api/mutations/useDeselectStore';
import { useCheckToken } from '../../../api/queries/useCheckToken';
import { selectedStoreInitialStateAtom } from '../../../atoms/storage';
import { storageListItemsAtom } from '../../../atoms/storageFlow';
import { useResetStorage } from '../../../atoms/useResetStorage';
import { useResetStorageFlow } from '../../../atoms/useResetStorageFlow';
import { type StackParams } from '../../../navigators/screen-types';
import { createPrint } from './createPrint';

export function useStorageChangesSummaryData(
  navigation: NativeStackNavigationProp<
    StackParams,
    'StorageChangesSummary',
    undefined
  >
) {
  const { data: user, isPending: isUserPending } = useCheckToken();

  const { mutateAsync: deselectStore } = useDeselectStore();

  const resetStorage = useResetStorage();
  const resetStorageFlow = useResetStorageFlow();

  const selectedStoreInitialState = useAtomValue(selectedStoreInitialStateAtom);
  const storageListItems = useAtomValue(storageListItemsAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isPrintEnabled = !!user && !!selectedStoreInitialState;

  const receiptItems = useMemo(
    () =>
      (storageListItems ?? []).filter(
        (item) => !!item.originalQuantity || !!item.currentQuantity
      ),
    [storageListItems]
  );

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createPrint({
        receiptItems,
        storeDetails: selectedStoreInitialState,
        user,
      }),
    });
  };

  const returnButtonHandler = async () => {
    setIsLoading(true);
    await deselectStore();

    await resetStorage();
    resetStorageFlow();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  };

  return {
    isLoading: isUserPending || isLoading,
    isPrintEnabled,
    printButtonHandler,
    returnButtonHandler,
  };
}
