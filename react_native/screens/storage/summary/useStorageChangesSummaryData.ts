import { type EventArg, useFocusEffect } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { printAsync } from 'expo-print';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';

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

  const finishStorage = useCallback(async () => {
    setIsLoading(true);
    await deselectStore();

    await resetStorage();
    resetStorageFlow();
  }, [deselectStore, resetStorage, resetStorageFlow]);

  const exitConfirmationHandler = useCallback(
    async (
      event: EventArg<
        'beforeRemove',
        true,
        {
          action: Readonly<{
            type: string;
            payload?: object;
            source?: string;
            target?: string;
          }>;
        }
      >
    ) => {
      event.preventDefault();
      await finishStorage();
      navigation.dispatch(event.data.action);
    },
    [finishStorage, navigation]
  );

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', exitConfirmationHandler);

      return () => {
        navigation.removeListener('beforeRemove', exitConfirmationHandler);
      };
    }, [exitConfirmationHandler, navigation])
  );

  const printButtonHandler = async () => {
    await printAsync({
      html: createPrint({
        receiptItems,
        storeDetails: selectedStoreInitialState,
        user,
      }),
    });
  };

  const returnButtonHandler = async () => {
    await finishStorage();
    navigation.removeListener('beforeRemove', exitConfirmationHandler);

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
