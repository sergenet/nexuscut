import urllib.request
import json

def get_archive_mp4(query, limit=10):
    url = f"https://archive.org/advancedsearch.php?q={urllib.parse.quote(query)}&fl[]=identifier,title,format&sort[]=downloads+desc&rows={limit * 3}&page=1&output=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        docs = data['response']['docs']
        results = []
        for doc in docs:
            # We need to fetch the file list to get the exact mp4 name
            item_url = f"https://archive.org/metadata/{doc['identifier']}"
            item_req = urllib.request.Request(item_url, headers={'User-Agent': 'Mozilla/5.0'})
            item_resp = urllib.request.urlopen(item_req)
            item_data = json.loads(item_resp.read())
            
            for file in item_data.get('files', []):
                if file.get('name', '').endswith('.mp4') and float(file.get('size', 0)) < 50000000: # < 50MB
                    direct_link = f"https://archive.org/download/{doc['identifier']}/{urllib.parse.quote(file['name'])}"
                    results.append(direct_link)
                    break
            if len(results) >= limit:
                break
        return results
    except Exception as e:
        print(f"Error fetching {query}: {e}")
        return []

print("GTA:", get_archive_mp4("gta 5 gameplay OR gta v gameplay", 2))
print("ASMR:", get_archive_mp4("kinetic sand ASMR OR satisfying slime", 2))
