import {
  all,
  assoc,
  assocPath,
  dissoc,
  has,
  isEmpty,
  isNil,
  not,
  pipe,
  propOr,
  propSatisfies,
  values,
} from 'ramda';
import { useCallback, useState } from 'react';
import { Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { RootState } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { roundActions } from '../../../store/round-slice/round-slice';
import { Item as ReceiptItem, OrderItem } from '../../../store/round-slice/round-slice-types';

import Button from '../../../components/ui/buttons/Button';
import colors from '../../../constants/colors';
import { ItemsList, SelectItemsProps } from '../../screen-types';
import SelectItem from './SelectItem';

const keyExtractor = (item: Item) => String(item.id);

export default function SelectItems({ route, navigation }: SelectItemsProps) {
  const dispatch = useAppDispatch();
  const itemsListType = route.params.items;

  const partnerId = useAppSelector((state) => state.round.currentReceipt.partnerId);
  const selectPriceList = useCallback(
    (state: RootState) => state.partners.data.find((partner) => partner.id === partnerId).priceList,
    [partnerId]
  );
  const priceList = useAppSelector(selectPriceList);

  const selectItems = useCallback(
    (state: RootState) => {
      const mapItemPrice = (item: Item) => {
        if (!priceList || priceList?.items?.length === 0) return item;

        const priceListItem = priceList?.items?.find((pi) => pi.itemId === item.id);
        return assoc('price', propOr(item.price, 'price', priceListItem), item);
      };

      if (itemsListType === ItemsList.STORE) {
        return state.items.data
          .filter((item) => has(String(item.id), state.store.items))
          .map(mapItemPrice) as Item[];
      }

      return state.items.data.map(mapItemPrice) as Item[];
    },
    [itemsListType, priceList]
  );
  const items = useAppSelector(selectItems);

  const [selectedItems, setSelectedItems] = useState<ReceiptItem>({});
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem>({});

  const upsertSelectedItem = useCallback(
    (id: string, expiresAt: string, quantity: number, itemAmount: number) => {
      if (!quantity) {
        setSelectedItems((currentItems) => {
          const itemsWithNewQuantity = assocPath(
            [id, expiresAt],
            { quantity, itemAmount },
            currentItems
          );

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
        setSelectedItems(assocPath([id, expiresAt], { quantity, itemAmount }));
      }
    },
    []
  );

  const upsertOrderItem = useCallback((id: string, quantity: number) => {
    if (!quantity) {
      setSelectedOrderItems(dissoc(id));
    } else {
      setSelectedOrderItems(assoc(id, quantity));
    }
  }, []);

  const canConfirmItems = not(isEmpty(selectItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = () => {
    if (canConfirmItems) {
      dispatch(roundActions.putItems(selectedItems));
      dispatch(roundActions.putOrderItems(selectedOrderItems));
      navigation.navigate('Review');
    }
  };

  const renderItem = (info: ListRenderItemInfo<Item>) => {
    const selected =
      !!selectedItems[String(info.item.id)] || !!selectedOrderItems[String(info.item.id)];

    return (
      <SelectItem
        info={info}
        selected={selected}
        upsertSelectedItem={upsertSelectedItem}
        upsertOrderItem={upsertOrderItem}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonVariant} onPress={confirmItemsHandler}>
          Tétellista véglegesítése
        </Button>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList data={items} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    flex: 0.1,
    marginVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    flex: 0.9,
  },
});
