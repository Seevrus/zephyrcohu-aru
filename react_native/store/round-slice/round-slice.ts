/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { initializeRound } from './round-api-actions';
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
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['round']>) => {
      state.storeId = payload.storeId;
      state.nextAvailableSerialNumber = payload.nextAvailableSerialNumber;
      state.receipts = mergeLeft(state.receipts, payload.receipts ?? []) as Round['receipts'];
    },
    addNewReceipt: () => {},
    removeLastUnsentReceipt: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(initializeRound.fulfilled, (state, { payload }) => {
      state.storeId = payload.storeId;
      state.nextAvailableSerialNumber = payload.nextAvailableSerialNumber;
      state.receipts = [];
    });
    builder.addCase(initializeRound.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
