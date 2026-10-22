const OP_PATTERN = /^[a-z]+$/;
const KEY_PATTERN = /^[a-z0-9]+$/;

// Formato cru (sem base64): 1ª linha = operação; demais = chave=valor.
// Valor com quebra de linha vira chave repetida; o shell junta de volta com '\n'.
const buildCommand = (op, params = {}) => {
  if (!OP_PATTERN.test(op)) throw new Error(`operação inválida: ${op}`);
  const lines = [op];
  Object.entries(params).forEach(([key, value]) => {
    if (!KEY_PATTERN.test(key)) throw new Error(`parâmetro inválido: ${key}`);
    const text = String(value);
    if (text.includes('\0')) throw new Error(`valor inválido: ${key}`);
    text.split('\n').forEach((part) => lines.push(`${key}=${part}`));
  });
  return lines.join('\n');
};

const parseCommand = (command) => {
  const [op, ...lines] = command.split('\n');
  const args = Object.create(null);
  lines.forEach((line) => {
    if (!line) return;
    const index = line.indexOf('=');
    const key = line.slice(0, index);
    const value = line.slice(index + 1);
    args[key] = key in args ? `${args[key]}\n${value}` : value;
  });
  return { op, args };
};

export { buildCommand, parseCommand };
