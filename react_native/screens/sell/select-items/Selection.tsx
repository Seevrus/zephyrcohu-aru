import { MaterialIcons } from '@expo/vector-icons';
import { pipe, replace, trim } from 'ramda';
import { useState } from 'react';
import { ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import Input from '../../../components/ui/Input';

type SelectionProps = {
  info: ListRenderItemInfo<{
    expiresAt: string;
    quantity: number;
  }>;
  onQuantityModified: (expiresAt: string, newQuantity: number) => void;
};

export default function Selection({ info, onQuantityModified }: SelectionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(null);

  const quantityHandler = (newQuantity: string) => {
    const formattedQuantity = pipe(trim, replace(',', '.'), Number)(newQuantity);
    const nullIshFormattedQuantity =
      Number.isNaN(formattedQuantity) || !formattedQuantity ? null : formattedQuantity;

    if (formattedQuantity < 0 || formattedQuantity > info.item.quantity) {
      setSelectedQuantity(info.item.quantity);
      onQuantityModified(info.item.expiresAt, info.item.quantity);
    } else {
      setSelectedQuantity(nullIshFormattedQuantity);
      onQuantityModified(info.item.expiresAt, nullIshFormattedQuantity);
    }
  };

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
          label={info.item.expiresAt}
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
