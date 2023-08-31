import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import env from '../../env.json';
import { useUserContext } from '../../providers/UserProvider';
import { LoginRequest } from '../request-types/LoginRequestType';
import mapLoginResponse from '../response-mappers/mapLoginResponse';
import { LoginResponse } from '../response-types/LoginResponseType';

export default function useLogin() {
  const queryClient = useQueryClient();
  const { saveLoginResponse } = useUserContext();

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

        return response;
      } catch (e) {
        if (isAxiosError(e) && e.response.status === 401) {
          throw new Error('Hibás felhasználónév / jelszó!');
        } else {
          throw new Error('Váratlan hiba lépett fel a bejelentkezés során.');
        }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['token'] });
      saveLoginResponse(data);
    },
  });
}
