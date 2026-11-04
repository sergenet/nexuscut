const { execSync } = require('child_process');
const fs = require('fs');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

// Create dummy concat file
fs.writeFileSync('concat_test.txt', "file 'C:\\NexusCut\\test_anim.mp4'\nfile 'C:\\NexusCut\\test_anim.mp4'");

try {
  const cmd = `"${ffmpeg}" -y -f concat -safe 0 -i "concat_test.txt" -c copy "C:\\NexusCut\\test_concat.mp4"`;
  console.log("Running:", cmd);
  execSync(cmd, { stdio: 'pipe' });
  console.log("SUCCESS");
} catch(e) {
  console.error("ERROR:", e.message);
  console.error("STDERR:", e.stderr.toString());
}
