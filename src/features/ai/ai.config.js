const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', labelKey: 'settings.models.fast' },
  { id: 'gemini-4-argon', labelKey: 'settings.models.capable' },
  { id: 'gemini-3.6-flash', labelKey: 'settings.models.previous' },
  { id: 'gemini-3.5-flash-lite', labelKey: 'settings.models.cheap' },
  { id: 'gemini-2.5-flash', labelKey: 'settings.models.legacy' },
  { id: 'gemini-2.5-pro', labelKey: 'settings.models.legacy' },
];

const DEFAULT_MODEL = GEMINI_MODELS[0].id;

const FORBIDDEN_CHARS = /[;&|<>`{}\n]|\$/;
const FORBIDDEN_FLAGS = /(^|\s)-(exec|execdir|ok|okdir|delete|fprint0?|fprintf|fls)(\s|$)/;
const COMMAND_FORMAT = /^find\s+(\/\S+)\s+.*-print$/;

export { GEMINI_MODELS, DEFAULT_MODEL, FORBIDDEN_CHARS, FORBIDDEN_FLAGS, COMMAND_FORMAT };
