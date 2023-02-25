import { keys, length, pipe } from 'ramda';
import { useState } from 'react';
import { LayoutChangeEvent, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/buttons/Button';
import colors from '../../../constants/colors';
import { PartnerDetails } from '../../../store/partners-slice/partners-slice-types';
import InfoItem from './InfoItem';

type SelectionProps = {
  selected: boolean;
  info: ListRenderItemInfo<PartnerDetails>;
  onSelect: (id: number) => void;
  onConfirmSelection: (id: number) => void;
};

export default function Selection({
  selected,
  info,
  onSelect,
  onConfirmSelection,
}: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;
  const partner = info.item;
  const { id, locations, phoneNumber } = partner;
  const numberOfLocationsAvailable = pipe(keys, length)(locations);

  let displayName: string;
  let centralName: string;
  let centralAddress: string;
  let deliveryName: string | undefined;
  let deliveryAddress: string | undefined;
  if (numberOfLocationsAvailable === 2) {
    displayName = locations.D.name;
    centralName = locations.C.name;
    centralAddress = `${locations.C.city}, ${locations.C.address}`;
    deliveryName = locations.D.name;
    deliveryAddress = `${locations.D.city}, ${locations.D.address}`;
  } else {
    displayName = locations.D.name;
    centralName = displayName;
    centralAddress = `${locations.D.city}, ${locations.D.address}`;
  }

  const [dropdownHeight, setDropdownHeight] = useState(250);

  return (
    <AnimatedListItem
      id={id}
      title={displayName}
      expandedInitially={selected}
      height={dropdownHeight}
      backgroundColor={backgroundColor}
      onSelect={onSelect}
    >
      <View
        style={styles.selectPartnerContainer}
        onLayout={(e: LayoutChangeEvent) => {
          setDropdownHeight(e.nativeEvent.layout.height);
        }}
      >
        <View style={styles.infoGroup}>
          <InfoItem label="Név" text={centralName} />
          <InfoItem label="Cím" text={centralAddress} />
        </View>
        {(deliveryName || deliveryAddress) && (
          <View style={styles.infoGroup}>
            {deliveryName && <InfoItem label="Szállítási név" text={deliveryName} />}
            {deliveryAddress && <InfoItem label="Szállítási cím" text={deliveryAddress} />}
          </View>
        )}
        {phoneNumber && (
          <View style={styles.infoGroup}>
            <InfoItem label="Telefon" text={phoneNumber} />
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
  infoGroup: {
    marginTop: 10,
  },
  buttonContainer: {
    alignSelf: 'center',
    width: '50%',
    marginTop: 10,
  },
});
