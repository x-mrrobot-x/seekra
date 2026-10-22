import { t } from '../../core/i18n.js';
import { EXTENSIONS } from '../../shared/utils/files.js';
import { formatSize } from '../../shared/utils/format.js';
import { getAllRoots, getVolumes, describePath } from '../explorer/explorer.model.js';

let mode = 'simple';
let scope = null;
let lastDuration = null;

const getMode = () => mode;
const setMode = (value) => {
  mode = value;
};
const getScope = () => scope;
const setScope = (path) => {
  scope = path;
};
const clearScope = () => {
  scope = null;
};
const setLastDuration = (milliseconds) => {
  lastDuration = milliseconds;
};

const getScopeInfo = () =>
  scope
    ? { name: describePath(scope), path: scope }
    : { name: t('search.scope.all'), path: getVolumes().map((volume) => t(volume.labelKey)).join(' + ') };

const validateRegex = (pattern) => {
  try {
    new RegExp(pattern);
    return null;
  } catch (error) {
    return error.message;
  }
};

const buildSearch = ({ text, type, minSize, days, recursive }) => {
  const roots = scope ? [scope] : getAllRoots();
  const chips = [];
  if (type) chips.push(t('chips.type', { value: t(`category.${type}`) }));
  if (minSize) chips.push(t('chips.size', { value: minSize }));
  if (days) chips.push(t('chips.days', { days }));
  if (scope) chips.push(t('chips.folder', { name: describePath(scope) }));
  if (!recursive) chips.push(t('chips.nonRecursive'));
  return {
    type: 'search',
    chips,
    params: {
      roots: roots.join('\n'),
      q: text,
      mode,
      ext: type ? EXTENSIONS[type].join(',') : '',
      minmb: minSize || 0,
      days: days || 0,
      rec: recursive ? 1 : 0,
    },
  };
};

const getOverviewStats = () => {
  const volumes = getVolumes();
  return [
    { value: String(volumes.length), labelKey: 'search.overview.volumes' },
    { value: formatSize(volumes.reduce((total, volume) => total + volume.free, 0)), labelKey: 'search.overview.free' },
    { value: lastDuration === null ? '—' : `${lastDuration} ms`, labelKey: 'search.overview.lastSearch' },
  ];
};

export {
  getMode,
  setMode,
  getScope,
  setScope,
  clearScope,
  setLastDuration,
  getScopeInfo,
  validateRegex,
  buildSearch,
  getOverviewStats,
};
