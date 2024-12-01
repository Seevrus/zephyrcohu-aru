import { type EventArg } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { isEmpty } from 'ramda';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { currentReceiptAtom } from '../../../atoms/receipts';
import { maxNewPartnerIdInUseAtom } from '../../../atoms/sellFlow';
import { Alert } from '../../../components/alert/Alert';
import { TextCard } from '../../../components/info-cards/TextCard';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type AddPartnerFormProps } from '../../../navigators/screen-types';

type FormErrors = {
  taxNumber: string;
  name: string;
  centralPostalCode: string;
  centralCity: string;
  centralAddress: string;
  deliveryName: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryAddress: string;
};

function SuspendedAddPartnerForm({
  navigation,
  route: { params },
}: AddPartnerFormProps) {
  const [maxNewPartnerIdInUse, setMaxNewPartnerIdInUse] = useAtom(
    maxNewPartnerIdInUseAtom
  );
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [taxNumber, setTaxNumber] = useState<string>(params?.taxNumber ?? '');
  const [name, setName] = useState<string>(params?.name ?? '');
  const [centralPostalCode, setCentralPostalCode] = useState<string>(
    params?.centralPostalCode ?? ''
  );
  const [centralCity, setCentralCity] = useState<string>(
    params?.centralCity ?? ''
  );
  const [centralAddress, setCentralAddress] = useState<string>(
    params?.centralAddress ?? ''
  );
  const [deliveryName, setDeliveryName] = useState<string>(
    params?.deliveryName ?? ''
  );
  const [deliveryPostalCode, setDeliveryPostalCode] = useState<string>(
    params?.deliveryPostalCode ?? ''
  );
  const [deliveryCity, setDeliveryCity] = useState<string>(
    params?.deliveryCity ?? ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    params?.deliveryAddress ?? ''
  );

  const [formError, setFormError] = useState<Partial<FormErrors>>({});

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [goBackAction, setGoBackAction] = useState<{
    type: string;
    payload?: object;
    source?: string;
    target?: string;
  } | null>(null);

  const handleGoBack = useCallback(
    (
      event: EventArg<
        'beforeRemove',
        true,
        {
          action: Readonly<{
            type: string;
            payload?: object;
            source?: string;
            target?: string;
          }>;
        }
      >
    ) => {
      event.preventDefault();

      setIsAlertVisible(true);
      setGoBackAction(event.data.action);
    },
    []
  );

  useEffect(() => {
    navigation.addListener('beforeRemove', handleGoBack);

    return () => {
      navigation.removeListener('beforeRemove', handleGoBack);
    };
  }, [handleGoBack, navigation]);

  const handlePartnerSubmit = async () => {
    const formErrors: Partial<FormErrors> = {};
    setFormError(formErrors);

    if (!/^\d{8}-\d-\d{2}$/.test(taxNumber)) {
      formErrors.taxNumber = 'Az adószám formátuma nem megfelelő.';
    }
    if (!name) {
      formErrors.name = 'A név megadása kötelező.';
    }
    if (
      (!centralPostalCode || !centralCity || !centralAddress) &&
      [centralPostalCode, centralCity, centralAddress].join('')
    ) {
      if (!centralPostalCode) {
        formErrors.centralPostalCode = 'Az irányítószám nem lett megadva.';
      }
      if (!centralCity) {
        formErrors.centralCity = 'A város nem lett megadva.';
      }
      if (!centralAddress) {
        formErrors.centralAddress = 'A központi cím nem lett megadva.';
      }
    }
    if (!deliveryName) {
      formErrors.deliveryName = 'A név megadása kötelező.';
    }
    if (!deliveryPostalCode) {
      formErrors.deliveryPostalCode = 'Az irányítószám megadása kötelező.';
    }
    if (!deliveryCity) {
      formErrors.deliveryCity = 'A város megadása kötelező.';
    }
    if (!deliveryAddress) {
      formErrors.deliveryAddress = 'A központi cím megadása kötelező.';
    }

    if (isEmpty(formErrors)) {
      setIsLoading(true);

      const partnerTemporaryId = maxNewPartnerIdInUse + 1;

      await setCurrentReceipt({
        partnerId: partnerTemporaryId,
        partnerCode: '',
        partnerSiteCode: '',
        buyer: {
          id: partnerTemporaryId,
          name,
          country: 'HU',
          postalCode: centralPostalCode || deliveryPostalCode,
          city: centralCity || deliveryCity,
          address: centralAddress || deliveryAddress,
          deliveryName,
          deliveryCountry: 'HU',
          deliveryPostalCode: deliveryPostalCode,
          deliveryCity: deliveryCity,
          deliveryAddress: deliveryAddress,
          iban: '',
          bankAccount: '',
          vatNumber: taxNumber,
        },
        paymentDays: 0,
        invoiceType: 'P',
      });

      await setMaxNewPartnerIdInUse(partnerTemporaryId);

      navigation.removeListener('beforeRemove', handleGoBack);
      navigation.reset({
        index: 1,
        routes: [{ name: 'Index' }, { name: 'SelectItemsToSell' }],
      });
    } else {
      setFormError(formErrors);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.textCardContainer}>
        {params?.taxNumber ? (
          <TextCard>
            Kérem ellenőrizze az adatokat és szükség esetén módosítsa azokat.
          </TextCard>
        ) : null}
        {!params?.taxNumber && (
          <TextCard>
            Amennyiben nem találja a keresett partnert a listában, ezen az
            oldalon lehetősége van manuálisan hozzáadni.
          </TextCard>
        )}
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Input
            label="Adószám:*"
            value={taxNumber}
            invalid={!!formError.taxNumber}
            config={{
              autoCorrect: false,
              onChangeText: setTaxNumber,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Név:*"
            value={name}
            invalid={!!formError.name}
            config={{
              autoCorrect: false,
              onChangeText: setName,
            }}
          />
        </View>
        <View style={styles.addressHeaderContainer}>
          <Text style={styles.addressHeader}>Székhely (központ)</Text>
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Irányítószám:"
            value={centralPostalCode}
            invalid={!!formError.centralPostalCode}
            config={{
              autoCorrect: false,
              onChangeText: setCentralPostalCode,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Város:"
            value={centralCity}
            invalid={!!formError.centralCity}
            config={{
              autoCorrect: false,
              onChangeText: setCentralCity,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Cím:"
            value={centralAddress}
            invalid={!!formError.centralAddress}
            config={{
              autoCorrect: false,
              onChangeText: setCentralAddress,
            }}
          />
        </View>
        <View style={styles.addressHeaderContainer}>
          <Text style={styles.addressHeader}>A bolt neve és címe</Text>
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Név:*"
            value={deliveryName}
            invalid={!!formError.deliveryName}
            config={{
              autoCorrect: false,
              onChangeText: setDeliveryName,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Irányítószám:*"
            value={deliveryPostalCode}
            invalid={!!formError.deliveryPostalCode}
            config={{
              autoCorrect: false,
              onChangeText: setDeliveryPostalCode,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Város:*"
            value={deliveryCity}
            invalid={!!formError.deliveryCity}
            config={{
              autoCorrect: false,
              onChangeText: setDeliveryCity,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Cím:*"
            value={deliveryAddress}
            invalid={!!formError.deliveryAddress}
            config={{
              autoCorrect: false,
              onChangeText: setDeliveryAddress,
            }}
          />
        </View>
        <View style={styles.buttonOuterContainer}>
          <View style={styles.buttonInnerContainer}>
            <Button variant="neutral" onPress={handlePartnerSubmit}>
              Partner felvétele a számlára
            </Button>
          </View>
        </View>
      </View>
      <Alert
        visible={isAlertVisible}
        title="Megerősítés szükséges"
        message="Biztosan vissza szeretne lépni? A megadott adatok nem kerülnek mentésre!"
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: () => setIsAlertVisible(false),
          },
          confirm: {
            text: 'Igen',
            variant: 'warning',
            onPress: () => {
              setIsAlertVisible(false);
              goBackAction && navigation.dispatch(goBackAction);
            },
          },
        }}
        onBackdropPress={() => setIsAlertVisible(false)}
      />
    </ScrollView>
  );
}

export function AddPartnerForm(props: AddPartnerFormProps) {
  return (
    <Suspense>
      <SuspendedAddPartnerForm {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  addressHeader: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.subtitle,
  },
  addressHeaderContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonInnerContainer: {
    marginTop: 20,
    width: 300,
  },
  buttonOuterContainer: {
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  formContainer: {
    marginBottom: 30,
    marginHorizontal: '5%',
  },
  inputContainer: {
    height: 90,
    marginTop: 20,
  },
  textCardContainer: {
    marginTop: 30,
  },
});
