import { resetMockServer } from '../src/services/mockServer';
import { store } from '../src/store';
import reducer, {
  bookingConfirmed,
  bookingFailed,
  bookingStarted,
  bookSlot,
  type LocalBooking,
} from '../src/store/bookingsSlice';
import { setFailure, setLatency } from '../src/store/settingsSlice';
import { api } from '../src/services/api';
import type { Doctor, Slot } from '../src/types/api';

const pending: LocalBooking = {
  localId: 'local_1',
  doctorId: 'doc_1',
  doctorName: 'Dr. Lakshmi Reddy',
  slotId: 'slot_1',
  startsAt: '2026-10-12T04:00:00.000Z',
  status: 'pending',
};

describe('bookings reducer', () => {
  it('adds a new booking as pending, newest first', () => {
    const state = reducer(
      [{ ...pending, localId: 'older' }],
      bookingStarted(pending),
    );
    expect(state.map(booking => booking.localId)).toEqual(['local_1', 'older']);
    expect(state[0].status).toBe('pending');
  });

  it('reconciles a pending booking with the server id', () => {
    const [booking] = reducer(
      [pending],
      bookingConfirmed({ localId: 'local_1', serverId: 'bk_9' }),
    );
    expect(booking).toMatchObject({ status: 'confirmed', serverId: 'bk_9' });
  });

  it('marks a refused booking as failed with the reason', () => {
    const [booking] = reducer(
      [pending],
      bookingFailed({ localId: 'local_1', failure: 'slotTaken' }),
    );
    expect(booking).toMatchObject({ status: 'failed', failure: 'slotTaken' });
  });

  it('ignores an answer for a booking it does not have', () => {
    expect(
      reducer([pending], bookingFailed({ localId: 'nope', failure: 'other' })),
    ).toEqual([pending]);
  });
});

describe('bookSlot (optimistic flow against the mock)', () => {
  // 2026-10-12 is a Monday, so the clinic is open.
  const date = '2026-10-12';
  const doctor = { id: 'doc_1', name: 'Dr. Lakshmi Reddy' } as Doctor;
  const args = { doctorId: doctor.id, date };

  const freeSlot = async () => {
    const slots = await store
      .dispatch(api.endpoints.getSlots.initiate(args, { forceRefetch: true }))
      .unwrap();
    return slots.find(slot => slot.available) as Slot;
  };
  const find = (localId: string) =>
    store.getState().bookings.find(booking => booking.localId === localId);
  const settled = async (localId: string) => {
    while (find(localId)?.status === 'pending')
      await new Promise<void>(resolve => setTimeout(resolve, 5));
    return find(localId);
  };

  beforeEach(() => {
    resetMockServer();
    store.dispatch(setLatency(20));
    store.dispatch(setFailure('none'));
  });
  afterAll(() => {
    store.dispatch(api.util.resetApiState());
  });

  it('is pending immediately, then confirmed by the server', async () => {
    const localId = store.dispatch(bookSlot(doctor, await freeSlot(), date));
    expect(find(localId)?.status).toBe('pending');
    expect(await settled(localId)).toMatchObject({
      status: 'confirmed',
      serverId: expect.any(String),
    });
  });

  it('shows the slot as taken at once, before the server answers', async () => {
    const slot = await freeSlot();
    store.dispatch(bookSlot(doctor, slot, date));
    const cached = api.endpoints.getSlots.select(args)(store.getState()).data;
    expect(cached?.find(candidate => candidate.id === slot.id)?.available).toBe(
      false,
    );
  });

  it('fails and frees the slot again when the server errors', async () => {
    const slot = await freeSlot();
    store.dispatch(setFailure('bookings'));
    const localId = store.dispatch(bookSlot(doctor, slot, date));
    expect(await settled(localId)).toMatchObject({
      status: 'failed',
      failure: 'other',
    });

    store.dispatch(setFailure('none'));
    expect((await freeSlot()).id).toBe(slot.id);
  });

  it('reports a slot someone else took as slotTaken', async () => {
    const slot = await freeSlot();
    await settled(store.dispatch(bookSlot(doctor, slot, date)));
    const second = store.dispatch(bookSlot(doctor, slot, date));
    expect(await settled(second)).toMatchObject({
      status: 'failed',
      failure: 'slotTaken',
    });
  });
});
