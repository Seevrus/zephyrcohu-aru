import { screen } from '@testing-library/react-native';

import { renderStack } from '../../test-utils/testUtils';
import { Index } from './Index';
import { SettingsButton } from './SettingsButton';

describe('Index Page', () => {
  test('renders with a loader initially', () => {
    const { unmount } = renderStack([
      {
        name: 'Index',
        component: Index,
        options: {
          headerTitle: 'Zephyr Boreal',
          headerRight: SettingsButton,
        },
      },
    ]);

    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toBeVisible();

    unmount();
  });
});
