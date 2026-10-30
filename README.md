# Formula DC-1

Formula DC-1 is a modern, data-driven web application tailored for Formula 1 fans and analysts. It visualizes race data, provides insights into driver performance, and includes experimental machine-learning models for podium prediction and lap-anomaly detection.

## Tech Stack

**Frontend:**
- React (with Vite)
- Tailwind CSS (for styling)
- Framer Motion (for animations)
- D3.js & Recharts (for data visualization)
- Three.js (for 3D rendering)
- React Router (for navigation)

**Data Science & Machine Learning:**
- Python 3
- Pandas & NumPy (for data manipulation)
- Scikit-Learn (for clustering and classification models)

## Key Web Features

The application is divided into several dedicated sections:
- **Learn F1 / Start Here:** Standard and Sprint weekend guides, an interactive points explorer, tire explanations, a circuit atlas, and an animated F1 dictionary.
- **Racers:** Detailed insights into driver statistics, comparing historical performance, and visualizing driver clustering categories.
- **Cars:** Exploration of F1 constructors and 3D car visualizations.
- **Live Season:** Tracking and visualizing current season standings and race-by-race progress.
- **All-Time Records:** Completed driver and constructor championship archives, consistent champion cards, and a season-by-season roll of honour.
- **Pit Wall AI:** An AI-powered dashboard offering predictive insights and lap analysis based on historical data models.

## Beginner navigation and learning path — 28 October 2026

The desktop header exposes eight direct destinations and five resource links without nested dropdowns. On smaller screens, a labeled navigation drawer presents the same destinations with short descriptions and keyboard focus handling.

Start Here includes eight short chapters, optional understanding checks, and progress saved on the current device. Dedicated Teams and Dictionary pages separate people and vocabulary from the car collection. Teams distinguishes the available season standings feed from the historical constructor directory; provider failure is shown explicitly.

Search covers pages, dictionary terms, venues, teams and drivers. Local topics and archived champions work without the full driver feed. Term, venue, team and driver results open specific destinations; accented names and common tire terminology are normalized. Tire guides use qualitative context rather than invented speed or durability percentages. Existing car, data and 3D routes remain available, and the opening pit-stop sequence is preserved.

## Latest experience update — 23 October 2026

- **27 animated dictionary explainers:** Each term has a 12–16 second film with four timestamped chapters, play/pause, replay, and a seekable timeline. Scene movement, captions, and example data follow the same clock.
- **Mechanisms with context:** A road-going safety coupe leads the field; VSC uses minimum-time control without a pacing vehicle. Undercut and overcut show both pit stops. Purple Sector compares sector times and demonstrates why a best sector need not produce the fastest lap.
- **Technical studies:** Animated wing hinges, hybrid-energy paths, the historical MGU-H, cockpit protection, garage inspection, and distinct tire-damage examples use dedicated scenes. Historical systems and 2026 concepts are identified separately.
- **24 circuit locations:** The atlas uses locally stored, selected venue photographs with source and license credits. Geographic track layouts remain a separate view; missing photos are not replaced with unrelated images.
- **Championship history:** Bundled completed-season archives cover driver titles from 1950–2025 and constructor titles from 1958–2025. An ongoing season leader is not treated as a champion.

The 3D explainers are illustrative reconstructions, not physics simulations or live telemetry. Multi-lap examples compress race time; component packaging is schematic. The safety coupe is procedural and unbranded, and the Mercedes reference model represents a 2022 car rather than a 2026 specification.

Implementation notes and attribution:

- [Dictionary animation storyboards](docs/dictionary-animation-storyboards.md)
- [Learning and championship data notes](docs/learning-and-records-upgrade.md)
- [Venue photograph sources and handling](docs/venue-photographs.md)
- [Circuit geometry license](public/circuit-data-LICENSE.txt)

## AI & Data Processing Scripts

The project includes several Python scripts that process raw F1 CSV datasets into structured JSON formats consumed by the frontend:

1. **`driver_clustering.py`**
   - **Purpose:** Groups drivers into behavioral clusters ("Race Day Warrior", "Quali Specialist", "Consistent Scorer", "Backmarker").
   - **Method:** Uses Scikit-Learn's `KMeans` algorithm on features like grid position gain, podium rate, DNF rate, and average qualifying position.

2. **`lap_anomaly.py`**
   - **Purpose:** Detects anomalous lap times to identify Safety Car periods, pit stops, or extraordinary push laps.
   - **Method:** Uses Scikit-Learn's `IsolationForest` anomaly detection algorithm on race lap times.

