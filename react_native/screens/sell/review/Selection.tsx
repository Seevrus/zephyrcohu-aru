import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { equals } from 'ramda';
import { memo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { StackParams } from '../../../navigators/screen-types';
import { ReviewItem } from '../../../providers/sell-flow-hooks/useReview';

const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

type SelectionProps = {
  selected: boolean;
  item: ReviewItem;
  onSelect: (id: string) => void;
  onDelete: ({ itemId, expirationId }: { itemId: number; expirationId: number }) => void;
};

function Selection({ selected, item, onSelect, onDelete }: SelectionProps) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();

  const backgroundColor = selected ? colors.ok : colors.neutral;
  const expiresAt = format(new Date(item.expiresAt), 'yyyy-MM');

  const [dropdownHeight, setDropdownHeight] = useState(250);

  const absoluteDiscount = item.selectedDiscounts?.find((d) => d.type === 'absolute');
  const percentageDiscount = item.selectedDiscounts?.find((d) => d.type === 'percentage');
  const freeFormDiscount = item.selectedDiscounts?.find((d) => d.type === 'freeForm');

  return (
    <AnimatedListItem
      id={`${item.itemId}-${item.expirationId}`}
      title={`${item.name} (${expiresAt})`}
      expandedInitially={selected}
      height={dropdownHeight}
      backgroundColor={backgroundColor}
      onSelect={onSelect}
    >
      <View
        style={styles.selectPartnerContainer}
        onLayout={(event: LayoutChangeEvent) => {
          setDropdownHeight(event.nativeEvent.layout.height);
        }}
      >
        <View style={styles.firstInfoGroup}>
          <LabeledItem label="Cikkszám" text={item.articleNumber} />
          <LabeledItem label="Lejárat" text={expiresAt} />
        </View>
        <View style={styles.infoGroup}>
          <LabeledItem label="Mennyiség" text={`${item.quantity} ${item.unitName}`} />
          <LabeledItem label="Bruttó összeg" text={formatPrice(item.grossAmount)} />
        </View>
        {item.selectedDiscounts && (
          <>
            <View style={styles.infoGroup}>
              <LabeledItem label="Érvényes kedvezmények" text="" />
            </View>
            {absoluteDiscount && (
              <View style={styles.firstInfoGroup}>
                <LabeledItem label="Típus" text="abszolút" />
                <LabeledItem label="Név" text={absoluteDiscount.name} />
                <LabeledItem label="Mennyiség" text={String(absoluteDiscount.quantity)} />
              </View>
            )}
            {percentageDiscount && (
              <View style={absoluteDiscount ? styles.infoGroup : styles.firstInfoGroup}>
                <LabeledItem label="Típus" text="százalékos" />
                <LabeledItem label="Név" text={percentageDiscount.name} />
                <LabeledItem label="Mennyiség" text={String(percentageDiscount.quantity)} />
              </View>
            )}
            {freeFormDiscount && (
              <View
                style={
                  absoluteDiscount || percentageDiscount ? styles.infoGroup : styles.firstInfoGroup
                }
              >
                <LabeledItem label="Típus" text="tetszőleges" />
                <LabeledItem label="Név" text={freeFormDiscount.name} />
                <LabeledItem label="Mennyiség" text={String(freeFormDiscount.quantity)} />
                <LabeledItem label="Ár" text={String(freeFormDiscount.price ?? '')} />
              </View>
            )}
          </>
        )}
        <View style={styles.buttonContainer}>
          <Button
            variant="warning"
            onPress={() => onDelete({ itemId: item.itemId, expirationId: item.expirationId })}
          >
            Törlés
          </Button>
          {item.availableDiscounts?.length > 0 && (
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

export default memo(Selection, equals);

const styles = StyleSheet.create({
  selectPartnerContainer: {
    padding: 10,
    paddingTop: 0,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  firstInfoGroup: {
    marginTop: 10,
  },
  infoGroup: {
    marginTop: 10,
    paddingTop: 5,
    borderTopColor: 'white',
    borderTopWidth: 1,
  },
  infoText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
  },
  buttonContainer: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 10,
  },
});
