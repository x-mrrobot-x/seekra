import { qs } from '../shared/utils/dom.js';

let elements = null;
const modals = new Map();
let active = null;

const queryElements = () => {
  elements = { overlay: qs('#overlay') };
};

const register = (name, { element, onClose = () => {} }) => {
  modals.set(name, { element, onClose });
};

const open = (name) => {
  active = name;
  modals.get(name).element.classList.add('on');
  elements.overlay.classList.add('on');
};

const close = () => {
  if (!active) return;
  const { element, onClose } = modals.get(active);
  element.classList.remove('on');
  elements.overlay.classList.remove('on');
  active = null;
  onClose();
};

const init = () => {
  queryElements();
  [[elements.overlay, 'click', close]].forEach(([element, event, handler]) => element.addEventListener(event, handler));
};

export { init, register, open, close };
