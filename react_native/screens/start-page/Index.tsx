import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { Suspense } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../atoms/token';
import { Loading } from '../../components/Loading';
import { Tile, type TileT } from '../../components/Tile';
import { Alert } from '../../components/alert/Alert';
import { Container } from '../../components/container/Container';
import { TextCard } from '../../components/info-cards/TextCard';
import { useTiles } from '../../hooks/useTiles';

function SuspendedIndex() {
  const { isFetching: isUserFetching } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const token = useAtomValue(loadable(tokenAtom));

  const { alert, tiles } = useTiles() || {};

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
    <Container testID="index-page" style={styles.container}>
      {!isInternetReachable && (
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
          <TextCard>Körindításhoz és -záráshoz kérem jelentkezzen be.</TextCard>
        </View>
      ) : null}
      <FlatList
        data={tiles}
        keyExtractor={(tile) => tile.id}
        renderItem={renderTile}
      />
      {alert ? (
        <Alert
          visible={alert.isAlertVisible}
          title={alert.alertTitle}
          message={alert.alertMessage}
          buttons={{
            cancel: alert.cancelButton,
            confirm: alert.confirmButton,
          }}
          onBackdropPress={alert.onBackdropPress}
        />
      ) : null}
    </Container>
  );
}

export function Index() {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedIndex />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  textCardContainer: {
    marginTop: 30,
  },
});
