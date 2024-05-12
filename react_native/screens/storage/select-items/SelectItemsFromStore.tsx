import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isNil } from 'ramda';
import { Suspense, useEffect } from 'react';
import {
  Animated,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { type StorageListItem } from '../../../atoms/storageFlow';
import { Alert } from '../../../components/alert/Alert';
import { Container } from '../../../components/container/Container';
import { Loading } from '../../../components/Loading';
import { Input } from '../../../components/ui/Input';
import { ForwardIcon } from '../../../navigators/ForwardIcon';
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
    searchTerm,
    setSearchTerm,
    itemsToShow,
    isAnyItemChanged,
    setCurrentQuantity,
    alert,
  } = useSelectItemsFromStoreData(navigation);

  useEffect(() => {
    if (isAnyItemChanged) {
      navigation.setOptions({
        headerRight() {
          return (
            <ForwardIcon
              onPress={() => {
                navigation.navigate('ReviewStorageChanges');
              }}
            />
          );
        },
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [isAnyItemChanged, navigation]);

  useEffect(() => {
    if (!isNil(scannedBarCode) && searchTerm !== scannedBarCode) {
      setSearchTerm(scannedBarCode);
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [navigation, scannedBarCode, searchTerm, setSearchTerm]);

  const renderItem: ListRenderItem<StorageListItem> = (info) => (
    <ExpirationAccordionDetails
      item={info.item}
      setCurrentQuantity={setCurrentQuantity}
    />
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
          <Input
            label=""
            labelPosition="left"
            value={searchTerm}
            config={{
              onChangeText: setSearchTerm,
            }}
          />
          <Pressable
            onPress={() => {
              navigation.navigate('ScanBarCodeInStorage');
            }}
          >
            <MaterialCommunityIcons name="barcode" size={40} color="white" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={itemsToShow}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
      <Alert
        visible={alert.isAlertVisible}
        title="Megerősítés szükséges"
        message="Biztosan ki szeretne lépni? A nem mentett rakodási adatok elvesznek!"
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: alert.resetAlertHandler,
          },
          confirm: {
            text: 'Igen',
            variant: 'warning',
            onPress: alert.exitConfimationHandler,
          },
        }}
        onBackdropPress={alert.resetAlertHandler}
      />
    </Container>
  );
}

export function SelectItemsFromStore(props: SelectItemsFromStoreProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectItemsFromStore {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
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
