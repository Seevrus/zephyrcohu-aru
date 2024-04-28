import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, isNil, isNotNil, pipe, replace, trim } from 'ramda';
import { memo, useCallback, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type StorageListItem } from '../../../atoms/storageFlow';
import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';

type ExpirationAccordionDetailsProps = {
  item: StorageListItem;
  setCurrentQuantity: (
    item: StorageListItem,
    newCurrentQuantity: number | null
  ) => void;
};

function _ExpirationAccordionDetails({
  item,
  setCurrentQuantity,
}: ExpirationAccordionDetailsProps) {
  const [dropdownHeight, setDropdownHeight] = useState(170);
  const [shownQuantity, setShownQuantity] = useState<string>('');

  const minimumCurrentQuantity = -1 * (item.originalQuantity ?? 0);

  const quantityHandler = useCallback(
    (newQuantity: string) => {
      if (newQuantity === '-') {
        setShownQuantity(newQuantity);
      } else {
        const formattedQuantity = pipe(
          trim,
          replace(',', '.'),
          Number,
          Math.floor
        )(newQuantity);

        const nullIshFormattedQuantity = Number.isNaN(formattedQuantity)
          ? null
          : formattedQuantity;

        const stringFormattedQuantity = isNil(nullIshFormattedQuantity)
          ? ''
          : String(formattedQuantity);

        if (
          newQuantity === '' ||
          formattedQuantity === 0 ||
          isNil(nullIshFormattedQuantity) ||
          (nullIshFormattedQuantity === -1 && minimumCurrentQuantity === 0)
        ) {
          setCurrentQuantity(item, null);
          setShownQuantity('');
        } else if (formattedQuantity <= minimumCurrentQuantity) {
          setCurrentQuantity(item, minimumCurrentQuantity);
          setShownQuantity(String(minimumCurrentQuantity));
        } else {
          setCurrentQuantity(item, nullIshFormattedQuantity);
          setShownQuantity(stringFormattedQuantity);
        }
      }
    },
    [item, minimumCurrentQuantity, setCurrentQuantity]
  );

  const listItemColor = (() => {
    if ((item.primaryStoreQuantity ?? 0) < (item.quantityChange ?? 0)) {
      return colors.error;
    }
    if (isNotNil(item.quantityChange)) {
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
      height={dropdownHeight}
      backgroundColor={listItemColor}
    >
      <View
        style={styles.selectItemContainer}
        onLayout={(event: LayoutChangeEvent) => {
          setDropdownHeight(event.nativeEvent.layout.height);
        }}
      >
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Vonalkód:</Text>
          <Text style={styles.detailsRowText}>
            {trim(`${item.itemBarcode} ${item.expirationBarcode}`)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Főraktárkészlet:</Text>
          <Text style={styles.detailsRowText}>{item.primaryStoreQuantity}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Saját raktár készlete:</Text>
          <Text style={styles.detailsRowText}>
            {item.originalQuantity ?? 0}
          </Text>
        </View>
        <View style={styles.selectionContainer}>
          <Pressable
            style={styles.selectIconContainer}
            onPress={() =>
              quantityHandler(String((item.quantityChange ?? 0) - 1))
            }
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
              label="Rakodás:"
              textAlign="center"
              config={{
                autoCapitalize: 'none',
                autoComplete: 'off',
                autoCorrect: false,
                contextMenuHidden: true,
                keyboardType: 'numeric',
                maxLength: 4,
                value: shownQuantity,
                onChangeText: quantityHandler,
              }}
            />
          </View>
          <Pressable
            style={styles.selectIconContainer}
            onPress={() =>
              quantityHandler(String((item.quantityChange ?? 0) + 1))
            }
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

export const ExpirationAccordionDetails = memo(
  _ExpirationAccordionDetails,
  arePropsEqual
);

const styles = StyleSheet.create({
  detailsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsRowText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  quantityContainer: {
    height: 85,
    width: '50%',
  },
  selectIcon: {
    marginBottom: 5,
    marginHorizontal: 30,
  },
  selectIconContainer: {
    justifyContent: 'flex-end',
  },
  selectItemContainer: {
    padding: 10,
  },
  selectItemNameContainer: {
    width: '70%',
  },
  selectItemText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectItemTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});
