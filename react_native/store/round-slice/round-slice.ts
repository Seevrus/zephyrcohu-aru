/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Round } from './round-slice-types';

const initialState: Round = {
  storeId: undefined,
  nextAvailableSerialNumber: undefined,
  receipts: [],
};

const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['round']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Round;
    },
    initializeRound: () => {},
    addNewReceipt: () => {},
    removeLastUnsentReceipt: () => {},
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
