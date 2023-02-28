import { MaterialIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';

export type ReceiptRowProps = {
  item: {
    id: number;
    articleNumber: string;
    name: string;
    expiresAt: string;
    quantity: number;
    unitName: string;
    grossAmount: number;
  };
  onRemoveItem: ({ id, expiresAt }: { id: number; expiresAt: string }) => void;
};

function ReceiptRow({
  item: { id, articleNumber, name, expiresAt, quantity, unitName, grossAmount },
  onRemoveItem,
}: ReceiptRowProps) {
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];
  // const vatLabel = vatAmount === 0 ? 'ÁFA kulcsa' : 'ÁFA kulcsa és összege';
  // const displayedVat = vatAmount === 0 ? `${vatRate}` : `${vatRate}%, ${formatPrice(vatAmount)}`;

  const deleteRowHandler = () => {
    Alert.alert(
      'Biztosan törölni szeretné?',
      `${name} (${articleNumber}), ${expiresAt}\n${quantity} ${unitName} ${formatPrice(
        grossAmount
      )}`,
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: () => onRemoveItem({ id, expiresAt }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <View>
          <Text style={styles.text}>{name}</Text>
        </View>
        <View style={styles.itemDetails}>
          <View style={[styles.detailsCellLeft, styles.detailsCell]}>
            <Text style={[styles.detailsCellLeft, styles.text]}>{articleNumber}</Text>
            <Text style={styles.text}>{expiresAt}</Text>
          </View>
          <View style={styles.detailsCell}>
            <Text style={[styles.detailsCellLeft, styles.text]}>{`${quantity} ${unitName}`}</Text>
            <Text style={styles.text}>{formatPrice(grossAmount)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.deleteIconContainer}>
        <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={deleteRowHandler}>
          <MaterialIcons name="close" size={30} color={colors.warning} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  itemContainer: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.smallText,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsCell: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsCellLeft: {
    marginRight: 10,
  },
  deleteIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default memo(ReceiptRow);
