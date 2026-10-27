import { t } from '../../core/i18n.js';
import * as storage from '../../core/storage.js';
import { getVolume, describePath } from '../explorer/explorer.model.js';
import { SAVED_QUERIES, FAVORITE_FOLDERS } from './saved.config.js';

const FAVORITES_KEY = 'favorites';

const presetPath = (folder) => `${getVolume('int').root}/${folder.subpath}`;

// Enquanto o usuário nunca favoritou nem desfavoritou nada, vale a lista inicial do config.
// Na primeira alteração a lista completa passa a ser gravada e daí em diante só ela vale.
const getPaths = () => storage.get(FAVORITES_KEY, FAVORITE_FOLDERS.map(presetPath));

const folderName = (path) => {
  const preset = FAVORITE_FOLDERS.find((folder) => presetPath(folder) === path);
  return preset ? t(preset.nameKey) : describePath(path);
};

const getQueries = () => SAVED_QUERIES;

const getFolders = () => getPaths().map((path) => ({ path, name: folderName(path) }));

const isFavorite = (path) => getPaths().includes(path);

// Liga/desliga o favorito e devolve o novo estado (true = agora é favorito).
const toggleFavorite = (path) => {
  const paths = getPaths();
  const added = !paths.includes(path);
  storage.set(FAVORITES_KEY, added ? [...paths, path] : paths.filter((item) => item !== path));
  return added;
};

export { getQueries, getFolders, isFavorite, toggleFavorite };
