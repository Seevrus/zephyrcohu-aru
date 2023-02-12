import { createAsyncThunk } from '@reduxjs/toolkit';

import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { InitializeRoundRequest, InitializeRoundResponse } from './round-slice-types';

// eslint-disable-next-line import/prefer-default-export
export const initializeRound = createAsyncThunk<
  InitializeRoundResponse,
  InitializeRoundRequest,
  { rejectValue: ErrorResponseT }
>('round/initializeRound', async (requestData, { rejectWithValue }) => {
  try {
    await setLocalStorage({
      round: {
        storeId: requestData.storeId,
        nextAvailableSerialNumber: requestData.nextAvailableSerialNumber,
        receipts: [],
      },
    } as Partial<LocalStorage>);
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return requestData;
});
