/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { checkToken, registerDevice } from './config-api-actions';
import { Config } from './config-slice-types';

const initialState: Config = {
  isDemoMode: false,
  isLoggedin: false,
  userType: undefined,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      const { type } = payload;
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
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(checkToken.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.userType = type;
    });
    builder.addCase(checkToken.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error(
            'Probléma lépett fel a korábban meghadott hitelesítési adatok ellenőrzése során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
        default:
          throw new Error(
            'Váratlan hiba lépett fel a kód feldolgozása során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
      }
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
