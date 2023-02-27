import { createAsyncThunk } from '@reduxjs/toolkit';
import { concat } from 'ramda';

import { setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { InitializeRoundRequest, InitializeRoundResponse } from './round-slice-types';

export const initializeRound = createAsyncThunk<
  InitializeRoundResponse,
  InitializeRoundRequest,
  { rejectValue: ErrorResponseT }
>('round/initializeRound', async (requestData, { rejectWithValue }) => {
  try {
    await setLocalStorage({
      round: {
        started: true,
        agentId: requestData.agentId,
        storeId: requestData.storeId,
        partnerListId: requestData.partnerListId,
        date: requestData.date,
        nextAvailableSerialNumber: requestData.nextAvailableSerialNumber,
        currentReceipt: undefined,
        receipts: [],
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return requestData;
});

export const finalizeCurrentReceipt = createAsyncThunk<
  boolean,
  never,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/finalizeCurrentReceipt', async (_, { getState, rejectWithValue }) => {
  try {
    const state: any = getState();
    const { currentReceipt } = state.round;

    await setLocalStorage({
      round: {
        ...state.round,
        nextAvailableSerialNumber: currentReceipt.serialNumber + 1,
        currentReceipt: undefined,
        receipts: concat(state.round.receipts, [currentReceipt]),
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
});

export const upsertReceipts = () => {};
