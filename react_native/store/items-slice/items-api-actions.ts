import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { FetchItemsRequest, FetchItemsResponse } from './items-slice-types';

const fetchItems = createAsyncThunk<
  FetchItemsResponse,
  FetchItemsRequest,
  { rejectValue: ErrorResponseT }
>('items/fetchItems', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchItemsResponse>;
  try {
    response = await axios.get(`${env.api_url}/items`, {
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
      items: response.data.data,
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

export default fetchItems;
