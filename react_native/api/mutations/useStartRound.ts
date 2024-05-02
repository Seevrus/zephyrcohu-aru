import { useMutation } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { type StartRoundRequestType } from '../request-types/StartRoundRequestType';
import { type StartRoundResponseType } from '../response-types/StartRoundResponseType';

export function useStartRound() {
  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn(request: StartRoundRequestType) {
      try {
        const response = await axios.post<StartRoundResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/rounds/start`,
          { data: request },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        if (response.data.data.storeId !== request.storeId) {
          throw new Error('Invalid Store ID');
        }

        return response.data.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useStartRound:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel a kör indítása során.');
      }
    },
  });
}
