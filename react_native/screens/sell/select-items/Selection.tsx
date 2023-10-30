import { MaterialIcons } from '@expo/vector-icons';
import { equals, pipe, replace, trim } from 'ramda';
import { memo } from 'react';
import {
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { format } from 'date-fns';
import { Input } from '../../../components/ui/Input';
import { type SellExpiration } from '../../../providers/sell-flow-hooks/useSelectItems';

type SelectionProps = {
  info: ListRenderItemInfo<SellExpiration>;
  quantity: number | null;
  onQuantityModified: (expirationId: number, newQuantity: number) => void;
};

function _Selection({ info, quantity, onQuantityModified }: SelectionProps) {
  const quantityHandler = (newQuantity: string) => {
    const formattedQuantity = pipe(
      trim,
      replace(',', '.'),
      Number
    )(newQuantity);
    const nullIshFormattedQuantity =
      Number.isNaN(formattedQuantity) || !formattedQuantity
        ? null
        : formattedQuantity;

    if (formattedQuantity < 0) {
      onQuantityModified(info.item.expirationId, null);
    } else if (formattedQuantity > info.item.quantity) {
      const newSelectedQuantity =
        info.item.quantity === 0 ? null : info.item.quantity;
      onQuantityModified(info.item.expirationId, newSelectedQuantity);
    } else {
      onQuantityModified(info.item.expirationId, nullIshFormattedQuantity);
    }
  };

  const label =
    info.item.expiresAt === 'Rendelés'
      ? info.item.expiresAt
      : `${format(new Date(info.item.expiresAt), 'yyyy-MM')} (${
          info.item.quantity
        })`;

  return (
    <View style={styles.selectionContainer}>
      <Pressable onPress={() => quantityHandler(String(quantity - 1))}>
        <MaterialIcons
          name="remove-circle-outline"
          size={40}
          color="white"
          style={styles.selectIcon}
        />
      </Pressable>
      <View style={styles.quantityContainer}>
        <Input
          label={label}
          textAlign="center"
          config={{
            autoCapitalize: 'none',
            autoComplete: 'off',
            autoCorrect: false,
            contextMenuHidden: true,
            keyboardType: 'numeric',
            maxLength: 4,
            value: String(quantity ?? ''),
            onChangeText: quantityHandler,
          }}
        />
      </View>
      <Pressable onPress={() => quantityHandler(String(quantity + 1))}>
        <MaterialIcons
          name="add-circle-outline"
          size={40}
          color="white"
          style={styles.selectIcon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  quantityContainer: {
    height: 90,
    width: '50%',
  },
  selectIcon: {
    marginBottom: 5,
    marginHorizontal: 30,
  },
  selectionContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export const Selection = memo(_Selection, equals);
