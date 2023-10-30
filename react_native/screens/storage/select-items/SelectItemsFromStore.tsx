import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectItemsFromStoreProps } from '../../../navigators/screen-types';
import {
  useStorageFlowContext,
  type ListItem,
} from '../../../providers/StorageFlowProvider';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export function SelectItemsFromStore({
  navigation,
  route,
}: SelectItemsFromStoreProps) {
  const scannedBarCode = route.params?.scannedBarCode;

  const {
    isPending,
    items,
    setCurrentQuantity,
    searchTerm,
    setSearchTerm,
    barCode,
    setBarCode,
  } = useStorageFlowContext();

  const isAnyItemChanged = useMemo(
    () => items?.some((item) => item.currentQuantity !== item.originalQuantity),
    [items]
  );

  useEffect(() => {
    if (!isNil(scannedBarCode) && barCode !== scannedBarCode) {
      setBarCode(scannedBarCode);
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [barCode, navigation, scannedBarCode, setBarCode]);

  if (isPending) {
    return <Loading />;
  }

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ExpirationAccordionDetails
      item={info.item}
      setCurrentQuantity={setCurrentQuantity}
    />
  );

  const sendButtonVariant = isAnyItemChanged ? 'ok' : 'disabled';

  const handleReviewChanges = () => {
    navigation.navigate('ReviewStorageChanges');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
          <Input
            label=""
            labelPosition="left"
            value={searchTerm}
            config={{ onChangeText: setSearchTerm }}
          />
          {barCode ? (
            <Pressable
              onPress={() => {
                setBarCode('');
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
          data={(items ?? []).slice(0, 10)}
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
