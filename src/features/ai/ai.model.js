import { t } from '../../core/i18n.js';
import * as storage from '../../core/storage.js';
import { generateJson } from '../../shared/utils/gemini.js';
import { getAllRoots, getVolume } from '../explorer/explorer.model.js';
import { GEMINI_MODELS, DEFAULT_MODEL, FORBIDDEN_CHARS, FORBIDDEN_FLAGS, COMMAND_FORMAT } from './ai.config.js';

const getModelId = () => {
  const id = storage.get('geminiModel', DEFAULT_MODEL);
  return GEMINI_MODELS.some((model) => model.id === id) ? id : DEFAULT_MODEL;
};

const hasApiKey = () => Boolean(storage.get('geminiKey', ''));

const systemPrompt = () => `Você é o interpretador de buscas do app NEXUS (Android, backend shell do Tasker).
Converta a solicitação do usuário em UM objeto JSON estrito (sem markdown, sem texto fora do JSON):
{
  "intent": "search_files",
  "roots": ["<raízes autorizadas dentre: ${getAllRoots().join(', ')}>"],
  "recursive": true|false,
  "filters": { "extensions": ["pdf"], "min_size": "5M", "max_age_days": 7, "type": "imagem|video|audio|documento|codigo|null" },
  "command": "find <raiz> -type f ... -print",
  "explanation": "<1 frase, no idioma do usuário>"
}
REGRAS DO COMANDO:
- Apenas 'find' com flags de leitura (-type f, -iname, -name, -size, -mtime, -path, -prune, -print). Terminar com -print.
- PROIBIDO: rm, mv, cp, chmod, chown, >, >>, |, ;, &&, $( ), crase, eval, dd, mkfs, wget, curl, -exec, -delete.
- -size usa sufixo M (ex.: +5M). -mtime -N para últimos N dias.
- Use -iname para ignorar maiúsculas. Caminho EXATO da raiz autorizada, sem inventar diretórios fora da allowlist.`;

const validateCommand = (command) => {
  if (!COMMAND_FORMAT.test(command)) return 'ai.reason.format';
  if (FORBIDDEN_CHARS.test(command) || FORBIDDEN_FLAGS.test(command)) return 'ai.reason.forbidden';
  return null;
};

const describeOutput = ({ filters = {}, recursive, roots = [] }) => {
  const chips = [];
  if (filters.extensions?.length) chips.push(t('ai.chips.extensions', { value: filters.extensions.join(', ') }));
  if (filters.min_size) chips.push(t('ai.chips.minimum', { value: filters.min_size }));
  if (filters.max_age_days) chips.push(t('ai.chips.days', { days: filters.max_age_days }));
  if (recursive === false) chips.push(t('chips.nonRecursive'));
  if (roots.length) chips.push(t('ai.chips.roots', { value: roots.map((root) => root.split('/').pop() || '/').join(', ') }));
  return chips;
};

const generateCommand = async (prompt) => {
  const apiKey = storage.get('geminiKey', '');
  if (!apiKey) throw Object.assign(new Error('no-key'), { code: 'no-key' });
  const output = await generateJson({ apiKey, model: getModelId(), systemInstruction: systemPrompt(), prompt });
  return { command: output.command || '', explanation: output.explanation || '', chips: describeOutput(output) };
};

const interpretLocally = (text) => {
  const low = text.toLowerCase();
  const download = `${getVolume('int').root}/Download`;
  const megabytes = (/(\d+)\s*mb/.exec(low) || [])[1];

  if (/pdf/.test(low)) {
    return {
      command: `find ${download} -type f -iname '*.pdf'${megabytes ? ` -size +${megabytes}M` : ''} -print`,
      explanation: megabytes ? t('ai.local.pdfSize', { mb: megabytes }) : t('ai.local.pdf'),
      chips: [t('ai.local.chipPdf'), megabytes && t('ai.chips.minimum', { value: `${megabytes} MB` }), t('ai.local.chipRecursive')].filter(Boolean),
    };
  }
  if (/v[ií]deo/.test(low)) {
    const size = megabytes || '500';
    return {
      command: `find ${getAllRoots().join(' ')} -type f \\( -iname '*.mp4' -o -iname '*.mkv' \\) -size +${size}M -print`,
      explanation: t('ai.local.video', { mb: size }),
      chips: [t('ai.local.chipVideo'), t('ai.chips.minimum', { value: `${size} MB` }), t('ai.local.chipAllRoots')],
    };
  }
  if (/png|imagem|image|imagen/.test(low) && /7|sete|seven|siete/.test(low)) {
    return {
      command: `find ${download} -type f -iname '*.png' -mtime -7 -print`,
      explanation: t('ai.local.png'),
      chips: [t('ai.local.chipPng'), t('ai.local.chipWeek')],
    };
  }
  return null;
};

export { hasApiKey, validateCommand, generateCommand, interpretLocally };
