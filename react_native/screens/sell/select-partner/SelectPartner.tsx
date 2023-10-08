import {
  allPass,
  complement,
  filter,
  includes,
  isNil,
  not,
  pipe,
  prepend,
  prop,
  take,
  when,
} from 'ramda';
import { useEffect, useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { Partners } from '../../../api/response-mappers/mapPartnersResponse';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import { PartnerList, SelectPartnerProps } from '../../screen-types';
import Selection from './Selection';

const NUM_PARTNERS_SHOWN = 10;

export default function SelectPartner({ route, navigation }: SelectPartnerProps) {
  const { partners, selectedPartner, selectPartner, saveSelectedPartnerInFlow } =
    useSellFlowContext();

  const partnerListType = route.params.partners;
  const [partnersShown, setPartnersShown] = useState<Partners>(null);

  useEffect(() => {
    setPartnersShown((prevPartnersShown) => {
      if (!isNil(prevPartnersShown) || !partners) {
        return prevPartnersShown;
      }

      return pipe(
        prop(partnerListType),
        take(NUM_PARTNERS_SHOWN),
        when<Partners, Partners>(
          allPass([() => not(isNil(selectedPartner)), complement(includes(selectedPartner))]),
          prepend(selectedPartner)
        )
      )(partners);
    });
  }, [partnerListType, partners, selectedPartner]);

  const searchInputHandler = (inputValue: string) => {
    setPartnersShown(
      pipe<[Record<PartnerList, Partners>], Partners, Partners, Partners, Partners>(
        prop(partnerListType),
        filter<Partners[number]>((partner) => {
          const needle = inputValue.toLocaleLowerCase();
          const haystack = Object.values(partner.locations)
            .map((location) => `${location.name}${location.city}${location.address}`)
            .join('');

          return haystack.toLocaleLowerCase().includes(needle);
        }),
        take(NUM_PARTNERS_SHOWN),
        when<Partners, Partners>(
          allPass([() => not(isNil(selectedPartner)), complement(includes(selectedPartner))]),
          prepend(selectedPartner)
        )
      )(partners)
    );
  };

  const confirmPartnerHandler = () => {
    saveSelectedPartnerInFlow();
    navigation.navigate('SelectItems');
  };

  const renderPartner: ListRenderItem<Partners[number]> = (
    info: ListRenderItemInfo<Partners[number]>
  ) => (
    <Selection
      info={info}
      selected={info.item.id === selectedPartner?.id}
      onSelect={selectPartner}
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
