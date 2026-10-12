import type { DoseTiming, Medicine, Prescription } from '../types/api';

export const TIMINGS: DoseTiming[] = ['morning', 'afternoon', 'night'];

export type ScheduleGroup = { timing: DoseTiming; medicines: Medicine[] };

/**
 * Regroups a prescription by time of day: which medicines to take in the morning, afternoon, night.
 * A time of day with nothing to take is left out.
 */
export function buildSchedule(prescription: Prescription): ScheduleGroup[] {
  return TIMINGS.map(timing => ({
    timing,
    medicines: prescription.medicines.filter(medicine =>
      medicine.timing.includes(timing),
    ),
  })).filter(group => group.medicines.length > 0);
}

/** Identifies one dose on one day, e.g. "2026-10-12|rx_1|med_1|morning". */
export const doseKey = (
  date: string,
  prescriptionId: string,
  medicineId: string,
  timing: DoseTiming,
) => [date, prescriptionId, medicineId, timing].join('|');

// When each time of day is reminded. Fixed for now; a real app would let the patient choose.
export const REMINDER_HOUR: Record<DoseTiming, number> = {
  morning: 8,
  afternoon: 14,
  night: 21,
};

/** The next time the clock shows `hour`:00 - later today, or tomorrow if that has already passed. */
export function nextOccurrence(hour: number, now = new Date()): Date {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}
