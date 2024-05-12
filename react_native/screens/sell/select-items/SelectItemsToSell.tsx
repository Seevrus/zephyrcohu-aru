import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { isNil } from 'ramda';
import { Suspense, useCallback, useEffect } from 'react';
import {
  Animated,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { selectedItemsAtom } from '../../../atoms/sellFlow';
import { Alert } from '../../../components/alert/Alert';
import { Container } from '../../../components/container/Container';
import { Loading } from '../../../components/Loading';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { ForwardIcon } from '../../../navigators/ForwardIcon';
import { type SelectItemsToSellProps } from '../../../navigators/screen-types';
import { formatPrice } from '../../../utils/formatPrice';
import { ItemAvailability, SelectItem } from './SelectItem';
import {
  type SellItem,
  useSelectItemsToSellData,
} from './useSelectItemsToSellData';

function SuspendedSelectItemsToSell({
  navigation,
  route,
}: SelectItemsToSellProps) {
  const scannedBarCode = route.params?.scannedBarCode;

  const selectedItems = useAtomValue(selectedItemsAtom);

  const {
    isLoading,
    selectedOrderItems,
    searchState,
    setSearchState,
    items,
    upsertSelectedItem,
    upsertOrderItem,
    netTotal,
    grossTotal,
    netOrderTotal,
    grossOrderTotal,
    canConfirmItems,
    confirmItemsHandler,
    alert,
  } = useSelectItemsToSellData(navigation);

  useEffect(() => {
    if (!isNil(scannedBarCode) && searchState.barCode !== scannedBarCode) {
      setSearchState({ searchTerm: '', barCode: scannedBarCode });
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [navigation, scannedBarCode, searchState.barCode, setSearchState]);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<SellItem>) => {
      let type: ItemAvailability;
      if (!!selectedItems[info.item.id] || !!selectedOrderItems[info.item.id]) {
        type = ItemAvailability.IN_RECEIPT;
      } else if (
        Object.values(info.item.expirations).some(
          (expiration) => (expiration.quantity ?? 0) > 0
        )
      ) {
        type = ItemAvailability.AVAILABLE;
      } else {
        type = ItemAvailability.ONLY_ORDER;
      }

      return (
        <SelectItem
          info={info}
          type={type}
          selectedItems={selectedItems}
          selectedOrderItems={selectedOrderItems}
          upsertSelectedItem={upsertSelectedItem}
          upsertOrderItem={upsertOrderItem}
        />
      );
    },
    [selectedItems, selectedOrderItems, upsertOrderItem, upsertSelectedItem]
  );

  useEffect(() => {
    if (canConfirmItems) {
      navigation.setOptions({
        headerRight() {
          return <ForwardIcon onPress={confirmItemsHandler} />;
        },
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [canConfirmItems, confirmItemsHandler, navigation]);

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
            value={searchState.searchTerm}
            config={{
              onChangeText: (text: string) =>
                setSearchState({ searchTerm: text, barCode: '' }),
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
                navigation.navigate('ScanBarCodeInSell');
              }}
            >
              <MaterialCommunityIcons name="barcode" size={40} color="white" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.summaryContainer}>
          <LabeledItem
            label="Vásárlás"
            text={`${formatPrice(netTotal)} / ${formatPrice(grossTotal)}`}
          />
          <LabeledItem
            label="Rendelés"
            text={`${formatPrice(netOrderTotal)} / ${formatPrice(
              grossOrderTotal
            )}`}
          />
        </View>
      </View>
      <Alert
        visible={alert.isAlertVisible}
        title={alert.alertTitle}
        message={alert.alertMessage}
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: alert.resetAlertHandler,
          },
          confirm: alert.alertConfirmButton,
        }}
        onBackdropPress={alert.resetAlertHandler}
      />
    </Container>
  );
}

export function SelectItemsToSell(props: SelectItemsToSellProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectItemsToSell {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: colors.neutral,
    borderTopColor: colors.white,
    borderTopWidth: 2,
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
  summaryContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginHorizontal: '7%',
  },
});
