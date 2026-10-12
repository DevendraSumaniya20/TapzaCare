import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { PrescriptionDetailScreen } from '../src/screens/PrescriptionDetailScreen';
import { PrescriptionsScreen } from '../src/screens/PrescriptionsScreen';
import { store } from '../src/store';
import { dosesLoaded } from '../src/store/dosesSlice';
import { setFailure } from '../src/store/settingsSlice';
import {
  cleanUpStore,
  prepareStore,
  renderWithProviders,
} from '../testUtils/renderWithProviders';

// Only `route.params` is read by the screen; the rest of the navigation props are not needed here.
const detail = (prescriptionId: string) => {
  const props = {
    route: { params: { prescriptionId } },
  } as unknown as ComponentProps<typeof PrescriptionDetailScreen>;
  return renderWithProviders(<PrescriptionDetailScreen {...props} />);
};

beforeAll(prepareStore);
beforeEach(() => {
  store.dispatch(setFailure('none'));
  store.dispatch(dosesLoaded({}));
});
afterAll(cleanUpStore);

describe('Prescriptions list', () => {
  it('lists the prescriptions from the server', async () => {
    await renderWithProviders(<PrescriptionsScreen />);
    expect(await screen.findByText('Dr. Lakshmi Reddy')).toBeTruthy();
    expect(screen.getByText('Dr. Arjun Rao')).toBeTruthy();
  });
});

describe('Prescription schedule', () => {
  it('groups medicines by time of day and leaves out an empty one', async () => {
    await detail('rx_2');
    expect(await screen.findByText('Morning')).toBeTruthy();
    expect(screen.getByText('Night')).toBeTruthy();
    expect(screen.queryByText('Afternoon')).toBeNull();
    expect(screen.getByText('0 of 2 doses taken today')).toBeTruthy();
  });

  it('marks a dose as taken and counts it, then unmarks it', async () => {
    await detail('rx_2');
    const [morningDose] = await screen.findAllByRole('checkbox');

    await fireEvent.press(morningDose);
    expect(screen.getByText('1 of 2 doses taken today')).toBeTruthy();
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();

    await fireEvent.press(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByText('0 of 2 doses taken today')).toBeTruthy();
  });

  it('says so when the prescription does not exist', async () => {
    await detail('rx_missing');
    expect(
      await screen.findByText('This prescription is no longer available'),
    ).toBeTruthy();
  });
});
