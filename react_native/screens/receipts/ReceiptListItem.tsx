import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type ReceiptListItemProps = {
  partnerName: string;
  receiptNr: string;
  total: number;
};

export default function ReceiptListItem({ partnerName, receiptNr, total }: ReceiptListItemProps) {
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

  return (
    <View style={styles.container}>
      <Pressable android_ripple={{ color: colors.neutralRipple }} style={styles.listItem}>
        <Text style={styles.text}>{partnerName}</Text>
        <View style={styles.row}>
          <Text style={styles.text}>{receiptNr}</Text>
          <Text style={[styles.text, styles.total]}>{formatPrice(total)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: colors.neutral,
    borderRadius: 8,
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
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
  },
  total: {
    alignSelf: 'flex-end',
  },
});
