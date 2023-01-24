/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { ErrorResponseT } from '../base-types';
import { Config, RegisterDeviceRequestT, RegisterDeviceResponseT } from './config-slice-types';

const initialState: Config = {
  hasToken: false,
  isTokenValid: false,
  userType: undefined,
};

export const registerDevice = createAsyncThunk<
  RegisterDeviceResponseT,
  RegisterDeviceRequestT,
  { rejectValue: ErrorResponseT }
>('config/registerDevice', async (requestData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${env.api_url}/users/register-device`, requestData, {
      headers: { Authorization: `Bearer ${requestData.token}` },
    });
    return response.data;
  } catch (e) {
    return rejectWithValue(e.response.data);
  }
});

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setTokenAvailability: (state, action: { payload: boolean; type: string }) => {
      state.hasToken = action.payload;
    },
    setTokenValidity: (state, action: { payload: boolean; type: string }) => {
      state.isTokenValid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.userType = type;
    });
    builder.addCase(registerDevice.rejected, (_, { payload }) => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw payload;
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
