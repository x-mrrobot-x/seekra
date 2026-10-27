const DEFAULT_TIMEOUT = 30000;
const DEFAULT_CONCURRENCY = 1;
const PARALLEL_JOBS = 3;

// `key` identifica uma "pista": jobs com a mesma key nunca rodam ao mesmo tempo (e `replace`
// cancela os da mesma key que ainda estão na fila). Jobs sem key só respeitam `concurrency`.
const createExecutionQueue = (run, { timeout = DEFAULT_TIMEOUT, concurrency = DEFAULT_CONCURRENCY, onDrop = () => {} } = {}) => {
  const jobs = [];
  const running = new Set();
  let counter = 0;

  const settle = (job, callback, value) => {
    if (job.done) return;
    job.done = true;
    clearTimeout(job.timer);
    callback(value);
  };

  const isLaneBusy = (key) => key !== undefined && [...running].some((job) => job.key === key);

  const release = (job) => {
    if (!running.delete(job)) return;
    pump();
  };

  const start = (job) => {
    running.add(job);
    job.timer = setTimeout(() => {
      onDrop(job);
      settle(job, job.reject, new Error('tempo esgotado'));
      release(job);
    }, job.timeout);
    new Promise((resolve) => resolve(run(job)))
      .then(
        (value) => settle(job, job.resolve, value),
        (error) => settle(job, job.reject, error),
      )
      .finally(() => release(job));
  };

  const pump = () => {
    while (running.size < concurrency) {
      const index = jobs.findIndex((job) => !isLaneBusy(job.key));
      if (index === -1) return;
      start(jobs.splice(index, 1)[0]);
    }
  };

  const push = (command, { key, replace = false, timeout: jobTimeout = timeout } = {}) =>
    new Promise((resolve, reject) => {
      if (replace && key) {
        for (let index = jobs.length - 1; index >= 0; index -= 1) {
          if (jobs[index].key !== key) continue;
          const [dropped] = jobs.splice(index, 1);
          settle(dropped, dropped.reject, new Error('cancelado'));
        }
      }
      counter += 1;
      jobs.push({ id: `j${Date.now().toString(36)}${counter}`, command, key, timeout: jobTimeout, resolve, reject, done: false });
      pump();
    });

  const clear = () => {
    while (jobs.length) {
      const job = jobs.shift();
      settle(job, job.reject, new Error('cancelado'));
    }
  };

  const size = () => jobs.length + running.size;

  return { push, clear, size };
};

export { createExecutionQueue, PARALLEL_JOBS };
