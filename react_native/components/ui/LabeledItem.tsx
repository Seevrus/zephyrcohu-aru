import { StyleSheet, Text, View } from 'react-native';

import { fontSizes } from '../../constants/fontSizes';
import { colors } from '../../constants/colors';

type LabeledItemProps = {
  label: string;
  text: string;
};

export function LabeledItem({ label, text }: LabeledItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoLabel: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  infoText: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
  },
});
