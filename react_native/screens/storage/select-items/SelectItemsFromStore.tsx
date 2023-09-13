import { Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectItemsFromStoreProps } from '../../screen-types';
import ExpirationAccordionDetails from './ExpirationAccordionDetails';
import useSelectItemsFromStore, { ListItem } from './useSelectItemsFromStore';
import Loading from '../../../components/Loading';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export default function SelectItemsFromStore({ navigation }: SelectItemsFromStoreProps) {
  const { isLoading, items = [], setCurrentQuantity, setSearchTerm } = useSelectItemsFromStore();

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ExpirationAccordionDetails item={info.item} setCurrentQuantity={setCurrentQuantity} />
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input label="Keresés" labelPosition="left" config={{ onChangeText: setSearchTerm }} />
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList data={items} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="disabled" onPress={() => undefined}>
            Tétellista véglegesítése
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
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: '7%',
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
