import { trim } from 'ramda';
import { StyleSheet, Text, View } from 'react-native';

import { type StorageListItem } from '../../../atoms/storageFlow';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';

type ReviewExpirationItemProps = {
  item: StorageListItem;
};

export function ReviewExpirationItem({ item }: ReviewExpirationItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.selectItemTitle}>
        <View style={styles.selectItemNameContainer}>
          <Text style={styles.selectItemText}>{item.name}</Text>
        </View>
        <Text style={styles.selectItemText}>{item.expiresAt}</Text>
      </View>
      <View style={styles.selectItemContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Vonalkód:</Text>
          <Text style={styles.detailsRowText}>
            {trim(`${item.itemBarcode} ${item.expirationBarcode}`)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Rakodott mennyiség:</Text>
          <Text style={styles.detailsRowText}>{item.quantityChange}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Rakodás utáni készlet:</Text>
          <Text style={styles.detailsRowText}>
            {(item.originalQuantity ?? 0) + (item.quantityChange ?? 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  detailsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsRowText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
  },
  selectItemContainer: {
    padding: 10,
  },
  selectItemNameContainer: {
    width: '70%',
  },
  selectItemText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectItemTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
});
