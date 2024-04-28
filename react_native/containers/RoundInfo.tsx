import { format } from 'date-fns';
import { isNotNil } from 'ramda';
import { StyleSheet, Text, View } from 'react-native';

import { useCheckToken } from '../api/queries/useCheckToken';
import { usePartnerLists } from '../api/queries/usePartnerLists';
import { useStoreDetails } from '../api/queries/useStoreDetails';
import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';

export function RoundInfo() {
  const { data: user } = useCheckToken();
  const { data: partnerLists } = usePartnerLists();
  const { data: storeDetails } = useStoreDetails(user?.storeId);

  const partnerList = partnerLists?.find(
    (pl) => pl.id === user?.lastRound?.partnerListId
  );

  if (!user?.lastRound || isNotNil(user.lastRound.roundFinished)) {
    return null;
  }

  return (
    <View style={styles.infoContainer}>
      {partnerList ? (
        <View style={styles.infoItemContainer}>
          <Text style={styles.infoItem}>Boltlista:</Text>
          <Text style={styles.infoItem}>{partnerList.name}</Text>
        </View>
      ) : null}
      {storeDetails ? (
        <View style={styles.infoItemContainer}>
          <Text style={styles.infoItem}>Raktár:</Text>
          <Text style={styles.infoItem}>{storeDetails.name}</Text>
        </View>
      ) : null}
      <View style={styles.infoItemContainer}>
        <Text style={styles.infoItem}>Kör kezdete:</Text>
        <Text style={styles.infoItem}>
          {format(user.lastRound.roundStarted, 'yyyy-MM-dd')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    borderTopColor: colors.white,
    borderTopWidth: 2,
    paddingHorizontal: '5%',
    paddingVertical: 15,
  },
  infoItem: {
    color: colors.white,
    fontSize: fontSizes.smallText,
    fontWeight: '600',
  },
  infoItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
