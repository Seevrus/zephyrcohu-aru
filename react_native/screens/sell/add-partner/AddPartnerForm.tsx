import { EventArg } from '@react-navigation/native';
import { formatISO } from 'date-fns';
import { isEmpty } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import Loading from '../../../components/Loading';
import TextCard from '../../../components/info-cards/TextCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { AddPartnerFormProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';

type FormErrors = {
  taxNumber: string;
  name: string;
  centralPostalCode: string;
  centralCity: string;
  centralAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryAddress: string;
};

export default function AddPartnerForm({ navigation, route: { params } }: AddPartnerFormProps) {
  const { isLoading: isContextLoading, saveNewPartnerInFlow } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [taxNumber, setTaxNumber] = useState<string>(params?.taxNumber ?? '');
  const [name, setName] = useState<string>(params?.name ?? '');
  const [centralPostalCode, setCentralPostalCode] = useState<string>(
    params?.centralPostalCode ?? ''
  );
  const [centralCity, setCentralCity] = useState<string>(params?.centralCity ?? '');
  const [centralAddress, setCentralAddress] = useState<string>(params?.centralAddress ?? '');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState<string>(
    params?.deliveryPostalCode ?? ''
  );
  const [deliveryCity, setDeliveryCity] = useState<string>(params?.deliveryCity ?? '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(params?.deliveryAddress ?? '');

  const [formError, setFormError] = useState<Partial<FormErrors>>({});

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

      Alert.alert(
        'Megerősítés szükséges',
        'Biztosan vissza szeretne lépni? A megadott adatok nem kerülnek mentésre!',
        [
          { text: 'Mégsem' },
          {
            text: 'Igen',
            style: 'destructive',
            onPress: async () => {
              navigation.dispatch(event.data.action);
            },
          },
        ]
      );
    },
    [navigation]
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

    if (!/^\d{8}-\d{1}-\d{2}$/.test(taxNumber)) {
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
    if (!deliveryPostalCode) {
      formErrors.deliveryPostalCode = 'Az irányítószám megadása kötelező..';
    }
    if (!deliveryCity) {
      formErrors.deliveryCity = 'A város megadása kötelező..';
    }
    if (!deliveryAddress) {
      formErrors.deliveryAddress = 'A központi cím megadása kötelező.';
    }

    if (!isEmpty(formErrors)) {
      setFormError(formErrors);
    } else {
      setIsLoading(true);
      const now = formatISO(new Date());
      await saveNewPartnerInFlow({
        id: -1,
        vatNumber: taxNumber,
        locations: {
          C: {
            name,
            locationType: 'C',
            country: 'HU',
            postalCode: centralPostalCode,
            city: centralCity,
            address: centralAddress,
            createdAt: now,
            updatedAt: now,
          },
          D: {
            name,
            locationType: 'D',
            country: 'HU',
            postalCode: deliveryPostalCode,
            city: deliveryCity,
            address: deliveryAddress,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }

    setIsLoading(false);
    navigation.removeListener('beforeRemove', handleGoBack);
    navigation.reset({
      index: 1,
      routes: [{ name: 'Index' }, { name: 'SelectItemsToSell' }],
    });
  };

  if (isLoading || isContextLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.textCardContainer}>
        {params?.taxNumber && (
          <TextCard>Kérem ellenőrizze az adatokat és szükség esetén módosítsa azokat.</TextCard>
        )}
        {!params?.taxNumber && (
          <TextCard>
            Amennyiben nem találja a keresett partnert a listában, ezen az oldalon lehetősége van
            manuálisan hozzáadni.
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
          <Text style={styles.addressHeader}>Központi cím (ha van)</Text>
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
          <Text style={styles.addressHeader}>Számlázási cím</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  textCardContainer: {
    marginTop: 30,
  },
  addressHeaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  addressHeader: {
    fontFamily: 'Muli',
    fontSize: fontSizes.subtitle,
    color: 'white',
  },
  formContainer: {
    marginHorizontal: '5%',
    marginBottom: 30,
  },
  inputContainer: {
    height: 90,
    marginTop: 20,
  },
  buttonOuterContainer: {
    alignItems: 'center',
  },
  buttonInnerContainer: {
    marginTop: 20,
    width: 300,
  },
});
