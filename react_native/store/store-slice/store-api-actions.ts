import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { FetchStoreRequest, FetchStoreResponse } from './store-slice-types';

const fetchStore = createAsyncThunk<
  FetchStoreResponse,
  FetchStoreRequest,
  { rejectValue: ErrorResponseT }
>('store/fetchStore', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchStoreResponse>;
  try {
    response = await axios.get(`${env.api_url}/stores/${requestData.code}`, {
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
      store: response.data,
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

export default fetchStore;
