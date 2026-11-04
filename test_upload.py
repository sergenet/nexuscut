import requests

url = 'http://209.74.79.56/api/transcribe'
files = {'file': ('test.mp4', b'dummy video content', 'video/mp4')}
print('Sending POST request...')
response = requests.post(url, files=files)
print('Response Status:', response.status_code)
print('Response Text:', response.text)
