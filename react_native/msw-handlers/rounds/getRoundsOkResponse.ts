/* eslint-disable sonarjs/no-duplicate-string */
import { http, HttpResponse } from 'msw';

export const getRoundsOkResponse = http.get(
  `${process.env.EXPO_PUBLIC_API_URL}/rounds`,
  () =>
    HttpResponse.json({
      data: [
        {
          id: 25,
          userId: 1,
          storeId: 2,
          partnerListId: 2,
          lastSerialNumber: 20_005,
          yearCode: 23,
          roundStarted: '2023-11-07T22:13:47.000000Z',
          roundFinished: '2023-11-07T22:13:47.000000Z',
          createdAt: '2023-11-07T01:14:14.000000Z',
          updatedAt: '2023-11-07T22:13:47.000000Z',
        },
        {
          id: 26,
          userId: 1,
          storeId: 2,
          partnerListId: 2,
          lastSerialNumber: null,
          yearCode: null,
          roundStarted: '2023-11-07T05:00:00.000000Z',
          roundFinished: null,
          createdAt: '2023-11-07T22:16:29.000000Z',
          updatedAt: '2023-11-07T22:16:29.000000Z',
        },
      ],
    })
);
