import { filter, includes, pipe, prop, take, toLower } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import ListItem from '../../components/ui/ListItem';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { roundActions } from '../../store/round-slice/round-slice';
import { PartnerList, SelectPartnerProps } from '../screen-types';
import Input from '../../components/ui/Input';

type Partner = {
  id: number;
  name: string;
};

const NUM_PARTNERS_SHOWN = 10;

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
  const [partnersShown, setPartnersShown] = useState<Partner[]>(
    take<Partner>(NUM_PARTNERS_SHOWN, partners)
  );

  const currentReceipt = useAppSelector((state) => state.round.currentReceipt);
  const lastPartnerId = useAppSelector((state) => state.round.currentReceipt?.partnerId);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number>(lastPartnerId);

  useEffect(() => {
    if (!currentReceipt) {
      dispatch(roundActions.addNewReceipt());
    }
  }, [currentReceipt, dispatch]);

  useEffect(() => {
    navigation.addListener('blur', () => {
      setSelectedPartnerId(lastPartnerId);
    });
  }, [lastPartnerId, navigation]);

  const searchInputHandler = (inputValue: string) => {
    setPartnersShown(
      pipe(
        filter(pipe(prop('name'), toLower, includes(inputValue.toLowerCase()))),
        take<Partner>(NUM_PARTNERS_SHOWN)
      )(partners)
    );
  };

  const selectPartnerHandler = (id: number) => {
    setSelectedPartnerId(id);
  };

  const confirmPartnerHandler = () => {
    if (selectedPartnerId > -1) {
      dispatch(roundActions.selectPartner(selectedPartnerId));
      navigation.navigate('SelectItems');
    }
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
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            label="Keresés"
            labelPosition="left"
            config={{
              onChangeText: searchInputHandler,
            }}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={partnersShown}
          extraData={selectedPartnerId}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPartner}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={confirmPartnerHandler}>
            Partner kiválasztása
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 50,
    marginVertical: 10,
  },
});
