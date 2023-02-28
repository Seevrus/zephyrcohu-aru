/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { concat, dissocPath, mergeDeepLeft, pipe, propOr, values } from 'ramda';

import { LocalStorage } from '../async-storage';
import { finalizeCurrentReceipt, initializeRound } from './round-api-actions';
import { Item, OrderItem, Round } from './round-slice-types';

const initialState: Round = {
  started: undefined,
  agentId: undefined,
  storeId: undefined,
  partnerListId: undefined,
  date: undefined,
  nextAvailableSerialNumber: undefined,
  currentReceipt: undefined,
  receipts: [],
};

const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['round']>) => {
      state.started = payload?.started;
      state.agentId = payload?.agentId;
      state.storeId = payload?.storeId;
      state.partnerListId = payload?.partnerListId;
      state.date = payload?.date;
      state.nextAvailableSerialNumber = payload?.nextAvailableSerialNumber;
      state.currentReceipt = payload?.currentReceipt;
      state.receipts = pipe(
        mergeDeepLeft(state.receipts),
        values
      )(propOr([], 'receipts', payload) as Round['receipts']) as Round['receipts'];
    },
    addNewReceipt: (state) => {
      state.currentReceipt = {
        isSent: false,
        partnerId: undefined,
        serialNumber: state.nextAvailableSerialNumber,
        originalCopiesPrinted: 0,
        items: {},
        orderItems: {},
      };
    },
    selectPartner: (state, { payload }: PayloadAction<number>) => {
      state.currentReceipt.partnerId = payload;
      state.currentReceipt.items = {};
      state.currentReceipt.orderItems = {};
    },
    putItems: (state, { payload }: PayloadAction<Item>) => {
      state.currentReceipt.items = payload;
    },
    removeItem: (state, { payload }: PayloadAction<{ id: number; expiresAt: string }>) => {
      state.currentReceipt.items = dissocPath(
        [payload.id, payload.expiresAt],
        state.currentReceipt.items
      );
    },
    putOrderItems: (state, { payload }: PayloadAction<OrderItem>) => {
      state.currentReceipt.orderItems = payload;
    },
    removeLastUnsentReceipt: (state) => {
      state.currentReceipt = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeRound.fulfilled, (state, { payload }) => {
      state.started = true;
      state.agentId = payload.agentId;
      state.storeId = payload.storeId;
      state.partnerListId = payload.partnerListId;
      state.date = payload.date;
      state.nextAvailableSerialNumber = payload.nextAvailableSerialNumber;
      state.receipts = [];
    });
    builder.addCase(initializeRound.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });

    builder.addCase(finalizeCurrentReceipt.fulfilled, (state) => {
      state.receipts = concat(state.receipts, [state.currentReceipt]);
      state.nextAvailableSerialNumber = state.currentReceipt.serialNumber + 1;
      state.currentReceipt = undefined;
    });
    builder.addCase(finalizeCurrentReceipt.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
