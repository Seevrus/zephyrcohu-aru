import { equals } from 'ramda';
import { memo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { OtherReviewItem } from '../../../providers/sell-flow-hooks/useReview';
import formatPrice from '../../../utils/formatPrice';
import getReviewItemId from './getReviewItemId';

type SelectionProps = {
  selected: boolean;
  item: OtherReviewItem;
  onSelect: (reviewItemId: string) => void;
  onDelete: (itemId: number) => void;
};

function RegularItemSelection({ selected, item, onSelect, onDelete }: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;

  const [dropdownHeight, setDropdownHeight] = useState(250);

  return (
    <AnimatedListItem
      id={getReviewItemId(item)}
      title={item.name}
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
        </View>
        <View style={styles.infoGroup}>
          <LabeledItem label="Mennyiség" text={`${item.quantity} ${item.unitName}`} />
          <LabeledItem label="Bruttó összeg" text={formatPrice(item.grossAmount)} />
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

export default memo(RegularItemSelection, equals);

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
