import urllib.request,urllib.parse,json,concurrent.futures
from pathlib import Path
queries=['Bahrain International Circuit grandstand','Jeddah Corniche Circuit grandstand','Albert Park Circuit aerial','Suzuka Circuit grandstand','Shanghai International Circuit grandstand','Miami International Autodrome grandstand','Imola circuit aerial','Monaco Grand Prix harbour','Circuit Gilles Villeneuve aerial','Circuit de Barcelona Catalunya aerial','Red Bull Ring aerial','Silverstone circuit aerial','Hungaroring aerial','Spa Francorchamps Eau Rouge','Circuit Zandvoort aerial','Monza circuit grandstand','Baku City Circuit grand prix','Marina Bay Street Circuit grand prix','Circuit of the Americas tower','Autodromo Hermanos Rodriguez grandstand','Interlagos aerial','Las Vegas Grand Prix circuit','Lusail International Circuit grandstand','Yas Marina Circuit aerial']
circuits=json.loads(Path('src/data/circuits.json').read_text(encoding='utf-8'))
def fetch(pair):
 circuit,query=pair
 params=dict(action='query',generator='search',gsrsearch=query+' filetype:bitmap -map -logo -diagram',gsrnamespace=6,gsrlimit=3,prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=1280,format='json')
 request=urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'FormulaDC1/1.0 educational-venue-gallery'})
 try:
  data=json.load(urllib.request.urlopen(request,timeout=35));pages=list(data.get('query',{}).get('pages',{}).values());pages.sort(key=lambda p:p.get('index',100))
  return circuit['id'],pages
 except Exception as error:return circuit['id'],{'error':str(error)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: result=dict(pool.map(fetch,zip(circuits,queries)))
Path('artifacts/venue-photo-candidates.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
for key,pages in result.items():print(key, [p['title'] for p in pages] if isinstance(pages,list) else pages)
