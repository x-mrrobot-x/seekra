const SKELETON_COUNT = 4;

const skeleton = () => `
  <li class="skeleton">
    <div class="skeleton-block skeleton-icon"></div>
    <div class="skeleton-lines">
      <div class="skeleton-block skeleton-title"></div>
      <div class="skeleton-block skeleton-text"></div>
    </div>
  </li>`;

const skeletons = (count = SKELETON_COUNT) =>
  `<ul class="file-list">${Array.from({ length: count }, skeleton).join('')}</ul>`;

export { skeletons };
