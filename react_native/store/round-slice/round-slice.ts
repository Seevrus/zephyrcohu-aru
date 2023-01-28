/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Round } from './round-slice-types';

const initialState: Round = undefined;

const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['round']>) => {
      const storedRound: Round = {
        ...action.payload,
        receipts: action.payload.receipts?.map((receipt) => ({
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

      state = mergeDeepLeft(state, storedRound) as Round;
    },
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
