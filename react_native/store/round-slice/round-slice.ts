/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepRight } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Round } from './round-slice-types';

// TODO: remove dummy data after BE integration
const initialState: Round = {
  id: 1,
  name: 'Zsibbadt Egerek 1.',
  clientIds: [1, 2, 3, 4],
  firstAvailableReceiptNr: '11243/23',
  receipts: [],
};

const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['round']>) => {
      const storedRound: Round = {
        ...action.payload,
        receipts: action.payload?.receipts.map((receipt) => ({
          ...receipt,
          transactions: receipt.transactions.map((transaction) => ({
            ...transaction,
            purchases: transaction.purchases?.map((purchase) => ({
              ...purchase,
              expiresAt: new Date(purchase.expiresAt),
            })),
          })),
          createdAt: new Date(receipt.createdAt),
        })),
      };

      state = mergeDeepRight(state, storedRound) as Round;
    },
    // this will be our entry point tomorrow. Therefore, we need a screen to start a round
    initializeRound: () => {},
    addNewReceipt: () => {},
    removeLastUnsentReceipt: () => {},
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
