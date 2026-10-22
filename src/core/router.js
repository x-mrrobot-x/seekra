import { qs, qsa, toRem } from '../shared/utils/dom.js';
import { emit, on } from './event-bus.js';

const NAV_BAR_WIDTH = 28;

let elements = null;
let currentTab = 'search';

const queryElements = () => {
  elements = {
    views: qsa('.view'),
    navButtons: qsa('#nav button'),
    navBar: qs('#nav-bar'),
  };
};

const moveNavBar = () => {
  const button = elements.navButtons.find((item) => item.dataset.tab === currentTab);
  elements.navBar.style.left = toRem(button.offsetLeft + button.offsetWidth / 2 - NAV_BAR_WIDTH / 2);
  elements.navBar.style.width = toRem(NAV_BAR_WIDTH);
};

const navigate = (view, tab = currentTab) => {
  currentTab = tab;
  elements.views.forEach((element) => element.classList.toggle('on', element.id === `view-${view}`));
  elements.navButtons.forEach((button) => button.classList.toggle('on', button.dataset.tab === tab));
  moveNavBar();
  emit('route:changed', { view, tab });
};

const bindEvents = () => {
  const bindings = elements.navButtons.map((button) => [
    button,
    'click',
    () => navigate(button.dataset.view, button.dataset.tab),
  ]);
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('layout:refresh', moveNavBar);
};

const init = () => {
  queryElements();
  bindEvents();
  moveNavBar();
};

export { init, navigate };
