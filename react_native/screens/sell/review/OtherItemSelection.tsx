import { equals } from 'ramda';
import { memo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { type OtherReviewItem } from '../../../atoms/sellFlow';
import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
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
      title={item.name}
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
          <LabeledItem label="Cikkszám" text={item.articleNumber} />
        </View>
        <View style={styles.infoGroup}>
          <LabeledItem
            label="Mennyiség"
            text={`${item.quantity} ${item.unitName}`}
          />
          <LabeledItem
            label="Bruttó összeg"
            text={formatPrice(item.grossAmount)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button variant="warning" onPress={() => onDelete(item.itemId)}>
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
  firstInfoGroup: {
    marginTop: 10,
  },
  infoGroup: {
    borderTopColor: colors.white,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 5,
  },
  selectPartnerContainer: {
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
  },
});