3. **`podium_predictor.py`**
   - **Purpose:** Predicts the probability of a driver finishing on the podium for specific circuits.
   - **Method:** Uses a `RandomForestClassifier` trained on historical grid positions, circuit averages, constructor points, and recent form.

## Setup & Installation

### Web Application

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

### Preview the production build

Build the application and serve the generated `dist/` output locally:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5178 --strictPort
```

Open [Formula DC-1 locally](http://127.0.0.1:5178/formula-dc1/). The `/formula-dc1/` base path is required; direct page links use hash routes, such as `/formula-dc1/#/teams`. Run the preview command again after stopping the server, and rebuild after source changes to update the preview.

For a quick responsive review, check the navigation drawer, season selector, expanded constructor profiles, driver comparison tables, and garage controls in both portrait and landscape layouts. Browser zoom should reflow the page while wide statistics tables scroll within their own panels. Physical iPhone Safari testing remains a separate check from desktop browser emulation.

### Data Scripts

1. Ensure you have the required Python libraries installed:
   ```bash
   pip install pandas numpy scikit-learn
   ```

2. Place the required dataset CSVs (`results.csv`, `drivers.csv`, `qualifying.csv`, `lap_times.csv`, `races.csv`, `constructorResults.csv`) in the project root directory.

3. Run any of the scripts to generate new data for the frontend:
   ```bash
   python driver_clustering.py
   python lap_anomaly.py
   python podium_predictor.py
   ```


## Beginner experience and data integrity

All original sections remain available under Learn, Explore, and Follow the Season.
Start Here separates Standard and Sprint weekends and lets visitors explore points
for each finishing position. Watch a Race explains a fictional timing tower, flags,
tire codes, and race context. Strategy
includes an interactive one-stop teaching model with visible assumptions. Garage
part buttons explain systems and select camera views; models download on selection.
The cinematic intro plays on full openings and can be skipped immediately.

- Publisher news contains only linked RSS items; provider failure is shown explicitly.
- Missing race results stay unavailable. Points progression uses round standings
  (including Sprint points), with gaps for missing observations.
- Circuit history queries circuit identity rather than reusing calendar round numbers.
- OpenF1 uses a 12-second cache; source timestamps distinguish observations from polls.
- Driver comparison counts recorded results instead of estimating poles and podiums.
- Completed seasons are used for championship counts; an ongoing season leader is
  not automatically awarded a title.
- Pit Wall AI's existing bundled data remains explicitly labelled experimental and
  illustrative. Its provenance and calibrated accuracy have not been established.
- Podium training now uses prior-race features and a chronological race holdout.
  Re-training requires the source CSVs and Python dependencies; no new accuracy is
  claimed until this is run on an identified dataset. Generated metadata documents
  the data cutoff, evaluation split, and hypothetical-grid assumption.

## Verification

```bash
npm test
npm run build
npm run lint
python -m unittest discover -s tests -p 'test_*.py'
```

Dictionary tests cover all 27 narratives, deterministic seeking, sector timing arithmetic, separate pit stops, vehicle clearance, and race-control distinctions.

Other unit tests cover cache refresh/failures, missing standings, RSS deduplication and
source dates, strategy-model tradeoffs, and driver-result counts. Python tests use
synthetic fixtures to verify prior-race feature construction and the export pipeline;
these are not real-world accuracy measurements. GLB files are preserved at their original
quality; they remain large, but are no longer all preloaded. The 3D renderer is a
separate on-demand bundle. Third-party data availability still depends on each
provider. Rules and historical specifications should be reviewed by season.


### Mercedes pit-stop opening

The 3D pit-stop plays on every full site opening/reload, without interrupting in-app navigation. Requested pages load underneath it. Skip and Escape are available immediately. A 10-second shared animation clock drives entry, jacks, tire removal/refitting, crew clearance and release, followed by a five-second central logo sequence and an 800 ms fade into the requested page. The console labels the timings and choreography as an illustrative simulation. Reduced-motion visitors receive a short static pit-box view. Failed model/graphics loads and a 10-second maximum loading wait release the overlay.

The environment contains code-built garage bays, overhead hoses, pit markings, equipment, a pit wall, fencing and instanced grandstand seats. Twelve crew prototypes use a skinned human mesh with procedural limb posing, with tire carriers, wheel-gun operators, jack operators and supporting personnel. Crew and jack equipment move clear before release. Rendering uses a capped pixel ratio, a single 1024-pixel shadow map and a precomputed studio reflection map. Human mesh provenance and project-use references are listed in public/pit-crew-base-attribution.txt. A purpose-built motorsport crew model is still required for authentic clothing and photo-level detail.

