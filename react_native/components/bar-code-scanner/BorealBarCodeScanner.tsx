import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import Loading from '../Loading';
import Button from '../ui/Button';

type BorealBarCodeScannerProps = {
  onCodeScanned: (code: string) => void;
};

export default function BorealBarCodeScanner({ onCodeScanned }: BorealBarCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
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
            Az alkalmazás nem rendelkezik a kamera használatához szükséges engedélyekkel.
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
      <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={styles.scanner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  textContainer: {
    marginHorizontal: '7%',
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: '7%',
  },
});
