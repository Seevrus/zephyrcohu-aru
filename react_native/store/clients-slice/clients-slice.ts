/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { Clients } from './clients-slice-types';

const initialState: Clients = [];

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
