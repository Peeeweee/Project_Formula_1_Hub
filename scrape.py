import json
import os
import requests
from duckduckgo_search import DDGS
from urllib.parse import urlparse

teams = ['Tyrrell', 'Brabham', 'Benetton', 'Cooper', 'BRM', 'Lotus']
base_dir = r"c:\Users\Paulo\Documents\F1_Proj"
logos_dir = os.path.join(base_dir, "public", "assets", "logos")
json_path = os.path.join(base_dir, "src", "data", "constructors.json")

os.makedirs(logos_dir, exist_ok=True)

with open(json_path, 'r', encoding='utf-8') as f:
    constructors = json.load(f)

ddgs = DDGS()

for c in constructors:
    name = c['name']
    if name in teams:
        query = f"{name} F1 team logo transparent png"
        print(f"Searching for {name}...")
        results = list(ddgs.images(query, max_results=3))
        
        if results:
            # try to find a valid URL
            for res in results:
                url = res.get('image')
                if url:
                    try:
                        print(f"Downloading {url}")
                        headers = {'User-Agent': 'Mozilla/5.0'}
                        img_data = requests.get(url, headers=headers, timeout=10).content
                        
                        ext = '.png' if '.png' in url.lower() else '.jpg'
                        if '.svg' in url.lower(): ext = '.svg'
                        
                        filename = f"{name.replace(' ', '_').lower()}{ext}"
                        filepath = os.path.join(logos_dir, filename)
                        
                        with open(filepath, 'wb') as img_file:
                            img_file.write(img_data)
                            
                        c['logoUrl'] = f"/assets/logos/{filename}"
                        print(f"Saved {name} logo to {filepath}")
                        break
                    except Exception as e:
                        print(f"Failed to download {url}: {e}")

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(constructors, f, indent=2)

print("Finished!")
