import { getVolume } from '../explorer/explorer.model.js';
import { SAVED_QUERIES, FAVORITE_FOLDERS } from './saved.config.js';

const getQueries = () => SAVED_QUERIES;

const getFolders = () =>
  FAVORITE_FOLDERS.map((folder) => ({ ...folder, path: `${getVolume('int').root}/${folder.subpath}` }));

export { getQueries, getFolders };
