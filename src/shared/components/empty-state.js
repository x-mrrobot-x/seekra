import { icon } from './icon.js';
import { escapeHtml } from '../utils/format.js';

const emptyState = ({ iconName, text, hint = '' }) => `
  <div class="empty-state">
    <span class="empty-icon">${icon(iconName, 'icon-lg')}</span>
    <p>${escapeHtml(text)}</p>
    ${hint ? `<small>${escapeHtml(hint)}</small>` : ''}
  </div>`;

export { emptyState };
