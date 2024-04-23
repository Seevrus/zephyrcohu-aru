import {
  type BarcodeScanningResult,
  Camera,
  CameraView,
} from 'expo-camera/next';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';

type BorealBarCodeScannerProps = {
  onCodeScanned: (code: string) => void;
};

export function BorealBarCodeScanner({
  onCodeScanned,
}: BorealBarCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    onCodeScanned(data);
  };

  if (hasPermission === null) {
    return <Loading />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Az alkalmazás nem rendelkezik a kamera használatához szükséges
            engedélyekkel.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button variant="neutral" onPress={() => onCodeScanned('')}>
            Vissza
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={styles.scanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
