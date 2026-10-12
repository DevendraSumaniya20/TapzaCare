import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SectionRenderer } from '../src/components/home/SectionRenderer';
import '../src/i18n';
import { api } from '../src/services/api';
import { store } from '../src/store';
import { setLatency } from '../src/store/settingsSlice';
import type { SectionConfig } from '../src/types/api';

const section = (type: string, items: unknown[]): SectionConfig => ({
  id: 'test',
  type,
  background: { kind: 'color', value: '#FFFFFF' },
  items,
});

const renderSection = (config: SectionConfig) =>
  render(
    <Provider store={store}>
      <NavigationContainer>
        <SectionRenderer section={config} />
      </NavigationContainer>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(setLatency(0));
});

// Drops RTK Query's cache timers so Jest can exit.
afterAll(() => {
  store.dispatch(api.util.resetApiState());
});

describe('SectionRenderer', () => {
  it('renders an offer strip message', async () => {
    await renderSection(
      section('offer_strip', [{ message: 'Free pickup today' }]),
    );
    expect(screen.getByText('Free pickup today')).toBeTruthy();
  });

  it('renders nothing for an unknown section type', async () => {
    await renderSection(
      section('video_story', [{ message: 'Should not show' }]),
    );
    expect(screen.queryByText('Should not show')).toBeNull();
  });

  it('renders nothing for a prototype key used as a type', async () => {
    await renderSection(section('constructor', []));
    expect(screen.toJSON()).toBeNull();
  });

  it('shows service prices in rupees and drops malformed items', async () => {
    await renderSection(
      section('service_grid', [
        {
          id: 'a',
          name: 'Full body checkup',
          priceInr: 1499,
          imageUrl: 'https://example.com/a.png',
        },
        { id: 'b', name: 'No price' },
        'not an object',
      ]),
    );
    expect(screen.getByText('₹1,499')).toBeTruthy();
    expect(screen.queryByText('No price')).toBeNull();
  });
});
