import { Text, View } from 'react-native';

import StartErrandLogo from '../assets/svg/start-errand.svg';
// <StartErrandLogo width={120} height={40} />

export default function Index() {
  return (
    <View>
      <Text>És ez már a tényleges kezdőképernyő, ahonnan a fő funkciók elérhetőek.</Text>
      <Text>
        A vissza gombbal kilépünk, a StartupCheck felé nincs visszaút. (Majd egyszer, még nincs
        implementálva.)
      </Text>
    </View>
  );
}
