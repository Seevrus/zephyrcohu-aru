import { equals } from 'ramda';
import { memo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { type OtherReviewItem } from '../../../atoms/sellFlow';
import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { formatPrice } from '../../../utils/formatPrice';
import { getReviewItemId } from './getReviewItemId';

type SelectionProps = {
  selected: boolean;
  item: OtherReviewItem;
  onSelect: (reviewItemId: string) => void;
  onDelete: (itemId: number) => void;
};

function _OtherItemSelection({
  selected,
  item,
  onSelect,
  onDelete,
}: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;

  const [dropdownHeight, setDropdownHeight] = useState(250);

  return (
    <AnimatedListItem
      id={getReviewItemId(item)}
      title={
        <View>
          <View>
            <Text style={styles.selectItemText}>{item.name}</Text>
          </View>
          <View style={styles.infoGroupWithBorder}>
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
        <View style={styles.infoGroup}>
          <LabeledItem
            label="Cikkszám"
            text={item.articleNumber}
            justifyContent="space-between"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            variant="warning"
            onPress={() => {
              onDelete(item.itemId);
            }}
          >
            Törlés
          </Button>
        </View>
      </View>
    </AnimatedListItem>
  );
}

export const OtherItemSelection = memo(_OtherItemSelection, equals);

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '85%',
  },
  infoGroup: {
    marginTop: 10,
  },
  infoGroupWithBorder: {
    borderTopColor: colors.white,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 5,
  },
  selectItemText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectPartnerContainer: {
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
  },
});
