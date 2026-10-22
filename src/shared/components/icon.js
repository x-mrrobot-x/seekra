import { createIcons, icons } from 'lucide';

const icon = (name, size = 'icon-md') => `<i data-lucide="${name}" class="${size}"></i>`;

const refreshIcons = () => createIcons({ icons });

export { icon, refreshIcons };
