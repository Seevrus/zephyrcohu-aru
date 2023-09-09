import { trim } from 'ramda';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ListItem } from './useSelectItemsFromStore';
import Input from '../../../components/ui/Input';

type ExpirationAccordionDetailsProps = {
  item: ListItem;
};

export default function ExpirationAccordionDetails({ item }: ExpirationAccordionDetailsProps) {
  return (
    <AnimatedListItem
      id={item.id}
      expandedInitially={false}
      title={
        <View style={styles.selectItemTitle}>
          <View style={styles.selectItemNameContainer}>
            <Text style={styles.selectItemText}>{item.name}</Text>
          </View>
          <Text style={styles.selectItemText}>{item.expiresAt}</Text>
        </View>
      }
      height={170}
      backgroundColor={colors.neutral}
    >
      <View style={styles.selectItemContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Kód:</Text>
          <Text style={styles.detailsRowText}>
            {trim(`${item.itemBarcode} ${item.expirationBarcode}`)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Főraktárkészlet:</Text>
          <Text style={styles.detailsRowText}>{item.primaryStoreQuantity}</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Pressable style={styles.selectIconContainer}>
            <MaterialIcons
              name="remove-circle-outline"
              size={40}
              color="white"
              style={styles.selectIcon}
            />
          </Pressable>
          <View style={styles.quantityContainer}>
            <Input
              label="Változás"
              textAlign="center"
              config={{
                autoCapitalize: 'none',
                autoComplete: 'off',
                autoCorrect: false,
                contextMenuHidden: true,
                keyboardType: 'numeric',
                maxLength: 4,
                value: '',
                onChangeText: () => undefined,
              }}
            />
          </View>
          <Pressable style={styles.selectIconContainer}>
            <MaterialIcons
              name="add-circle-outline"
              size={40}
              color="white"
              style={styles.selectIcon}
            />
          </Pressable>
        </View>
      </View>
    </AnimatedListItem>
  );
}

const styles = StyleSheet.create({
  selectItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectItemNameContainer: {
    width: '70%',
  },
  selectItemText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectItemContainer: {
    padding: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsRowText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectionContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectIconContainer: {
    justifyContent: 'flex-end',
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
