import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import env from '../../env.json';
import { useToken } from '../queries/useToken';
import { type ChangePasswordRequest } from '../request-types/ChangePasswordRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';
import { useLogout } from './useLogout';

export function usePasswordChange() {
  const queryClient = useQueryClient();
  const logout = useLogout();

  const {
    data: { token },
  } = useToken();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ password }: ChangePasswordRequest) => {
      try {
        const response = await axios
          .post<LoginResponse>(
            `${env.api_url}/users/password`,
            { password },
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((r) => mapLoginResponse(r.data));

        await SecureStore.setItemAsync(
          'boreal-token',
          JSON.stringify({
            token: response.token.accessToken,
            isPasswordExpired: response.token.isPasswordExpired,
            expiresAt: response.token.expiresAt,
          })
        );
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('usePasswordChange:', error.response?.data);
        }
        if (isAxiosError(error) && error.response.status === 400) {
          throw new Error('A jelszó nem egyezhet meg a korábbi 10 jelszóval.');
        } else if (isAxiosError(error) && error.response.status === 401) {
          await logout.mutateAsync();
          throw new Error(
            'A jelszó megváltoztatásához újra be kell jelentkeznie.'
          );
        } else if (isAxiosError(error) && error.response.status === 422) {
          throw new Error('A jelszó formátuma nem megfelelő.');
        } else {
          throw new Error(
            'Váratlan hiba lépett fel a jelszóváltoztatás során.'
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['token'] });
    },
  });
}
