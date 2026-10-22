import { execute } from '@env';
import { buildCommand } from '../shared/utils/protocol.js';
import { toFile } from '../shared/utils/files.js';

const TIMEOUTS = { ping: 10000, volumes: 15000, list: 20000, search: 60000, hash: 120000 };
const SEARCH_KEY = 'query';

const unwrap = ({ code, stdout, stderr }) => {
  if (code !== 0) throw new Error(stderr.trim() || `código ${code}`);
  return stdout;
};

const run = async (op, params, options) => unwrap(await execute(buildCommand(op, params), options));

const parseEntries = (output) =>
  output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [type, size, mtime, ...rest] = line.split('|');
      const path = rest.join('|');
      const index = path.lastIndexOf('/');
      return toFile({
        dir: type === 'd',
        size: Number(size) || 0,
        mtime: Number(mtime) || 0,
        path,
        name: path.slice(index + 1),
        parent: path.slice(0, index),
      });
    });

const parseVolumes = (output) =>
  output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [root, free, total] = line.split('|');
      return { root, free: Number(free) || 0, total: Number(total) || 0 };
    });

const ping = () => run('ping', {}, { timeout: TIMEOUTS.ping });
const volumes = async () => parseVolumes(await run('volumes', {}, { timeout: TIMEOUTS.volumes }));
const list = async (dir) => parseEntries(await run('list', { dir }, { timeout: TIMEOUTS.list }));
const search = async (params) =>
  parseEntries(await run('search', params, { key: SEARCH_KEY, replace: true, timeout: TIMEOUTS.search }));
const searchByCommand = async (command) =>
  parseEntries(await run('ia', { cmd: command }, { key: SEARCH_KEY, replace: true, timeout: TIMEOUTS.search }));
const hash = async (path) => (await run('hash', { path }, { timeout: TIMEOUTS.hash })).trim();
const open = (path) => run('open', { path });
const share = (path) => run('share', { path });

export { ping, volumes, list, search, searchByCommand, hash, open, share };
