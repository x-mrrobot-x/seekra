const DEFAULT_TIMEOUT = 30000;

const createExecutionQueue = (run, { timeout = DEFAULT_TIMEOUT, onDrop = () => {} } = {}) => {
  const jobs = [];
  let current = null;
  let counter = 0;

  const settle = (job, callback, value) => {
    if (job.done) return;
    job.done = true;
    clearTimeout(job.timer);
    callback(value);
  };

  const release = (job) => {
    if (current !== job) return;
    current = null;
    pump();
  };

  const pump = () => {
    if (current || !jobs.length) return;
    const job = jobs.shift();
    current = job;
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

  const size = () => jobs.length + (current ? 1 : 0);

  return { push, clear, size };
};

export { createExecutionQueue };
