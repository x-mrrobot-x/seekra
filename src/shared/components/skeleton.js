const SKELETON_COUNT = 4;

const skeletons = (count = SKELETON_COUNT) =>
  Array(count)
    .fill(
      `<div class="skeleton">
        <div class="skeleton-block skeleton-icon"></div>
        <div class="skeleton-lines">
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-text"></div>
        </div>
      </div>`,
    )
    .join('');

export { skeletons };
