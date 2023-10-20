import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, pipe, replace, trim } from 'ramda';
import { memo, useState } from 'react';
import { ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';

import { format } from 'date-fns';
import Input from '../../../components/ui/Input';
import { SellExpiration } from '../../../providers/sell-flow-hooks/useSelectItems';

type SelectionProps = {
  info: ListRenderItemInfo<SellExpiration>;
  onQuantityModified: (expirationId: number, newQuantity: number) => void;
};

function Selection({ info, onQuantityModified }: SelectionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(null);

  const quantityHandler = (newQuantity: string) => {
    const formattedQuantity = pipe(trim, replace(',', '.'), Number)(newQuantity);
    const nullIshFormattedQuantity =
      Number.isNaN(formattedQuantity) || !formattedQuantity ? null : formattedQuantity;

    if (formattedQuantity < 0) {
      setSelectedQuantity(null);
      onQuantityModified(info.item.id, null);
    } else if (formattedQuantity > info.item.quantity) {
      const newSelectedQuantity = info.item.quantity === 0 ? null : info.item.quantity;
      setSelectedQuantity(newSelectedQuantity);
      onQuantityModified(info.item.id, newSelectedQuantity);
    } else {
      setSelectedQuantity(nullIshFormattedQuantity);
      onQuantityModified(info.item.id, nullIshFormattedQuantity);
    }
  };

  const label =
    info.item.expiresAt === 'Rendelés'
      ? info.item.expiresAt
      : `${format(new Date(info.item.expiresAt), 'yyyy-MM')} (${info.item.quantity})`;

  return (
    <View style={styles.selectionContainer}>
      <Pressable onPress={() => quantityHandler(String(selectedQuantity - 1))}>
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
            value: String(selectedQuantity ?? ''),
            onChangeText: quantityHandler,
          }}
        />
      </View>
      <Pressable onPress={() => quantityHandler(String(selectedQuantity + 1))}>
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
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  selectIcon: {
    marginHorizontal: 30,
    marginBottom: 5,
  },
  quantityContainer: {
    height: 90,
    width: '50%',
  },
});

function arePropsEqual(oldProps: SelectionProps, newProps: SelectionProps) {
  return eqProps('info', oldProps, newProps);
}

export default memo(Selection, arePropsEqual);
