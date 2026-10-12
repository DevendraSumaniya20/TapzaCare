import { festivalConfig, normalConfig } from '../src/data/configs';
import { validateConfig } from '../src/utils/validateConfig';

describe('validateConfig', () => {
  it('accepts both shipped configs unchanged', () => {
    expect(validateConfig(normalConfig)).toEqual(normalConfig);
    expect(validateConfig(festivalConfig)).toEqual(festivalConfig);
  });

  it('keeps sections of unknown type so the renderer can skip them', () => {
    const types = validateConfig(normalConfig).sections.map(
      section => section.type,
    );
    expect(types).toContain('video_story');
  });

  it('drops a malformed section or tab instead of rejecting the whole config', () => {
    const config = validateConfig({
      ...normalConfig,
      tabs: [
        ...normalConfig.tabs,
        { id: 'x', label: 'Shop', icon: 'pill', screen: 'shop' },
      ],
      sections: [
        ...normalConfig.sections,
        { id: 'broken', type: 'offer_strip' },
        null,
      ],
    });
    expect(config.tabs).toHaveLength(normalConfig.tabs.length);
    expect(config.sections).toHaveLength(normalConfig.sections.length);
  });

  it('defaults missing items to an empty list', () => {
    const [section] = validateConfig({
      ...normalConfig,
      sections: [
        {
          id: 's',
          type: 'offer_strip',
          background: { kind: 'color', value: '#FFFFFF' },
        },
      ],
    }).sections;
    expect(section?.items).toEqual([]);
  });

  it.each([
    ['not an object', null],
    ['no version', { ...normalConfig, version: undefined }],
    [
      'a theme colour missing',
      { ...normalConfig, theme: { ...normalConfig.theme, primary: '' } },
    ],
    ['no usable tabs', { ...normalConfig, tabs: [] }],
  ])('rejects a config with %s', (_name, input) => {
    expect(() => validateConfig(input)).toThrow();
  });
});
