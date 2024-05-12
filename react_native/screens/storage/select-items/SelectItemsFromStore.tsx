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
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
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
    showCancelStorageAlertHandler,
    goBackAlert,
    cancelStorageAlert,
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
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="warning" onPress={showCancelStorageAlertHandler}>
            Rakodás elvetése
          </Button>
        </View>
      </View>
      <Alert
        visible={goBackAlert.isAlertVisible}
        title="Megerősítés szükséges"
        message="Biztosan ki szeretne lépni? A nem mentett rakodási adatok elvesznek!"
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: goBackAlert.resetAlertHandler,
          },
          confirm: {
            text: 'Igen',
            variant: 'warning',
            onPress: goBackAlert.confirmationHandler,
          },
        }}
        onBackdropPress={goBackAlert.resetAlertHandler}
      />
      <Alert
        visible={cancelStorageAlert.isAlertVisible}
        title="Megerősítés szükséges"
        message="Ezzel a lépéssel befejeződik a rakodási folyamat a képernyőn elvégzett módosítások mentése nélkül."
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: cancelStorageAlert.resetAlertHandler,
          },
          confirm: {
            text: 'Igen',
            variant: 'warning',
            onPress: cancelStorageAlert.confirmationHandler,
          },
        }}
        onBackdropPress={cancelStorageAlert.resetAlertHandler}
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
  buttonContainer: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: '10%',
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
