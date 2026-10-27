import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import { qsa } from '../shared/utils/dom.js';
import { emit } from './event-bus.js';

const locales = { pt, en, es };

const LANGUAGES = [
  { code: 'pt', label: 'Português (Brasil)', html: 'pt-BR' },
  { code: 'en', label: 'English', html: 'en' },
  { code: 'es', label: 'Español', html: 'es' },
];

const DEFAULT_LANGUAGE = 'pt';
const TRANSLATABLE = '[data-i18n], [data-i18n-placeholder]';

let language = DEFAULT_LANGUAGE;

const resolve = (locale, key) =>
  key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), locale);

const interpolate = (text, params) =>
  text.replace(/'?\{\{(\w+)\}\}'?/g, (match, name) => (name in params ? String(params[name]) : match));

const t = (key, params = {}) => {
  const value = resolve(locales[language], key) ?? resolve(locales[DEFAULT_LANGUAGE], key);
  return typeof value === 'string' ? interpolate(value, params) : key;
};

const translateElement = (element) => {
  const { i18n, i18nPlaceholder } = element.dataset;
  if (i18n) element.textContent = t(i18n);
  if (i18nPlaceholder) element.placeholder = t(i18nPlaceholder);
};

const applyTranslations = (root = document) => {
  if (root.dataset) translateElement(root);
  qsa(TRANSLATABLE, root).forEach(translateElement);
};

// Troca a chave de um elemento em runtime; o idioma passa a acompanhá-la em applyTranslations.
const translate = (element, key) => {
  element.dataset.i18n = key;
  translateElement(element);
};

const translatePlaceholder = (element, key) => {
  element.dataset.i18nPlaceholder = key;
  translateElement(element);
};

const getLanguage = () => language;

const init = (code) => {
  language = locales[code] ? code : DEFAULT_LANGUAGE;
  document.documentElement.lang = LANGUAGES.find((item) => item.code === language).html;
};

const setLanguage = (code) => {
  init(code);
  applyTranslations();
  emit('language:changed', { language });
};

export { LANGUAGES, init, t, translate, translatePlaceholder, applyTranslations, getLanguage, setLanguage };
