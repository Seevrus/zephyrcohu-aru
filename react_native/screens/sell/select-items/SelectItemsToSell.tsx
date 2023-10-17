import { EventArg } from '@react-navigation/native';
import {
  __,
  all,
  any,
  assocPath,
  defaultTo,
  dissoc,
  filter,
  gte,
  includes,
  isEmpty,
  isNil,
  not,
  pipe,
  prop,
  propSatisfies,
  take,
  toLower,
  values,
} from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Animated, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import Loading from '../../../components/Loading';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { SelectItemsToSellProps } from '../../../navigators/screen-types';
import { useReceiptsContext } from '../../../providers/ReceiptsProvider';
import { SellItem, SellItems, useSellFlowContext } from '../../../providers/SellFlowProvider';
import SelectItem, { ItemAvailability } from './SelectItem';

const NUM_ITEMS_SHOWN = 10;

export default function SelectItemsToSell({ navigation }: SelectItemsToSellProps) {
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

  const { resetCurrentReceipt } = useReceiptsContext();
  const { isLoading, items } = useSellFlowContext();

  const [itemsShown, setItemsShown] = useState<SellItems>(take(NUM_ITEMS_SHOWN, items));

  const [selectedItems, setSelectedItems] = useState<Record<number, Record<number, number>>>({});
  const [selectedOrderItems, setSelectedOrderItems] = useState<Record<number, number>>({});

  const [netTotal, grossTotal] = useMemo(
    () =>
      Object.entries(selectedItems).reduce(
        (prev, curr) => {
          const [prevNetAmount, prevGrossAmount] = prev;
          const [itemId, expirations] = curr;

          const currentQuantity = Object.values(expirations).reduce(
            (accumulatedQuantity, expirationQuantity) => accumulatedQuantity + expirationQuantity,
            0
          );

          const currentItem = items.find((item) => item.id === +itemId);
          const { netPrice, vatRate } = currentItem;
          const netAmount = netPrice * currentQuantity;
          const vatRateNumeric = defaultTo(0, +vatRate);
          const vatAmount = Math.round(netAmount * (vatRateNumeric / 100));

          return [prevNetAmount + netAmount, prevGrossAmount + netAmount + vatAmount];
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

          const currentItem = items.find((item) => item.id === +itemId);
          const { netPrice, vatRate } = currentItem;
          const netAmount = netPrice * orderQuantity;
          const vatRateNumeric = defaultTo(0, +vatRate);
          const vatAmount = Math.round(netAmount * (vatRateNumeric / 100));

          return [prevNetOrderAmount + netAmount, prevGrossOrderAmount + netAmount + vatAmount];
        },
        [0, 0]
      ),
    [items, selectedOrderItems]
  );

  const upsertSelectedItem = useCallback((id: number, expirationId: number, quantity: number) => {
    if (!quantity) {
      setSelectedItems((currentItems) => {
        const itemsWithNewQuantity = assocPath([id, expirationId], quantity, currentItems);

        const areAllQuantitiesZero = pipe(
          values,
          all(propSatisfies(isNil, 'quantity'))
        )(itemsWithNewQuantity[id]);

        if (areAllQuantitiesZero) {
          return dissoc(id, currentItems);
        }

        return itemsWithNewQuantity;
      });
    } else {
      setSelectedItems(assocPath([id, expirationId], quantity));
    }
  }, []);

  const upsertOrderItem = useCallback((id: number, quantity: number) => {
    if (!quantity) {
      setSelectedOrderItems(dissoc(String(id)));
    } else {
      setSelectedOrderItems((prevItems) => ({ ...prevItems, [id]: quantity }));
    }
  }, []);

  const searchInputHandler = (inputValue: string) => {
    setItemsShown(
      pipe(
        filter<SellItem>(pipe(prop('name'), toLower, includes(inputValue.toLowerCase()))),
        (filteredItems: SellItems) => take(NUM_ITEMS_SHOWN, filteredItems)
      )(items)
    );
  };

  useEffect(() => {
    const listener = (
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
              await resetCurrentReceipt();
              navigation.dispatch(event.data.action);
            },
          },
        ]
      );
    };

    navigation.addListener('beforeRemove', listener);

    return () => {
      navigation.removeListener('beforeRemove', listener);
    };
  }, [navigation, resetCurrentReceipt]);

  const canConfirmItems = not(isEmpty(selectedItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  // const confirmItemsHandler = () => {
  //   if (canConfirmItems) {
  //     dispatch(roundActions.putItems(selectedItems));
  //     dispatch(roundActions.putOrderItems(selectedOrderItems));
  //     navigation.removeListener('beforeRemove', customBackHandler);
  //     navigation.navigate('Review');
  //   }
  // };

  const renderItem = (info: ListRenderItemInfo<SellItem>) => {
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
        upsertSelectedItem={upsertSelectedItem}
        upsertOrderItem={upsertOrderItem}
      />
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            label="Keresés"
            labelPosition="left"
            config={{ onChangeText: searchInputHandler }}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={itemsShown}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summary}>
            Vásárlás: {formatPrice(netTotal)} / {formatPrice(grossTotal)}
          </Text>
          <Text style={styles.summary}>
            Rendelés: {formatPrice(netOrderTotal)} / {formatPrice(grossOrderTotal)}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={() => {}}>
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
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 150,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryContainer: {
    marginHorizontal: '7%',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  summary: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
});
