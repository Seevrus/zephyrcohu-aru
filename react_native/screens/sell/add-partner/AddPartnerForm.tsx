import { useNetInfo } from '@react-native-community/netinfo';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import ErrorCard from '../../../components/info-cards/ErrorCard';
import TextCard from '../../../components/info-cards/TextCard';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import Button from '../../../components/ui/Button';

export default function AddPartnerForm() {
  const { isInternetReachable } = useNetInfo();

  const [taxNumber, setTaxNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [felir, setFelir] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [finalTaxNumber, setFinalTaxNumber] = useState<string>('');

  const searchTaxNumberVariant = taxNumber.length === 8 ? 'neutral' : 'disabled';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.textCardContainer}>
        <TextCard>
          Amennyiben nem találja a keresett partnert a listában, ezen az oldalon lehetősége van
          manuálisan hozzáadni.
        </TextCard>
      </View>
      {!isInternetReachable && (
        <View style={styles.textCardContainer}>
          <ErrorCard>Az alkalmazás jelenleg internetkapcsolat nélkül működik.</ErrorCard>
        </View>
      )}
      {isInternetReachable && (
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
                onChangeText: setTaxNumber,
              }}
            />
          </View>
          <View style={styles.buttonOuterContainer}>
            <View style={styles.buttonInnerContainer}>
              <Button variant={searchTaxNumberVariant} onPress={() => {}}>
                Keresés
              </Button>
            </View>
          </View>
        </View>
      )}
      <View style={[styles.formContainer, styles.formContainerBottom]}>
        <View style={styles.inputContainer}>
          <Input
            label="Adószám:"
            value={finalTaxNumber}
            config={{
              autoCorrect: false,
              onChangeText: setFinalTaxNumber,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Név:"
            value={name}
            config={{
              autoCorrect: false,
              onChangeText: setName,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="FELIR:"
            value={felir}
            config={{
              autoCorrect: false,
              onChangeText: setFelir,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Irányítószám:"
            value={postalCode}
            config={{
              autoCorrect: false,
              onChangeText: setPostalCode,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Város:"
            value={city}
            config={{
              autoCorrect: false,
              onChangeText: setCity,
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Cím:"
            value={address}
            config={{
              autoCorrect: false,
              onChangeText: setAddress,
            }}
          />
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
  formContainer: {
    marginHorizontal: '5%',
  },
  formContainerBottom: {
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
    width: 150,
  },
});
