import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, pipe, replace, trim } from 'ramda';
import { memo, useState } from 'react';
import { ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import Input from '../../../components/ui/Input';

type SelectionProps = {
  info: ListRenderItemInfo<{
    expiresAt: string;
    quantity: number;
  }>;
  onQuantityModified: (expiresAt: string, newQuantity: number) => void;
};

function Selection({ info, onQuantityModified }: SelectionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(null);

  const quantityHandler = (newQuantity: string) => {
    const formattedQuantity = pipe(trim, replace(',', '.'), Number)(newQuantity);
    const nullIshFormattedQuantity =
      Number.isNaN(formattedQuantity) || !formattedQuantity ? null : formattedQuantity;

    if (formattedQuantity < 0) {
      setSelectedQuantity(null);
      onQuantityModified(info.item.expiresAt, null);
    } else if (formattedQuantity > info.item.quantity) {
      const newSelectedQuantity = info.item.quantity === 0 ? null : info.item.quantity;
      setSelectedQuantity(newSelectedQuantity);
      onQuantityModified(info.item.expiresAt, newSelectedQuantity);
    } else {
      setSelectedQuantity(nullIshFormattedQuantity);
      onQuantityModified(info.item.expiresAt, nullIshFormattedQuantity);
    }
  };

  const label =
    info.item.expiresAt === 'Rendelés'
      ? info.item.expiresAt
      : `${info.item.expiresAt} (${info.item.quantity})`;

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
