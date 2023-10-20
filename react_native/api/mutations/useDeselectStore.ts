import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import useToken from '../queries/useToken';
import { LoginResponse } from '../response-types/LoginResponseType';

export default function useDeselectStore() {
  const queryClient = useQueryClient();
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['deselect-store'],
    mutationFn: async () => {
      try {
        const response = await axios.post<LoginResponse>(
          `${env.api_url}/storage/unlock_from_user`,
          undefined,
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );

        return response.data;
      } catch (e) {
        throw new Error('Váratlan hiba lépett fel a raktár leválasztása során.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
    },
  });
}
