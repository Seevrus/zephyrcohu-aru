import { MaterialIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { Suspense } from 'react';
import {
  FlatList,
  type ListRenderItem,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { type Partners } from '../../../api/response-mappers/mapPartnersResponse';
import { Container } from '../../../components/container/Container';
import { Loading } from '../../../components/Loading';
import { Input } from '../../../components/ui/Input';
import { type SelectPartnerProps } from '../../../navigators/screen-types';
import { Selection } from './Selection';
import { useSelectPartnerData } from './useSelectPartnerData';

function SuspendedSelectPartner({ route, navigation }: SelectPartnerProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    onSearch,
    partners,
    selectedPartner,
    selectPartnerHandler,
    confirmPartnerHandler,
  } = useSelectPartnerData({ route, navigation });

  const renderPartner: ListRenderItem<Partners[number]> = (
    info: ListRenderItemInfo<Partners[number]>
  ) => (
    <Selection
      item={info.item}
      selected={info.item.id === selectedPartner?.id}
      onSelect={selectPartnerHandler}
      onConfirmSelection={confirmPartnerHandler}
    />
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            label="Keresés"
            labelPosition="left"
            config={{
              onChangeText: onSearch,
            }}
          />
          <Pressable
            onPress={() => {
              if (isInternetReachable) {
                navigation.navigate('SearchPartnerNavForm');
              } else {
                navigation.navigate('AddPartnerForm');
              }
            }}
          >
            <MaterialIcons name="add-circle-outline" size={40} color="white" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          key="select-partner-list"
          data={partners}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPartner}
        />
      </View>
    </Container>
  );
}

export function SelectPartner(props: SelectPartnerProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectPartner {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
  },
});
