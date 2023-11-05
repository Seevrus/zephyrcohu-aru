import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isNil } from 'ramda';
import { Suspense, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { type StorageListItem } from '../../../atoms/storageFlow';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectItemsFromStoreProps } from '../../../navigators/screen-types';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';
import { useSelectItemsFromStoreData } from './useSelectItemsFromStoreData';

const keyExtractor = (item: StorageListItem) => String(item.expirationId);

function SuspendedSelectItemsFromStore({
  navigation,
  route,
}: SelectItemsFromStoreProps) {
  const scannedBarCode = route.params?.scannedBarCode;

  const {
    isLoading,
    searchState,
    setSearchState,
    itemsToShow,
    isAnyItemChanged,
    setCurrentQuantity,
  } = useSelectItemsFromStoreData();

  useEffect(() => {
    if (!isNil(scannedBarCode) && searchState.barCode !== scannedBarCode) {
      setSearchState({ searchTerm: '', barCode: scannedBarCode });
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [navigation, scannedBarCode, searchState.barCode, setSearchState]);

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

  if (isLoading) {
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
