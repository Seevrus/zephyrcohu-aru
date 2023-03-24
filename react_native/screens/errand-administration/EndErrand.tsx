import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import useToken from '../../hooks/useToken';

import { agentsActions } from '../../store/agents-slice/agents-slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { itemsActions } from '../../store/items-slice/items-slice';
import { partnersActions } from '../../store/partners-slice/partners-slice';
import {
  endRoundApi,
  endRoundLocal,
  uploadOrders,
  upsertReceipts,
} from '../../store/round-slice/round-api-actions';
import { storesActions } from '../../store/stores-slice/stores-slice';

import ErrorCard from '../../components/info-cards/ErrorCard';
import Loading from '../../components/Loading';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { EndErrandProps } from '../screen-types';

export default function EndErrand({ navigation }: EndErrandProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token } = useToken();
  const roundId = useAppSelector((state) => state.round?.roundId);
  const lastSerialNumber = useAppSelector((state) => state.round?.nextAvailableSerialNumber) - 1;
  const yearCode = useAppSelector((state) => state.stores?.store?.yearCode);

  const [loading, setLoading] = useState<boolean>(false);
  const [endErrandError, setEndErrandError] = useState<string>('');

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation]);

  const endErrandHandler = async () => {
    setLoading(true);
    setEndErrandError('');

    try {
      await dispatch(upsertReceipts({ deviceId, token }));
      await dispatch(uploadOrders({ deviceId, token }));
      await dispatch(
        endRoundApi({
          deviceId,
          token,
          roundId,
          lastSerialNumber,
          yearCode,
        })
      );
      await dispatch(endRoundLocal());
      dispatch(agentsActions.endErrand());
      dispatch(itemsActions.endErrand());
      dispatch(partnersActions.endErrand());
      dispatch(storesActions.endErrand());

      navigation.pop();
    } catch (err) {
      setLoading(false);
      setEndErrandError(err.message);
    }
  };

  if (loading) {
    return <Loading message="Kör zárása folyamatban..." />;
  }

  return (
    <View style={styles.container}>
      {!!endErrandError && (
        <View>
          <ErrorCard>{endErrandError}</ErrorCard>
        </View>
      )}
      <Text style={styles.text}>
        Az alábbi gombra kattintva beküldi a még nem beküldött számlákat, valamint az árulevételek
        során rendelésként meadott tételeket. Ezután új kör indítható.
      </Text>
      <Text style={styles.text}>
        Kivételes esetektől eltekintve ezt kizárólag visszaérkezés után szükséges megtenni.
      </Text>
      <Text style={styles.text}>
        <Text style={styles.warning}>Figyelem:</Text> az alkalmazás nem frissíti a szerveren
        elérhető raktárkészleteket, arra kizárólag a központnak van lehetősége, ezért napközbeni
        újraindítás esetén azok nem lesznek pontosak!
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant="warning" onPress={endErrandHandler}>
          Kör zárása
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: '7%',
  },
  text: {
    marginTop: 10,
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  warning: {
    color: colors.warning,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 30,
    marginHorizontal: '25%',
  },
});
