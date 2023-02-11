/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Items } from './items-slice-types';

const initialState: Items = [];

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['items']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Items;
    },
  },
});

export const { actions: itemsActions, reducer: itemsReducer } = itemsSlice;
