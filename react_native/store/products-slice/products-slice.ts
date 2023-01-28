/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepRight } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Products } from './products-slice-types';

const initialState: Products = [];

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['products']>) => {
      const storedProducts: Products = action.payload?.map((product) => ({
        ...product,
        expirations: product.expirations?.map((expiration) => ({
          ...expiration,
          expiresAt: new Date(expiration.expiresAt),
        })),
      }));

      state = mergeDeepRight(state, storedProducts) as Products;
    },
  },
});

export const { actions: productsActions, reducer: productsReducer } = productsSlice;
