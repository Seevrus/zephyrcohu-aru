import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { Partners } from '../../../api/response-mappers/mapPartnersResponse';
import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';

type SelectionProps = {
  selected: boolean;
  item: Partners[number];
  onSelect: (id: number) => void;
  onConfirmSelection: (id: number) => void;
};

export default function Selection({
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
    alignSelf: 'center',
    width: '50%',
    marginTop: 10,
  },
});
