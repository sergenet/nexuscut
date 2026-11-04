const { Worker } = require('worker_threads');
const w = new Worker(`
  const { parentPort } = require('worker_threads');
  globalThis.self = globalThis;
  globalThis.importScripts = function(url) {
    const fs = require('fs');
    const code = fs.readFileSync(url, 'utf8');
    eval(code);
  };
  try {
    importScripts('C:/NexusCut/mobile/public/ffmpeg/ffmpeg-core.js');
    parentPort.postMessage('SUCCESS: ' + typeof self.createFFmpegCore);
  } catch(e) {
    parentPort.postMessage('ERROR: ' + e.toString());
  }
`, {eval: true});
w.on('message', console.log);
