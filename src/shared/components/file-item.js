import { t } from '../../core/i18n.js';
import { escapeHtml, formatSize, timeElement } from '../utils/format.js';
import { CATEGORY_ICONS } from '../utils/files.js';
import { icon } from './icon.js';

const MAX_DELAY = 400;
const STAGGER = 40;

const animationDelay = (position) => `animation-delay:${Math.min(position * STAGGER, MAX_DELAY)}ms`;

const fileItem = (file, index, source, position = index) => `
  <li class="list-item" data-source="${source}" data-index="${index}" style="${animationDelay(position)}">
    <div class="item-icon item-icon-${file.category}">${icon(CATEGORY_ICONS[file.category])}</div>
    <div class="item-meta">
      <p class="item-name">${escapeHtml(file.name)}</p>
      ${source === 'results' ? `<p class="item-path">${escapeHtml(file.parent)}</p>` : ''}
      <p class="item-details">
        <span class="item-category">${t(`category.${file.category}`)}</span>
        <span>${formatSize(file.size)}</span>
        ${timeElement(file.mtime, '· ')}
      </p>
    </div>
  </li>`;

export { fileItem, animationDelay };
