const { exec } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const cmd = `"${ffmpeg}" -y -loop 1 -i "C:/dino_project/glowing_egg_car.png" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -vf "scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,crop='1620/min(1+0.03*t,1.5)':'2880/min(1+0.03*t,1.5)':'(iw-ow)/2':'(ih-oh)/2',scale=1080:1920" -c:v libx264 -preset fast -tune stillimage -r 30 -c:a aac -ac 2 -b:a 192k -ar 44100 -pix_fmt yuv420p -t 3 "C:/NexusCut/test_anim.mp4"`;

console.log("Running command:", cmd);
exec(cmd, (err, stdout, stderr) => {
  if(err) {
    console.error('ERROR:', err.message);
    console.error('STDERR:', stderr);
  } else {
    console.log('SUCCESS');
  }
});
