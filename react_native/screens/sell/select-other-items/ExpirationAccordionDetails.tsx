import { MaterialIcons } from '@expo/vector-icons';
import { eqProps, isNil, pipe, replace, trim } from 'ramda';
import { memo, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type OtherSellItem } from './useSelectOtherItemsToSellData';

type ExpirationAccordionDetailsProps = {
  item: OtherSellItem;
  netPrice: number | null;
  setNetPrice: (item: OtherSellItem, price: number | null) => void;
  quantity: number | null;
  setQuantity: (item: OtherSellItem, quantity: number | null) => void;
  comment: string | null;
  setComment: (item: OtherSellItem, comment: string | null) => void;
};

function _ExpirationAccordionDetails({
  item,
  netPrice,
  setNetPrice,
  quantity,
  setQuantity,
  comment,
  setComment,
}: ExpirationAccordionDetailsProps) {
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [shownPrice, setShownPrice] = useState<string>(
    netPrice?.toString() ?? ''
  );
  const [shownQuantity, setShownQuantity] = useState<string>(
    quantity?.toString() ?? ''
  );

  const backgroundColor = (quantity ?? 0) > 0 ? colors.ok : colors.neutral;

  const priceHandler = (newPrice: string) => {
    if (newPrice === '-') {
      setShownPrice(newPrice);
    } else {
      const formattedPrice = pipe(
        trim,
        replace(',', '.'),
        Number,
        Math.floor
      )(newPrice);

      const nullIshFormattedPrice = Number.isNaN(formattedPrice)
        ? null
        : formattedPrice;

      const stringFormattedPrice = isNil(nullIshFormattedPrice)
        ? ''
        : String(formattedPrice);

      if (newPrice === '' || isNil(nullIshFormattedPrice)) {
        setNetPrice(item, null);
        setShownPrice('');
      } else {
        setNetPrice(item, nullIshFormattedPrice);
        setShownPrice(stringFormattedPrice);
      }
    }
  };

  const quantityHandler = (newQuantity: string) => {
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

      if (newQuantity === '' || isNil(nullIshFormattedQuantity)) {
        setQuantity(item, null);
        setShownQuantity('');
      } else {
        setQuantity(item, nullIshFormattedQuantity);
        setShownQuantity(stringFormattedQuantity);
      }
    }
  };

  const commentHandler = (newComment: string) => {
    if (newComment.trim().length === 0) {
      setComment(item, null);
    } else {
      setComment(item, newComment);
    }
  };

  return (
    <AnimatedListItem
      id={item.id}
      expandedInitially={false}
      title={
        <View style={styles.selectItemTitle}>
          <Text style={styles.selectItemText}>{item.name}</Text>
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
            onPress={() => quantityHandler(String((quantity ?? 0) - 1))}
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
              label="Mennyiség:"
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
            onPress={() => quantityHandler(String((quantity ?? 0) + 1))}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={40}
              color="white"
              style={styles.selectIcon}
            />
          </Pressable>
        </View>
        <View style={styles.priceContainer}>
          <Input
            label="Egységár:"
            textAlign="center"
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              contextMenuHidden: true,
              keyboardType: 'numeric',
              maxLength: 6,
              value: shownPrice,
              onChangeText: priceHandler,
            }}
          />
        </View>
        <View style={styles.commentContainer}>
          <Input
            label="Tételszöveg:"
            config={{
              multiline: true,
              numberOfLines: 5,
              maxLength: 100,
              value: String(comment ?? ''),
              onChangeText: commentHandler,
            }}
          />
        </View>
      </View>
    </AnimatedListItem>
  );
}

function arePropsEqual(
  oldProps: ExpirationAccordionDetailsProps,
  newProps: ExpirationAccordionDetailsProps
) {
  return (
    eqProps('item', oldProps, newProps) &&
    oldProps.quantity === newProps.quantity &&
    oldProps.netPrice === newProps.netPrice &&
    oldProps.comment === newProps.comment
  );
}

export const ExpirationAccordionDetails = memo(
  _ExpirationAccordionDetails,
  arePropsEqual
);

const styles = StyleSheet.create({
  commentContainer: {
    height: 200,
  },
  priceContainer: {
    height: 90,
  },
  quantityContainer: {
    height: 90,
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
    justifyContent: 'space-between',
    padding: 10,
  },
  selectItemText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectItemTitle: {
    alignItems: 'flex-start',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});
