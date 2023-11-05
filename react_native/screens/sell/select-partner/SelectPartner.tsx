import { MaterialIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAtom } from 'jotai';
import {
  allPass,
  complement,
  filter,
  includes,
  isNotNil,
  pipe,
  prepend,
  sort,
  take,
  when,
} from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useActiveRound } from '../../../api/queries/useActiveRound';
import { usePartnerLists } from '../../../api/queries/usePartnerLists';
import { usePartners } from '../../../api/queries/usePartners';
import {
  type Partner,
  type Partners,
} from '../../../api/response-mappers/mapPartnersResponse';
import { currentReceiptAtom } from '../../../atoms/receipts';
import { selectedPartnerAtom } from '../../../atoms/sellFlow';
import { Loading } from '../../../components/Loading';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import {
  PartnerList,
  type SelectPartnerProps,
} from '../../../navigators/screen-types';
import { Selection } from './Selection';

const NUM_PARTNERS_SHOWN = 10;

export function SelectPartner({ route, navigation }: SelectPartnerProps) {
  const { isInternetReachable } = useNetInfo();

  const { data: activeRound, isPending: isActiveRoundPending } =
    useActiveRound();
  const { data: partnerLists, isPending: isPartnerListsPending } =
    usePartnerLists();
  const { data: partners, isPending: isPartnersPending } = usePartners();

  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [selectedPartner, setSelectedPartner] = useAtom(selectedPartnerAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const partnerListType = route.params.partners;

  const currentPartnerList = useMemo(
    () =>
      partnerLists?.find(
        (partnerList) => partnerList.id === activeRound?.partnerListId
      ),
    [activeRound?.partnerListId, partnerLists]
  );

  const partnersShown: Partners = useMemo(
    () =>
      pipe(
        when(
          () => partnerListType === PartnerList.STORE,
          filter<Partner>(
            (partner) => !!currentPartnerList?.partners?.includes(partner.id)
          )
        ),
        sort<Partner>(
          (partner1, partner2) =>
            partner1.locations?.D?.name.localeCompare(
              partner2.locations?.D?.name,
              'HU-hu'
            )
        ),
        when<Partners, Partners>(
          () => !!searchInputValue,
          filter<Partner>((partner) => {
            const needle = searchInputValue.toLocaleLowerCase();
            const haystack = Object.values(partner.locations)
              .map(
                (location) =>
                  `${location.name}${location.city}${location.address}`
              )
              .join('');

            return haystack.toLocaleLowerCase().includes(needle);
          })
        ),
        (partners) => take<Partner>(NUM_PARTNERS_SHOWN, partners),
        when<Partners, Partners>(
          allPass([
            () => isNotNil(selectedPartner),
            complement(includes(selectedPartner)),
          ]),
          prepend(selectedPartner as Partner)
        )
      )(partners ?? []),
    [
      currentPartnerList?.partners,
      partnerListType,
      partners,
      searchInputValue,
      selectedPartner,
    ]
  );

  const selectPartnerHandler = useCallback(
    (partnerId: string | number) => {
      setSelectedPartner(
        partners?.find((partner) => partner.id === +partnerId) ?? null
      );
    },
    [partners, setSelectedPartner]
  );

  const confirmPartnerHandler = useCallback(async () => {
    if (selectedPartner) {
      setIsLoading(true);

      setCurrentReceipt({
        partnerId: selectedPartner.id,
        partnerCode: selectedPartner.code,
        partnerSiteCode: selectedPartner.siteCode,
        buyer: {
          id: selectedPartner.id,
          name:
            selectedPartner.locations.C?.name ??
            selectedPartner.locations.D?.name,
          country:
            selectedPartner.locations.C?.country ??
            selectedPartner.locations.D?.country,
          postalCode:
            selectedPartner.locations.C?.postalCode ??
            selectedPartner.locations.D?.postalCode,
          city:
            selectedPartner.locations.C?.city ??
            selectedPartner.locations.D?.city,
          address:
            selectedPartner.locations.C?.address ??
            selectedPartner.locations.D?.address,
          deliveryName: selectedPartner.locations.D?.name,
          deliveryCountry: selectedPartner.locations.D?.country,
          deliveryPostalCode: selectedPartner.locations.D?.postalCode,
          deliveryCity: selectedPartner.locations.D?.city,
          deliveryAddress: selectedPartner.locations.D?.address,
          iban: selectedPartner.iban,
          bankAccount: selectedPartner.bankAccount,
          vatNumber: selectedPartner.vatNumber,
        },
        paymentDays: selectedPartner.paymentDays,
        invoiceType: selectedPartner.invoiceType,
      });

      navigation.replace('SelectItemsToSell');
    }
  }, [navigation, selectedPartner, setCurrentReceipt]);

  const renderPartner: ListRenderItem<Partners[number]> = (
    info: ListRenderItemInfo<Partners[number]>
  ) => (
    <Selection
      item={info.item}
      selected={info.item.id === selectedPartner?.id}
      onSelect={selectPartnerHandler}
      onConfirmSelection={confirmPartnerHandler}
    />
  );

  if (
    isLoading ||
    isActiveRoundPending ||
    isPartnerListsPending ||
    isPartnersPending
  ) {
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
              onChangeText: setSearchInputValue,
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
    backgroundColor: colors.background,
    flex: 1,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
  },
});
