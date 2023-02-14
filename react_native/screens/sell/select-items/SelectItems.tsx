import { all, append, assoc, isNil, map, pipe, prop, propEq, propOr, reject } from 'ramda';
import { useCallback, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Button from '../../../components/ui/buttons/Button';
import colors from '../../../constants/colors';
import { RootState } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { roundActions } from '../../../store/round-slice/round-slice';
import { Item as ReceiptItem, OrderItem } from '../../../store/round-slice/round-slice-types';
import { ItemsList, SelectItemsProps } from '../../screen-types';
import SelectItem from './SelectItem';

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
          .filter(
            (item) => state.store.items.findIndex((storeItem) => storeItem.id === item.id) !== -1
          )
          .map(mapItemPrice) as Item[];
      }

      return state.items.data.map(mapItemPrice) as Item[];
    },
    [itemsListType, priceList]
  );
  const items = useAppSelector(selectItems);

  const [selectedItems, setSelectedItems] = useState<ReceiptItem[]>([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);

  const upsertSelectedItem = (selectedItem: ReceiptItem) => {
    if (selectedItems.findIndex((si) => si.id === selectedItem.id) === -1) {
      setSelectedItems(append(selectedItem));
    } else if (all(pipe(prop('quantity'), isNil), selectedItem.expirations)) {
      setSelectedItems(reject(propEq('id', selectedItem.id)));
    } else {
      setSelectedItems(map((i) => (i.id === selectedItem.id ? selectedItem : i)));
    }
  };

  const upsertOrderItem = (selectedItem: OrderItem) => {
    if (selectedOrderItems.findIndex((si) => si.id === selectedItem.id) === -1) {
      setSelectedOrderItems(append(selectedItem));
    } else if (isNil(selectedItem.quantity)) {
      setSelectedItems(reject(propEq('id', selectedItem.id)));
    } else {
      setSelectedOrderItems(map((i) => (i.id === selectedItem.id ? selectedItem : i)));
    }
  };

  const canConfirmItems = selectedItems.length > 0;
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = () => {
    if (canConfirmItems) {
      dispatch(roundActions.putItems(selectedItems));
      dispatch(roundActions.putOrderItems(selectedOrderItems));
      navigation.navigate('Review');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonVariant} onPress={confirmItemsHandler}>
          Tétellista véglegesítése
        </Button>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={(info) => (
            <SelectItem
              info={info}
              selectedItem={selectedItems.find((si) => si.id === info.item.id)}
              upsertSelectedItem={upsertSelectedItem}
              selectedOrderItem={selectedOrderItems.find((si) => si.id === info.item.id)}
              upsertOrderItem={upsertOrderItem}
            />
          )}
        />
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
