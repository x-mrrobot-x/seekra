import { qs } from '../utils/dom.js';
import { on } from '../../core/event-bus.js';
import { setIcon } from './icon.js';

const TOAST_DURATION = 2200;

let elements = null;
let timer = null;

const queryElements = () => {
  elements = { toast: qs('#toast'), message: qs('#toast-message') };
};

const show = ({ message, icon: iconName = 'check' }) => {
  setIcon(elements.toast, iconName);
  elements.message.textContent = message;
  elements.toast.classList.add('visible');
  clearTimeout(timer);
  timer = setTimeout(() => elements.toast.classList.remove('visible'), TOAST_DURATION);
};

const init = () => {
  queryElements();
  on('toast', show);
};

export { init, show };
