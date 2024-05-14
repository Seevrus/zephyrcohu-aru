import { type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  allPass,
  complement,
  filter,
  includes,
  isNotNil,
  pipe,
  prepend,
  when,
} from 'ramda';
import { useMemo, useState } from 'react';

import { useSearchTaxNumber } from '../../../api/queries/useSearchTaxNumber';
import { type TaxPayer } from '../../../api/response-mappers/mapSearchTaxPayerResponse';
import { type StackParams } from '../../../navigators/screen-types';

type UseSearchPartnerNavFormProps = {
  navigation: NativeStackNavigationProp<
    StackParams,
    'SearchPartnerNavForm',
    undefined
  >;
  route: RouteProp<StackParams, 'SearchPartnerNavForm'>;
};

export function useSearchPartnerNavFormData({
  navigation,
  route: { params },
}: UseSearchPartnerNavFormProps) {
  const [taxNumber, setTaxNumber] = useState<string>(params?.taxNumber ?? '');
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<TaxPayer | null>(null);

  const {
    data: taxPayerData,
    isFetching: isTaxPayerFetching,
    isSuccess: isTaxPayerSuccess,
  } = useSearchTaxNumber({ taxNumber });

  const taxPayersShown: TaxPayer[] = useMemo(
    () =>
      pipe(
        when<TaxPayer[], TaxPayer[]>(
          () => !!searchValue,
          filter<TaxPayer>((taxPayer) => {
            const needle = searchValue.toLocaleLowerCase();
            const haystack = Object.values(taxPayer.locations)
              .filter((location) => !!location)
              .map(
                (location) =>
                  `${location.name}${location.city}${location.address}`
              )
              .join('');

            return haystack.toLocaleLowerCase().includes(needle);
          })
        ),
        when<TaxPayer[], TaxPayer[]>(
          allPass([
            () => isNotNil(selectedResult),
            complement(includes(selectedResult)),
          ]),
          prepend(selectedResult as TaxPayer)
        )
      )(taxPayerData ?? []),
    [searchValue, selectedResult, taxPayerData]
  );

  const taxNumberSearchHandler = (value: string) => {
    setTaxNumber(value);
    setSearchValue('');
  };

  const selectResult = (id: string | number) => {
    setSelectedResult(taxPayerData?.find((tp) => tp.id === +id) ?? null);
  };

  const confirmResultHandler = (id: string | number) => {
    const selectedTaxPayer = taxPayerData?.find((tp) => tp.id === +id);
    setSelectedResult(selectedTaxPayer ?? null);

    if (selectedTaxPayer) {
      navigation.navigate('AddPartnerForm', {
        taxNumber: selectedTaxPayer.vatNumber,
        name:
          selectedTaxPayer.locations.C?.name ??
          selectedTaxPayer.locations.D.name,
        centralPostalCode: selectedTaxPayer.locations.C?.postalCode,
        centralCity: selectedTaxPayer.locations.C?.city,
        centralAddress: selectedTaxPayer.locations.C?.address,
        deliveryName: selectedTaxPayer.locations.D.name,
        deliveryPostalCode: selectedTaxPayer.locations.D?.postalCode,
        deliveryCity: selectedTaxPayer.locations.D?.city,
        deliveryAddress: selectedTaxPayer.locations.D?.address,
      });
    }
  };

  return {
    isLoading: isTaxPayerFetching,
    searchValue,
    setSearchValue,
    taxNumber,
    taxNumberSearchHandler,
    isTaxPayerSuccess,
    taxPayers: taxPayersShown,
    selectedResult,
    selectResult,
    confirmResultHandler,
  };
}
