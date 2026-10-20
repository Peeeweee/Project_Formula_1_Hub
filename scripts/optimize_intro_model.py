"""Build a texture-optimized intro copy; keep the garage source unchanged.
Requires Pillow. Run: python scripts/optimize_intro_model.py
"""
import io
import json
import struct
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/f1_mercedes_w13_concept.glb'
TARGET = ROOT / 'public/mercedes-intro.glb'

def optimize():
    source = SOURCE.read_bytes()
    json_size = struct.unpack_from('<I', source, 12)[0]
    document = json.loads(source[20:20 + json_size])
    binary = source[28 + json_size:]
    replacements = {}
    for image in document['images']:
        index = image['bufferView']
        view = document['bufferViews'][index]
        start = view.get('byteOffset', 0)
        texture = Image.open(io.BytesIO(binary[start:start + view['byteLength']])).convert('RGBA')
        texture.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        if texture.getchannel('A').getextrema() != (255, 255):
            texture.save(output, format='PNG', optimize=True)
            image['mimeType'] = 'image/png'
        else:
            texture.convert('RGB').save(output, format='JPEG', quality=88, optimize=True)
            image['mimeType'] = 'image/jpeg'
        replacements[index] = output.getvalue()
    rebuilt = bytearray()
    for index, view in enumerate(document['bufferViews']):
        start = view.get('byteOffset', 0)
        payload = replacements.get(index, binary[start:start + view['byteLength']])
        rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
        view['byteOffset'] = len(rebuilt)
        view['byteLength'] = len(payload)
        rebuilt.extend(payload)
    document['buffers'][0]['byteLength'] = len(rebuilt)
    metadata = json.dumps(document, separators=(',', ':')).encode()
    metadata += b' ' * (-len(metadata) % 4)
    rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
    result = struct.pack('<III', 0x46546C67, 2, 28 + len(metadata) + len(rebuilt))
    result += struct.pack('<II', len(metadata), 0x4E4F534A) + metadata
    result += struct.pack('<II', len(rebuilt), 0x004E4942) + rebuilt
    TARGET.write_bytes(result)
    print(f'{len(source):,} -> {len(result):,} bytes ({1 - len(result) / len(source):.1%} smaller)')

if __name__ == '__main__':
    optimize()
