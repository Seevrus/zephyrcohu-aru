/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { checkToken, registerDevice, unregisterDevice } from './config-api-actions';
import { Config } from './config-slice-types';

import { LocalStorage } from '../async-storage';

const initialState: Config = {
  isLocalStateMerged: false,
  isDemoMode: false,
  isLoggedin: false,
  tokenError: false,
  userType: undefined,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['config']>) => {
      state.isLocalStateMerged = true;
      state.isDemoMode = action.payload?.isDemoMode ?? false;
      state.isLoggedin = action.payload?.isLoggedin ?? false;
      state.tokenError = action.payload?.tokenError ?? false;
      state.userType = action.payload?.userType;
    },
    setIsLoggedin: (state, action: PayloadAction<boolean>) => {
      state.isLoggedin = action.payload;
    },
    setTokenError: (state, action: PayloadAction<boolean>) => {
      state.tokenError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.isLoggedin = true;
      state.userType = type;
    });
    builder.addCase(registerDevice.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 400:
          throw new Error(
            'Ez a felhasználó egy másik eszközön már érvényesítette a hozzáférését. Amennyiben az alkalmazás újratelepítése vagy a készülék cseréje miatt újbóli bejelentkezésre van szükség, kérem igényeljen új kódot az alkalmazás adminisztrátorától.'
          );
        case 401:
          throw new Error('A beírt token érvénytelen.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(checkToken.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.isLoggedin = true;
      state.userType = type;
    });
    builder.addCase(checkToken.rejected, (state, { payload }) => {
      state.tokenError = true;
      switch (payload.status) {
        case 401:
          throw new Error(
            'Probléma lépett fel a korábban megadott hitelesítési adatok ellenőrzése során.'
          );
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(unregisterDevice.fulfilled, (state) => {
      state.isLoggedin = false;
      state.userType = undefined;
    });
    builder.addCase(unregisterDevice.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
