import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { emptyState } from '../../shared/components/empty-state.js';
import { escapeHtml } from '../../shared/utils/format.js';

const templates = {
  query: (query, index) => `
    <li class="list-item" data-query="${index}">
      <div class="item-icon item-icon-${query.tone}">${icon(query.icon)}</div>
      <div class="item-meta">
        <p class="item-name">${t(query.nameKey)}</p>
        <p class="item-path">${t(query.descKey)}</p>
      </div>
    </li>`,

  folder: (folder, index) => `
    <li class="list-item" data-folder="${index}">
      <div class="item-icon item-icon-dir">${icon('folder')}</div>
      <div class="item-meta">
        <p class="item-name">${escapeHtml(folder.name)}</p>
        <p class="item-path">${escapeHtml(folder.path)}</p>
      </div>
      <button type="button" class="icon-button active" data-unfavorite="${index}" aria-label="${escapeHtml(t('saved.removeFavorite'))}">
        ${icon('star', 'icon-sm')}
      </button>
    </li>`,

  noFolders: () =>
    `<li>${emptyState({ iconName: 'star', text: t('saved.foldersEmpty'), hint: t('saved.foldersEmptyHint') })}</li>`,
};

const update = {
  lists: (elements, queries, folders) => {
    elements.queries.innerHTML = queries.map(templates.query).join('');
    elements.folders.innerHTML = folders.length ? folders.map(templates.folder).join('') : templates.noFolders();
  },
};

export { templates, update };
