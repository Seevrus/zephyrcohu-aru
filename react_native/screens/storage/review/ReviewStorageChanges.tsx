import { useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import { ListItem, useStorageFlowContext } from '../../../providers/StorageFlowProvider';
import { ReviewStorageChagesProps } from '../../screen-types';
import ReviewExpirationItem from './ReviewExpirationItem';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export default function ReviewStorageChanges({ navigation }: ReviewStorageChagesProps) {
  const { items } = useStorageFlowContext();
  const changedItems = useMemo(
    () => (items ?? []).filter((item) => item.currentQuantity !== item.originalQuantity),
    [items]
  );

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ReviewExpirationItem item={info.item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList data={changedItems} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="ok" onPress={() => undefined}>
            Véglegesítés
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 70,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
