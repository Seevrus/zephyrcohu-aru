import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtom, useAtomValue } from 'jotai';

import { storedTokenAtom, tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { queryKeys } from '../keys';
import { type ChangePasswordRequest } from '../request-types/ChangePasswordRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';
import { useLogout } from './useLogout';

export function usePasswordChange() {
  const queryClient = useQueryClient();
  const { mutateAsync: logout } = useLogout();

  const [, setStoredToken] = useAtom(storedTokenAtom);
  const { token } = useAtomValue(tokenAtom);

  return useMutation({
    async mutationFn({ password }: ChangePasswordRequest) {
      try {
        const response = await axios
          .post<LoginResponse>(
            `${env.api_url}/users/password`,
            { password },
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                'X-Android-Id': getAndroidId(),
              },
            }
          )
          .then((response) => mapLoginResponse(response.data));

        await setStoredToken({
          token: response.token.accessToken,
          isPasswordExpired: response.token.isPasswordExpired,
          expiresAt: response.token.expiresAt,
        });
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('usePasswordChange:', error.response?.data);
        }
        if (isAxiosError(error) && error.response?.status === 400) {
          throw new Error('A jelszó nem egyezhet meg a korábbi 10 jelszóval.');
        } else if (isAxiosError(error) && error.response?.status === 401) {
          await logout();
          throw new Error(
            'A jelszó megváltoztatásához újra be kell jelentkeznie.'
          );
        } else if (isAxiosError(error) && error.response?.status === 422) {
          throw new Error('A jelszó formátuma nem megfelelő.');
        } else {
          throw new Error(
            'Váratlan hiba lépett fel a jelszóváltoztatás során.'
          );
        }
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    },
  });
}
