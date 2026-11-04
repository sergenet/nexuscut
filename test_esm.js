const { Worker } = require('worker_threads');
const w = new Worker(`
  const { parentPort } = require('worker_threads');
  globalThis.self = globalThis;
  (async () => {
    try {
      const coreModule = await import('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js');
      parentPort.postMessage('SUCCESS: ' + typeof coreModule.default);
    } catch(e) {
      parentPort.postMessage('ERROR: ' + e.toString());
    }
  })();
`, {eval: true});
w.on('message', console.log);
