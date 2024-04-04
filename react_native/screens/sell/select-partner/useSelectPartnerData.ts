import { type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
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

import { useCheckToken } from '../../../api/queries/useCheckToken';
import { usePartnerLists } from '../../../api/queries/usePartnerLists';
import { usePartners } from '../../../api/queries/usePartners';
import {
  type Partner,
  type Partners,
} from '../../../api/response-mappers/mapPartnersResponse';
import { currentReceiptAtom } from '../../../atoms/receipts';
import { selectedPartnerAtom } from '../../../atoms/sellFlow';
import {
  PartnerList,
  type PartnerTabParams,
  type StackParams,
} from '../../../navigators/screen-types';

const NUM_PARTNERS_SHOWN = 10;

type UseSelectPartnerProps = {
  route: RouteProp<
    PartnerTabParams,
    'SelectPartnerFromStore' | 'SelectPartnerFromAll'
  >;
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<
      PartnerTabParams,
      'SelectPartnerFromStore' | 'SelectPartnerFromAll',
      undefined
    >,
    NativeStackNavigationProp<StackParams, keyof StackParams, undefined>
  >;
};

export function useSelectPartnerData({
  route,
  navigation,
}: UseSelectPartnerProps) {
  const { data: user, isPending: isUserPending } = useCheckToken();
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
        (partnerList) => partnerList.id === user?.lastRound?.partnerListId
      ),
    [partnerLists, user?.lastRound?.partnerListId]
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
        sort<Partner>((partner1, partner2) =>
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

      await setCurrentReceipt({
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

  return {
    isLoading:
      isLoading || isPartnerListsPending || isPartnersPending || isUserPending,
    onSearch: setSearchInputValue,
    partners: partnersShown,
    selectedPartner,
    selectPartnerHandler,
    confirmPartnerHandler,
  };
}
