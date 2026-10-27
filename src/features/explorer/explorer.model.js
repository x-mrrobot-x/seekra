import { t } from '../../core/i18n.js';
import * as api from '../../core/api-adapter.js';
import * as localCache from '../../shared/utils/local-cache.js';
import { INTERNAL_ROOT, VOLUMES_CACHE_KEY, VOLUME_DEFAULTS } from './explorer.config.js';

const volumes = {
  int: { key: 'int', root: INTERNAL_ROOT, free: 0, total: 0, on: true },
  sd: { key: 'sd', root: '', free: 0, total: 0, on: false },
};

let currentKey = 'int';
let currentPath = INTERNAL_ROOT;
let folders = [];
let files = [];
let requestId = 0;

const withDefaults = (volume) => ({ ...volume, ...VOLUME_DEFAULTS[volume.key] });

const getVolumes = () => Object.values(volumes).filter((volume) => volume.on).map(withDefaults);
const getVolume = (key) => withDefaults(volumes[key]);
const getCurrentVolume = () => getVolume(currentKey);
const getCurrentPath = () => currentPath;
const getAllRoots = () => getVolumes().map((volume) => volume.root);
const getFolders = () => folders;
const getFiles = () => files;

const describePath = (path) => {
  const volume = getVolumes().find((item) => item.root === path);
  return volume ? t(volume.labelKey) : path.split('/').pop();
};

const applyVolumes = (list) => {
  const internal = list.find((item) => item.root === INTERNAL_ROOT) || list[0];
  const external = list.find((item) => item !== internal);
  if (internal) Object.assign(volumes.int, { root: internal.root, free: internal.free, total: internal.total });
  volumes.sd.on = Boolean(external);
  if (external) Object.assign(volumes.sd, { root: external.root, free: external.free, total: external.total });
  if (currentKey === 'sd' && !external) setVolume('int');
};

const isCachedVolume = (item) =>
  item && typeof item.root === 'string' && Number.isFinite(item.free) && Number.isFinite(item.total);

const restoreVolumes = () => {
  const cached = localCache.read(VOLUMES_CACHE_KEY);
  if (!Array.isArray(cached) || !cached.length || !cached.every(isCachedVolume)) return false;
  applyVolumes(cached);
  return true;
};

const loadVolumes = async () => {
  const list = await api.volumes();
  applyVolumes(list);
  localCache.write(VOLUMES_CACHE_KEY, list);
};

const setVolume = (key) => {
  currentKey = key;
  currentPath = volumes[key].root;
};

const setPath = (path) => {
  const volume = getVolumes().find((item) => path === item.root || path.startsWith(`${item.root}/`));
  if (!volume) return false;
  currentKey = volume.key;
  currentPath = path;
  return true;
};

const enterFolder = (index) => {
  currentPath = `${currentPath}/${folders[index].name}`;
};

const navigateTo = (index) => {
  const root = getCurrentVolume().root;
  const parts = currentPath.slice(root.length).split('/').filter(Boolean).slice(0, index + 1);
  currentPath = [root, ...parts].join('/');
};

const getCrumbs = () => {
  const root = getCurrentVolume().root;
  return { root, parts: currentPath.slice(root.length).split('/').filter(Boolean) };
};

const isAtRoot = () => currentPath === getCurrentVolume().root;

const goBack = () => {
  const { parts } = getCrumbs();
  if (parts.length === 0) return;
  if (parts.length === 1) setVolume(currentKey);
  else navigateTo(parts.length - 2);
};

const loadDirectory = async () => {
  requestId += 1;
  const id = requestId;
  const entries = await api.list(currentPath);
  if (id !== requestId) return false;
  folders = entries.filter((entry) => entry.dir);
  files = entries.filter((entry) => !entry.dir);
  return true;
};

export {
  getVolumes,
  getVolume,
  getCurrentVolume,
  getCurrentPath,
  getAllRoots,
  getFolders,
  getFiles,
  describePath,
  restoreVolumes,
  loadVolumes,
  setVolume,
  setPath,
  enterFolder,
  navigateTo,
  getCrumbs,
  isAtRoot,
  goBack,
  loadDirectory,
};
