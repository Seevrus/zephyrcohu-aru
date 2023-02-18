import { append, pipe, values } from 'ramda';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import AnimatedListItem, { ItemAvailability } from '../../../components/ui/AnimatedListItem';
import { useAppSelector } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { Expiration } from '../../../store/store-slice/store-slice-types';
import Selection from './Selection';

export default function SelectItem({
  info,
  type,
  upsertSelectedItem,
  upsertOrderItem,
}: {
  info: ListRenderItemInfo<Item>;
  type: ItemAvailability;
  upsertSelectedItem: (id: string, expiresAt: string, quantity: number, itemAmount: number) => void;
  upsertOrderItem: (id: string, quantity: number) => void;
}) {
  const storeItem = useAppSelector((state) => state.store.items[info.item.id]);

  const expirations: Expiration[] = pipe(
    values,
    append({
      expiresAt: 'Rendelés',
      quantity: 1000,
    })
  )(storeItem.expirations);

  const modifyQuantity = (expiresAt: string, newQuantity: number) => {
    if (expiresAt === 'Rendelés') {
      upsertOrderItem(String(info.item.id), newQuantity);
    } else {
      upsertSelectedItem(
        String(info.item.id),
        expiresAt,
        newQuantity,
        Math.round(newQuantity ?? 0 * info.item.price)
      );
    }
  };

  return (
    <AnimatedListItem type={type} title={info.item.name} height={expirations.length * 98}>
      <View style={styles.selectItemContainer}>
        <FlatList
          data={expirations}
          keyExtractor={(item) => item.expiresAt}
          renderItem={(expirationInfo) => (
            <Selection info={expirationInfo} onQuantityModified={modifyQuantity} />
          )}
        />
      </View>
    </AnimatedListItem>
  );
}

const styles = StyleSheet.create({
  selectItemContainer: {
    padding: 10,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  selectIcon: {
    marginHorizontal: 30,
    marginBottom: 5,
  },
  quantityContainer: {
    width: '50%',
  },
});
