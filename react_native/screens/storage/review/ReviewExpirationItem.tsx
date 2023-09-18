import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ListItem } from '../../../providers/StorageFlowProvider';

type ReviewExpirationItemProps = {
  item: ListItem;
};

export default function ReviewExpirationItem({ item }: ReviewExpirationItemProps) {
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
          <Text style={styles.detailsRowText}>Rakodott mennyiség:</Text>
          <Text style={styles.detailsRowText}>
            {item.currentQuantity - (item.originalQuantity ?? 0)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowText}>Rakodás utáni készlet:</Text>
          <Text style={styles.detailsRowText}>{item.currentQuantity}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral,
    marginHorizontal: '7%',
    marginVertical: 10,
    borderRadius: 10,
  },
  selectItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  selectItemNameContainer: {
    width: '70%',
  },
  selectItemText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  selectItemContainer: {
    padding: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsRowText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
});
