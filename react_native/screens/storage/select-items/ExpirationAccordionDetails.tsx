import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, isNil, pipe, replace, trim } from 'ramda';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ListItem } from '../../../providers/StorageFlowProvider';

type ExpirationAccordionDetailsProps = {
  item: ListItem;
  setCurrentQuantity: (item: ListItem, newCurrentQuantity: number | null) => void;
};

function ExpirationAccordionDetails({ item, setCurrentQuantity }: ExpirationAccordionDetailsProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(
    item.currentQuantity ?? 0
  );

  const quantityHandler = (newQuantity: string) => {
    const formattedQuantity = pipe(trim, replace(',', '.'), Number, Math.floor)(newQuantity);
    const nullIshFormattedQuantity = Number.isNaN(formattedQuantity) ? null : formattedQuantity;

    if (newQuantity === '' || formattedQuantity < 0 || isNil(nullIshFormattedQuantity)) {
      setSelectedQuantity(null);
      setCurrentQuantity(item, null);
    } else {
      setSelectedQuantity(nullIshFormattedQuantity);
      setCurrentQuantity(item, nullIshFormattedQuantity);
    }
  };

  const listItemColor = (() => {
    if (item.primaryStoreQuantity < 0) {
      return colors.error;
    }
    if ((item.currentQuantity || 0) !== (item.originalQuantity || 0)) {
      return colors.warning;
    }

    return colors.neutral;
  })();

  return (
    <AnimatedListItem
      id={item.expirationId}
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
      backgroundColor={listItemColor}
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
          <Pressable
            style={styles.selectIconContainer}
            onPress={() => quantityHandler(String((selectedQuantity ?? 0) - 1))}
          >
            <MaterialIcons
              name="remove-circle-outline"
              size={40}
              color="white"
              style={styles.selectIcon}
            />
          </Pressable>
          <View style={styles.quantityContainer}>
            <Input
              label="Raktárkészlet:"
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
          <Pressable
            style={styles.selectIconContainer}
            onPress={() => quantityHandler(String((selectedQuantity ?? 0) + 1))}
          >
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

function arePropsEqual(
  oldProps: ExpirationAccordionDetailsProps,
  newProps: ExpirationAccordionDetailsProps
) {
  return eqProps('item', oldProps, newProps);
}

export default memo(ExpirationAccordionDetails, arePropsEqual);

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
