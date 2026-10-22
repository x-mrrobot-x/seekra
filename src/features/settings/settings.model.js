import { name as environmentName } from '@env';
import * as storage from '../../core/storage.js';
import * as i18n from '../../core/i18n.js';
import * as api from '../../core/api-adapter.js';
import { checkModel } from '../../shared/utils/gemini.js';
import { GEMINI_MODELS, DEFAULT_MODEL } from '../ai/ai.config.js';
import { getVolumes } from '../explorer/explorer.model.js';

const getTheme = () => storage.get('theme', 'dark');
const setTheme = (theme) => storage.set('theme', theme);

const getLanguage = () => i18n.getLanguage();
const changeLanguage = (code) => {
  storage.set('language', code);
  i18n.setLanguage(code);
};

const getApiKey = () => storage.get('geminiKey', '');
const getModelId = () => {
  const id = storage.get('geminiModel', DEFAULT_MODEL);
  return GEMINI_MODELS.some((model) => model.id === id) ? id : DEFAULT_MODEL;
};

const saveGemini = ({ apiKey, model }) => {
  storage.set('geminiKey', apiKey);
  storage.set('geminiModel', model);
};

const testGemini = async () => {
  const apiKey = getApiKey();
  if (!apiKey) throw Object.assign(new Error('no-key'), { code: 'no-key' });
  await checkModel({ apiKey, model: getModelId() });
};

const pingEnvironment = async () => {
  const start = performance.now();
  await api.ping();
  return Math.round(performance.now() - start);
};

const getRoots = () => getVolumes();
const getEnvironmentName = () => environmentName;

export {
  getTheme,
  setTheme,
  getLanguage,
  changeLanguage,
  getApiKey,
  getModelId,
  saveGemini,
  testGemini,
  pingEnvironment,
  getRoots,
  getEnvironmentName,
};
