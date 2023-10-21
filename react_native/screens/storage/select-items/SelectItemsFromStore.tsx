import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { Animated, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';

import Loading from '../../../components/Loading';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { ListItem, useStorageFlowContext } from '../../../providers/StorageFlowProvider';
import { SelectItemsFromStoreProps } from '../../../navigators/screen-types';
import ExpirationAccordionDetails from './ExpirationAccordionDetails';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export default function SelectItemsFromStore({ navigation, route }: SelectItemsFromStoreProps) {
  const scannedBarCode = route.params?.scannedBarCode;

  const { isLoading, items, setCurrentQuantity, searchTerm, setSearchTerm, barCode, setBarCode } =
    useStorageFlowContext();

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

  if (isLoading) {
    return <Loading />;
  }

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ExpirationAccordionDetails item={info.item} setCurrentQuantity={setCurrentQuantity} />
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
              <MaterialCommunityIcons name="barcode-off" size={40} color="white" />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 70,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
