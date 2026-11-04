const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegExe = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

// First, create a 20 second test video
const createCmd = `"${ffmpegExe}" -y -f lavfi -i testsrc=duration=20:size=640x360:rate=30 -c:v libx264 test_in.mp4`;

exec(createCmd, (err, stdout, stderr) => {
  if (err) {
    console.error("Error creating test video", err);
    return;
  }
  
  // Now apply the exact same logic as route.ts
  const filter = `[0:v]trim=start=0:end=10,setpts=PTS-STARTPTS,fps=30[v_seg0]; [0:v]trim=start=10:end=20,setpts=PTS-STARTPTS,fps=30[v_seg1]; [v_seg0][v_seg1]xfade=transition=fade:duration=3:offset=7[v_acc1]`;
  
  const fadeCmd = `"${ffmpegExe}" -y -i test_in.mp4 -filter_complex "${filter}" -map "[v_acc1]" -c:v libx264 -pix_fmt yuv420p test_out.mp4`;
  
  console.log("Running fade...");
  exec(fadeCmd, (err2, stdout2, stderr2) => {
    if (err2) {
      console.error("Error fading", err2);
      return;
    }
    console.log("Fade complete. Checking duration...");
    
    // ffprobe using ffmpeg output
    exec(`"${ffmpegExe}" -i test_out.mp4`, (err3, stdout3, stderr3) => {
      const match = stderr3.match(/Duration: (\d+:\d+:\d+\.\d+)/);
      if (match) {
        console.log("Output Duration:", match[1]);
      } else {
        console.log("Could not parse duration");
      }
    });
  });
});
