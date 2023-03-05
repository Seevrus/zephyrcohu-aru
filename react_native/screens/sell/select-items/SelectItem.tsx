import { append, eqProps, pipe, values } from 'ramda';
import { memo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import colors from '../../../constants/colors';
import { useAppSelector } from '../../../store/hooks';
import { Item } from '../../../store/items-slice/items-slice-types';
import { Expiration } from '../../../store/stores-slice/stores-slice-types';
import Selection from './Selection';

export enum ItemAvailability {
  IN_RECEIPT,
  AVAILABLE,
  ONLY_ORDER,
}

type SelectItemProps = {
  info: ListRenderItemInfo<Item>;
  type: ItemAvailability;
  upsertSelectedItem: (id: string, name: string, expiresAt: string, quantity: number) => void;
  upsertOrderItem: (id: string, name: string, quantity: number) => void;
};

function SelectItem({ info, type, upsertSelectedItem, upsertOrderItem }: SelectItemProps) {
  const storeItem = useAppSelector((state) => state.stores.store.items[info.item.id]);

  const expirations: Expiration[] = pipe(
    values,
    append({
      expiresAt: 'Rendelés',
      quantity: 1000,
    })
  )(storeItem.expirations);

  const modifyQuantity = (expiresAt: string, newQuantity: number) => {
    if (expiresAt === 'Rendelés') {
      upsertOrderItem(String(info.item.id), info.item.name, newQuantity);
    } else {
      upsertSelectedItem(String(info.item.id), info.item.name, expiresAt, newQuantity);
    }
  };

  const backgroundColors = {
    [ItemAvailability.AVAILABLE]: colors.neutral,
    [ItemAvailability.IN_RECEIPT]: colors.ok,
    [ItemAvailability.ONLY_ORDER]: colors.warning,
  };

  return (
    <AnimatedListItem
      id={info.item.id}
      expandedInitially={false}
      title={info.item.name}
      height={expirations?.length ?? 0 * 100}
      backgroundColor={backgroundColors[type]}
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

function arePropsEqual(oldProps: SelectItemProps, newProps: SelectItemProps) {
  return eqProps('info', oldProps, newProps) && eqProps('type', oldProps, newProps);
}

export default memo(SelectItem, arePropsEqual);
