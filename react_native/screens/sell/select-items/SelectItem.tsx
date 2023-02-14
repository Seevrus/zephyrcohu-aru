import { append, assoc, pipe, prop } from 'ramda';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import AnimatedListItem from '../../../components/AnimatedListItem';
import { useAppSelector } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { Item as ReceiptItem, OrderItem } from '../../../store/round-slice/round-slice-types';
import Selection from './Selection';

type Expirations = {
  expiresAt: string;
  quantity: number;
}[];

export default function SelectItem({
  info,
  selectedItem,
  upsertSelectedItem,
  selectedOrderItem,
  upsertOrderItem,
}: {
  info: ListRenderItemInfo<Item>;
  selectedItem: ReceiptItem | undefined;
  upsertSelectedItem: (selectedItem: ReceiptItem) => void;
  selectedOrderItem: OrderItem | undefined;
  upsertOrderItem: (selectedItem: OrderItem) => void;
}) {
  const storeItem = useAppSelector((state) =>
    state.store.items.find((si) => si.id === info.item.id)
  );

  const expirations: Expirations = pipe(
    prop('expirations'),
    append({
      expiresAt: 'Rendelés',
      quantity: 1000,
    })
  )(storeItem);

  const modifyQuantity = (expiresAt: string, newQuantity: number) => {
    if (expiresAt === 'Rendelés') {
      if (selectedOrderItem) {
        upsertOrderItem(assoc('quantity', newQuantity, selectedOrderItem));
      } else {
        upsertOrderItem({
          id: info.item.id,
          articleNumber: info.item.articleNumber,
          quantity: newQuantity,
        });
      }
    } else if (selectedItem) {
      upsertSelectedItem({
        ...selectedItem,
        expirations: selectedItem.expirations.map((si) =>
          si.expiresAt === expiresAt
            ? {
                ...si,
                quantity: newQuantity,
                itemAmount: Math.round(newQuantity ?? 0 * info.item.price),
              }
            : si
        ),
      });
    } else {
      upsertSelectedItem({
        id: info.item.id,
        articleNumber: info.item.articleNumber,
        expirations: [
          {
            expiresAt,
            quantity: newQuantity,
            itemAmount: Math.round(newQuantity ?? 0 * info.item.price),
          },
        ],
      });
    }
  };

  return (
    <AnimatedListItem
      selected={!!selectedItem || !!selectedOrderItem}
      title={info.item.name}
      height={expirations.length * 98}
    >
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
