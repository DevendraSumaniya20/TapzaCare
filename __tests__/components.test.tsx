import { fireEvent, screen } from '@testing-library/react-native';
import { BookingResult } from '../src/components/booking/BookingResult';
import { OptionGroup } from '../src/components/OptionGroup';
import { DoseRow } from '../src/components/prescriptions/DoseRow';
import { StateView } from '../src/components/StateView';
import { CloudOff } from 'lucide-react-native';
import type { LocalBooking } from '../src/store/bookingsSlice';
import {
  cleanUpStore,
  prepareStore,
  renderWithProviders,
} from '../testUtils/renderWithProviders';

beforeAll(prepareStore);
afterAll(cleanUpStore);

describe('OptionGroup', () => {
  it('marks the selected option and reports a new choice', async () => {
    const onSelect = jest.fn();
    await renderWithProviders(
      <OptionGroup
        label="Network speed"
        options={[
          { value: 0, label: 'Instant' },
          { value: 3000, label: 'Slow' },
        ]}
        selected={0}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Instant' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Slow' })).not.toBeSelected();

    await fireEvent.press(screen.getByRole('radio', { name: 'Slow' }));
    expect(onSelect).toHaveBeenCalledWith(3000);
  });
});

describe('StateView', () => {
  it('shows the retry action only when one is given', async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <StateView
        icon={CloudOff}
        title="Could not load"
        message="Try again"
        actionLabel="Retry"
        onAction={onAction}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('has no button without an action', async () => {
    await renderWithProviders(
      <StateView
        icon={CloudOff}
        title="Nothing here"
        message="Come back later"
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('DoseRow', () => {
  const medicine = {
    id: 'med_1',
    name: 'Paracetamol 650',
    dose: '1 tablet after food',
    days: 5,
    timing: [],
  };

  it('is an unchecked checkbox that reports a tap', async () => {
    const onToggle = jest.fn();
    await renderWithProviders(
      <DoseRow medicine={medicine} taken={false} onToggle={onToggle} />,
    );

    const row = screen.getByRole('checkbox');
    expect(row).not.toBeChecked();
    expect(screen.queryByText('Taken')).toBeNull();

    await fireEvent.press(row);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows a taken dose as checked', async () => {
    await renderWithProviders(
      <DoseRow medicine={medicine} taken onToggle={jest.fn()} />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('Taken')).toBeTruthy();
  });
});

describe('BookingResult', () => {
  const booking: LocalBooking = {
    localId: 'local_1',
    doctorId: 'doc_1',
    doctorName: 'Dr. Lakshmi Reddy',
    slotId: 'slot_1',
    date: '2026-10-12',
    startsAt: '2026-10-12T11:30:00.000Z',
    status: 'pending',
  };
  const show = (
    overrides: Partial<LocalBooking>,
    handlers = { onDone: jest.fn(), onChooseAnother: jest.fn() },
  ) =>
    renderWithProviders(
      <BookingResult booking={{ ...booking, ...overrides }} {...handlers} />,
    );

  it('shows success at once while the server is still confirming', async () => {
    await show({ status: 'pending' });
    expect(screen.getByText('Appointment booked')).toBeTruthy();
    expect(screen.getByText('Confirming with the clinic…')).toBeTruthy();
    expect(screen.getByText('Dr. Lakshmi Reddy')).toBeTruthy();
  });

  it('settles to confirmed', async () => {
    await show({ status: 'confirmed' });
    expect(screen.getByText('Confirmed by the clinic')).toBeTruthy();
  });

  it('explains a slot taken by someone else and offers another time', async () => {
    const handlers = { onDone: jest.fn(), onChooseAnother: jest.fn() };
    await show({ status: 'failed', failure: 'slotTaken' }, handlers);

    expect(screen.getByText('Booking did not go through')).toBeTruthy();
    expect(
      screen.getByText('That time was just taken by someone else.'),
    ).toBeTruthy();
    expect(screen.queryByText('Appointment booked')).toBeNull();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Choose another time' }),
    );
    expect(handlers.onChooseAnother).toHaveBeenCalledTimes(1);
  });

  it('says a booking made offline is saved, not booked', async () => {
    await show({ status: 'queued' });
    expect(screen.getByText('Saved. You are offline')).toBeTruthy();
    expect(screen.queryByText('Appointment booked')).toBeNull();
  });
});
