import * as api from '../../core/api-adapter.js';

let current = null;

const setFile = (file) => {
  current = file;
};
const getFile = () => current;
const computeHash = () => api.hash(current.path);
const openFile = () => api.open(current.path);
const shareFile = () => api.share(current.path);

export { setFile, getFile, computeHash, openFile, shareFile };
