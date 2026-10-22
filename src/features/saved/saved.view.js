import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';

const templates = {
  query: (query, index) => `
    <div class="list-item" data-query="${index}">
      <div class="item-icon item-icon-${query.tone}">${icon(query.icon)}</div>
      <div class="item-meta">
        <div class="item-name">${t(query.nameKey)}</div>
        <div class="item-path">${t(query.descKey)}</div>
      </div>
    </div>`,

  folder: (folder, index) => `
    <div class="list-item" data-folder="${index}">
      <div class="item-icon item-icon-dir">${icon('folder')}</div>
      <div class="item-meta">
        <div class="item-name">${t(folder.nameKey)}</div>
        <div class="item-path">${escapeHtml(folder.path)}</div>
      </div>
    </div>`,

  page: (queries, folders) => `
    <div class="section-label section-label-first" data-i18n="saved.queriesTitle"></div>
    <div class="file-list" id="saved-queries">${queries.map(templates.query).join('')}</div>
    <div class="section-label" data-i18n="saved.foldersTitle"></div>
    <div class="file-list" id="saved-folders">${folders.map(templates.folder).join('')}</div>`,
};

const render = {
  page: (container, queries, folders) => {
    container.innerHTML = templates.page(queries, folders);
  },
};

const update = {
  lists: (elements, queries, folders) => {
    elements.queries.innerHTML = queries.map(templates.query).join('');
    elements.folders.innerHTML = folders.map(templates.folder).join('');
  },
};

export { templates, render, update };
