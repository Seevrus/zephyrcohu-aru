import { last } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import ListItem from '../../components/ListItem';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { roundActions } from '../../store/round-slice/round-slice';
import { PartnerList, SelectPartnerProps } from '../screen-types';

type Partner = {
  id: number;
  name: string;
};

export default function SelectPartnerFromAll({ route, navigation }: SelectPartnerProps) {
  const dispatch = useAppDispatch();

  const partnerListType = route.params.partners;
  const selectPartners = useCallback(
    (state: RootState) => {
      if (partnerListType === PartnerList.ALL) {
        return state.partners.data;
      }

      return state.partners.data.filter((partner) => partner.storeId === state.round.storeId);
    },
    [partnerListType]
  );
  const partners = useAppSelector(selectPartners);

  const receipts = useAppSelector((state) => state.round.receipts);
  const lastPartnerId = useAppSelector((state) => state.round.currentReceipt?.partnerId);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number>(lastPartnerId);

  useEffect(() => {
    if (receipts.length === 0 || last(receipts).isSent) {
      dispatch(roundActions.addNewReceipt());
    }
  }, [dispatch, receipts]);

  useEffect(() => {
    navigation.addListener('blur', () => {
      setSelectedPartnerId(lastPartnerId);
    });
  }, [lastPartnerId, navigation]);

  const confirmPartnerHandler = () => {
    if (selectedPartnerId > -1) {
      dispatch(roundActions.selectPartner(selectedPartnerId));
      navigation.navigate('SelectItems');
    }
  };

  const selectPartnerHandler = (id: number) => {
    setSelectedPartnerId(id);
  };

  const renderPartner: ListRenderItem<Partner> = (info: ListRenderItemInfo<Partner>) => (
    <ListItem
      id={info.item.id}
      title={info.item.name}
      selected={info.item.id === selectedPartnerId}
      onPress={selectPartnerHandler}
    />
  );

  const confirmButtonVariant = selectedPartnerId > 0 ? 'ok' : 'disabled';

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonVariant} onPress={confirmPartnerHandler}>
          Partner kiválasztása
        </Button>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={partners}
          extraData={selectedPartnerId}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPartner}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    flex: 0.1,
    marginVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    flex: 0.9,
  },
});
