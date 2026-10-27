import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
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
        <p class="item-name">${t(folder.nameKey)}</p>
        <p class="item-path">${escapeHtml(folder.path)}</p>
      </div>
    </li>`,
};

const update = {
  lists: (elements, queries, folders) => {
    elements.queries.innerHTML = queries.map(templates.query).join('');
    elements.folders.innerHTML = folders.map(templates.folder).join('');
  },
};

export { templates, update };
