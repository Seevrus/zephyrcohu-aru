import {
  all,
  assoc,
  assocPath,
  dissoc,
  filter,
  includes,
  isEmpty,
  isNil,
  not,
  pipe,
  prop,
  propOr,
  propSatisfies,
  take,
  toLower,
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
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectItemsProps } from '../../screen-types';
import SelectItem from './SelectItem';
import { ItemAvailability } from '../../../components/ui/AnimatedListItem';

const keyExtractor = (item: Item) => String(item.id);
const NUM_ITEMS_SHOWN = 10;

export default function SelectItems({ navigation }: SelectItemsProps) {
  const dispatch = useAppDispatch();

  const selectStoreItems = useCallback((state: RootState) => state.store.items, []);
  const storeItems = useAppSelector(selectStoreItems);

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

      return state.items.data.map(mapItemPrice) as Item[];
    },
    [priceList]
  );
  const items = useAppSelector(selectItems);
  const [itemsShown, setItemsShown] = useState<Item[]>(take<Item>(NUM_ITEMS_SHOWN, items));

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

  const searchInputHandler = (inputValue: string) => {
    setItemsShown(
      pipe(
        filter(pipe(prop('name'), toLower, includes(inputValue.toLowerCase()))),
        take<Item>(NUM_ITEMS_SHOWN)
      )(items)
    );
  };

  const canConfirmItems = not(isEmpty(selectedItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = () => {
    if (canConfirmItems) {
      dispatch(roundActions.putItems(selectedItems));
      dispatch(roundActions.putOrderItems(selectedOrderItems));
      navigation.navigate('Review');
    }
  };

  const renderItem = (info: ListRenderItemInfo<Item>) => {
    let type: ItemAvailability;
    if (!!selectedItems[String(info.item.id)] || !!selectedOrderItems[String(info.item.id)]) {
      type = ItemAvailability.IN_RECEIPT;
    } else if (storeItems[info.item.id]) {
      // TODO: map it to current quantity
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
    height: 50,
    marginVertical: 10,
  },
});
