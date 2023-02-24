import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { FetchAgentsRequest, FetchAgentsResponse } from './agents-slice-types';

export const fetchAgents = createAsyncThunk<
  FetchAgentsResponse,
  FetchAgentsRequest,
  { rejectValue: ErrorResponseT }
>('agents/fetchAgents', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchAgentsResponse>;
  try {
    response = await axios.get(`${env.api_url}/users`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      agents: response.data,
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return response.data;
});

export const removeAgents = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'agents/removeAgents',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        agents: {
          data: undefined,
        },
      });
    } catch (e) {
      return rejectWithValue({
        status: 507,
        codeName: 'Insufficient Storage',
        message: e.message,
      });
    }

    return true;
  }
);
