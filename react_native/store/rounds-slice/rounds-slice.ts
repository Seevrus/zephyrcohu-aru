/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { Rounds } from './rounds-slice-types';

const initialState: Rounds = [
  {
    id: 1,
    name: 'Borsod 1. Kör',
    clientIds: [1, 6, 7, 11, 18],
    receiptNr: {
      first: '10000/23',
      last: '19999/23',
    },
  },
  {
    id: 2,
    name: 'Borsod 2. Kör',
    clientIds: [2, 8, 12, 20],
    receiptNr: {
      first: '20000/23',
      last: '29999/23',
    },
  },
  {
    id: 3,
    name: 'Borsod 3. Kör',
    clientIds: [3, 9, 13, 14, 15, 19],
    receiptNr: {
      first: '30000/23',
      last: '39999/23',
    },
  },
  {
    id: 4,
    name: 'Békés 1. Kör',
    clientIds: [4, 10, 17],
    receiptNr: {
      first: '40000/23',
      last: '49999/23',
    },
  },
  {
    id: 5,
    name: 'Békés 2. Kör',
    clientIds: [5, 16],
    receiptNr: {
      first: '50000/23',
      last: '59999/23',
    },
  },
];

const roundsSlice = createSlice({
  name: 'rounds',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['rounds']>) => {
      state = action.payload;
    },
  },
});

export const { actions: roundsActions, reducer: roundsReducer } = roundsSlice;
