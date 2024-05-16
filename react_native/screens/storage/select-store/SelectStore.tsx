import { useNetInfo } from '@react-native-community/netinfo';
import { isNotNil } from 'ramda';
import { Suspense, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Container } from '../../../components/container/Container';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Loading } from '../../../components/Loading';
import { Dropdown } from '../../../components/ui/Dropdown';
import { ForwardIcon } from '../../../navigators/ForwardIcon';
import { type SelectStoreProps } from '../../../navigators/screen-types';
import { useSelectStoreData } from './useSelectStoreData';

function SuspendedSelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    error,
    selectedStoreId,
    handleSubmitSelectedStore,
    displayStores,
    handleStoreSelect,
  } = useSelectStoreData(navigation);

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.goBack();
    }
  }, [isInternetReachable, navigation]);

  useEffect(() => {
    if (isNotNil(selectedStoreId)) {
      navigation.setOptions({
        headerRight() {
          return <ForwardIcon onPress={handleSubmitSelectedStore} />;
        },
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [handleSubmitSelectedStore, navigation, selectedStoreId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container style={styles.container}>
      <View style={styles.headerContainer}>
        {error ? (
          <View>
            <ErrorCard>{error}</ErrorCard>
          </View>
        ) : null}
      </View>
      <View style={styles.listContainer}>
        <Dropdown
          label="Raktár"
          data={displayStores}
          onSelect={handleStoreSelect}
        />
      </View>
    </Container>
  );
}

export function SelectStore(props: SelectStoreProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectStore {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  headerContainer: {
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
});
