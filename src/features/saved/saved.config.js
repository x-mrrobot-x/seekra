const SAVED_QUERIES = [
  { nameKey: 'saved.queries.backups.name', descKey: 'saved.queries.backups.desc', icon: 'history', tone: 'doc', text: 'backup', mode: 'simple' },
  { nameKey: 'saved.queries.photos.name', descKey: 'saved.queries.photos.desc', icon: 'regex', tone: 'img', text: 'IMG_[0-9]{8}', mode: 'regex' },
];

const FAVORITE_FOLDERS = [
  { nameKey: 'saved.folders.download', subpath: 'Download' },
  { nameKey: 'saved.folders.camera', subpath: 'DCIM/Camera' },
];

export { SAVED_QUERIES, FAVORITE_FOLDERS };
