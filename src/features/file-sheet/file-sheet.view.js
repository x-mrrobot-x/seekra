import { t } from '../../core/i18n.js';
import { setIcon } from '../../shared/components/icon.js';
import { formatSize, formatDate } from '../../shared/utils/format.js';
import { CATEGORY_ICONS } from '../../shared/utils/files.js';

const update = {
  file: (elements, file) => {
    elements.name.textContent = file.name;
    elements.path.textContent = file.path;
    elements.size.textContent = formatSize(file.size);
    elements.modified.textContent = formatDate(file.mtime);
    elements.type.textContent = t(`category.${file.category}`);
    setIcon(elements.preview, CATEGORY_ICONS[file.category]);
  },
  hash: (element, state, text = '') => {
    element.classList.toggle('hash-loading', state === 'loading');
    element.classList.toggle('hash-error', state === 'error');
    element.classList.toggle('hash-done', state === 'done');
    if (state === 'loading') element.textContent = t('sheet.computing');
    else element.textContent = state === 'idle' ? t('sheet.compute') : text;
  },
};

const helpers = {
  retryText: (message) => `${message} — ${t('sheet.retry')}`,
};

export { update, helpers };
