import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { filter, isNil, pipe, prop, sortBy, take, when } from 'ramda';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { useItems } from '../../../api/queries/useItems';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import {
  storageListItemsAtom,
  type StorageListItem,
} from '../../../atoms/storageFlow';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectItemsFromStoreProps } from '../../../navigators/screen-types';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';

const keyExtractor = (item: StorageListItem) => String(item.expirationId);

function SuspendedSelectItemsFromStore({
  navigation,
  route,
}: SelectItemsFromStoreProps) {
  const scannedBarCode = route.params?.scannedBarCode;
  const { data: items, isPending: isItemsPending } = useItems();

  const [storageListItems, setStorageListItems] = useAtom(storageListItemsAtom);

  const isAnyItemChanged = useMemo(
    () =>
      storageListItems?.some(
        (item) => item.currentQuantity !== item.originalQuantity
      ),
    [storageListItems]
  );

  const primaryStoreDetails = useAtomValue(primaryStoreAtom);
  const selectedStoreInitialState = useAtomValue(selectedStoreInitialStateAtom);
  const selectedStoreDetails = useAtomValue(selectedStoreAtom);

  const [searchState, setSearchState] = useState({
    searchTerm: '',
    barCode: '',
  });

  useEffect(() => {
    if (!isNil(scannedBarCode) && searchState.barCode !== scannedBarCode) {
      setSearchState({ searchTerm: '', barCode: scannedBarCode });
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [navigation, scannedBarCode, searchState.barCode]);

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
          currentQuantity: selectedStoreDetails?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
        }))
      )
    );
  }, [
    items,
    primaryStoreDetails?.expirations,
    selectedStoreDetails?.expirations,
    selectedStoreInitialState?.expirations,
    setStorageListItems,
  ]);

  const itemsToShow = useMemo(
    () =>
      pipe(
        when(
          () => !!searchState.searchTerm || !!searchState.barCode,
          filter<StorageListItem>(
            (item) =>
              `${item.name.toLowerCase()}${item.expiresAt}`.includes(
                searchState.searchTerm.toLowerCase()
              ) &&
              `${item.itemBarcode}${item.expirationBarcode}`.includes(
                searchState.barCode
              )
          )
        ),
        sortBy<StorageListItem>(prop('name')),
        (items) => take(10, items)
      )(storageListItems ?? []),
    [searchState.barCode, searchState.searchTerm, storageListItems]
  );

  const setCurrentQuantity = useCallback(
    (itemToSet: StorageListItem, newCurrentQuantity: number | null) => {
      setStorageListItems(
        (prevItems) =>
          prevItems?.map((item) =>
            item.itemId === itemToSet.itemId &&
            item.expirationId === itemToSet.expirationId
              ? {
                  ...item,
                  primaryStoreQuantity:
                    (item.primaryStoreQuantity ?? 0) -
                    ((newCurrentQuantity ?? 0) - (item.currentQuantity ?? 0)),
                  currentQuantity: newCurrentQuantity ?? undefined,
                }
              : item
          )
      );
    },
    [setStorageListItems]
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
          data={itemsToShow}
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
