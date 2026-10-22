const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const toRem = (pixels) => `${pixels / parseFloat(getComputedStyle(document.documentElement).fontSize)}rem`;

const placeSlider = (slider, button) => {
  slider.style.left = toRem(button.offsetLeft);
  slider.style.width = toRem(button.offsetWidth);
};

export { qs, qsa, toRem, placeSlider };
