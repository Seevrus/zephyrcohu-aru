import * as SecureStore from 'expo-secure-store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { ErrorResponseT } from '../base-types';
import {
  CheckTokenRequestT,
  CheckTokenResponseT,
  RegisterDeviceRequestT,
  RegisterDeviceResponseT,
} from './config-slice-types';

export const registerDevice = createAsyncThunk<
  RegisterDeviceResponseT,
  RegisterDeviceRequestT,
  { rejectValue: ErrorResponseT }
>('config/registerDevice', async (requestData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${env.api_url}/users/register-device`,
      {
        devideId: requestData.deviceId,
      },
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
      }
    );
    return response.data;
  } catch (e) {
    return rejectWithValue(e.response.data);
  }
});

export const checkToken = createAsyncThunk<
  CheckTokenResponseT,
  CheckTokenRequestT,
  { rejectValue: ErrorResponseT }
>('config/checkToken', async (requestData, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${env.api_url}/users/check-token`, {
      headers: {
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });
    return response.data;
  } catch (e) {
    return rejectWithValue(e.response.data);
  }
});

export const unregisterDevice = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'config/unregisterDevice',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('boreal-device-id');
      await SecureStore.deleteItemAsync('boreal-token');

      return true;
    } catch (e) {
      return rejectWithValue({
        status: 500,
        codeName: 'Internal Server Error',
        message: 'Unable to remove items from secure storage',
      });
    }
  }
);
