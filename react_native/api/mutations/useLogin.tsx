import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import env from '../../env.json';
import { type LoginRequest } from '../request-types/LoginRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ userName, password }: LoginRequest) => {
      try {
        const response = await axios
          .post<LoginResponse>(
            `${env.api_url}/users/login`,
            { userName, password },
            { headers: { Accept: 'application/json' } }
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

        console.log(response.token.accessToken);

        return response;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useLogin:', error.response?.data);
        }
        throw isAxiosError(error) && error.response.status === 401
          ? new Error('Hibás felhasználónév / jelszó!')
          : new Error('Váratlan hiba lépett fel a bejelentkezés során.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['token'] });
    },
  });
}
