import * as api from '../../core/api-adapter.js';

let requestId = 0;
let files = [];

const getFiles = () => files;

const run = async (query) => {
  requestId += 1;
  const id = requestId;
  const start = performance.now();
  try {
    const result = query.type === 'ia' ? await api.searchByCommand(query.command) : await api.search(query.params);
    if (id !== requestId) return null;
    files = result;
    return { files, duration: Math.round(performance.now() - start) };
  } catch (error) {
    if (id !== requestId || error.message === 'cancelado') return null;
    throw error;
  }
};

export { getFiles, run };
