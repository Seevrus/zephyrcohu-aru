import { http, HttpResponse } from 'msw';

import env from '../../env.json';

export const getCheckTokenErrorResponse = http.get(
  `${env.api_url}/users/check-token`,
  () =>
    HttpResponse.json(
      {
        status: 401,
        codeName: 'Unathorized',
        message:
          'The client must authenticate itself to get the requested response.',
      },
      { status: 401 }
    )
);
