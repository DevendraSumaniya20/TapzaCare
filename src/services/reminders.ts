import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import i18n from '../i18n';
import type { DoseTiming, Prescription } from '../types/api';
import {
  buildSchedule,
  nextOccurrence,
  REMINDER_HOUR,
  type ScheduleGroup,
} from '../utils/schedule';

const CHANNEL_ID = 'medicine-reminders';

const TIMING_LABEL = {
  morning: 'prescriptions.morning',
  afternoon: 'prescriptions.afternoon',
  night: 'prescriptions.night',
} as const;

// One notification per prescription and time of day. A fixed id lets us replace or cancel exactly that one.
const reminderId = (prescriptionId: string, timing: DoseTiming) =>
  `rx:${prescriptionId}:${timing}`;

/** Text is fixed when the reminder is scheduled, in the language chosen at that moment. */
const content = (prescription: Prescription, group: ScheduleGroup) => ({
  title: i18n.t('reminders.title', {
    time: i18n.t(TIMING_LABEL[group.timing]),
  }),
  body: group.medicines
    .map(medicine => `${medicine.name} - ${medicine.dose}`)
    .join('\n'),
  android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
  data: { prescriptionId: prescription.id },
});

/** Asks for notification permission (the OS shows its prompt once) and prepares the Android channel. */
async function prepare(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED)
    return false;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: i18n.t('reminders.channel'),
    importance: AndroidImportance.HIGH,
  });
  return true;
}

/** Schedules a daily reminder for each time of day in the prescription. False if the user refused notifications. */
export async function enableReminders(
  prescription: Prescription,
): Promise<boolean> {
  if (!(await prepare())) return false;
  await Promise.all(
    buildSchedule(prescription).map(group =>
      notifee.createTriggerNotification(
        {
          id: reminderId(prescription.id, group.timing),
          ...content(prescription, group),
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: nextOccurrence(REMINDER_HOUR[group.timing]).getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        },
      ),
    ),
  );
  return true;
}

export async function disableReminders(
  prescription: Prescription,
): Promise<void> {
  await notifee.cancelTriggerNotifications(
    buildSchedule(prescription).map(group =>
      reminderId(prescription.id, group.timing),
    ),
  );
}

/** Whether this prescription currently has reminders scheduled. The OS is the source of truth, not app state. */
export async function hasReminders(prescriptionId: string): Promise<boolean> {
  const ids = await notifee.getTriggerNotificationIds();
  return ids.some(id => id.startsWith(`rx:${prescriptionId}:`));
}

/** For demos and for checking that notifications work: the first reminder, ten seconds from now. */
export async function sendTestReminder(
  prescription: Prescription,
): Promise<boolean> {
  const [group] = buildSchedule(prescription);
  if (!group || !(await prepare())) return false;
  await notifee.createTriggerNotification(content(prescription, group), {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 10_000,
  });
  return true;
}
