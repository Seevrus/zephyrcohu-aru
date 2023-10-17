import { append, eqProps, pipe, values } from 'ramda';
import { memo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import colors from '../../../constants/colors';
import { SellExpiration, SellItem } from '../../../providers/SellFlowProvider';
import Selection from './Selection';

export enum ItemAvailability {
  IN_RECEIPT,
  AVAILABLE,
  ONLY_ORDER,
}

type SelectItemProps = {
  info: ListRenderItemInfo<SellItem>;
  type: ItemAvailability;
  upsertSelectedItem: (id: number, expirationId: number, quantity: number) => void;
  upsertOrderItem: (id: number, quantity: number) => void;
};

function SelectItem({ info, type, upsertSelectedItem, upsertOrderItem }: SelectItemProps) {
  const expirations: SellExpiration[] = pipe(
    values,
    append({
      id: -1000,
      expiresAt: 'Rendelés',
      quantity: 1000,
    })
  )(info.item.expirations ?? []);

  const modifyQuantity = (expirationId: number, newQuantity: number) => {
    if (expirationId === -1000) {
      upsertOrderItem(info.item.id, newQuantity);
    } else {
      upsertSelectedItem(info.item.id, expirationId, newQuantity);
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
      height={expirations.length * 105}
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
