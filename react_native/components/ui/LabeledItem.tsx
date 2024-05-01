import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

type LabeledItemProps = {
  label: string;
  text: string;
  justifyContent?: 'flex-start' | 'space-between';
};

export function LabeledItem({
  label,
  text,
  justifyContent = 'flex-start',
}: LabeledItemProps) {
  return (
    <View style={[styles.container, { justifyContent }]}>
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
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  infoText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
  },
});
