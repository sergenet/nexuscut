const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const cmd = `"${ffmpeg}" -y -loop 1 -i "C:/dino_project/glowing_egg_car.png" -i "C:/NexusCut/public/sfx/swoosh.mp3" -vf "scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,crop='1620/min(1+0.03*t,1.5)':'2880/min(1+0.03*t,1.5)':'(iw-ow)/2':'(ih-oh)/2',scale=1080:1920" -c:v libx264 -preset fast -tune stillimage -r 30 -c:a aac -ac 2 -b:a 192k -ar 44100 -pix_fmt yuv420p -shortest "C:/NexusCut/test_anim_audio.mp4"`;
console.log('Running cmd:', cmd);
try {
  execSync(cmd, { stdio: 'pipe' });
  console.log('SUCCESS');
} catch(e) {
  console.error('ERROR:', e.message);
  console.error('STDERR:', e.stderr.toString());
}
