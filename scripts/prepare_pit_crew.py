"""Prepare the official Three.js Michelle sample as a small neutral suit rig.
Input: artifacts/asset-review/Michelle.glb (official Three.js sample).
No animation clips or unused color/gloss/specular textures ship in the intro.
"""
import json
import struct
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'artifacts/asset-review/Michelle.glb').read_bytes()
size = struct.unpack_from('<I', source, 12)[0]
doc = json.loads(source[20:20 + size])
binary = source[28 + size:]
doc.pop('animations', None)
used = set()
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        used.update(primitive['attributes'].values())
        if 'indices' in primitive: used.add(primitive['indices'])
for skin in doc['skins']:
    used.add(skin['inverseBindMatrices'])
accessor_map = {old: new for new, old in enumerate(sorted(used))}
doc['accessors'] = [doc['accessors'][old] for old in sorted(used)]
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        primitive['attributes'] = {key: accessor_map[value] for key, value in primitive['attributes'].items()}
        if 'indices' in primitive: primitive['indices'] = accessor_map[primitive['indices']]
for skin in doc['skins']: skin['inverseBindMatrices'] = accessor_map[skin['inverseBindMatrices']]
normal_index = doc['textures'][doc['materials'][0]['normalTexture']['index']]['source']
doc['images'] = [doc['images'][normal_index]]
doc['textures'] = [{'source': 0, 'sampler': 0}]
doc['materials'] = [{'name': 'Neutral crew suit', 'doubleSided': True, 'normalTexture': {'index': 0}, 'pbrMetallicRoughness': {'baseColorFactor': [.04, .06, .07, 1], 'roughnessFactor': .85, 'metallicFactor': 0}}]
doc.pop('extensionsUsed', None)
doc.pop('extensionsRequired', None)
views = sorted({item['bufferView'] for item in doc['accessors']} | {doc['images'][0]['bufferView']})
view_map = {old: new for new, old in enumerate(views)}
rebuilt = bytearray()
new_views = []
for index in views:
    view = dict(doc['bufferViews'][index])
    offset = view.get('byteOffset', 0)
    payload = binary[offset:offset + view['byteLength']]
    rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
    view['byteOffset'] = len(rebuilt)
    new_views.append(view)
    rebuilt.extend(payload)
for item in doc['accessors']: item['bufferView'] = view_map[item['bufferView']]
doc['images'][0]['bufferView'] = view_map[doc['images'][0]['bufferView']]
doc['bufferViews'] = new_views
doc['buffers'] = [{'byteLength': len(rebuilt)}]
doc['asset']['extras'] = {'source': 'Three.js Michelle / Mixamo', 'changes': 'Neutral suit materials; removed unused textures and animation clips.'}
metadata = json.dumps(doc, separators=(',', ':')).encode()
metadata += b' ' * (-len(metadata) % 4)
rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
result = struct.pack('<III', 0x46546C67, 2, 28 + len(metadata) + len(rebuilt))
result += struct.pack('<II', len(metadata), 0x4E4F534A) + metadata
result += struct.pack('<II', len(rebuilt), 0x004E4942) + rebuilt
(ROOT / 'public/pit-crew-suit.glb').write_bytes(result)
print(f'{len(source):,} -> {len(result):,} bytes')
