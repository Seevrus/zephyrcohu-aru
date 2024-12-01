import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { Suspense } from 'react';
import {
  FlatList,
  type ListRenderItem,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../atoms/token';
import { Alert } from '../../components/alert/Alert';
import { Container } from '../../components/container/Container';
import { TextCard } from '../../components/info-cards/TextCard';
import { Loading } from '../../components/Loading';
import { Tile, type TileT } from '../../components/Tile';
import { RoundInfo } from '../../containers/RoundInfo';
import { useAppUpdates } from '../../hooks/useAppUpdates';
import { useInitializeApp } from '../../hooks/useInitializeApp';
import { useTiles } from '../../hooks/useTiles';
import { type IndexProps } from '../../navigators/screen-types';

function SuspendedIndex({ navigation }: IndexProps) {
  useInitializeApp();

  const { alert: updateAlert } = useAppUpdates();
  const { isFetching: isUserFetching } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const token = useAtomValue(loadable(tokenAtom));

  const { alert: tileAlert, tiles } = useTiles() || {};

  const loginNavigationHandler = () => {
    navigation.navigate('Login');
  };

  const renderTile: ListRenderItem<TileT> = (
    info: ListRenderItemInfo<TileT>
  ) => (
    <Tile
      id={info.item.id}
      title={info.item.title}
      Icon={info.item.Icon}
      variant={info.item.variant}
      onPress={info.item.onPress}
    />
  );

  if (isUserFetching || token.state !== 'hasData') {
    return <Loading />;
  }

  return (
    <Container testID="index-page">
      {isInternetReachable === false && (
        <View style={styles.textCardContainer}>
          <TextCard>
            Az alkalmazás jelenleg internetkapcsolat nélkül működik.
          </TextCard>
        </View>
      )}
      {token.data.isPasswordExpired ? (
        <View style={styles.textCardContainer}>
          <TextCard>Az Ön jelszava lejárt, kérem változtassa meg.</TextCard>
        </View>
      ) : null}
      {token.data.isTokenExpired ? (
        <View style={styles.textCardContainer}>
          <Pressable onPress={loginNavigationHandler}>
            <TextCard>
              A program használatának megkezdéséhez kérem jelentkezzen be.
            </TextCard>
          </Pressable>
        </View>
      ) : null}
      <FlatList
        data={tiles}
        keyExtractor={(tile) => tile.id}
        renderItem={renderTile}
      />
      <RoundInfo />
      {updateAlert ? (
        <Alert
          visible={updateAlert.isAlertVisible}
          title={updateAlert.alertTitle}
          message={updateAlert.alertMessage}
          buttons={{
            cancel: updateAlert.cancelButton,
          }}
          onBackdropPress={updateAlert.onBackdropPress}
        />
      ) : null}
      {!updateAlert && tileAlert ? (
        <Alert
          visible={tileAlert.isAlertVisible}
          title={tileAlert.alertTitle}
          message={tileAlert.alertMessage}
          buttons={{
            cancel: tileAlert.cancelButton,
          }}
          onBackdropPress={tileAlert.onBackdropPress}
        />
      ) : null}
    </Container>
  );
}

export function Index(props: IndexProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedIndex {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  textCardContainer: {
    marginTop: 30,
  },
});
