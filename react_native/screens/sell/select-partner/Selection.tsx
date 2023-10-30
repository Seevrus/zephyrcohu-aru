import { equals } from 'ramda';
import { memo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { type Partners } from '../../../api/response-mappers/mapPartnersResponse';
import { AnimatedListItem } from '../../../components/ui/AnimatedListItem';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';

type SelectionProps = {
  selected: boolean;
  item: Partners[number];
  onSelect: (id: number) => void;
  onConfirmSelection: (id: number) => void;
};

function _Selection({
  selected,
  item,
  onSelect,
  onConfirmSelection,
}: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;
  const { id, locations, phoneNumber } = item;

  const deliveryName = locations.D?.name;
  const deliveryAddress = `${locations.D?.postalCode} ${locations.D?.city}, ${locations.D?.address}`;
  const hasCentralLocation = !!locations.C;
  const centralName = locations.C?.name;
  const centralAddress = `${locations.C?.postalCode} ${locations.C?.city}, ${locations.C?.address}`;

  const [dropdownHeight, setDropdownHeight] = useState(250);

  return (
    <AnimatedListItem
      id={id}
      title={deliveryName}
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
          <Text style={styles.infoText}>{deliveryAddress}</Text>
        </View>
        {hasCentralLocation && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoText}>{centralName}</Text>
            <Text style={styles.infoText}>{centralAddress}</Text>
          </View>
        )}
        {phoneNumber && (
          <View style={styles.infoGroup}>
            <LabeledItem label="Telefon" text={phoneNumber} />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button variant="ok" onPress={() => onConfirmSelection(id)}>
            Kiválasztás
          </Button>
        </View>
      </View>
    </AnimatedListItem>
  );
}

export const Selection = memo(_Selection, equals);

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    width: '50%',
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
  infoText: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
  },
  selectPartnerContainer: {
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
  },
});
