import 'react-native-get-random-values';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom } from 'jotai';
import { v4 as uuidv4 } from 'uuid';

import { deviceIdAtom, storedTokenAtom } from '../../atoms/token';
import { userLoginIdentifierAtom } from '../../atoms/user';
import { queryKeys } from '../keys';
import { type LoginRequest } from '../request-types/LoginRequestType';
import { mapLoginResponse } from '../response-mappers/mapLoginResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useLogin() {
  const queryClient = useQueryClient();

  const [, setStoredToken] = useAtom(storedTokenAtom);
  const [, setLoginIdentifier] = useAtom(userLoginIdentifierAtom);
  const [, setDeviceId] = useAtom(deviceIdAtom);

  return useMutation({
    async mutationFn({ userName, password }: LoginRequest) {
      try {
        const deviceId = uuidv4();
        await setDeviceId(deviceId);

        const response = await axios
          .post<LoginResponse>(
            `${process.env.EXPO_PUBLIC_API_URL}/users/login`,
            { userName, password },
            {
              headers: {
                Accept: 'application/json',
                'X-Device-Id': deviceId,
              },
            }
          )
          .then((response) => mapLoginResponse(response.data));

        console.log('Device ID', deviceId);
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
