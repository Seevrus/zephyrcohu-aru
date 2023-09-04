import { StyleSheet, Text, View } from 'react-native';

import { SelectItemsFromStoreProps } from '../screen-types';
import AnimatedListItem from '../../components/ui/AnimatedListItem';
import colors from '../../constants/colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SelectItemsFromStore({ navigation }: SelectItemsFromStoreProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input label="Keresés" labelPosition="left" config={{ onChangeText: () => undefined }} />
        </View>
      </View>
      <View style={styles.listContainer}>
        <AnimatedListItem
          id={1}
          expandedInitially={false}
          title="Teszt termék"
          height={200}
          backgroundColor={colors.neutral}
        >
          <View style={styles.selectItemContainer}>
            <Text>Ide írok valamit.</Text>
          </View>
        </AnimatedListItem>
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
  selectItemContainer: {
    padding: 10,
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
