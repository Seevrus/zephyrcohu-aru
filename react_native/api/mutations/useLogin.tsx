import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom } from 'jotai';

import { storedTokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { type LoginRequest } from '../request-types/LoginRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useLogin() {
  const queryClient = useQueryClient();

  const [, setStoredToken] = useAtom(storedTokenAtom);

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

        await setStoredToken({
          token: response.token.accessToken,
          isPasswordExpired: response.token.isPasswordExpired,
          expiresAt: response.token.expiresAt,
        });

        return response;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useLogin:', error.response?.data);

          if (error?.response?.status === 401) {
            throw new Error('Hibás felhasználónév / jelszó!');
          }
          if (error?.response?.status === 423) {
            throw new Error(
              'Túl sok sikertelen bejelentkezési kísérlet miatt a felhasználót zároltuk.'
            );
          }
        }

        throw new Error('Váratlan hiba lépett fel a bejelentkezés során.');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['token'] });
      await queryClient.invalidateQueries({ queryKey: ['check-token'] });
    },
  });
}
