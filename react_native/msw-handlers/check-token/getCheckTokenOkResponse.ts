import { addDays } from 'date-fns';
import { http, HttpResponse } from 'msw';

import env from '../../env.json';

export const getCheckTokenOkResponse = http.get(
  `${env.api_url}/users/check-token`,
  () =>
    HttpResponse.json({
      id: 1,
      code: '01',
      userName: 'fteszt',
      state: 'R',
      name: 'Teszt Felhasználó',
      company: {
        id: 1,
        code: '001',
        name: 'Szlartibartfaszt és Társa',
        country: 'HU',
        postalCode: '8145',
        city: 'Nádasladány',
        address: 'Kastély út 5.',
        felir: 'XY1234567',
        vatNumber: '12345678-1-23',
        iban: 'HU88',
        bankAccount: '12345678-00000000-12345678',
        phoneNumber: '+36701237654',
        email: null,
      },
      phoneNumber: '+36301234567',
      roles: ['A'],
      storeId: null,
      createdAt: '2023-05-18T20:18:34.000000Z',
      updatedAt: '2023-11-10T20:18:06.000000Z',
      lastActive: '2023-11-10T20:18:06.000000Z',
      token: {
        tokenType: 'Bearer',
        accessToken: 'abc123',
        abilities: ['AM', 'I', 'A'],
        expiresAt: addDays(new Date(), 1),
      },
    })
);
