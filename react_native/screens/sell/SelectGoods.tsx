import { append, equals, indexOf, reject } from 'ramda';
import { useState } from 'react';
import { Animated, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import AnimatedListItem from '../../components/AnimatedListItem';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { SelectPartnerProps } from '../screen-types';

export default function SelectPartner({ navigation }: SelectPartnerProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  // TODO: move this to redux and figure out how to handle the state of this page. Same for partners
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Jégkrém 1',
      price: 299,
      stock: [
        {
          expiresAt: new Date('2023-03-31'),
          quantity: 9,
        },
      ],
    },
    {
      id: 2,
      name: 'Jégkrém 2',
      price: 449,
      stock: [
        {
          expiresAt: new Date('2023-05-31'),
          quantity: 11,
        },
        {
          expiresAt: new Date('2023-06-30'),
          quantity: 15,
        },
      ],
    },
    {
      id: 3,
      name: 'Jégkrém 3',
      price: 99,
      stock: [
        {
          expiresAt: new Date('2023-03-31'),
          quantity: 21,
        },
      ],
    },
  ]);

  const selectGoodsHandler = (id: number) => {
    const selectedGoodsIndex = indexOf(id, selectedProductIds);
    if (selectedGoodsIndex === -1) {
      setSelectedProductIds(append<number>(id));
    } else {
      setSelectedProductIds(reject(equals(id)));
    }
  };

  const renderPartner: ListRenderItem<Good> = (info: ListRenderItemInfo<Good>) => (
    <AnimatedListItem
      id={info.item.id}
      title={info.item.name}
      expanded={selectedProductIds.includes(info.item.id)}
      onTitlePress={selectGoodsHandler}
    />
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={products}
        extraData={selectedProductIds}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPartner}
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <Button variant="disabled">Tovább</Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
