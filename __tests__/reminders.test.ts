import notifee from '@notifee/react-native';
import { prescriptions } from '../src/data/prescriptions';
import {
  disableReminders,
  enableReminders,
  hasReminders,
  sendTestReminder,
} from '../src/services/reminders';

const mocked = jest.mocked(notifee);
// rx_2: one medicine in the morning, one at night.
const prescription = prescriptions[1];

beforeEach(() => {
  jest.clearAllMocks();
  mocked.requestPermission.mockResolvedValue({
    authorizationStatus: 1,
  } as never);
});

describe('medicine reminders', () => {
  it('schedules one daily reminder per time of day, listing the medicines due then', async () => {
    expect(await enableReminders(prescription)).toBe(true);

    const calls = mocked.createTriggerNotification.mock.calls;
    expect(calls.map(([notification]) => notification.id)).toEqual([
      'rx:rx_2:morning',
      'rx:rx_2:night',
    ]);
    expect(calls[0][0].body).toContain('Telmisartan 40');
    expect(calls[1][0].body).toContain('Atorvastatin 10');
    for (const [, trigger] of calls) {
      expect(trigger).toMatchObject({ repeatFrequency: 1 });
      expect((trigger as { timestamp: number }).timestamp).toBeGreaterThan(
        Date.now(),
      );
    }
  });

  it('schedules nothing when the user refuses notifications', async () => {
    mocked.requestPermission.mockResolvedValue({
      authorizationStatus: 0,
    } as never);
    expect(await enableReminders(prescription)).toBe(false);
    expect(mocked.createTriggerNotification).not.toHaveBeenCalled();
  });

  it('cancels exactly the reminders of that prescription', async () => {
    await disableReminders(prescription);
    expect(mocked.cancelTriggerNotifications).toHaveBeenCalledWith([
      'rx:rx_2:morning',
      'rx:rx_2:night',
    ]);
  });

  it('reads whether reminders are on from what the OS has scheduled', async () => {
    mocked.getTriggerNotificationIds.mockResolvedValue(['rx:rx_2:night']);
    expect(await hasReminders('rx_2')).toBe(true);
    expect(await hasReminders('rx_1')).toBe(false);
  });

  it('sends a one-off test reminder about ten seconds ahead', async () => {
    const before = Date.now();
    expect(await sendTestReminder(prescription)).toBe(true);
    const [, trigger] = mocked.createTriggerNotification.mock.calls[0];
    const delay = (trigger as { timestamp: number }).timestamp - before;
    expect(delay).toBeGreaterThanOrEqual(10_000);
    expect(delay).toBeLessThan(11_000);
    expect(trigger).not.toHaveProperty('repeatFrequency');
  });
});
