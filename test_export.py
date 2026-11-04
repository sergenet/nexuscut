import subprocess

cmd = r'''"C:\NexusCut\node_modules\ffmpeg-static\ffmpeg.exe" -y -f lavfi -i "color=c=red:s=720x1280:r=30:d=10" -f lavfi -i "color=c=blue:s=720x1280:r=30:d=10" -filter_complex "[0:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration=2,scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p,setsar=1/1,settb=AVTB[v_seg0]; [1:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=30,scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p,setsar=1/1,settb=AVTB[v_seg1]; [v_seg0][v_seg1]xfade=transition=fade:duration=2:offset=3[v_out]" -map "[v_out]" -c:v libx264 -preset ultrafast "C:\NexusCut\test_transition.mp4"'''

p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print("RETURN CODE:", p.returncode)
print(p.stderr[-1000:])
