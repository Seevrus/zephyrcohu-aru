import { format } from 'date-fns';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ReviewRow } from './types';

const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

type SelectionProps = {
  selected: boolean;
  item: ReviewRow;
  onSelect: (id: string) => void;
  onDelete: ({ itemId, expirationId }: { itemId: number; expirationId: number }) => void;
};

export default function Selection({ selected, item, onSelect, onDelete }: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;
  const expiresAt = format(new Date(item.expiresAt), 'yyyy-MM');

  const [dropdownHeight, setDropdownHeight] = useState(250);

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
        <View style={styles.buttonContainer}>
          <Button
            variant="warning"
            onPress={() => onDelete({ itemId: item.itemId, expirationId: item.expirationId })}
          >
            Törlés
          </Button>
          <Button variant="ok" onPress={() => {}}>
            Kedvezmények
          </Button>
        </View>
      </View>
    </AnimatedListItem>
  );
}

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
