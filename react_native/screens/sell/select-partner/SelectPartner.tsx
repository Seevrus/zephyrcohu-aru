import { MaterialIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
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
import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Partners } from '../../../api/response-mappers/mapPartnersResponse';
import Loading from '../../../components/Loading';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { PartnerList, SelectPartnerProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import Selection from './Selection';

const NUM_PARTNERS_SHOWN = 10;

export default function SelectPartner({ route, navigation }: SelectPartnerProps) {
  const { isInternetReachable } = useNetInfo();
  const {
    isLoading: isContextLoading,
    partners,
    selectedPartner,
    selectPartner,
    saveSelectedPartnerInFlow,
  } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const confirmPartnerHandler = async () => {
    setIsLoading(true);
    await saveSelectedPartnerInFlow();
    setIsLoading(false);
    navigation.replace('SelectItemsToSell');
  };

  const renderPartner: ListRenderItem<Partners[number]> = (
    info: ListRenderItemInfo<Partners[number]>
  ) => (
    <Selection
      item={info.item}
      selected={info.item.id === selectedPartner?.id}
      onSelect={selectPartner}
      onConfirmSelection={confirmPartnerHandler}
    />
  );

  if (isLoading || isContextLoading) {
    return <Loading />;
  }

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
          <Pressable
            onPress={() => {
              if (isInternetReachable) {
                navigation.navigate('SearchPartnerNavForm');
              } else {
                navigation.navigate('AddPartnerForm');
              }
            }}
          >
            <MaterialIcons name="add-circle-outline" size={40} color="white" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          key="select-partner-list"
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
});
