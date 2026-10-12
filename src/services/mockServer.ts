import { festivalConfig, normalConfig } from '../data/configs';
import { localize } from '../data/configTranslations';
import { doctors } from '../data/doctors';
import { prescriptions } from '../data/prescriptions';
import type { Language } from '../i18n';
import type { Booking, Slot } from '../types/api';

export type ConfigVariant = 'normal' | 'festival';
// Which endpoints the mock should fail, so one flow can be broken while the rest works.
export type FailureMode = 'none' | 'config' | 'bookings' | 'all';

export type MockSettings = {
  variant: ConfigVariant;
  // Plays the role of the Accept-Language header.
  language: Language;
  latencyMs: number;
  failure: FailureMode;
};

export type MockRequest = {
  method: 'GET' | 'POST';
  path: '/config' | '/doctors' | '/slots' | '/bookings' | '/prescriptions';
  params?: Record<string, string>;
  body?: unknown;
};

export type MockResponse = { status: number; data: unknown };

// Server-side memory of taken slots; lives for the app session, like a real backend would outlive a screen.
const bookedSlotIds = new Set<string>();

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const hash = (text: string) =>
  [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);

function shouldFail(path: MockRequest['path'], failure: FailureMode): boolean {
  if (failure === 'all') return true;
  if (failure === 'config') return path === '/config';
  if (failure === 'bookings') return path === '/bookings';
  return false;
}

// Clinic hours: 9:00-13:00 and 17:00-20:00, half-hour slots. Closed on Sundays, which gives a real empty state.
const SESSION_STARTS = [
  9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 17, 17.5, 18, 18.5, 19, 19.5,
];

function slotsFor(doctorId: string, date: string): Slot[] {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return [];
  if (new Date(year, month - 1, day).getDay() === 0) return [];

  return SESSION_STARTS.map(start => {
    const startsAt = new Date(
      year,
      month - 1,
      day,
      Math.floor(start),
      (start % 1) * 60,
    );
    const id = `${doctorId}_${date}_${start}`;
    return {
      id,
      doctorId,
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + 30 * 60_000).toISOString(),
      // Deterministic, so the same doctor and date always show the same gaps.
      available: hash(id) % 4 !== 0 && !bookedSlotIds.has(id),
    };
  });
}

function createBooking(body: unknown): MockResponse {
  const { doctorId, slotId } = (body ?? {}) as {
    doctorId?: string;
    slotId?: string;
  };
  if (!doctorId || !slotId)
    return {
      status: 400,
      data: { message: 'doctorId and slotId are required' },
    };

  const date = slotId.split('_')[2] ?? '';
  const slot = slotsFor(doctorId, date).find(
    candidate => candidate.id === slotId,
  );
  if (!slot) return { status: 404, data: { message: 'Slot not found' } };
  if (!slot.available)
    return { status: 409, data: { message: 'This slot was just taken' } };

  bookedSlotIds.add(slotId);
  const booking: Booking = {
    id: `bk_${bookedSlotIds.size}_${hash(slotId)}`,
    doctorId,
    slotId,
    startsAt: slot.startsAt,
    status: 'confirmed',
  };
  return { status: 201, data: booking };
}

/** The whole backend: waits for the configured latency, then answers or fails as the settings say. */
export async function mockRequest(
  request: MockRequest,
  settings: MockSettings,
): Promise<MockResponse> {
  await delay(settings.latencyMs);
  if (shouldFail(request.path, settings.failure)) {
    return { status: 500, data: { message: 'Server is not responding' } };
  }

  switch (request.path) {
    case '/config':
      return {
        status: 200,
        data: localize(
          settings.variant === 'festival' ? festivalConfig : normalConfig,
          settings.language,
        ),
      };
    case '/doctors':
      return { status: 200, data: doctors };
    case '/slots':
      return {
        status: 200,
        data: slotsFor(
          request.params?.doctorId ?? '',
          request.params?.date ?? '',
        ),
      };
    case '/bookings':
      return createBooking(request.body);
    case '/prescriptions':
      return { status: 200, data: prescriptions };
  }
}

/** Test helper: forget every booking. */
export const resetMockServer = () => bookedSlotIds.clear();
