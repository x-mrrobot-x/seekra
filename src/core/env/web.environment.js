import { createExecutionQueue, PARALLEL_JOBS } from '../execution-queue.js';
import { parseCommand } from '../../shared/utils/protocol.js';
import { emit } from '../event-bus.js';
import { handlers } from './web.mock.js';

const name = 'web';
const RESPONSE_DELAY = 150;

const run = async (job) => {
  await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY));
  const { op, args } = parseCommand(job.command);
  const handler = handlers[op];
  if (!handler) return { code: 127, stdout: '', stderr: `operação desconhecida: ${op}` };
  try {
    return { code: 0, stdout: handler(args), stderr: '' };
  } catch (error) {
    return { code: 1, stdout: '', stderr: error.message };
  }
};

const queue = createExecutionQueue(run, { concurrency: PARALLEL_JOBS });

const execute = (command, options) => queue.push(command, options);
const read = (path) => Promise.resolve(localStorage.getItem(`seekra_file:${path}`) || '');
const write = (path, content) => {
  localStorage.setItem(`seekra_file:${path}`, content);
  return Promise.resolve();
};
const notify = (message) => emit('toast', { message, icon: 'info' });
const exit = () => window.close();
const getVariable = (variable) => localStorage.getItem(`seekra_var:${variable}`);
const clear = () => queue.clear();
const size = () => queue.size();

export { name, read, write, execute, notify, exit, getVariable, clear, size };
