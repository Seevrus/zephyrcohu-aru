import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { ErrorResponseT } from '../base-types';
import {
  CheckTokenquestT,
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
  CheckTokenquestT,
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
