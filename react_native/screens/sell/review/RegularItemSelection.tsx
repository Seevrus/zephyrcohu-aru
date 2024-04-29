import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { equals } from 'ramda';
import { memo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { type RegularReviewItem } from '../../../atoms/sellFlow';
import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type StackParams } from '../../../navigators/screen-types';
import { formatPrice } from '../../../utils/formatPrice';
import { getReviewItemId } from './getReviewItemId';

type SelectionProps = {
  selected: boolean;
  item: RegularReviewItem;
  onSelect: (id: string) => void;
  onDelete: ({
    itemId,
    expirationId,
  }: {
    itemId: number;
    expirationId: number;
  }) => void;
};

function _RegularItemSelection({
  selected,
  item,
  onSelect,
  onDelete,
}: SelectionProps) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();

  const backgroundColor = selected ? colors.ok : colors.neutral;
  const expiresAt = format(new Date(item.expiresAt), 'yyyy-MM');

  const [dropdownHeight, setDropdownHeight] = useState(250);

  const absoluteDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'absolute'
  );
  const percentageDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'percentage'
  );
  const freeFormDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'freeForm'
  );

  return (
    <AnimatedListItem
      id={getReviewItemId(item)}
      title={
        <View style={styles.selectItemTitle}>
          <View style={styles.selectItemNameContainer}>
            <Text style={styles.selectItemText}>{item.name}</Text>
          </View>
          <Text style={styles.selectItemText}>{expiresAt}</Text>
        </View>
      }
      expandedInitially={selected}
      height={dropdownHeight}
      backgroundColor={backgroundColor}
      onSelect={(id: string | number) => onSelect(String(id))}
    >
      <View
        style={styles.selectPartnerContainer}
        onLayout={(event: LayoutChangeEvent) => {
          setDropdownHeight(event.nativeEvent.layout.height);
        }}
      >
        <View style={styles.firstInfoGroup}>
          <LabeledItem
            label="Cikkszám"
            text={item.articleNumber}
            justifyContent="space-between"
          />
        </View>
        <View style={styles.infoGroup}>
          <LabeledItem
            label="Mennyiség"
            text={`${item.quantity} ${item.unitName}`}
            justifyContent="space-between"
          />
          <LabeledItem
            label="Bruttó összeg"
            text={formatPrice(item.grossAmount)}
            justifyContent="space-between"
          />
        </View>
        {item.selectedDiscounts ? (
          <>
            <View style={styles.infoGroup}>
              <LabeledItem label="Érvényes kedvezmények" text="" />
            </View>
            {absoluteDiscount ? (
              <View style={styles.firstInfoGroup}>
                <LabeledItem
                  label="Típus"
                  text="abszolút"
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Név"
                  text={absoluteDiscount.name}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Mennyiség"
                  text={String(absoluteDiscount.quantity)}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Mértéke"
                  text={`${absoluteDiscount.amount ?? 0} Ft / ${item.unitName}`}
                  justifyContent="space-between"
                />
              </View>
            ) : null}
            {percentageDiscount ? (
              <View
                style={
                  absoluteDiscount ? styles.infoGroup : styles.firstInfoGroup
                }
              >
                <LabeledItem
                  label="Típus"
                  text="százalékos"
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Név"
                  text={percentageDiscount.name}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Mennyiség"
                  text={String(percentageDiscount.quantity)}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Mértéke"
                  text={`${percentageDiscount.amount ?? 0}% / ${item.unitName}`}
                  justifyContent="space-between"
                />
              </View>
            ) : null}
            {freeFormDiscount ? (
              <View
                style={
                  absoluteDiscount || percentageDiscount
                    ? styles.infoGroup
                    : styles.firstInfoGroup
                }
              >
                <LabeledItem
                  label="Típus"
                  text="tetszőleges"
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Név"
                  text={freeFormDiscount.name}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Mennyiség"
                  text={String(freeFormDiscount.quantity)}
                  justifyContent="space-between"
                />
                <LabeledItem
                  label="Ár"
                  text={`${freeFormDiscount.price ?? ''} Ft / ${item.unitName}`}
                  justifyContent="space-between"
                />
              </View>
            ) : null}
          </>
        ) : null}
        <View style={styles.buttonContainer}>
          <Button
            variant="warning"
            onPress={() =>
              onDelete({ itemId: item.itemId, expirationId: item.expirationId })
            }
          >
            Törlés
          </Button>
          {(item.availableDiscounts?.length ?? 0) > 0 && (
            <Button
              variant="ok"
              onPress={() => {
                navigation.navigate('Discounts', { item });
              }}
            >
              Kedvezmények
            </Button>
          )}
        </View>
      </View>
    </AnimatedListItem>
  );
}

export const RegularItemSelection = memo(_RegularItemSelection, equals);

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '85%',
  },
  firstInfoGroup: {
    marginTop: 10,
  },
  infoGroup: {
    borderTopColor: colors.white,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 5,
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
  selectPartnerContainer: {
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
  },
});
