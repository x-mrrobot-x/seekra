const NOW = Date.now();

const FILES = [
  ['backup_contatos_2026.vcf', '/storage/emulated/0/Download', 128000, 200],
  ['IMG_20261001_festa.png', '/storage/emulated/0/DCIM/Camera', 3450000, 3],
  ['IMG_20260928_praia.png', '/storage/emulated/0/DCIM/Camera', 2800000, 6],
  ['IMG_20260814_antiga.png', '/storage/emulated/0/DCIM/Camera', 3100000, 65],
  ['video_aniversario.mp4', '/storage/emulated/0/Movies', 734000000, 12],
  ['aula_gravada.mp4', '/storage/emulated/0/Movies', 1024000000, 40],
  ['podcast_ep12.mp3', '/storage/emulated/0/Music/Podcasts', 48200000, 8],
  ['trilha_synth.mp3', '/storage/emulated/0/Music', 9100000, 100],
  ['contrato_aluguel.pdf', '/storage/emulated/0/Documents', 6400000, 20],
  ['relatorio_final.pdf', '/storage/emulated/0/Download', 9100000, 2],
  ['notas_reuniao.txt', '/storage/emulated/0/Documents', 4200, 5],
  ['app_config.json', '/storage/emulated/0/Android/data/nexus', 56000, 30],
  ['dados_backup.json', '/storage/emulated/0/Download/Backups', 2500000, 15],
  ['fotos_familia.zip', '/storage/emulated/0/Download', 524000000, 90],
  ['BACKUP_2025.tar.gz', '/storage/0123-4567/Backup', 2140000000, 400],
  ['manual_tasker.pdf', '/storage/0123-4567/Docs', 15400000, 55],
].map(([name, parent, size, age]) => ({ name, parent, size, mtime: Math.floor(NOW / 1000 - age * 86400), age }));

const VOLUMES = [
  { root: '/storage/emulated/0', free: 18.2e9, total: 128e9 },
  { root: '/storage/0123-4567', free: 41.7e9, total: 64e9 },
];

const MEGABYTE = 1048576;

const toLines = (items) => (items.length ? `${items.join('\n')}\n` : '');
const fileLine = (file) => `f|${file.size}|${file.mtime}|${file.parent}/${file.name}`;
const insideRoots = (path, roots) => roots.some((root) => path === root || path.startsWith(`${root}/`));
const globToRegex = (glob) =>
  new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');

const listDirectory = ({ dir }) => {
  const base = dir.replace(/\/$/, '');
  const folders = new Map();
  const files = [];
  FILES.forEach((file) => {
    if (file.parent === base) files.push(file);
    else if (file.parent.startsWith(`${base}/`)) {
      const folder = file.parent.slice(base.length + 1).split('/')[0];
      folders.set(folder, Math.max(folders.get(folder) || 0, file.mtime));
    }
  });
  files.sort((a, b) => a.name.localeCompare(b.name));
  const folderLines = [...folders]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, mtime]) => `d|0|${mtime}|${base}/${folder}`);
  return toLines([...folderLines, ...files.map(fileLine)]);
};

const searchFiles = ({ roots, q = '', mode, ext, minmb, days, rec }) => {
  const rootList = roots.split('\n').filter(Boolean);
  const extensions = ext ? ext.split(',') : [];
  const pattern = mode === 'regex' && q ? new RegExp(q, 'i') : null;
  const needle = q.toLowerCase();
  return toLines(
    FILES.filter((file) => {
      if (!insideRoots(file.parent, rootList)) return false;
      if (rec === '0' && !rootList.includes(file.parent)) return false;
      if (pattern ? !pattern.test(file.name) : needle && !file.name.toLowerCase().includes(needle)) return false;
      if (extensions.length && !extensions.includes(file.name.split('.').pop().toLowerCase())) return false;
      if (Number(minmb) && file.size < minmb * MEGABYTE) return false;
      if (Number(days) && file.age > Number(days)) return false;
      return true;
    }).map(fileLine),
  );
};

const searchByCommand = ({ cmd }) => {
  const roots = cmd.match(/\/storage\/[^\s'"]+/g) || [];
  const patterns = [...cmd.matchAll(/-i?name\s+'([^']*)'/g)].map((match) => globToRegex(match[1]));
  const minSize = (cmd.match(/-size\s+\+(\d+)M/) || [])[1];
  const maxAge = (cmd.match(/-mtime\s+-(\d+)/) || [])[1];
  return toLines(
    FILES.filter((file) => {
      if (roots.length && !insideRoots(file.parent, roots)) return false;
      if (patterns.length && !patterns.some((pattern) => pattern.test(file.name))) return false;
      if (minSize && file.size < minSize * MEGABYTE) return false;
      if (maxAge && file.age > Number(maxAge)) return false;
      return true;
    }).map(fileLine),
  );
};

const handlers = {
  ping: () => 'ok\n',
  volumes: () => toLines(VOLUMES.map(({ root, free, total }) => `${root}|${free}|${total}`)),
  list: listDirectory,
  search: searchFiles,
  ia: searchByCommand,
  hash: () => {
    throw new Error('indisponível no ambiente web');
  },
  open: () => '',
  share: () => '',
};

export { handlers };