The intro uses `public/mercedes-intro.glb` (5.85 MB), generated from the original 46.38 MB Mercedes asset. Its seventeen textures are capped at 1024 pixels; the source garage asset remains unchanged. Rebuild it with `python scripts/optimize_intro_model.py` (Pillow required). Downloads report byte progress when Content-Length is available and use normal browser caching. Skip aborts an outstanding download; unmounting disposes scene resources.

### Free pit crew assets

The intro uses the CC BY 4.0 OpenRC F1 crew mesh by 3D Print Tech Design for four wheel-gun operators. The original low-resolution STL is archived under `artifacts/asset-review/`; `python scripts/prepare_openrc_crew.py` rebuilds the 253 KB indexed GLB. It preserves the source kneeling pose and animates instance transforms, rather than claiming a full skeletal rig. Remaining personnel use an adapted generic rig. The in-app crew credits include source links, license and modifications. Framer Motion handles the UI; Three.js handles the 3D scene.

The detailed Pit Crew Helmet PL by Pierre-Louis Baril is displayed using 16 directional rendered views (~641 KB total). `python scripts/render_pit_helmet.py` renders these locally with Blender Python; the original `.blend` and conversion tools stay ignored. Crew bodies and the Mercedes remain live Three.js geometry. This keeps the extractable source helmet mesh out of the web distribution, in accordance with Blendkit's rendered-use and distribution guidance. The credits link contains asset, author and license links.
## Reliability and interface update — 28 October 2026

- Champion, historical car and era-gallery photographs are served locally through a shared media manifest. Common active-driver portraits and news thumbnails are also bundled; unknown archival portraits retain a named fallback and a bounded remote lookup. Source links are indexed in [local media sources](docs/local-media-sources.md).
- Driver comparison uses recorded race results without requiring every seasonal standings request. Saved champion/current-driver career totals appear immediately, with retrieval dates, while live totals refresh. Grid-P1 starts are labeled separately from qualifying pole awards.
- Teams has a season selector from 1950 through the next calendar year, automatically advancing with the calendar. Current-season data refreshes every five minutes. Future grids appear only when the provider publishes them. Pre-1958 seasons have constructor entries but no constructors' championship standings. The early archive includes Indianapolis 500 constructors.
- Constructor profiles expand within the directory and include summaries, associated drivers and archive-derived championship years. Current official team logos and archived team/manufacturer marks are stored locally. Archived marks are representative identities, not guaranteed season-specific artwork; uncommon constructors without a verified badge use a name mark.
- The garage provides labeled views, component explanations, reset, rotation, lighting and optional specifications. Mobile component explanations appear below the controls. The first Mercedes model uses the existing 5.85 MB optimized asset; other models load only when selected.
- Branding uses black, white and red interface colors. Official images, car liveries and race-control teaching signals retain their source colors. Eurostile Bold Extended handles headings, GoodTimes the brand and section accents, and Chrono selected metadata. Body text uses a readable system sans-serif.
- Development and preview servers expose a fixed F1 publisher-news route. Public static hosting uses an RSS relay or the clearly dated bundled edition if that relay is blocked. Always-live production news requires hosting an equivalent server route; a static build alone cannot provide a server endpoint.

Refresh saved editions with `npm run refresh:news`, `npm run refresh:drivers`, and `npm run refresh:media`. These jobs need network access; they do not replace content with invented data when providers fail. Font source details and production-license status are recorded in the media notes.

## Responsive layouts — 28 October 2026

Shared page widths now expand on large monitors and reflow as browser zoom reduces available CSS space. Navigation uses a drawer below 1024 px. Phone layouts include 44 px controls, 16 px form fields to avoid iOS focus zoom, safe-area insets, dynamic viewport heights, scrollable data tables, stacked team cards, and tap-based car anatomy controls. The desktop garage keeps its controls in a scrollable panel; phone explanations remain beside their controls.

Browser review covered all 13 routes at narrow phone, iPhone-sized portrait/landscape, tablet, desktop and zoom-equivalent widths: 143 viewport/route checks with no document-level horizontal overflow or rendered error boundaries. Expanded team profiles, two-driver comparison, search, mobile navigation, dictionary dialogs and garage component controls were also exercised. This verifies browser reflow, not a physical iOS Safari device run. The layout audit is saved in `artifacts/responsive-layout-audit.json`.
