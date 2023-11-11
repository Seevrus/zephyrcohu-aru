/* eslint-disable @typescript-eslint/no-explicit-any */
import NetInfo from '@react-native-community/netinfo';
import {
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { receiptsAtom } from '../../atoms/receipts';
import { createGetCheckTokenOkResponse } from '../../msw-handlers/check-token/createGetCheckTokenOkResponse';
import { getPartnerListsOkResponse } from '../../msw-handlers/partner-lists/getPartnerListsOkResponse';
import { getRoundsOkResponse } from '../../msw-handlers/rounds/getRoundsOkResponse';
import {
  type InitialAtoms,
  renderStack,
  useServer,
} from '../../test-utils/testUtils';
import { Index } from './Index';
import { SettingsButton } from './SettingsButton';

const server = useServer(
  createGetCheckTokenOkResponse(),
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

    test.each`
      tileName               | tileIndex
      ${'storage tile'}      | ${0}
      ${'start errand tile'} | ${1}
      ${'end errand tile'}   | ${4}
    `('$tileName is disabled', async ({ tileIndex }) => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[tileIndex];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#767676' });

      await user.press(tileButton);
      jest.runAllTimers();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Funkció nem elérhető',
        'A funkció csak bejelentkezés után elérhető.',
        [{ text: 'Értem' }]
      );
    });

    test('select partner tile is enabled if the round has started', async () => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[2];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#312A5F' });
    });

    test('select partner tile is disabled if the round has not started', async () => {
      server.use(createGetCheckTokenOkResponse({ isRoundStarted: false }));

      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[2];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#767676' });
    });

    test('receipts tile is enabled if there are receipts available', async () => {
      await renderIndex({ receipts: [receiptsAtom, [{}]] });
      const storageTile = screen.getAllByTestId('tile')[3];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#312A5F' });
    });

    test('receipts tile is disabled if there are no receipts available', async () => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[3];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#767676' });
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

    /**
     * ${'start errand tile'} | ${1}
      ${'end errand tile'}   | ${4}
     */

    test.only.each`
      tileName          | tileIndex
      ${'storage tile'} | ${0}
    `('$tileName is disabled', async ({ tileIndex }) => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[tileIndex];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#767676' });

      await user.press(tileButton);
      jest.runAllTimers();

      expect(Alert.alert).toHaveBeenLastCalledWith(
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

    test.each`
      tileName               | tileIndex
      ${'storage tile'}      | ${0}
      ${'start errand tile'} | ${1}
      ${'end errand tile'}   | ${4}
    `('$tileName is disabled', async ({ tileIndex }) => {
      await renderIndex();
      const storageTile = screen.getAllByTestId('tile')[tileIndex];
      const tileButton = within(storageTile).getByTestId('tile-button');

      expect(tileButton).toHaveStyle({ backgroundColor: '#767676' });

      await user.press(tileButton);
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

async function renderIndex(initialAtoms?: InitialAtoms) {
  const view = renderStack(
    [
      {
        name: 'Index',
        component: Index,
        options: {
          headerTitle: 'Zephyr Boreal',
          headerRight: SettingsButton,
        },
      },
    ],
    initialAtoms
  );

  await waitForElementToBeRemoved(() =>
    screen.queryByTestId('loading-indicator')
  );

  await waitFor(() => {
    expect(screen.getByTestId('index-page')).toBeVisible();
  });

  return view;
}
