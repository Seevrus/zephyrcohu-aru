import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import useToken from '../api/queries/useToken';
import { StackParams } from '../screens/screen-types';

export default function useTokenWithRedirect() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const tokenResult = useToken();

  useEffect(() => {
    if (tokenResult.isError || (!tokenResult.isLoading && tokenResult.data?.isTokenExpired)) {
      navigation.replace('Login');
    }
  }, [navigation, tokenResult.data?.isTokenExpired, tokenResult.isError, tokenResult.isLoading]);

  // TODO password expiration

  return tokenResult;
}