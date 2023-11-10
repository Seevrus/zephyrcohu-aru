/* eslint-disable @typescript-eslint/no-explicit-any */
import NetInfo from '@react-native-community/netinfo';
import {
  screen,
  userEvent,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { getCheckTokenOkResponse } from '../../msw-handlers/check-token/getCheckTokenOkResponse';
import { getPartnerListsOkResponse } from '../../msw-handlers/partner-lists/getPartnerListsOkResponse';
import { getRoundsOkResponse } from '../../msw-handlers/rounds/getRoundsOkResponse';
import { renderStack, useServer } from '../../test-utils/testUtils';
import { Index } from './Index';
import { SettingsButton } from './SettingsButton';

useServer(
  getCheckTokenOkResponse,
  getPartnerListsOkResponse,
  getRoundsOkResponse
);

describe('Index Page', () => {
  const user = userEvent.setup();

  beforeAll(() => {
    jest.spyOn(Alert, 'alert');
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders with five tiles', async () => {
    await renderIndex();

    expect(screen.getAllByTestId('tile')).toHaveLength(5);
  });

  describe('if the token is expired', () => {
    const mockedSecureStore = jest.mocked(SecureStore);

    beforeAll(() => {
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          token: 'abc123',
          isPasswordExpired: false,
          expiresAt: '1900-01-01 00:00:00',
        })
      );
    });

    test('storage tile is disabled', async () => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[0];

      await user.press(within(storageTile).getByTestId('tile-button'));
      jest.runAllTimers();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Funkció nem elérhető',
        'A funkció csak bejelentkezés után elérhető.',
        [{ text: 'Értem' }]
      );
    });

    afterAll(() => {
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          token: 'abc123',
          isPasswordExpired: false,
          expiresAt: '2100-01-01 00:00:00',
        })
      );
    });
  });

  describe('if the password is expired', () => {
    const mockedSecureStore = jest.mocked(SecureStore);

    beforeAll(() => {
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          token: 'abc123',
          isPasswordExpired: true,
          expiresAt: '2100-01-01 00:00:00',
        })
      );
    });

    test('storage tile is disabled', async () => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[0];

      await user.press(within(storageTile).getByTestId('tile-button'));
      jest.runAllTimers();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Funkció nem elérhető',
        'Az Ön jelszava lejárt, kérem változtassa meg.',
        [{ text: 'Értem' }]
      );
    });

    afterAll(() => {
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          token: 'abc123',
          isPasswordExpired: false,
          expiresAt: '2100-01-01 00:00:00',
        })
      );
    });
  });

  describe('if the internet is not reachable', () => {
    let netInfoSpy: jest.SpyInstance;

    beforeAll(() => {
      netInfoSpy = jest
        .spyOn(NetInfo, 'useNetInfo')
        .mockImplementation(() => ({ isInternetReachable: false }) as any);
    });

    test('storage tile is disabled', async () => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[0];

      await user.press(within(storageTile).getByTestId('tile-button'));
      jest.runAllTimers();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Funkció nem elérhető',
        'A funkció csak online érhető el.',
        [{ text: 'Értem' }]
      );
    });

    afterAll(() => {
      netInfoSpy.mockClear();
    });
  });
});

async function renderIndex() {
  renderStack([
    {
      name: 'Index',
      component: Index,
      options: {
        headerTitle: 'Zephyr Boreal',
        headerRight: SettingsButton,
      },
    },
  ]);

  await waitForElementToBeRemoved(() =>
    screen.queryByTestId('loading-indicator')
  );

  expect(screen.getByTestId('index-page')).toBeVisible();
}
