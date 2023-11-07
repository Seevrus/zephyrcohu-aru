import { useNetInfo } from '@react-native-community/netinfo';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtomValue } from 'jotai';
import { useLayoutEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { type TaxPayer } from '../../../api/response-mappers/mapSearchTaxPayerResponse';
import { tokenAtom } from '../../../atoms/token';
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
import { useSearchPartnerNavFormData } from './useSearchPartnerNavFormData';

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

export function SearchPartnerNavForm({
  navigation,
  route,
}: SearchPartnerNavFormProps) {
  const { isInternetReachable } = useNetInfo();
  const { isTokenExpired } = useAtomValue(tokenAtom);

  const {
    isLoading,
    searchValue,
    setSearchValue,
    taxNumber,
    taxNumberSearchHandler,
    isTaxPayerSuccess,
    taxPayers,
    selectedResult,
    selectResult,
    confirmResultHandler,
  } = useSearchPartnerNavFormData({
    navigation,
    route,
  });

  useLayoutEffect(() => {
    if (isInternetReachable === false || isTokenExpired) {
      navigation.replace('AddPartnerForm');
    }
  }, [isInternetReachable, isTokenExpired, navigation]);

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

  if (isLoading) {
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
          data={taxPayers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPartner}
        />
      </View>
      {isTaxPayerSuccess ? (
        <View style={[styles.formContainer, styles.bottomFormContainer]}>
          <View style={styles.inputContainer}>
            <Input
              label="Keresés a találatok között:"
              value={searchValue}
              config={{
                autoCorrect: false,
                onChangeText: setSearchValue,
              }}
            />
          </View>
        </View>
      ) : null}
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
