import * as SecureStore from 'expo-secure-store';
import { useEffect, useReducer } from 'react';

type CredentialsState = {
  deviceId: string;
  deviceIdError: boolean;
  token: string;
  tokenError: boolean;
  isTokenAvailable: boolean;
  tokenStorageError: boolean;
};

enum CredentialsActionTypes {
  SET_DEVICE_ID = 'SET_DEVICE_ID',
  SET_DEVICE_ID_ERROR = 'SET_DEVICE_ID_ERROR',
  SET_TOKEN = 'SET_TOKEN',
  SET_TOKEN_ERROR = 'SET_TOKEN_ERROR',
}

type CredentialsAction = {
  type: CredentialsActionTypes;
  payload: string | boolean;
};

const intialState: CredentialsState = {
  deviceId: '',
  deviceIdError: false,
  token: '',
  tokenError: false,
  isTokenAvailable: false,
  tokenStorageError: false,
};

const credentialsReducer = (state: CredentialsState, action: CredentialsAction) => {
  switch (action.type) {
    case CredentialsActionTypes.SET_DEVICE_ID: {
      const deviceId = action.payload as string;
      const deviceIdError = deviceId ? false : state.deviceIdError;
      return {
        ...state,
        deviceId,
        deviceIdError,
        isTokenAvailable: !!deviceId && !state.deviceIdError && !!state.token && !state.tokenError,
        tokenStorageError: deviceIdError || state.tokenError,
      };
    }
    case CredentialsActionTypes.SET_DEVICE_ID_ERROR: {
      const deviceIdError = action.payload as boolean;
      return {
        ...state,
        deviceId: deviceIdError ? '' : state.deviceId,
        deviceIdError,
        isTokenAvailable: state.deviceId && !deviceIdError && !!state.token && !state.tokenError,
        tokenStorageError: deviceIdError || state.tokenError,
      };
    }
    case CredentialsActionTypes.SET_TOKEN: {
      const token = action.payload as string;
      const tokenError = token ? false : state.tokenError;
      return {
        ...state,
        token,
        tokenError,
        isTokenAvailable: !!state.deviceId && !state.deviceIdError && !!token && !state.tokenError,
        tokenStorageError: state.deviceIdError || tokenError,
      };
    }
    case CredentialsActionTypes.SET_TOKEN_ERROR: {
      const tokenError = action.payload as string;
      return {
        ...state,
        token: tokenError ? '' : state.token,
        tokenError,
        isTokenAvailable: state.deviceId && !state.deviceIdError && !!state.token && !tokenError,
        tokenStorageError: state.deviceIdError || tokenError,
      };
    }
    default:
      return state;
  }
};

const useToken = () => {
  const [credentialsState, dispatch] = useReducer(credentialsReducer, intialState);

  useEffect(() => {
    const getCredentials = async () => {
      try {
        const deviceId = (await SecureStore.getItemAsync('boreal-device-id')) ?? 'NONE';
        dispatch({ type: CredentialsActionTypes.SET_DEVICE_ID, payload: deviceId });
      } catch (_) {
        dispatch({ type: CredentialsActionTypes.SET_DEVICE_ID_ERROR, payload: true });
      }

      try {
        const token = (await SecureStore.getItemAsync('boreal-token')) ?? 'NONE';
        dispatch({ type: CredentialsActionTypes.SET_TOKEN, payload: token });
      } catch (_) {
        dispatch({ type: CredentialsActionTypes.SET_TOKEN_ERROR, payload: true });
      }
    };

    getCredentials();
  }, []);

  return {
    deviceId: credentialsState.deviceId,
    token: credentialsState.token,
    isTokenAvailable: credentialsState.isTokenAvailable,
    tokenStorageError: credentialsState.tokenStorageError,
  };
};

export default useToken;
