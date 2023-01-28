/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Products } from './products-slice-types';

const initialState: Products = undefined;

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

      state = mergeDeepLeft(state, storedProducts) as Products;
    },
  },
});

export const { actions: productsActions, reducer: productsReducer } = productsSlice;
