import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { emptyState } from '../../shared/components/empty-state.js';
import { fileItem, animationDelay } from '../../shared/components/file-item.js';
import { skeletons } from '../../shared/components/skeleton.js';
import { escapeHtml, formatSize, formatDate } from '../../shared/utils/format.js';
import { placeSlider } from '../../shared/utils/dom.js';

const templates = {
  page: () => `
    <div class="volume-switch" id="volume-switch">
      <div class="volume-switch-slider" id="volume-slider"></div>
      <button data-volume="int" class="on">${icon('smartphone')}<span data-i18n="explorer.internal"></span></button>
      <button data-volume="sd">${icon('sd-card')}<span data-i18n="explorer.sd"></span></button>
    </div>
    <div class="card explorer-header">
      <div class="volume-info" id="volume-info"></div>
      <div class="crumbs-row">
        <button class="btn btn-icon" id="back-btn">${icon('arrow-left', 'icon-sm')}</button>
        <div class="crumbs" id="crumbs"></div>
      </div>
      <div class="btn-row">
        <button class="btn primary" id="search-here">${icon('search', 'icon-sm')}<span data-i18n="explorer.searchHere"></span></button>
        <button class="btn" id="favorite">${icon('star', 'icon-sm')}<span data-i18n="explorer.favorite"></span></button>
      </div>
    </div>
    <div class="file-list scroll-list" id="explorer-list"></div>`,

  volumeInfo: (volume) => `
    <div class="volume-icon">${icon(volume.icon)}</div>
    <div class="volume-text"><b>${t(volume.labelKey)}</b><span>${t('explorer.free', { size: formatSize(volume.free) })}</span></div>
    <div class="volume-status">${icon('check-circle-2', 'icon-xs')}${t('explorer.access')}</div>`,

  crumbs: ({ root, parts }) =>
    `<a data-crumb="-1">${escapeHtml(root)}</a>${parts
      .map((part, index) => `<span>›</span><a data-crumb="${index}">${escapeHtml(part)}</a>`)
      .join('')}`,

  folder: (folder, index) => `
    <div class="list-item" data-folder="${index}" style="${animationDelay(index)}">
      <div class="item-icon item-icon-dir">${icon('folder')}</div>
      <div class="item-meta">
        <div class="item-name">${escapeHtml(folder.name)}</div>
        <div class="item-sub"><span>${formatDate(folder.mtime)}</span></div>
      </div>
      ${icon('chevron-right', 'icon-md item-chevron')}
    </div>`,

  sectionLabel: (key, count, first) =>
    `<div class="section-label ${first ? 'section-label-first' : 'section-label-next'}">${t(key, { count })}</div>`,

  list: (folders, files) => {
    const folderHtml = folders.length
      ? templates.sectionLabel('explorer.folders', folders.length, true) +
        folders.map((folder, index) => templates.folder(folder, index)).join('')
      : '';
    const fileHtml = files.length
      ? templates.sectionLabel('explorer.files', files.length, !folders.length) +
        files.map((file, index) => fileItem(file, index, 'explorer', index + folders.length)).join('')
      : '';
    return folderHtml + fileHtml;
  },

  empty: () => emptyState({ iconName: 'folder-open', text: t('explorer.empty'), hint: t('explorer.emptyHint') }),
  error: (message) => emptyState({ iconName: 'alert-triangle', text: escapeHtml(message) }),
};

const render = {
  page: (container) => {
    container.innerHTML = templates.page();
  },
};

const update = {
  header: (elements, volume, crumbs) => {
    elements.volumeInfo.innerHTML = templates.volumeInfo(volume);
    elements.crumbs.innerHTML = templates.crumbs(crumbs);
    elements.crumbs.scrollLeft = elements.crumbs.scrollWidth;
  },
  volumeButtons: (elements, currentKey, volumes) => {
    elements.volumeButtons.forEach((button) => {
      button.classList.toggle('on', button.dataset.volume === currentKey);
      button.classList.toggle('hidden', button.dataset.volume === 'sd' && !volumes.some((volume) => volume.key === 'sd'));
    });
  },
  slider: (elements, currentKey) => {
    placeSlider(elements.slider, elements.volumeButtons.find((item) => item.dataset.volume === currentKey));
  },
  backButton: (elements, atRoot) => {
    elements.backBtn.disabled = atRoot;
  },
  loading: (elements) => {
    elements.list.innerHTML = skeletons();
  },
  list: (elements, folders, files) => {
    elements.list.innerHTML = folders.length || files.length ? templates.list(folders, files) : templates.empty();
    elements.list.scrollTop = 0;
  },
  error: (elements, message) => {
    elements.list.innerHTML = templates.error(message);
  },
};

const helpers = {
  highlight: (button, duration) => {
    button.classList.remove('highlight');
    button.offsetWidth;
    button.classList.add('highlight');
    return setTimeout(() => button.classList.remove('highlight'), duration);
  },
};

export { templates, render, update, helpers };
