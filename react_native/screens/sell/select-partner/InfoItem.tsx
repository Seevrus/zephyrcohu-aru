import { StyleSheet, Text, View } from 'react-native';

import fontSizes from '../../../constants/fontSizes';

type InfoItemProps = {
  label: string;
  text: string;
};

export default function InfoItem({ label, text }: InfoItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  infoLabel: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  infoText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
  },
});