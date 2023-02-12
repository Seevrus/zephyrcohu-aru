import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { FetchPartnersRequest, FetchPartnersResponse } from './partners-slice-types';

export const fetchPartners = createAsyncThunk<
  FetchPartnersResponse,
  FetchPartnersRequest,
  { rejectValue: ErrorResponseT }
>('partners/fetchPartners', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchPartnersResponse>;
  try {
    response = await axios.get(`${env.api_url}/partners`, {
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
      partners: response.data,
    } as Partial<LocalStorage>);
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return response.data;
});

export const removePartners = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'partners/removePartners',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        partners: {
          data: [],
        },
      } as Partial<LocalStorage>);
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
