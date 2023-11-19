import { http, HttpResponse } from 'msw';
import env from '../../env.json';

export const getPartnerListsOkResponse = http.get(
  `${env.api_url}/partner_lists`,
  () =>
    HttpResponse.json({
      data: [
        {
          id: 2,
          name: 'Test Partner List',
          partners: [15],
          createdAt: '2023-08-28 23:37:11',
          updatedAt: '2023-08-28 23:37:11',
        },
      ],
    })
);
