/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { concat, init, last, mergeDeepLeft, pipe, propOr, values } from 'ramda';

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
      state.receipts = pipe(
        mergeDeepLeft(state.receipts),
        values
      )(propOr([], 'receipts', payload) as Round['receipts']) as Round['receipts'];
    },
    addNewReceipt: (state) => {
      state.receipts = concat(state.receipts, [
        {
          isSent: false,
          partnerId: undefined,
          serialNumber: state.nextAvailableSerialNumber,
          totalAmount: 0,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          items: [],
          orderItems: [],
        },
      ]);
    },
    selectPartner: (state, { payload }: PayloadAction<number>) => {
      state.receipts = [
        ...init(state.receipts),
        {
          ...last(state.receipts),
          partnerId: payload,
        },
      ];
    },
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
