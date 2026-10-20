# Free pit-stop asset research

Checked 20 October 2026. The budget is zero. A free download is not automatically a rigged, web-ready asset.

## Integrated

- **Pit Crew Helmet PL**, Pierre-Louis Baril - free under Blendkit Royalty Free. Official signed-in download obtained as a 603,824-byte 1K `.blend`. Because the licensing FAQ restricts easily extractable models, the source stays in ignored local storage. The live intro uses 16 camera-facing rendered PNG views (641,257 bytes combined), not the original mesh. Rendered images are expressly permitted in the FAQ. Original team graphics were replaced with neutral graphite/turquoise materials. Rebuild with `python scripts/render_pit_helmet.py`; the local official `bpy` toolchain is ignored by Git and ESLint.
  - Asset: https://www.blendkit.com/asset-gallery-detail/cc329482-f2d1-49ff-82bc-8407f455cdc2/
  - License: https://www.blendkit.com/docs/licenses/
  - Render/distribution FAQ: https://www.blendkit.com/docs/licenses/licensing-faq/

- **OpenRC F1 Pit Crew Member**, 3D Print Tech Design - CC BY 4.0; downloaded through the signed-in Pinshape account. The low-resolution STL supplies the four wheel-gun operators. Converted to indexed GLB, smoothed normals, suit/helmet/equipment materials, and animated instance transforms. The source has no skeleton; no full-body retargeting is claimed. Source and license are linked in the in-app asset credits. The original STL is archived in artifacts/asset-review/openrc-pit-crew.stl. Rebuild with python scripts/prepare_openrc_crew.py.


- **Poly Haven Urban Courtyard** � CC0; local 1K HDR, 1,651,460 bytes. Outdoor reflections only, not a substitute for the 3D pit lane. https://polyhaven.com/a/urban_courtyard
- **Poly Haven Asphalt 02** � CC0; local 1K color, OpenGL normal and roughness maps (about 2.5 MB combined). https://polyhaven.com/a/asphalt_02
- Poly Haven permits modification and redistribution of these assets: https://polyhaven.com/license

## Crew shortlist

| Asset | Verified facts | Suitability / outstanding work |
|---|---|---|
| Pit Crew Helmet PL, Pierre-Louis Baril | Listed Free; royalty-free license; 11.3 MiB; designed for racing drivers and pit crew | Downloaded and integrated as rendered directional views. Source mesh is not published. This is a rendering optimization, not a new skeletal crew body. |
| OpenRC F1 Pit Crew Member, 3D Print Tech Design | Free; CC BY; attribution required; full and low-resolution STL; login required | Authentic subject, but a posed solid print mesh. Integrated for wheel-gun operators using its natural fixed crouch. Transform animation only; it is not a drop-in skeletal rig. |
| Car mechanic, BELAZ / asset_for_games | Sketchfab search lists free download and FBX | Candidate only: page access returned 403, so license, rig and appearance remain unverified. Not integrated. |

Sources:
- Helmet: https://www.blendkit.com/asset-gallery-detail/cc329482-f2d1-49ff-82bc-8407f455cdc2/
- OpenRC: https://pinshape.com/items/20376-pit-crew-member-openrc-f1-110-isch
- Mechanic: https://sketchfab.com/3d-models/car-mechanic-0728feefdd174869ac7d22017cb5a077

## Rejected / not production-ready

- CGTrader Mechanic Character (ayushcodemate): listing claims rigging, but a buyer reports it is not rigged. Marked royalty-free / no AI. Do not treat it as a verified animated solution. https://www.cgtrader.com/free-3d-models/character/man/mechanic-character-eefbb559-c581-4902-91f6-72d49284cc01
- DV Driver: free game-specific KN5 package, incorporates other helmet work; web redistribution permission not established. https://www.overtake.gg/downloads/dv-driver-driver-model-with-up-to-120-fictional-skins.70692/
- Ripped F1 Manager game assets and third-party mirrors of paid packs: no verified reuse license.
- Three.js Soldier/Vanguard: replaced; its armored appearance was unsuitable.
- Current free fallback: the official Three.js Michelle/Mixamo rig, adapted to a neutral suit with original fitted helmet geometry. Source optimized from 3,276,888 to 1,341,972 bytes by removing unused maps and clips. This improves the silhouette but is not a photorealistic Mercedes crew scan. https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Michelle.glb
- Official download checks: Blendkit helmet endpoint returns 403 without login; Pinshape crew download redirects to login. Pinshape and Blendkit sign-ins succeeded, and both official downloads were obtained. No account protection was bypassed.

## Motion implementation

The installed framer-motion package drives title changes, explanatory copy, panel entrance, skip-button feedback and the intro fade. Three.js continues to animate meshes, wheel service and camera motion. Reduced-motion preferences disable movement in UI transitions. No paid animation services or additional dependencies.
