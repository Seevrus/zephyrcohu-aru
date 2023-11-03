import { useNetInfo } from '@react-native-community/netinfo';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  allPass,
  complement,
  filter,
  includes,
  isNil,
  not,
  pipe,
  prepend,
  take,
  when,
} from 'ramda';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useSearchTaxNumber } from '../../../api/queries/useSearchTaxNumber';
import { useToken } from '../../../api/queries/tokenAtom';
import { type TaxPayer } from '../../../api/response-mappers/mapSearchTaxPayerResponse';
import { Loading } from '../../../components/Loading';
import { TextCard } from '../../../components/info-cards/TextCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import {
  type SearchPartnerNavFormProps,
  type StackParams,
} from '../../../navigators/screen-types';
import { Selection } from '../select-partner/Selection';

function Header({
  taxNumber,
  onTaxNumberChange,
  navigation,
}: {
  taxNumber: string;
  onTaxNumberChange: (taxNumber: string) => void;
  navigation: NativeStackNavigationProp<
    StackParams,
    'SearchPartnerNavForm',
    undefined
  >;
}) {
  return (
    <>
      {!taxNumber && (
        <View style={styles.textCardContainer}>
          <TextCard>
            Amennyiben nem találja a keresett partnert a listában, ezen az
            oldalon lehetősége van keresésre a NAV adatbázisában.
          </TextCard>
        </View>
      )}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Input
            label="Keresés adószámra:"
            value={taxNumber}
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              keyboardType: 'numeric',
              maxLength: 8,
              onChangeText: onTaxNumberChange,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.buttonContainer}>
            <Button
              variant="neutral"
              onPress={() => {
                navigation.navigate('AddPartnerForm');
              }}
            >
              Kézi megadás
            </Button>
          </View>
        </View>
      </View>
    </>
  );
}

const NUM_PARTNERS_SHOWN = 10;

export function SearchPartnerNavForm({
  navigation,
  route: { params },
}: SearchPartnerNavFormProps) {
  const { isInternetReachable } = useNetInfo();
  const { isPending: isTokenPending, data: { isTokenExpired } = {} } =
    useToken();

  const [taxNumber, setTaxNumber] = useState<string>(params?.taxNumber ?? '');
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<TaxPayer>(null);

  const {
    data: taxPayerData,
    isPending,
    isSuccess,
  } = useSearchTaxNumber({ taxNumber });

  const [taxPayersShown, setTaxPayersShown] = useState<TaxPayer[]>(null);

  useLayoutEffect(() => {
    if (isInternetReachable === false || isTokenExpired) {
      navigation.replace('AddPartnerForm');
    }
  }, [isInternetReachable, isTokenExpired, navigation]);

  useEffect(() => {
    if (isPending) {
      setTaxPayersShown(null);
    }
  }, [isPending]);

  useEffect(() => {
    setTaxPayersShown((prevTaxpayersShown) => {
      if (!isNil(prevTaxpayersShown) || isPending || !taxPayerData) {
        return prevTaxpayersShown;
      }

      return pipe(
        take(NUM_PARTNERS_SHOWN),
        when<TaxPayer[], TaxPayer[]>(
          allPass([
            () => not(isNil(selectedResult)),
            complement(includes(selectedResult)),
          ]),
          prepend(selectedResult)
        )
      )(taxPayerData);
    });
  }, [isPending, selectedResult, taxPayerData]);

  const taxNumberSearchHandler = (value: string) => {
    setTaxNumber(value);
    setSearchValue('');
  };

  const resultsSearchHandler = (inputValue: string) => {
    setTaxPayersShown(
      pipe<[TaxPayer[]], TaxPayer[], TaxPayer[], TaxPayer[]>(
        filter<TaxPayer>((taxPayer) => {
          const needle = inputValue.toLocaleLowerCase();
          const haystack = Object.values(taxPayer.locations)
            .filter((location) => !!location)
            .map(
              (location) =>
                `${location.name}${location.city}${location.address}`
            )
            .join('');

          return haystack.toLocaleLowerCase().includes(needle);
        }),
        take(NUM_PARTNERS_SHOWN),
        when<TaxPayer[], TaxPayer[]>(
          allPass([
            () => not(isNil(selectedResult)),
            complement(includes(selectedResult)),
          ]),
          prepend(selectedResult)
        )
      )(taxPayerData)
    );
  };

  const selectResult = (id: number) => {
    setSelectedResult(taxPayerData?.find((tp) => tp.id === id));
  };

  const confirmResultHandler = (id: number) => {
    const selectedTaxPayer = taxPayerData?.find((tp) => tp.id === id);
    setSelectedResult(selectedTaxPayer);
    if (selectedTaxPayer) {
      navigation.navigate('AddPartnerForm', {
        taxNumber: selectedTaxPayer.vatNumber,
        name:
          selectedTaxPayer.locations.C.name ??
          selectedTaxPayer.locations.D.name,
        centralPostalCode: selectedTaxPayer.locations.C?.postalCode,
        centralCity: selectedTaxPayer.locations.C?.city,
        centralAddress: selectedTaxPayer.locations.C?.address,
        deliveryPostalCode: selectedTaxPayer.locations.D?.postalCode,
        deliveryCity: selectedTaxPayer.locations.D?.city,
        deliveryAddress: selectedTaxPayer.locations.D?.address,
      });
    }
  };

  const renderPartner: ListRenderItem<TaxPayer> = (
    info: ListRenderItemInfo<TaxPayer>
  ) => (
    <Selection
      item={
        {
          id: info.item.id,
          locations: info.item.locations,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
      selected={info.item.id === selectedResult?.id}
      onSelect={selectResult}
      onConfirmSelection={confirmResultHandler}
    />
  );

  if (isTokenPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          ListHeaderComponent={
            <Header
              taxNumber={taxNumber}
              onTaxNumberChange={taxNumberSearchHandler}
              navigation={navigation}
            />
          }
          data={taxPayersShown}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPartner}
        />
      </View>
      {isSuccess && (
        <View style={[styles.formContainer, styles.bottomFormContainer]}>
          <View style={styles.inputContainer}>
            <Input
              label="Keresés a találatok között:"
              value={searchValue}
              config={{
                autoCorrect: false,
                onChangeText: resultsSearchHandler,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomFormContainer: {
    borderColor: colors.white,
    borderTopWidth: 1,
    marginTop: 20,
  },
  buttonContainer: {
    marginHorizontal: '20%',
    marginTop: 20,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  formContainer: {
    marginHorizontal: '5%',
  },
  inputContainer: {
    height: 90,
  },
  listContainer: {
    maxHeight: '83%',
  },
  textCardContainer: {
    marginBottom: 20,
    marginTop: 30,
  },
});
