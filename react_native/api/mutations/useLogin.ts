import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtom } from 'jotai';

import { storedTokenAtom } from '../../atoms/token';
import { userLoginIdentifierAtom } from '../../atoms/user';
import env from '../../env.json';
import { queryKeys } from '../keys';
import { type LoginRequest } from '../request-types/LoginRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useLogin() {
  const queryClient = useQueryClient();

  const [, setStoredToken] = useAtom(storedTokenAtom);
  const [, setLoginIdentifier] = useAtom(userLoginIdentifierAtom);

  return useMutation({
    async mutationFn({ userName, password }: LoginRequest) {
      try {
        const response = await axios
          .post<LoginResponse>(
            `${env.api_url}/users/login`,
            { userName, password },
            {
              headers: {
                Accept: 'application/json',
                'X-Android-Id': getAndroidId(),
              },
            }
          )
          .then((r) => mapLoginResponse(r.data));

        console.log('Token:', response.token.accessToken);

        await setStoredToken({
          token: response.token.accessToken,
          isPasswordExpired: response.token.isPasswordExpired,
          expiresAt: response.token.expiresAt,
        });

        await setLoginIdentifier(userName);

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
              'Ezzel a felhasználóval egy másik eszközről már bejelentkeztek.'
            );
          }
          if (error?.response?.status === 429) {
            throw new Error(
              'Túl sok sikertelen bejelentkezési kísérlet miatt a felhasználót zároltuk.'
            );
          }
        }

        throw new Error('Váratlan hiba lépett fel a bejelentkezés során.');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    },
  });
}
