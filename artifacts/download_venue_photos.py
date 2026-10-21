import json,urllib.request,time,io
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
p=Path('src/data/venuePhotos.json');photos=json.loads(p.read_text(encoding='utf-8'));photos.pop('las_vegas',None);folder=Path('public/assets/venues');folder.mkdir(parents=True,exist_ok=True)
for key,item in photos.items():
 try:
  req=urllib.request.Request(item['url'],headers={'User-Agent':'FormulaDC1/1.0 educational-venue-gallery'});data=urllib.request.urlopen(req,timeout=30).read();im=Image.open(io.BytesIO(data)).convert('RGB');im.thumbnail((1280,960));im.save(folder/(key+'.jpg'),quality=85,optimize=True);item['localUrl']='/assets/venues/'+key+'.jpg';print(key,'OK',flush=True)
 except Exception as error:print(key,str(error),flush=True)
 time.sleep(.4)
p.write_text(json.dumps(photos,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
thumbs=list(folder.glob('*.jpg'));sheet=Image.new('RGB',(1000,((len(thumbs)+3)//4)*170),'#121925');draw=ImageDraw.Draw(sheet)
for i,file in enumerate(thumbs):
 image=ImageOps.fit(Image.open(file).convert('RGB'),(240,140));x=(i%4)*250;y=(i//4)*170;sheet.paste(image,(x,y));draw.text((x+4,y+143),file.stem,fill='white')
sheet.save('artifacts/venue-photo-contact-sheet.jpg')
