import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, isNil, pipe, replace, trim } from 'ramda';
import { memo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { OtherItem } from '../../../providers/sell-flow-hooks/useSelectOtherItems';

type ExpirationAccordionDetailsProps = {
  item: OtherItem;
  setCurrentQuantity: (item: OtherItem, newCurrentQuantity: number | null) => void;
};

function ExpirationAccordionDetails({ item, setCurrentQuantity }: ExpirationAccordionDetailsProps) {
  const backgroundColor = item.quantity > 0 ? colors.ok : colors.neutral;

  const [dropdownHeight, setDropdownHeight] = useState(250);
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null);

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

  return (
    <AnimatedListItem
      id={item.id}
      expandedInitially={false}
      title={
        <View style={styles.selectItemTitle}>
          <View style={styles.selectItemNameContainer}>
            <Text style={styles.selectItemText}>{item.name}</Text>
          </View>
        </View>
      }
      height={dropdownHeight}
      backgroundColor={backgroundColor}
    >
      <View
        style={styles.selectItemContainer}
        onLayout={(event: LayoutChangeEvent) => {
          setDropdownHeight(event.nativeEvent.layout.height);
        }}
      >
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
        {/* TODO add comment box */}
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
