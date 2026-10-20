"""Convert the CC BY 4.0 OpenRC pit crew STL to an indexed, smooth web GLB.

Source: 3D Print Tech Design, Pinshape item 20376, low-resolution download.

Original STL is archived in artifacts/asset-review; this script does not change it.

Requires numpy.

"""

from pathlib import Path

import json

import struct

import numpy as np

ROOT = Path(__file__).resolve().parents[1]

raw = (ROOT / 'artifacts/asset-review/openrc-pit-crew.stl').read_bytes()

count = struct.unpack_from('<I', raw, 80)[0]

tri = np.frombuffer(raw[84:], dtype=np.dtype([('n','<f4',(3,)), ('v','<f4',(3,3)), ('attr','<u2')]), count=count)

positions = tri['v'].reshape(-1, 3).copy()

# STL Z-up to glTF Y-up; preserve the original crouched service pose.

positions = positions[:, [0, 2, 1]] * np.array([1, 1, -1])

lo, hi = positions.min(0), positions.max(0)

positions -= np.array([(lo[0]+hi[0])/2, lo[1], (lo[2]+hi[2])/2])

positions *= 1.35 / (hi[1]-lo[1])

vertices, inverse = np.unique(np.round(positions, 6), axis=0, return_inverse=True)

index_type = 5123 if len(vertices) < 65536 else 5125
indices = inverse.astype('<u2' if index_type == 5123 else '<u4')

vertices = vertices.astype('<f4')

faces = vertices[indices.reshape(-1,3)]

face_normals = np.cross(faces[:,1]-faces[:,0], faces[:,2]-faces[:,0])

normals = np.zeros_like(vertices)

for corner in range(3): np.add.at(normals, indices.reshape(-1,3)[:,corner], face_normals)

normals /= np.maximum(np.linalg.norm(normals,axis=1,keepdims=True), 1e-10)

parts=[vertices.tobytes(), normals.astype('<f4').tobytes(), indices.tobytes()]

offsets=[0,len(parts[0]),len(parts[0])+len(parts[1])]

bin_data=b''.join(parts)

doc={'asset':{'version':'2.0','generator':'Formula DC-1 OpenRC conversion','copyright':'3D Print Tech Design — CC BY 4.0','extras':{'source':'https://pinshape.com/items/20376-pit-crew-member-openrc-f1-110-isch','license':'https://creativecommons.org/licenses/by/4.0/','changes':'Z-up conversion; normalized scale; welded vertices; smoothed normals; GLB export.'}},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'OpenRC_Pit_Crew','mesh':0}],'meshes':[{'name':'OpenRC fixed service pose','primitives':[{'attributes':{'POSITION':0,'NORMAL':1},'indices':2,'material':0}]}],'materials':[{'name':'Crew suit','pbrMetallicRoughness':{'baseColorFactor':[.04,.065,.07,1],'metallicFactor':0,'roughnessFactor':.8}}],'buffers':[{'byteLength':len(bin_data)}],'bufferViews':[{'buffer':0,'byteOffset':offsets[i],'byteLength':len(parts[i]),'target':34963 if i==2 else 34962} for i in range(3)],'accessors':[{'bufferView':0,'componentType':5126,'count':len(vertices),'type':'VEC3','min':vertices.min(0).tolist(),'max':vertices.max(0).tolist()},{'bufferView':1,'componentType':5126,'count':len(vertices),'type':'VEC3'},{'bufferView':2,'componentType':index_type,'count':len(indices),'type':'SCALAR'}]}

metadata=json.dumps(doc,separators=(',',':')).encode();metadata+=b' '*(-len(metadata)%4)

bin_data+=b'\0'*(-len(bin_data)%4)

result=struct.pack('<III',0x46546c67,2,28+len(metadata)+len(bin_data))+struct.pack('<II',len(metadata),0x4e4f534a)+metadata+struct.pack('<II',len(bin_data),0x004e4942)+bin_data

(ROOT/'public/openrc-pit-crew.glb').write_bytes(result)

print(f'{count:,} triangles, {len(vertices):,} vertices, {len(result):,} bytes')

