import { qs } from '../utils/dom.js';
import { escapeHtml } from '../utils/format.js';
import { on } from '../../core/event-bus.js';
import { icon, refreshIcons } from './icon.js';

const TOAST_DURATION = 2200;

let elements = null;
let timer = null;

const queryElements = () => {
  elements = { toast: qs('#toast') };
};

const show = ({ message, icon: iconName = 'check' }) => {
  elements.toast.innerHTML = `${icon(iconName, 'icon-sm')}<span>${escapeHtml(message)}</span>`;
  elements.toast.classList.add('on');
  refreshIcons();
  clearTimeout(timer);
  timer = setTimeout(() => elements.toast.classList.remove('on'), TOAST_DURATION);
};

const init = () => {
  queryElements();
  on('toast', show);
};

export { init, show };
