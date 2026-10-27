const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const formatSize = (bytes) => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
};

const formatDate = (seconds) => new Date(seconds * 1000).toISOString().slice(0, 10);

const timeElement = (seconds, prefix = '') => {
  const date = formatDate(seconds);
  return `<time datetime="${date}">${prefix}${date}</time>`;
};

export { escapeHtml, formatSize, formatDate, timeElement };
