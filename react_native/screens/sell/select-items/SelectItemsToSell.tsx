import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventArg, useFocusEffect } from '@react-navigation/native';
import {
  __,
  all,
  any,
  anyPass,
  dissoc,
  equals,
  gte,
  isEmpty,
  isNil,
  not,
  pipe,
  prop,
  values,
} from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Animated, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';

import Loading from '../../../components/Loading';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import { SelectItemsToSellProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import { SellItem } from '../../../providers/sell-flow-hooks/useSelectItems';
import calculateAmounts from '../../../utils/calculateAmounts';
import formatPrice from '../../../utils/formatPrice';
import SelectItem, { ItemAvailability } from './SelectItem';

const NUM_ITEMS_SHOWN = 10;

export default function SelectItemsToSell({ navigation, route }: SelectItemsToSellProps) {
  const scannedBarCode = route.params?.scannedBarCode;

  const {
    isPending: isContextPending,
    items,
    selectedItems,
    setSelectedItems,
    selectedOrderItems,
    setSelectedOrderItems,
    searchTerm,
    setSearchTerm,
    barCode,
    setBarCode,
    saveSelectedItemsInFlow,
    resetSellFlowContext,
  } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [netTotal, grossTotal] = useMemo(
    () =>
      Object.entries(selectedItems).reduce(
        (prev, curr) => {
          const [prevNetAmount, prevGrossAmount] = prev;
          const [itemId, expirations] = curr;

          const currentItem = items?.find((item) => item.id === +itemId);

          if (!currentItem) {
            return prev;
          }

          const { netPrice, vatRate } = currentItem;

          const [expirationsNetAmount, expirationsGrossAmount] = Object.values(expirations)
            .map((expirationQuantity) => {
              const { netAmount, grossAmount } = calculateAmounts({
                netPrice,
                quantity: expirationQuantity,
                vatRate,
              });

              return [netAmount, grossAmount];
            })
            .reduce(([pn, pg], [cn, cg]) => [pn + cn, pg + cg], [0, 0]);

          return [prevNetAmount + expirationsNetAmount, prevGrossAmount + expirationsGrossAmount];
        },
        [0, 0]
      ),
    [items, selectedItems]
  );

  const [netOrderTotal, grossOrderTotal] = useMemo(
    () =>
      Object.entries(selectedOrderItems).reduce(
        (prev, curr) => {
          const [prevNetOrderAmount, prevGrossOrderAmount] = prev;
          const [itemId, orderQuantity] = curr;

          const currentItem = items?.find((item) => item.id === +itemId);

          if (!currentItem) {
            return prev;
          }

          const { netPrice, vatRate } = currentItem;
          const { netAmount, grossAmount } = calculateAmounts({
            netPrice,
            quantity: orderQuantity,
            vatRate,
          });

          return [prevNetOrderAmount + netAmount, prevGrossOrderAmount + grossAmount];
        },
        [0, 0]
      ),
    [items, selectedOrderItems]
  );

  const upsertSelectedItem = useCallback(
    (id: number, expirationId: number, quantity: number | null) => {
      const newQuantity = quantity ?? undefined;

      setSelectedItems((currentItems) => {
        const itemsWithNewQuantity = {
          ...currentItems,
          [id]: {
            ...(currentItems[id] ?? {}),
            [expirationId]: newQuantity,
          },
        };

        const areAllQuantitiesZero = pipe(
          values,
          all(anyPass([equals(0), isNil]))
        )(itemsWithNewQuantity[id]);

        if (areAllQuantitiesZero) {
          return dissoc(id, itemsWithNewQuantity);
        }

        return itemsWithNewQuantity;
      });
    },
    [setSelectedItems]
  );

  const upsertOrderItem = useCallback(
    (id: number, quantity: number) => {
      if (!quantity) {
        setSelectedOrderItems(dissoc(String(id)));
      } else {
        setSelectedOrderItems((prevItems) => ({ ...prevItems, [id]: quantity }));
      }
    },
    [setSelectedOrderItems]
  );

  useEffect(() => {
    if (!isNil(scannedBarCode) && barCode !== scannedBarCode) {
      setBarCode(scannedBarCode);
      navigation.setParams({ scannedBarCode: undefined });
    }
  }, [barCode, navigation, scannedBarCode, setBarCode]);

  const exitConfimationHandler = useCallback(
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

      Alert.alert(
        'Megerősítés szükséges',
        'Biztosan ki szeretne lépni? A folyamat a partnerválasztástól indul újra!',
        [
          { text: 'Mégsem' },
          {
            text: 'Igen',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              await resetSellFlowContext();
              setIsLoading(false);
              navigation.dispatch(event.data.action);
            },
          },
        ]
      );
    },
    [navigation, resetSellFlowContext]
  );

  useFocusEffect(() => {
    navigation.addListener('beforeRemove', exitConfimationHandler);
  });

  const canConfirmItems = not(isEmpty(selectedItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);
      await saveSelectedItemsInFlow();
      setIsLoading(false);
      navigation.removeListener('beforeRemove', exitConfimationHandler);
      navigation.navigate('Review');
    }
  }, [canConfirmItems, exitConfimationHandler, navigation, saveSelectedItemsInFlow]);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<SellItem>) => {
      let type: ItemAvailability;
      if (!!selectedItems[info.item.id] || !!selectedOrderItems[info.item.id]) {
        type = ItemAvailability.IN_RECEIPT;
      } else if (
        any(pipe(prop('quantity'), gte(__, 0)), pipe(prop('expirations'), values)(info.item))
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
          upsertSelectedItem={upsertSelectedItem}
          upsertOrderItem={upsertOrderItem}
        />
      );
    },
    [selectedItems, selectedOrderItems, upsertOrderItem, upsertSelectedItem]
  );

  if (isContextPending || isLoading) {
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
          data={items.slice(0, NUM_ITEMS_SHOWN)}
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
            text={`${formatPrice(netOrderTotal)} / ${formatPrice(grossOrderTotal)}`}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={confirmItemsHandler}>
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
    height: 135,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
    backgroundColor: colors.neutral,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryContainer: {
    marginHorizontal: '7%',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
});
