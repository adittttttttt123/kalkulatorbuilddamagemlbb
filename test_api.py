import urllib.request
import json

def test():
    urls = {
        "hero": "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/hero-meta.json",
        "item": "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/item-meta.json"
    }
    
    for name, url in urls.items():
        print(f"--- Fetching {name} ---")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                print("Type of data:", type(data))
                if isinstance(data, dict):
                    print("Keys:", list(data.keys()))
                    # Look for data list
                    for key in data:
                        if isinstance(data[key], list) and len(data[key]) > 0:
                            print(f"Sample item from keys '{key}':", json.dumps(data[key][0], indent=2)[:500])
                elif isinstance(data, list) and len(data) > 0:
                    print("Sample item:", json.dumps(data[0], indent=2)[:500])
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    test()
