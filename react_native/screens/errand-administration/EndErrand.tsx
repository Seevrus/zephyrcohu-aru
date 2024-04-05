import { useNetInfo } from '@react-native-community/netinfo';
import { Suspense, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { type EndErrandProps } from '../../navigators/screen-types';
import { useEndErrand } from './useEndErrand';

function SuspendedEndErrand({ navigation }: EndErrandProps) {
  const { isInternetReachable } = useNetInfo();
  const { isPending: isEndErrandPending, finishRound } = useEndErrand();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [endErrandError, setEndErrandError] = useState<string>('');

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation]);

  const endErrandHandler = async () => {
    setIsLoading(true);
    setEndErrandError('');

    try {
      setIsLoading(true);
      await finishRound();

      navigation.replace('PrintEndErrand');
    } catch {
      setIsLoading(false);
      setEndErrandError('Kör zárása sikertelen.');
    }
  };

  if (isLoading || isEndErrandPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!!endErrandError && (
        <View>
          <ErrorCard>{endErrandError}</ErrorCard>
        </View>
      )}
      <Text style={styles.text}>
        Az kör zárásával az alkalmazás készre jelenti a teljes eladási
        folyamatot.
      </Text>
      <Text style={styles.text}>
        Sikeres körzárás esetén a következő képernyőn lesz lehetőség a
        végelszámolás kinyomtatására, amely a készpénzes számlák ellenértéke
        átbételének igazolására szolgál.
      </Text>
      <Text style={styles.text}>
        Kivételes esetektől eltekintve a kör zárását kizárólag visszaérkezés
        után szükséges megtenni.
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant="warning" onPress={endErrandHandler}>
          Kör zárása
        </Button>
      </View>
    </View>
  );
}

export function EndErrand(props: EndErrandProps) {
  return (
    <Suspense>
      <SuspendedEndErrand {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: '25%',
    marginTop: 30,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  text: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    marginTop: 10,
  },
});
