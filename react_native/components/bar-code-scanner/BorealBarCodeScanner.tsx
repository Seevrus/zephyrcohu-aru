import { FontAwesome5 } from '@expo/vector-icons';
import {
  type EventArg,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera/next';
import { not } from 'ramda';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { type StackParams } from '../../navigators/screen-types';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';

type BorealBarCodeScannerProps = {
  navigation:
    | NativeStackNavigationProp<StackParams, 'ScanBarCodeInStorage', undefined>
    | NativeStackNavigationProp<StackParams, 'ScanBarCodeInSell', undefined>;
  previousScreen: 'SelectItemsFromStore' | 'SelectItemsToSell';
};

export function BorealBarCodeScanner({
  navigation,
  previousScreen,
}: BorealBarCodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();

  const barCode = useRef<string | undefined>(undefined);
  const [isTorchEnabled, setIsTorchEnabled] = useState<boolean>(false);
  const [goBack, setGoBack] = useState<boolean>(false);

  const handleToggleFlash = () => {
    setIsTorchEnabled(not);
  };

  const backButtonHandler = useCallback(
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
      navigation.removeListener('beforeRemove', backButtonHandler);

      setIsTorchEnabled(false);
      barCode.current = undefined;
      setGoBack(true);
    },
    [navigation]
  );

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string | undefined }) => {
      navigation.removeListener('beforeRemove', backButtonHandler);

      setIsTorchEnabled(false);
      barCode.current = data;
      setGoBack(true);
    },
    [backButtonHandler, navigation]
  );

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', backButtonHandler);

      return () => {
        navigation.removeListener('beforeRemove', backButtonHandler);
      };
    }, [backButtonHandler, navigation])
  );

  useEffect(() => {
    if (!isTorchEnabled && goBack) {
      navigation.replace(previousScreen, { scannedBarCode: barCode.current });
    }
  }, [goBack, isTorchEnabled, navigation, previousScreen]);

  if (!permission || !isFocused) {
    return <Loading />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Az alkalmazás nem rendelkezik a kamera használatához szükséges
            engedélyekkel.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            variant="neutral"
            onPress={() => handleBarCodeScanned({ data: undefined })}
          >
            Vissza
          </Button>
        </View>
        <View style={styles.buttonContainer}>
          <Button variant="neutral" onPress={requestPermission}>
            Engedélyezés
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          enableTorch={isTorchEnabled}
          onBarcodeScanned={handleBarCodeScanned}
          style={styles.scanner}
        />
      </View>
      <View style={styles.flashlightContainer}>
        <Pressable onPress={handleToggleFlash}>
          <FontAwesome5 name="lightbulb" size={60} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    paddingHorizontal: '20%',
  },
  cameraContainer: {
    height: 350,
    marginVertical: 30,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: 'column',
  },
  flashlightContainer: {
    alignItems: 'center',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: '7%',
  },
  text: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  textContainer: {
    marginHorizontal: '7%',
  },
});
