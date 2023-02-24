import { keys, length, pipe, prop } from 'ramda';
import { ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import AnimatedListItem from '../../../components/ui/AnimatedListItem';
import Button from '../../../components/ui/buttons/Button';
import colors from '../../../constants/colors';
import { PartnerDetails } from '../../../store/partners-slice/partners-slice-types';

type SelectionProps = {
  selected: boolean;
  info: ListRenderItemInfo<PartnerDetails>;
  onConfirmSelection: (id: number) => void;
};

export default function Selection({ selected, info, onConfirmSelection }: SelectionProps) {
  const backgroundColor = selected ? colors.ok : colors.neutral;
  const partner = info.item;
  const numberOfLocationsAvailable = pipe(prop('locations'), keys, length)(partner);

  let displayName: string;
  let centralName: string;
  let centralAddress: string;
  let deliveryName: string | undefined;
  let deliveryAddress: string | undefined;
  if (numberOfLocationsAvailable === 2) {
    displayName = partner.locations.D.name;
    centralName = partner.locations.C.name;
    centralAddress = `${partner.locations.C.city}, ${partner.locations.C.address}`;
    deliveryName = partner.locations.D.name;
    deliveryAddress = `${partner.locations.D.city}, ${partner.locations.D.address}`;
  } else {
    displayName = partner.locations.D.name;
    centralName = displayName;
    centralAddress = `${partner.locations.D.city}, ${partner.locations.D.address}`;
  }

  return (
    <AnimatedListItem
      title={displayName}
      expandedInitially={selected}
      height={numberOfLocationsAvailable * 60 + 100}
      backgroundColor={backgroundColor}
    >
      <View style={styles.selectPartnerContainer}>
        <Text>{`Név: ${centralName}`}</Text>
        <Text>{`Cím: ${centralAddress}`}</Text>
        {deliveryName && <Text>{`Szállítási név: ${deliveryName}`}</Text>}
        {deliveryAddress && <Text>{`Szállítási cím: ${deliveryAddress}`}</Text>}
        <Button variant="ok" onPress={() => onConfirmSelection(partner.id)}>
          Kiválasztás
        </Button>
      </View>
    </AnimatedListItem>
  );
}

const styles = StyleSheet.create({
  selectPartnerContainer: {
    padding: 10,
  },
});
