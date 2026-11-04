import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search_wikimedia_video(query, limit=10):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json&srlimit={limit*3}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req, context=ctx)
        data = json.loads(response.read())
        results = []
        for item in data['query']['search']:
            title = item['title']
            if not title.lower().endswith(('.webm', '.mp4', '.ogv')):
                continue
            
            # Get file URL
            img_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=videoinfo&viprop=url&format=json"
            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_resp = urllib.request.urlopen(img_req, context=ctx)
            img_data = json.loads(img_resp.read())
            
            pages = img_data['query']['pages']
            for page_id in pages:
                if 'videoinfo' in pages[page_id]:
                    file_url = pages[page_id]['videoinfo'][0]['url']
                    results.append(file_url)
                    break
            
            if len(results) >= limit:
                break
        return results
    except Exception as e:
        print(f"Error fetching {query}: {e}")
        return []

print("GTA:", search_wikimedia_video("gameplay mp4", 10))
print("ASMR:", search_wikimedia_video("sand mp4", 10))
