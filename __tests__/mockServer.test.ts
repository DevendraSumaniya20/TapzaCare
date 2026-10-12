import {
  mockRequest,
  resetMockServer,
  setConfigOverride,
  type MockSettings,
} from '../src/services/mockServer';
import type { LayoutConfig, Slot } from '../src/types/api';

const settings: MockSettings = {
  variant: 'normal',
  language: 'en',
  latencyMs: 0,
  failure: 'none',
};
// 2026-10-12 is a Monday, 2026-10-18 a Sunday.
const slotsOn = async (date: string) =>
  (
    await mockRequest(
      { method: 'GET', path: '/slots', params: { doctorId: 'doc_1', date } },
      settings,
    )
  ).data as Slot[];

beforeEach(resetMockServer);

describe('mock server', () => {
  it('serves a different config on the festival day', async () => {
    const normal = await mockRequest(
      { method: 'GET', path: '/config' },
      settings,
    );
    const festival = await mockRequest(
      { method: 'GET', path: '/config' },
      { ...settings, variant: 'festival' },
    );
    expect(festival.data).not.toEqual(normal.data);
  });

  it('localises config content for the requested language', async () => {
    const hindi = await mockRequest(
      { method: 'GET', path: '/config' },
      { ...settings, language: 'hi' },
    );
    const labels = (hindi.data as LayoutConfig).tabs.map(tab => tab.label);
    expect(labels).toEqual(['होम', 'बुकिंग', 'पर्चे', 'प्रोफ़ाइल']);
  });

  it('serves what the admin published, and the shipped config again after a reset', async () => {
    const shipped = (
      await mockRequest({ method: 'GET', path: '/config' }, settings)
    ).data as LayoutConfig;
    setConfigOverride('normal', {
      ...shipped,
      version: 99,
      sections: [...shipped.sections].reverse(),
    });

    const edited = (
      await mockRequest({ method: 'GET', path: '/config' }, settings)
    ).data as LayoutConfig;
    expect(edited.version).toBe(99);
    expect(edited.sections[0].id).toBe(
      shipped.sections[shipped.sections.length - 1].id,
    );

    setConfigOverride('normal', null);
    expect(
      (await mockRequest({ method: 'GET', path: '/config' }, settings)).data,
    ).toEqual(shipped);
  });

  it('fails only the endpoints the failure switch names', async () => {
    const failing: MockSettings = { ...settings, failure: 'config' };
    expect(
      (await mockRequest({ method: 'GET', path: '/config' }, failing)).status,
    ).toBe(500);
    expect(
      (await mockRequest({ method: 'GET', path: '/doctors' }, failing)).status,
    ).toBe(200);
  });

  it('has no slots on a Sunday', async () => {
    expect(await slotsOn('2026-10-18')).toEqual([]);
  });

  it('books a free slot once, then answers 409', async () => {
    const free = (await slotsOn('2026-10-12')).find(slot => slot.available);
    const body = { doctorId: 'doc_1', slotId: free!.id };

    expect(
      (await mockRequest({ method: 'POST', path: '/bookings', body }, settings))
        .status,
    ).toBe(201);
    expect(
      (await mockRequest({ method: 'POST', path: '/bookings', body }, settings))
        .status,
    ).toBe(409);
    expect(
      (await slotsOn('2026-10-12')).find(slot => slot.id === free!.id)
        ?.available,
    ).toBe(false);
  });
});
