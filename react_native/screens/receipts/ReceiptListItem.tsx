import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { formatPrice } from '../../utils/formatPrice';

type ReceiptListItemProps = {
  partnerName: string;
  serialNumber: number;
  yearCode: number;
  total: number;
  onPress: (serialNumber: number) => void;
};

export function ReceiptListItem({
  partnerName,
  serialNumber,
  yearCode,
  total,
  onPress,
}: ReceiptListItemProps) {
  return (
    <View style={styles.container}>
      <Pressable
        android_ripple={{ color: colors.neutralRipple }}
        style={styles.listItem}
        onPress={() => onPress(serialNumber)}
      >
        <Text style={styles.text}>{partnerName}</Text>
        <View style={styles.row}>
          <Text style={styles.text}>{`${serialNumber}/${yearCode}`}</Text>
          <Text style={[styles.text, styles.total]}>{formatPrice(total)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral,
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  listItem: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
  },
  total: {
    alignSelf: 'flex-end',
  },
});
