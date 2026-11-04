const fs = require('fs');
let t = fs.readFileSync('C:/NexusCut/mobile/public/ffmpeg/814.ffmpeg.js', 'utf8');
t = t.replace('catch{', 'catch(__err){');
t = t.replace('throw s', 'throw new Error("failed to import ffmpeg-core.js: " + (__err ? __err.message : "unknown") + " | URL: " + r)');
fs.writeFileSync('C:/NexusCut/mobile/public/ffmpeg/814.ffmpeg.js', t);
