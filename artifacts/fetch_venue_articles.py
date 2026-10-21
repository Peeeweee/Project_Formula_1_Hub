import urllib.request,urllib.parse,json
from pathlib import Path
titles=['Bahrain International Circuit','Jeddah Corniche Circuit','Albert Park Circuit','Suzuka International Racing Course','Shanghai International Circuit','Miami International Autodrome','Imola Circuit','Circuit de Monaco','Circuit Gilles Villeneuve','Circuit de Barcelona-Catalunya','Red Bull Ring','Silverstone Circuit','Hungaroring','Circuit de Spa-Francorchamps','Circuit Zandvoort','Monza Circuit','Baku City Circuit','Marina Bay Street Circuit','Circuit of the Americas','Autódromo Hermanos Rodríguez','Interlagos Circuit','Las Vegas Strip Circuit','Lusail International Circuit','Yas Marina Circuit']
params=dict(action='query',titles='|'.join(titles),prop='images',imlimit=500,redirects=1,format='json')
req=urllib.request.Request('https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'FormulaDC1/1.0 venue-gallery'})
j=json.load(urllib.request.urlopen(req,timeout=40));Path('artifacts/venue-article-images.json').write_text(json.dumps(j,ensure_ascii=False,indent=2),encoding='utf-8')
for page in j.get('query',{}).get('pages',{}).values():
 print(page['title'],[i['title'] for i in page.get('images',[]) if i['title'].lower().endswith(('.jpg','.jpeg','.webp'))][:25])
