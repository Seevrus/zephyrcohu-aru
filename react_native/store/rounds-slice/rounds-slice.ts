/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { Rounds } from './rounds-slice-types';

const initialState: Rounds = [];

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
