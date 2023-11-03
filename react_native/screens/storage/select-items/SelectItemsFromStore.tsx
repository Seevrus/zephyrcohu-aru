import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai';
import { assocPath, isEmpty, isNil } from 'ramda';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import {
  searchStateAtom,
  storageListItemsAtom,
  type StorageListItem,
  primaryStoreExpirationsAtom,
  originalStorageExpirationsAtom,
  storageExpirationsAtom,
} from '../../../atoms/storageFlow';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectItemsFromStoreProps } from '../../../navigators/screen-types';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';
import { itemsAtom } from '../../../api/queries/itemsAtom';
import { format, parseISO } from 'date-fns';

const keyExtractor = (item: StorageListItem) => String(item.expirationId);

function SuspendedSelectItemsFromStore({
  navigation,
  route,
}: SelectItemsFromStoreProps) {
  const scannedBarCode = route.params?.scannedBarCode;
  const { data: items, isPending: isItemsPending } = useAtomValue(itemsAtom);

  const [storageListItems, setStorageListItems] = useAtom(storageListItemsAtom);
  const [searchState, setSearchState] = useAtom(searchStateAtom);

  const isAnyItemChanged = useMemo(
    () =>
      storageListItems?.some(
        (item) => item.currentQuantity !== item.originalQuantity
      ),
    [storageListItems]
  );

  const primaryStoreDetails = useAtomValue(primaryStoreAtom);
  const [primaryStoreExpirations, setPrimaryStoreExpirations] = useAtom(
    primaryStoreExpirationsAtom
  );

  const selectedStoreOriginalDetails = useAtomValue(
    selectedStoreInitialStateAtom
  );
  const [originalStorageExpirations, setOriginalStorageExpirations] = useAtom(
    originalStorageExpirationsAtom
  );

  const selectedStoreDetails = useAtomValue(selectedStoreAtom);
  const [storageExpirations, setStorageExpirations] = useAtom(
    storageExpirationsAtom
  );

  useEffect(() => {
    if (!isNil(scannedBarCode) && searchState.barCode !== scannedBarCode) {
      setSearchState({ searchTerm: '', barCode: scannedBarCode });
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [navigation, scannedBarCode, searchState.barCode, setSearchState]);

  useEffect(() => {
    setPrimaryStoreExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(primaryStoreDetails))
        return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      primaryStoreDetails.expirations?.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return expirations;
    });
  }, [primaryStoreDetails, setPrimaryStoreExpirations]);

  useEffect(() => {
    setOriginalStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(selectedStoreOriginalDetails))
        return prevExpirations;

      const originalExpirations: Record<number, Record<number, number>> = {};

      selectedStoreOriginalDetails.expirations?.forEach((expiration) => {
        if (!originalExpirations[expiration.itemId]) {
          originalExpirations[expiration.itemId] = {};
        }
        originalExpirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return originalExpirations;
    });
  }, [selectedStoreOriginalDetails, setOriginalStorageExpirations]);

  useEffect(() => {
    setStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(selectedStoreDetails))
        return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      selectedStoreDetails.expirations?.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return expirations;
    });
  }, [selectedStoreDetails, setStorageExpirations]);

  useEffect(() => {
    setStorageListItems(
      (items ?? [])
        .flatMap<StorageListItem>((item) =>
          item.expirations.map((expiration) => ({
            itemId: item.id,
            expirationId: expiration.id,
            articleNumber: item.articleNumber,
            name: item.name,
            expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
            itemBarcode: item.barcode ?? '',
            expirationBarcode: expiration.barcode ?? '',
            unitName: item.unitName,
            primaryStoreQuantity:
              primaryStoreExpirations[item.id]?.[expiration.id],
            originalQuantity:
              originalStorageExpirations[item.id]?.[expiration.id],
            currentQuantity: storageExpirations[item.id]?.[expiration.id],
          }))
        )
        .filter(
          (item) =>
            `${item.name.toLowerCase()}${item.expiresAt}`.includes(
              searchState.searchTerm.toLowerCase()
            ) &&
            `${item.itemBarcode}${item.expirationBarcode}`.includes(
              searchState.barCode
            )
        )
        .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name, 'HU-hu'))
    );
  }, [
    items,
    originalStorageExpirations,
    primaryStoreExpirations,
    searchState.barCode,
    searchState.searchTerm,
    setStorageListItems,
    storageExpirations,
  ]);

  const setCurrentQuantity = useCallback(
    (item: StorageListItem, newCurrentQuantity: number | null) => {
      const currentPrimaryStoreQuantity =
        primaryStoreExpirations[item.itemId]?.[item.expirationId] ?? 0;
      const currentQuantity =
        storageExpirations[item.itemId]?.[item.expirationId] ?? 0;

      const difference = (newCurrentQuantity || 0) - currentQuantity;

      setPrimaryStoreExpirations(
        assocPath(
          [item.itemId, item.expirationId],
          currentPrimaryStoreQuantity - difference
        )
      );

      setStorageExpirations(
        assocPath(
          [item.itemId, item.expirationId],
          currentQuantity + difference
        )
      );
    },
    [
      primaryStoreExpirations,
      setPrimaryStoreExpirations,
      setStorageExpirations,
      storageExpirations,
    ]
  );

  const renderItem = (info: ListRenderItemInfo<StorageListItem>) => (
    <ExpirationAccordionDetails
      item={info.item}
      setCurrentQuantity={setCurrentQuantity}
    />
  );

  const sendButtonVariant = isAnyItemChanged ? 'ok' : 'disabled';

  const handleReviewChanges = () => {
    navigation.navigate('ReviewStorageChanges');
  };

  if (isItemsPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
          <Input
            label=""
            labelPosition="left"
            value={searchState.searchTerm}
            config={{
              onChangeText: (text) => {
                setSearchState({ searchTerm: text, barCode: '' });
              },
            }}
          />
          {searchState.barCode ? (
            <Pressable
              onPress={() => {
                setSearchState((prevState) => ({ ...prevState, barCode: '' }));
              }}
            >
              <MaterialCommunityIcons
                name="barcode-off"
                size={40}
                color="white"
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                navigation.navigate('ScanBarCodeInStorage');
              }}
            >
              <MaterialCommunityIcons name="barcode" size={40} color="white" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={(storageListItems ?? []).slice(0, 10)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant={sendButtonVariant} onPress={handleReviewChanges}>
            Tétellista véglegesítése
          </Button>
        </View>
      </View>
    </View>
  );
}

export function SelectItemsFromStore(props: SelectItemsFromStoreProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedSelectItemsFromStore {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  footerContainer: {
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 70,
    paddingVertical: 10,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
  },
});
