import { filter, pipe, take } from 'ramda';
import { useEffect, useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectPartnerProps } from '../../screen-types';
import Selection from './Selection';

const NUM_PARTNERS_SHOWN = 10;

export default function SelectPartnerFromAll({ route, navigation }: SelectPartnerProps) {
  const dispatch = useAppDispatch();

  const partnerListType = route.params.partners;
  const partners = usePartners(partnerListType);
  const [partnersShown, setPartnersShown] = useState<PartnerDetails[]>(
    take<PartnerDetails>(NUM_PARTNERS_SHOWN, partners)
  );

  const currentReceipt = useAppSelector((state) => state.round.currentReceipt);
  const lastPartnerId = useAppSelector((state) => state.round.currentReceipt?.partnerId);
  const [selectedPartnerId, setSelectedPartnerId] = useState(lastPartnerId);

  useEffect(() => {
    if (!currentReceipt) {
      dispatch(roundActions.addNewReceipt());
    }
  }, [currentReceipt, dispatch]);

  const searchInputHandler = (inputValue: string) => {
    setPartnersShown(
      pipe(
        filter<PartnerDetails>((partner) => {
          const needle = inputValue.toLocaleLowerCase();
          const haystack = Object.values(partner.locations)
            .map((location) => `${location.name}${location.city}${location.address}`)
            .join('');

          return haystack.toLocaleLowerCase().includes(needle);
        }),
        take<PartnerDetails>(NUM_PARTNERS_SHOWN)
      )(partners)
    );
  };

  const selectPartnerHandler = (id: number) => {
    setSelectedPartnerId(id);
  };

  const confirmPartnerHandler = (id: number) => {
    dispatch(roundActions.selectPartner(id));
    navigation.navigate('SelectItems');
  };

  const renderPartner: ListRenderItem<PartnerDetails> = (
    info: ListRenderItemInfo<PartnerDetails>
  ) => (
    <Selection
      info={info}
      selected={info.item.id === selectedPartnerId}
      onSelect={selectPartnerHandler}
      onConfirmSelection={confirmPartnerHandler}
    />
  );

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
});
