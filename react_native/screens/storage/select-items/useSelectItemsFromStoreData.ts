import { type EventArg, useFocusEffect } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { filter, isNotNil, pipe, prop, sortBy, when } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDeselectStore } from '../../../api/mutations/useDeselectStore';
import { useItems } from '../../../api/queries/useItems';
import {
  primaryStoreAtom,
  selectedStoreCurrentStateAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import {
  type StorageListItem,
  storageListItemsAtom,
} from '../../../atoms/storageFlow';
import { type StackParams } from '../../../navigators/screen-types';

export function useSelectItemsFromStoreData(
  navigation: NativeStackNavigationProp<
    StackParams,
    'SelectItemsFromStore',
    undefined
  >
) {
  const { data: items, isPending: isItemsPending } = useItems();
  const { mutateAsync: deselectStore, isPending: isDeselectStorePending } =
    useDeselectStore();

  const primaryStoreDetails = useAtomValue(primaryStoreAtom);
  const selectedStoreInitialState = useAtomValue(selectedStoreInitialStateAtom);
  const selectedStoreCurrentState = useAtomValue(selectedStoreCurrentStateAtom);

  const [storageListItems, setStorageListItems] = useAtom(storageListItemsAtom);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isGoBackAlertVisible, setIsGoBackAlertVisible] =
    useState<boolean>(false);
  const [isCancelStorageAlertVisible, setIsCancelStorageAlertVisible] =
    useState<boolean>(false);

  const isAnyItemChanged = useMemo(
    () => storageListItems?.some((item) => isNotNil(item.quantityChange)),
    [storageListItems]
  );

  const backButtonHandler = useCallback(
    (
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

      if (isAnyItemChanged) {
        setIsGoBackAlertVisible(true);
      } else {
        navigation.removeListener('beforeRemove', backButtonHandler);

        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      }
    },
    [isAnyItemChanged, navigation]
  );

  const resetGoBackAlertHandler = useCallback(() => {
    setIsGoBackAlertVisible(false);
  }, []);

  const resetCancelStorageAlertHandler = useCallback(() => {
    setIsCancelStorageAlertVisible(false);
  }, []);

  const exitConfimationHandler = useCallback(() => {
    navigation.removeListener('beforeRemove', backButtonHandler);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  }, [backButtonHandler, navigation]);

  const showCancelStorageAlertHandler = useCallback(() => {
    setIsCancelStorageAlertVisible(true);
  }, []);

  const cancelStorageHandler = useCallback(async () => {
    await deselectStore();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  }, [deselectStore, navigation]);

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', backButtonHandler);

      return () => {
        navigation.removeListener('beforeRemove', backButtonHandler);
      };
    }, [backButtonHandler, navigation])
  );

  useEffect(() => {
    setStorageListItems(
      (items ?? []).flatMap<StorageListItem>((item) =>
        item.expirations.map((expiration) => ({
          itemId: item.id,
          expirationId: expiration.id,
          articleNumber: item.articleNumber,
          name: item.name,
          expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
          itemBarcode: item.barcode ?? '',
          expirationBarcode: expiration.barcode ?? '',
          unitName: item.unitName,
          primaryStoreQuantity: primaryStoreDetails?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
          originalQuantity: selectedStoreInitialState?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
          quantityChange: undefined,
        }))
      )
    );
  }, [
    items,
    primaryStoreDetails?.expirations,
    selectedStoreCurrentState?.expirations,
    selectedStoreInitialState?.expirations,
    setStorageListItems,
  ]);

  const itemsToShow = useMemo(
    () =>
      pipe(
        when(
          () => !!searchTerm,
          filter<StorageListItem>(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.expiresAt.startsWith(searchTerm) ||
              item.itemBarcode.startsWith(searchTerm) ||
              item.expirationBarcode.startsWith(searchTerm)
          )
        ),
        sortBy<StorageListItem>(prop('name'))
      )(storageListItems ?? []),
    [searchTerm, storageListItems]
  );

  const setCurrentQuantity = useCallback(
    (itemToSet: StorageListItem, totalChangedQuantity: number | null) => {
      setStorageListItems((prevItems) => {
        if (!prevItems) {
          return prevItems;
        }

        return prevItems.map((item) =>
          item.itemId === itemToSet.itemId &&
          item.expirationId === itemToSet.expirationId
            ? {
                ...item,
                quantityChange: totalChangedQuantity ?? undefined,
              }
            : item
        );
      });
    },
    [setStorageListItems]
  );

  return {
    isLoading: isItemsPending || isDeselectStorePending,
    searchTerm,
    setSearchTerm,
    itemsToShow,
    isAnyItemChanged,
    setCurrentQuantity,
    showCancelStorageAlertHandler,
    goBackAlert: {
      isAlertVisible: isGoBackAlertVisible,
      resetAlertHandler: resetGoBackAlertHandler,
      confirmationHandler: exitConfimationHandler,
    },
    cancelStorageAlert: {
      isAlertVisible: isCancelStorageAlertVisible,
      resetAlertHandler: resetCancelStorageAlertHandler,
      confirmationHandler: cancelStorageHandler,
    },
  };
}
