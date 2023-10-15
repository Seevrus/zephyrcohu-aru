import {
  all,
  any,
  assoc,
  assocPath,
  dissoc,
  filter,
  gt,
  includes,
  isEmpty,
  isNil,
  not,
  pathOr,
  pipe,
  prop,
  propSatisfies,
  take,
  toLower,
  values,
  __,
} from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, BackHandler, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { EventArg, useFocusEffect } from '@react-navigation/native';
import useItems from '../../../hooks/useItems';
import usePriceList from '../../../hooks/usePriceList';
import useStoreItems from '../../../hooks/useStoreItems';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectItemsToSellProps } from '../../../navigators/screen-types';
import SelectItem, { ItemAvailability } from './SelectItem';
import { useReceiptsContext } from '../../../providers/ReceiptsProvider';

// const keyExtractor = (item: Item) => String(item.id);
// const NUM_ITEMS_SHOWN = 10;

export default function SelectItemsToSell({ navigation }: SelectItemsToSellProps) {
  const { resetCurrentReceipt } = useReceiptsContext();

  // const storeItems = useStoreItems();
  // const priceList = usePriceList();
  // const items = useItems(priceList);

  // const [itemsShown, setItemsShown] = useState<Item[]>(take<Item>(NUM_ITEMS_SHOWN, items));

  // const [selectedItems, setSelectedItems] = useState<ReceiptItem>({});
  // const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem>({});

  // const upsertSelectedItem = useCallback(
  //   (id: string, name: string, expiresAt: string, quantity: number) => {
  //     if (!quantity) {
  //       setSelectedItems((currentItems) => {
  //         const itemsWithNewQuantity = assocPath([id, expiresAt], { name, quantity }, currentItems);

  //         const areAllQuantitiesZero = pipe(
  //           values,
  //           all(propSatisfies(isNil, 'quantity'))
  //         )(itemsWithNewQuantity[id]);

  //         if (areAllQuantitiesZero) {
  //           return dissoc(id, currentItems);
  //         }

  //         return itemsWithNewQuantity;
  //       });
  //     } else {
  //       setSelectedItems(assocPath([id, expiresAt], { name, quantity }));
  //     }
  //   },
  //   []
  // );

  // const upsertOrderItem = useCallback((id: string, name: string, quantity: number) => {
  //   if (!quantity) {
  //     setSelectedOrderItems(dissoc(id));
  //   } else {
  //     setSelectedOrderItems(assoc(id, { name, quantity }));
  //   }
  // }, []);

  // const searchInputHandler = (inputValue: string) => {
  //   setItemsShown(
  //     pipe(
  //       filter(pipe(prop('name'), toLower, includes(inputValue.toLowerCase()))),
  //       take<Item>(NUM_ITEMS_SHOWN)
  //     )(items)
  //   );
  // };

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

  // const canConfirmItems = not(isEmpty(selectedItems));
  // const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  // const confirmItemsHandler = () => {
  //   if (canConfirmItems) {
  //     dispatch(roundActions.putItems(selectedItems));
  //     dispatch(roundActions.putOrderItems(selectedOrderItems));
  //     navigation.removeListener('beforeRemove', customBackHandler);
  //     navigation.navigate('Review');
  //   }
  // };

  // const renderItem = (info: ListRenderItemInfo<Item>) => {
  //   let type: ItemAvailability;
  //   if (!!selectedItems[info.item.id] || !!selectedOrderItems[info.item.id]) {
  //     type = ItemAvailability.IN_RECEIPT;
  //   } else if (
  //     pipe(
  //       pathOr<Record<string, Expiration>>({}, [info.item.id, 'expirations']),
  //       values,
  //       any(pipe(prop('quantity'), gt(__, 0)))
  //     )(storeItems)
  //   ) {
  //     type = ItemAvailability.AVAILABLE;
  //   } else {
  //     type = ItemAvailability.ONLY_ORDER;
  //   }

  //   return (
  //     <SelectItem
  //       info={info}
  //       type={type}
  //       upsertSelectedItem={upsertSelectedItem}
  //       upsertOrderItem={upsertOrderItem}
  //     />
  //   );
  // };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input label="Keresés" labelPosition="left" config={{ onChangeText: () => {} }} />
        </View>
      </View>
      <View style={styles.listContainer}>
        {/* <Animated.FlatList data={itemsShown} keyExtractor={keyExtractor} renderItem={renderItem} /> */}
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="disabled" onPress={() => {}}>
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
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
});
