import { icon } from './icon.js';

const emptyState = ({ iconName, text, hint = '' }) => `
  <div class="empty-state">
    <span class="empty-icon">${icon(iconName, 'icon-lg')}</span>${text}
    ${hint ? `<small>${hint}</small>` : ''}
  </div>`;

export { emptyState };
