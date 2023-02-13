import { MaterialIcons } from '@expo/vector-icons';
import { append, equals, indexOf, reject } from 'ramda';
import { useState } from 'react';
import { Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import AnimatedListItem from '../../components/AnimatedListItem';
import Button from '../../components/ui/buttons/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import { useAppSelector } from '../../store/hooks';
import { Item } from '../../store/items-slice/items-slice-types';
import { ItemsList, SelectItemsProps } from '../screen-types';

function SelectItem({
  info,
  selectedItemIds,
}: {
  info: ListRenderItemInfo<Item>;
  selectedItemIds: number[];
}) {
  return (
    <AnimatedListItem selected={selectedItemIds.includes(info.item.id)} title={info.item.name}>
      <View style={styles.selectItemContainer}>
        <View style={styles.selectionContainer}>
          <MaterialIcons
            name="remove-circle-outline"
            size={40}
            color="white"
            style={styles.selectIcon}
          />
          <View style={styles.quantityContainer}>
            <Input
              label="2021-03"
              config={{
                autoCapitalize: 'none',
                autoComplete: 'off',
                autoCorrect: false,
                contextMenuHidden: true,
                keyboardType: 'numeric',
              }}
            />
          </View>
          <MaterialIcons
            name="add-circle-outline"
            size={40}
            color="white"
            style={styles.selectIcon}
          />
        </View>
      </View>
    </AnimatedListItem>
  );
}

export default function SelectItems({ route, navigation }: SelectItemsProps) {
  const itemsListType = route.params.items;

  const items = useAppSelector((state) => {
    if (itemsListType === ItemsList.STORE) {
      return state.items.data.filter(
        (item) => state.store.items.findIndex((storeItem) => storeItem.id === item.id) !== -1
      );
    }

    return state.items.data;
  });

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const selectItemHandler = (id: number) => {
    const selectedItemIndex = indexOf(id, selectedItemIds);
    if (selectedItemIndex === -1) {
      setSelectedItemIds(append<number>(id));
    } else {
      setSelectedItemIds(reject(equals(id)));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button variant="disabled">Tétellista véglegesítése</Button>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={items}
          extraData={selectedItemIds}
          keyExtractor={(item) => String(item.id)}
          renderItem={(info) => <SelectItem info={info} selectedItemIds={selectedItemIds} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    flex: 0.1,
    marginVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    flex: 0.9,
  },
  selectItemContainer: {
    padding: 10,
  },
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
    width: '50%',
  },
});
