/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { Clients } from './clients-slice-types';

const initialState: Clients = [
  {
    id: 1,
    name: 'Első Ügyfél',
    vatNumber: '10000000-0-01',
    address: {
      zipCode: 1001,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 2,
    name: 'Második Ügyfél',
    vatNumber: '10000000-0-02',
    address: {
      zipCode: 1002,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 3,
    name: 'Harmadik Ügyfél',
    vatNumber: '10000000-0-03',
    address: {
      zipCode: 1003,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 4,
    name: 'Negyedik Ügyfél',
    vatNumber: '10000000-0-04',
    address: {
      zipCode: 1004,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 5,
    name: 'Ötödik Ügyfél',
    vatNumber: '10000000-0-05',
    address: {
      zipCode: 1005,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 6,
    name: 'Hatodik Ügyfél',
    vatNumber: '10000000-0-06',
    address: {
      zipCode: 1006,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 7,
    name: 'Hetedik Ügyfél',
    vatNumber: '10000000-0-07',
    address: {
      zipCode: 1007,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 8,
    name: 'Nyolcadik Ügyfél',
    vatNumber: '10000000-0-08',
    address: {
      zipCode: 1008,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 9,
    name: 'Kilencedik Ügyfél',
    vatNumber: '10000000-0-09',
    address: {
      zipCode: 1009,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 10,
    name: 'Tizedik Ügyfél',
    vatNumber: '10000000-0-10',
    address: {
      zipCode: 1010,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 11,
    name: 'Tizenegyedik Ügyfél',
    vatNumber: '10000000-0-11',
    address: {
      zipCode: 1011,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 12,
    name: 'Tizenkettedik Ügyfél',
    vatNumber: '10000000-0-12',
    address: {
      zipCode: 1012,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 13,
    name: 'Tizenharmadik Ügyfél',
    vatNumber: '10000000-0-13',
    address: {
      zipCode: 1013,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 14,
    name: 'Tizennegyedik Ügyfél',
    vatNumber: '10000000-0-14',
    address: {
      zipCode: 1014,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 15,
    name: 'Tizenötödik Ügyfél',
    vatNumber: '10000000-0-15',
    address: {
      zipCode: 1015,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 16,
    name: 'Tizenhatodik Ügyfél',
    vatNumber: '10000000-0-16',
    address: {
      zipCode: 1016,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 17,
    name: 'Tizenhetedik Ügyfél',
    vatNumber: '10000000-0-17',
    address: {
      zipCode: 1017,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 18,
    name: 'Tizennyolcadik Ügyfél',
    vatNumber: '10000000-0-18',
    address: {
      zipCode: 1018,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 19,
    name: 'Tizenkilencedik Ügyfél',
    vatNumber: '10000000-0-19',
    address: {
      zipCode: 1019,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
  {
    id: 20,
    name: 'Huszadik Ügyfél',
    vatNumber: '10000000-0-20',
    address: {
      zipCode: 1020,
      city: 'Alsógöröngyös',
      address: 'Kossuth utca 112.',
    },
  },
];

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['clients']>) => {
      state = action.payload;
    },
  },
});

export const { actions: clientsActions, reducer: clientsReducer } = clientsSlice;
