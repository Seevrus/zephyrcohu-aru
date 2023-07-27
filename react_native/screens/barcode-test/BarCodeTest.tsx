import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import colors from '../../constants/colors';
import Button from '../../components/ui/Button';
import fontSizes from '../../constants/fontSizes';

export default function BarCodeTest() {
  const [hasPermission, setHasPermission] = useState(null);

  const [scanned, setScanned] = useState(false);
  const [codeType, setCodeType] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setCodeType(type);
    setCode(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={{ height: scanned ? 0 : 500 }}>
        {!scanned && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>
      {scanned && (
        <>
          <Text style={[styles.text, styles.boldText]}>Beolvasott kód típusa:</Text>
          <Text style={styles.text}>{codeType}</Text>
          <Text style={[styles.text, styles.boldText]}>Beolvasott kód:</Text>
          <Text style={styles.text}>{code}</Text>
          <View style={styles.buttonContainer}>
            <Button
              variant="neutral"
              onPress={() => {
                setScanned(false);
              }}
            >
              Új kód olvasása
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  text: {
    marginTop: 10,
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  boldText: {
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
