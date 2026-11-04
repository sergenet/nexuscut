import paramiko

def test_xfade():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(host, username=username, password=password)
        
        # Create test script on VPS
        cmds = [
            "cd /var/www/nexuscut",
            # Generate one 1.9-second video and one 2.0-second video
            "ffmpeg -y -f lavfi -i testsrc=duration=1.9:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=1.9 -c:v libx264 -c:a aac test1.mp4",
            "ffmpeg -y -f lavfi -i testsrc=duration=2:size=1280x720:rate=30 -f lavfi -i sine=frequency=2000:duration=2 -c:v libx264 -c:a aac test2.mp4",
            # Run xfade expecting 2.0 seconds from test1
            "./node_modules/ffmpeg-static/ffmpeg -y -i test1.mp4 -i test2.mp4 -filter_complex \"[0:v]format=yuv420p,settb=AVTB[v0];[1:v]format=yuv420p,settb=AVTB[v1];[v0][v1]xfade=transition=fade:duration=1:offset=1[vout]\" -map \"[vout]\" -c:v libx264 test_out.mp4",
            # Get duration
            "ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 test_out.mp4"
        ]
        
        stdin, stdout, stderr = ssh.exec_command(" && ".join(cmds))
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        ssh.close()
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_xfade()
