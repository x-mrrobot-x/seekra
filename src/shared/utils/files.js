const EXTENSIONS = {
  img: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp', 'svg'],
  vid: ['mp4', 'mkv', 'avi', 'mov', 'webm', '3gp'],
  aud: ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'opus', 'aac'],
  code: ['json', 'js', 'ts', 'py', 'sh', 'html', 'css', 'xml', 'yml', 'yaml', 'kt', 'java', 'bsh'],
  doc: ['pdf', 'doc', 'docx', 'odt', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md', 'epub', 'vcf', 'zip', 'rar', '7z', 'tar', 'gz'],
};

const CATEGORY_ICONS = {
  img: 'image',
  vid: 'file-video',
  aud: 'file-audio',
  doc: 'file-text',
  code: 'file-code',
};

const categoryOf = (name) => {
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return Object.keys(EXTENSIONS).find((key) => EXTENSIONS[key].includes(extension)) || 'doc';
};

const toFile = (entry) => ({ ...entry, category: entry.dir ? 'dir' : categoryOf(entry.name) });

export { EXTENSIONS, CATEGORY_ICONS, categoryOf, toFile };
