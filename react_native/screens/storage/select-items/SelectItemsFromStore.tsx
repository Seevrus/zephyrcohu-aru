import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';

import Loading from '../../../components/Loading';
import BorealBarCodeScanner from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectItemsFromStoreProps } from '../../screen-types';
import ExpirationAccordionDetails from './ExpirationAccordionDetails';
import useSelectItemsFromStore, { ListItem } from './useSelectItemsFromStore';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export default function SelectItemsFromStore({ navigation }: SelectItemsFromStoreProps) {
  const {
    isLoading,
    items = [],
    setCurrentQuantity,
    searchTerm,
    setSearchTerm,
    setBarCode,
  } = useSelectItemsFromStore();

  const [showScanner, setShowScanner] = useState<boolean>(false);

  if (isLoading) {
    return <Loading />;
  }

  const handleScannedBarCode = (barCode: string) => {
    setBarCode(barCode);
    setShowScanner(false);
  };

  if (showScanner) {
    return <BorealBarCodeScanner onCodeScanned={handleScannedBarCode} />;
  }

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ExpirationAccordionDetails item={info.item} setCurrentQuantity={setCurrentQuantity} />
  );

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
          <Pressable
            style={styles.barCodeContainer}
            onPress={() => {
              setShowScanner(true);
            }}
          >
            <FontAwesome5 name="barcode" size={40} color="white" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList data={items} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="disabled" onPress={() => undefined}>
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
  barCodeContainer: {
    marginLeft: 20,
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
