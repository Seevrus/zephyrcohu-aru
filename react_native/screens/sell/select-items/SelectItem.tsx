import { append, eqProps, equals, pipe, values } from 'ramda';
import { memo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { colors } from '../../../constants/colors';
import {
  type SellExpiration,
  type SellItem,
} from '../../../providers/sell-flow-hooks/useSelectItems';
import { Selection } from './Selection';

export enum ItemAvailability {
  IN_RECEIPT,
  AVAILABLE,
  ONLY_ORDER,
}

type SelectItemProps = {
  info: ListRenderItemInfo<SellItem>;
  type: ItemAvailability;
  selectedItems: Record<number, Record<number, number>>;
  selectedOrderItems: Record<number, number>;
  upsertSelectedItem: (
    id: number,
    expirationId: number,
    quantity: number
  ) => void;
  upsertOrderItem: (id: number, quantity: number) => void;
};

function _SelectItem({
  info,
  type,
  selectedItems,
  selectedOrderItems,
  upsertSelectedItem,
  upsertOrderItem,
}: SelectItemProps) {
  const expirations: SellExpiration[] = pipe(
    values,
    append({
      itemId: info.item.id,
      expirationId: -1000,
      expiresAt: 'Rendelés',
      quantity: 1000,
    })
  )(info.item.expirations ?? []);

  const modifyQuantity = useCallback(
    (expirationId: number, newQuantity: number) => {
      if (expirationId === -1000) {
        upsertOrderItem(info.item.id, newQuantity);
      } else {
        upsertSelectedItem(info.item.id, expirationId, newQuantity);
      }
    },
    [info.item.id, upsertOrderItem, upsertSelectedItem]
  );

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
      height={expirations.length * 105}
      backgroundColor={backgroundColors[type]}
    >
      <View style={styles.selectItemContainer}>
        <FlatList
          data={expirations}
          keyExtractor={(expiration) => expiration.expiresAt}
          renderItem={(expirationInfo) => (
            <Selection
              info={expirationInfo}
              quantity={
                expirationInfo.item.expiresAt === 'Rendelés'
                  ? selectedOrderItems[expirationInfo.item.itemId] ?? null
                  : selectedItems[expirationInfo.item.itemId]?.[
                      expirationInfo.item.expirationId
                    ] ?? null
              }
              onQuantityModified={modifyQuantity}
            />
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
});

function arePropsEqual(oldProps: SelectItemProps, newProps: SelectItemProps) {
  return (
    eqProps('info', oldProps, newProps) &&
    eqProps('type', oldProps, newProps) &&
    equals(
      oldProps.selectedItems[oldProps.info.item.id],
      newProps.selectedItems[newProps.info.item.id]
    ) &&
    oldProps.selectedOrderItems[oldProps.info.item.id] ===
      newProps.selectedOrderItems[newProps.info.item.id]
  );
}

export const SelectItem = memo(_SelectItem, arePropsEqual);
