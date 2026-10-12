import { prescriptions } from '../src/data/prescriptions';
import reducer, { doseToggled, dosesLoaded } from '../src/store/dosesSlice';
import { buildSchedule, doseKey } from '../src/utils/schedule';

describe('buildSchedule', () => {
  it('groups medicines by time of day, in morning-afternoon-night order', () => {
    const schedule = buildSchedule(prescriptions[0]);
    expect(schedule.map(group => group.timing)).toEqual([
      'morning',
      'afternoon',
      'night',
    ]);
    expect(
      schedule.map(group => group.medicines.map(medicine => medicine.id)),
    ).toEqual([['med_1', 'med_3'], ['med_3'], ['med_1', 'med_2', 'med_3']]);
  });

  it('leaves out a time of day with nothing to take', () => {
    expect(buildSchedule(prescriptions[1]).map(group => group.timing)).toEqual([
      'morning',
      'night',
    ]);
  });
});

describe('doses reducer', () => {
  const key = doseKey('2026-10-12', 'rx_1', 'med_1', 'morning');

  it('marks a dose as taken, and unmarks it on a second tap', () => {
    const taken = reducer({}, doseToggled(key));
    expect(taken).toEqual({ [key]: true });
    expect(reducer(taken, doseToggled(key))).toEqual({});
  });

  it('keeps the same medicine at another time of day separate', () => {
    const state = reducer({}, doseToggled(key));
    expect(
      state[doseKey('2026-10-12', 'rx_1', 'med_1', 'night')],
    ).toBeUndefined();
  });

  it('replaces state with what was restored from storage', () => {
    expect(reducer({ old: true }, dosesLoaded({ [key]: true }))).toEqual({
      [key]: true,
    });
  });
});
