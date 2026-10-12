import { localize } from '../src/data/configTranslations';
import { isDark, withAlpha } from '../src/utils/color';
import { nextDays, toDateKey } from '../src/utils/date';
import { formatInr } from '../src/utils/format';
import { isText, parseItems } from '../src/utils/parseItems';

describe('colour helpers', () => {
  it('tells dark backgrounds from light ones', () => {
    expect(isDark('#134E4A')).toBe(true);
    expect(isDark('#000')).toBe(true);
    expect(isDark('#FEF3C7')).toBe(false);
    expect(isDark('#FFFFFF')).toBe(false);
  });

  it('treats anything that is not a hex colour as light', () => {
    expect(isDark('teal')).toBe(false);
    expect(isDark('')).toBe(false);
  });

  it('adds opacity to a hex colour and leaves other values alone', () => {
    expect(withAlpha('#0F766E', 0.5)).toBe('rgba(15, 118, 110, 0.5)');
    expect(withAlpha('#fff', 0.1)).toBe('rgba(255, 255, 255, 0.1)');
    expect(withAlpha('teal', 0.5)).toBe('teal');
  });
});

describe('formatInr', () => {
  it('uses the rupee sign and Indian digit grouping', () => {
    expect(formatInr(449)).toBe('₹449');
    expect(formatInr(1499)).toBe('₹1,499');
    expect(formatInr(150000)).toBe('₹1,50,000');
  });
});

describe('date helpers', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 9, 12, 23, 59))).toBe('2026-10-12');
  });

  it('lists consecutive days and rolls over the month end', () => {
    const days = nextDays(3, new Date(2026, 9, 30, 15)).map(toDateKey);
    expect(days).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
});

describe('parseItems', () => {
  const parse = (item: Record<string, unknown>) =>
    isText(item.name) ? { name: item.name } : null;

  it('keeps valid items and drops everything else', () => {
    const items = [
      { name: 'A' },
      { name: '' },
      { other: 1 },
      null,
      'text',
      7,
      { name: 'B' },
    ];
    expect(parseItems(items, parse)).toEqual([{ name: 'A' }, { name: 'B' }]);
  });

  it('returns an empty list for no items', () => {
    expect(parseItems([], parse)).toEqual([]);
  });
});

describe('localize', () => {
  const content = {
    label: 'Home',
    nested: [{ title: 'Quick actions', priceInr: 499 }],
    icon: 'home',
  };

  it('translates known strings at any depth and leaves the rest untouched', () => {
    expect(localize(content, 'hi')).toEqual({
      label: 'होम',
      nested: [{ title: 'त्वरित सेवाएँ', priceInr: 499 }],
      icon: 'home',
    });
  });

  it('returns English content unchanged, without mutating the input', () => {
    expect(localize(content, 'en')).toBe(content);
    localize(content, 'te');
    expect(content.label).toBe('Home');
  });
});
