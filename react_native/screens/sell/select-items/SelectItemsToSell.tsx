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
import { Alert, Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useItems from '../../../hooks/useItems';
import usePriceList from '../../../hooks/usePriceList';
import useStoreItems from '../../../hooks/useStoreItems';

import { useAppDispatch } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { roundActions } from '../../../store/round-slice/round-slice';
import { Item as ReceiptItem, OrderItem } from '../../../store/round-slice/round-slice-types';
import { Expiration } from '../../../store/stores-slice/stores-slice-types';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectItemsToSellProps } from '../../screen-types';
import SelectItem, { ItemAvailability } from './SelectItem';

const keyExtractor = (item: Item) => String(item.id);
const NUM_ITEMS_SHOWN = 10;

export default function SelectItemsToSell({ navigation }: SelectItemsToSellProps) {
  const dispatch = useAppDispatch();

  const storeItems = useStoreItems();
  const priceList = usePriceList();
  const items = useItems(priceList);

  const [itemsShown, setItemsShown] = useState<Item[]>(take<Item>(NUM_ITEMS_SHOWN, items));

  const [selectedItems, setSelectedItems] = useState<ReceiptItem>({});
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem>({});

  const upsertSelectedItem = useCallback(
    (id: string, name: string, expiresAt: string, quantity: number) => {
      if (!quantity) {
        setSelectedItems((currentItems) => {
          const itemsWithNewQuantity = assocPath([id, expiresAt], { name, quantity }, currentItems);

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
        setSelectedItems(assocPath([id, expiresAt], { name, quantity }));
      }
    },
    []
  );

  const upsertOrderItem = useCallback((id: string, name: string, quantity: number) => {
    if (!quantity) {
      setSelectedOrderItems(dissoc(id));
    } else {
      setSelectedOrderItems(assoc(id, { name, quantity }));
    }
  }, []);

  const searchInputHandler = (inputValue: string) => {
    setItemsShown(
      pipe(
        filter(pipe(prop('name'), toLower, includes(inputValue.toLowerCase()))),
        take<Item>(NUM_ITEMS_SHOWN)
      )(items)
    );
  };

  const customBackHandler = useCallback(
    (e) => {
      if (isEmpty(selectedItems)) return;

      e.preventDefault();

      Alert.alert(
        'Tételek törlése',
        'Ha visszalép a partner kiválasztására, a jelenleg kiválasztott tételek törlődnek. Biztosan folytatni szeretné?',
        [
          { text: 'Mégse' },
          {
            text: 'Biztosan ezt szeretném',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    },
    [navigation, selectedItems]
  );

  useEffect(
    () => navigation.addListener('beforeRemove', customBackHandler),
    [customBackHandler, navigation]
  );

  const canConfirmItems = not(isEmpty(selectedItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = () => {
    if (canConfirmItems) {
      dispatch(roundActions.putItems(selectedItems));
      dispatch(roundActions.putOrderItems(selectedOrderItems));
      navigation.removeListener('beforeRemove', customBackHandler);
      navigation.navigate('Review');
    }
  };

  const renderItem = (info: ListRenderItemInfo<Item>) => {
    let type: ItemAvailability;
    if (!!selectedItems[info.item.id] || !!selectedOrderItems[info.item.id]) {
      type = ItemAvailability.IN_RECEIPT;
    } else if (
      pipe(
        pathOr<Record<string, Expiration>>({}, [info.item.id, 'expirations']),
        values,
        any(pipe(prop('quantity'), gt(__, 0)))
      )(storeItems)
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
        <Animated.FlatList data={itemsShown} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
      <View style={styles.footerContainer}>
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