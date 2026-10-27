import { createExecutionQueue, PARALLEL_JOBS } from '../execution-queue.js';
import { decode } from '../../shared/utils/base64.js';
import { buildCommand } from '../../shared/utils/protocol.js';
import { emit } from '../event-bus.js';

const name = 'tasker';
const TASK_NAME = 'SK 02 - EXEC';
const TASK_PRIORITY = 10;

const pending = new Map();

const getBridge = () => {
  const bridge = window.Tasker;
  return bridge && typeof bridge.runTask === 'function' ? bridge : null;
};

const toError = (error) => (error instanceof Error ? error : new Error(String(error?.message ?? error)));

const unwrapEnvelope = (base64) => {
  try {
    const { id, code, out, err } = JSON.parse(decode(base64));
    return { id, result: { code: Number(code) || 0, stdout: out || '', stderr: err || '' } };
  } catch {
    return null;
  }
};

const sendJob = (job) => {
  const bridge = getBridge();
  if (!bridge) return Promise.reject(new Error('Tasker bridge indisponível (ative a JS Bridge no WebView)'));

  const options = { name: TASK_NAME, variables: { rid: job.id, args: job.command }, priority: TASK_PRIORITY };

  if (typeof bridge.runTaskForResult === 'function') {
    return bridge
      .runTaskForResult({ ...options, timeoutMs: job.timeout })
      .then((response) => {
        const envelope = response?.returnValue ? unwrapEnvelope(response.returnValue) : null;
        if (!envelope) throw new Error(`a tarefa ${TASK_NAME} não devolveu o envelope (falta a ação Return)`);
        return envelope.result;
      })
      .catch((error) => {
        throw toError(error);
      });
  }

  return new Promise((resolve, reject) => {
    pending.set(job.id, { resolve, reject });
    Promise.resolve(bridge.runTask(options)).catch((error) => {
      pending.delete(job.id);
      reject(toError(error));
    });
  });
};

const receive = (base64) => {
  const envelope = unwrapEnvelope(base64);
  const entry = envelope && pending.get(envelope.id);
  if (!entry) return false;
  pending.delete(envelope.id);
  entry.resolve(envelope.result);
  return true;
};

window.SeekraBridge = { receive };

const queue = createExecutionQueue(sendJob, { concurrency: PARALLEL_JOBS, onDrop: (job) => pending.delete(job.id) });

const unwrapOutput = ({ code, stdout, stderr }) => {
  if (code !== 0) throw new Error(stderr.trim() || `código ${code}`);
  return stdout;
};

const execute = (command, options) => queue.push(command, options);
const fileLane = (path) => `file:${path}`;
const read = (path, options) => execute(buildCommand('read', { path }), { ...options, key: fileLane(path) }).then(unwrapOutput);
const write = (path, content) => execute(buildCommand('write', { path, data: content }), { key: fileLane(path) }).then(unwrapOutput);
const notify = (message) => emit('toast', { message, icon: 'info' });
const exit = () => {
  const bridge = getBridge();
  if (bridge && typeof bridge.cancelScreen === 'function') bridge.cancelScreen('exit');
  else window.close();
};
const getVariable = (variable) => {
  const bridge = getBridge();
  return bridge && typeof bridge.getVariable === 'function' ? bridge.getVariable(String(variable).replace(/^%/, '')) : null;
};
const clear = () => queue.clear();
const size = () => queue.size();

export { name, read, write, execute, notify, exit, getVariable, clear, size };
