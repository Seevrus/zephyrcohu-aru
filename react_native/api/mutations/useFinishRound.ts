import { useMutation } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { type FinishRoundRequestType } from '../request-types/FinishRoundRequestType';
import { type FinishRoundResponseType } from '../response-types/FinishRoundResponseType';

export function useFinishRound() {
  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn(request: FinishRoundRequestType) {
      try {
        const response = await axios.post<FinishRoundResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/rounds/finish`,
          { data: request },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useFinishRound:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel a kör zárása során.');
      }
    },
  });
}
