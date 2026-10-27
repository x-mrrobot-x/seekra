import { t, translate } from '../../core/i18n.js';
import { icon, setIcon } from '../../shared/components/icon.js';
import { emptyState } from '../../shared/components/empty-state.js';
import { fileItem, animationDelay } from '../../shared/components/file-item.js';
import { skeletons } from '../../shared/components/skeleton.js';
import { escapeHtml, formatSize, timeElement } from '../../shared/utils/format.js';
import { placeSlider } from '../../shared/utils/dom.js';

const templates = {
  crumbs: ({ root, parts }) =>
    [root, ...parts]
      .map((name, index) => `<li><button type="button" data-crumb="${index - 1}">${escapeHtml(name)}</button></li>`)
      .join(''),

  folder: (folder, index) => `
    <li class="list-item" data-folder="${index}" style="${animationDelay(index)}">
      <div class="item-icon item-icon-dir">${icon('folder')}</div>
      <div class="item-meta">
        <p class="item-name">${escapeHtml(folder.name)}</p>
        <p class="item-details">${timeElement(folder.mtime)}</p>
      </div>
      ${icon('chevron-right', 'icon-md item-chevron')}
    </li>`,

  sectionHeading: (key, count) => `<h2 class="section-heading">${t(key, { count })}</h2>`,

  list: (folders, files) => {
    const folderHtml = folders.length
      ? templates.sectionHeading('explorer.folders', folders.length) +
        `<ul class="file-list">${folders.map((folder, index) => templates.folder(folder, index)).join('')}</ul>`
      : '';
    const fileHtml = files.length
      ? templates.sectionHeading('explorer.files', files.length) +
        `<ul class="file-list">${files.map((file, index) => fileItem(file, index, 'explorer', index + folders.length)).join('')}</ul>`
      : '';
    return folderHtml + fileHtml;
  },

  empty: () => emptyState({ iconName: 'folder-open', text: t('explorer.empty'), hint: t('explorer.emptyHint') }),
  error: (message) => emptyState({ iconName: 'triangle-alert', text: message }),
};

const update = {
  header: (elements, volume, crumbs) => {
    setIcon(elements.volumeIcon, volume.icon);
    translate(elements.volumeName, volume.labelKey);
    elements.volumeFree.textContent = t('explorer.free', { size: formatSize(volume.free) });
    elements.crumbs.innerHTML = templates.crumbs(crumbs);
    elements.crumbs.scrollLeft = elements.crumbs.scrollWidth;
  },
  volumeButtons: (elements, currentKey, volumes) => {
    elements.volumeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.volume === currentKey);
      button.classList.toggle('hidden', button.dataset.volume === 'sd' && !volumes.some((volume) => volume.key === 'sd'));
    });
  },
  slider: (elements, currentKey) => {
    placeSlider(elements.slider, elements.volumeButtons.find((item) => item.dataset.volume === currentKey));
  },
  favorite: (elements, favorited) => {
    elements.favorite.classList.toggle('active', favorited);
    translate(elements.favoriteLabel, favorited ? 'explorer.favorited' : 'explorer.favorite');
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

export { templates, update, helpers };
