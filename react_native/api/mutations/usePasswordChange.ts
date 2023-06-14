import { useMutation } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import { ChangePasswordRequest } from '../request-types/ChangePasswordRequestType';
import useToken from '../queries/useToken';
import useLogout from './useLogout';

export default function usePasswordChange() {
  const logout = useLogout();

  const {
    data: { token },
  } = useToken();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ password }: ChangePasswordRequest) => {
      try {
        await axios.post<never>(
          `${env.api_url}/users/password`,
          { password },
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        if (isAxiosError(e) && e.response.status === 400) {
          throw new Error('A jelszó nem egyezhet meg a korábbi 10 jelszóval.');
        } else if (isAxiosError(e) && e.response.status === 401) {
          await logout.mutateAsync();
          throw new Error('A jelszó megváltoztatásához újra be kell jelentkeznie.');
        } else if (isAxiosError(e) && e.response.status === 422) {
          throw new Error('A jelszó formátuma nem megfelelő.');
        } else {
          throw new Error('Váratlan hiba lépett fel a jelszóváltoztatás során.');
        }
      }
    },
  });
}
