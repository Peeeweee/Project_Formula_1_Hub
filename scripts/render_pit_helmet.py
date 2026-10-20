"""Render licensed helmet views for the live 3D intro; never export its mesh.
Source: Pit Crew Helmet PL, Pierre-Louis Baril, Blendkit royalty-free license.
Install conversion tools locally: python -m pip install --target .tools/bpy bpy==5.2.2
The downloaded source .blend stays in ignored artifacts/asset-review/.
"""
from pathlib import Path
import sys, math
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools/bpy'))
import bpy
from mathutils import Vector
bpy.context.preferences.filepaths.use_scripts_auto_execute = False
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'artifacts/asset-review/pit-crew-helmet-1k.blend'), load_ui=False, use_scripts=False)
scene = bpy.context.scene
# Keep the original modeled shell, vents and hardware. Use neutral team colors
# and remove Ferrari-specific graphics from the source material slots.
def material(name, color, roughness, metal=0):
    mat=bpy.data.materials.new(name); mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*color,1)
    bsdf.inputs['Roughness'].default_value=roughness
    bsdf.inputs['Metallic'].default_value=metal
    return mat
shell=material('DC1 graphite helmet',(.035,.065,.07),.28,.4)
accent=material('DC1 turquoise accent',(.025,.42,.38),.32,.3)
visor=material('Smoked visor',(.012,.035,.045),.14,.72)
rubber=material('Padding and rubber',(.012,.015,.018),.86)
silver=material('Hardware',(.35,.4,.42),.25,.8)
meshes=[o for o in scene.objects if o.type=='MESH']
for obj in meshes:
    for slot in obj.material_slots:
        name=slot.material.name.lower() if slot.material else ''
        slot.material=visor if 'glass' in name else silver if ('chrome' in name or 'tal helmet' in name) else rubber if any(part in name for part in ['fabric','plastic','carbon','piano']) else accent if name.endswith(('.001','.003')) else shell
    for polygon in obj.data.polygons: polygon.use_smooth=True
# Bound the evaluated meshes, including the author's modeling modifiers.
depsgraph=bpy.context.evaluated_depsgraph_get()
points=[obj.matrix_world@Vector(corner) for obj in meshes for corner in obj.evaluated_get(depsgraph).bound_box]
lo=Vector(tuple(min(point[i] for point in points) for i in range(3)))
hi=Vector(tuple(max(point[i] for point in points) for i in range(3)))
center=(lo+hi)/2; extent=max(hi-lo)
world=bpy.data.worlds.new('Outdoor lighting'); world.use_nodes=True; scene.world=world
nodes=world.node_tree.nodes; links=world.node_tree.links
image=nodes.new('ShaderNodeTexEnvironment'); image.image=bpy.data.images.load(str(ROOT/'public/environments/urban_courtyard_1k.hdr'))
links.new(image.outputs['Color'],nodes.get('Background').inputs['Color']); nodes.get('Background').inputs['Strength'].default_value=.6
for offset,energy,size in [((2,-3,3),100,2),((-2,1,2),65,2)]:
    light=bpy.data.lights.new('Studio softbox','AREA'); light.energy=energy; light.shape='DISK'; light.size=size
    obj=bpy.data.objects.new('Studio softbox',light); scene.collection.objects.link(obj); obj.location=center+Vector(offset)
    obj.rotation_euler=(center-obj.location).to_track_quat('-Z','Y').to_euler()
camera_data=bpy.data.cameras.new('Helmet view'); camera_data.type='ORTHO'; camera_data.ortho_scale=extent*1.32
camera=bpy.data.objects.new('Helmet view',camera_data); scene.collection.objects.link(camera); scene.camera=camera
scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=16; scene.cycles.use_denoising=True
scene.render.resolution_x=scene.render.resolution_y=256; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'; scene.render.film_transparent=True
scene.render.use_persistent_data=True
scene.view_settings.view_transform='AgX'
output=ROOT/'public/helmet-views'; output.mkdir(exist_ok=True)
for row,pitch in enumerate([15,35]):
    for column in range(8):
        yaw=column*math.tau/8; elevation=math.radians(pitch); radius=extent*4
        camera.location=center+Vector((math.sin(yaw)*math.cos(elevation)*radius,-math.cos(yaw)*math.cos(elevation)*radius,math.sin(elevation)*radius))
        camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(output/f'helmet-{row*8+column:02d}.png')
        bpy.ops.render.render(write_still=True)
        print(f'HELMET_VIEW {row*8+column+1}/16',flush=True)
# Record the alpha bounds so each billboard has correct proportions without
# delivering the original mesh or cropping away directional view alignment.
from PIL import Image
import json
bounds=[list(Image.open(output/f'helmet-{index:02d}.png').getchannel('A').getbbox()) for index in range(16)]
(ROOT/'src/data/helmetFrames.js').write_text('export const HELMET_FRAME_BOUNDS = '+json.dumps(bounds)+';\n',encoding='utf-8')
print('Finished rendered helmet views; source mesh remains private.',flush=True)
