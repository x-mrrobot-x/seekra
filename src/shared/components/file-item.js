import { t } from '../../core/i18n.js';
import { escapeHtml, formatSize, formatDate } from '../utils/format.js';
import { CATEGORY_ICONS } from '../utils/files.js';
import { icon } from './icon.js';

const MAX_DELAY = 400;
const STAGGER = 40;

const animationDelay = (position) => `animation-delay:${Math.min(position * STAGGER, MAX_DELAY)}ms`;

const fileItem = (file, index, source, position = index) => `
  <div class="list-item" data-source="${source}" data-index="${index}" style="${animationDelay(position)}">
    <div class="item-icon item-icon-${file.category}">${icon(CATEGORY_ICONS[file.category])}</div>
    <div class="item-meta">
      <div class="item-name">${escapeHtml(file.name)}</div>
      ${source === 'results' ? `<div class="item-path">${escapeHtml(file.parent)}</div>` : ''}
      <div class="item-sub">
        <span class="item-tag">${t(`category.${file.category}`)}</span>
        <span>${formatSize(file.size)}</span>
        <span>· ${formatDate(file.mtime)}</span>
      </div>
    </div>
  </div>`;

export { fileItem, animationDelay };
