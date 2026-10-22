const MODES = ['simple', 'regex', 'ai'];

const MODE_ICONS = { simple: 'search', regex: 'regex', ai: 'sparkles' };

const TYPE_OPTIONS = [
  { value: '', key: 'search.filters.all' },
  { value: 'img', key: 'category.img' },
  { value: 'vid', key: 'category.vid' },
  { value: 'aud', key: 'category.aud' },
  { value: 'doc', key: 'category.doc' },
  { value: 'code', key: 'category.code' },
];

const SIZE_OPTIONS = [
  { value: '', key: 'search.filters.any' },
  { value: '1', key: 'search.filters.size1' },
  { value: '100', key: 'search.filters.size100' },
  { value: '500', key: 'search.filters.size500' },
];

const PERIOD_OPTIONS = [
  { value: '', key: 'search.filters.any' },
  { value: '7', key: 'search.filters.days7' },
  { value: '30', key: 'search.filters.days30' },
];

const RECENT_SEARCHES = [
  { text: 'backup', mode: 'simple' },
  { text: 'IMG_[0-9]{8}', mode: 'regex' },
];

export { MODES, MODE_ICONS, TYPE_OPTIONS, SIZE_OPTIONS, PERIOD_OPTIONS, RECENT_SEARCHES };
