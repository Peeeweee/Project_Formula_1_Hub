# Dictionary animation storyboards

Status: implemented for all 27 current dictionary entries. Each film uses a shared seekable timeline, four chapters, scene-specific motion and supporting evidence.

Implementation: `src/data/dictionaryFilms.js` defines the narratives; `src/utils/dictionaryTimeline.js` drives the deterministic scene state. The dictionary scene components render road traffic, pit service, mechanical cutaways, garage inspection and tire damage. A procedural unbranded road coupe represents the safety car. These are illustrative reconstructions, with compressed multi-lap time and schematic component packaging, rather than physics simulations.

## What the review found

The existing dictionary selects one of a few broad scene categories. Many terms therefore receive similar car movements even when the mechanism needs a different setting. A moving camera, status label or position change is not evidence that a concept has been demonstrated.

Specific failures to correct:

- Safety Car has no physical road-going safety car, deployment, queue or restart context.
- Overcut and undercut do not show both pit stops, tire conditions and the timing comparison needed to explain the position change.
- Purple Sector has no sector boundary, reference time or timing screen. A purple object beside a car cannot explain it.
- VSC must remain distinct from Safety Car: no physical pacing vehicle and no intentional field bunching.
- The historical MGU-H description currently overstates its effects. It exchanges energy with the turbo shaft; it does not directly convert heat into electricity, eliminate all turbo lag or continuously charge the battery.
- Backmarker is a position description, not a synonym for a lapped car. A lapped car need not be last or intrinsically slow.
- Pit window is a strategic range, not one universally perfect lap. Tires, traffic, weather and race conditions matter.
- Purple means the session's best recorded sector at that moment, not necessarily the whole day's best or the fastest whole lap. Sectors are timing sections, not necessarily equal thirds by distance.
- A push lap need not be perfect or set a personal best. Tire damage does not always produce a retirement. A jump start should not be described as intentional cheating.
- Parc ferme is a rules condition with permitted work, not a magical physical lock applied only after qualifying.

## Shared direction

1. Each film establishes a location and a question, shows the mechanism, then proves the result with a visible comparison.
2. Default duration is 12 seconds. Pit cycles, timing and race-control films use 16 seconds where context needs longer. This is animation playback time, not an assertion about real elapsed race time.
3. All films have a running timeline and scrubber. Play, pause, replay and chapter selection control the same timeline. Pausing freezes the sequence; it does not merely stop camera rotation.
4. Manual inspection is separate from playback: orbiting never replaces the scripted action. Use deliberate camera cuts and stable comparison shots.
5. Realistic surfaces, scale, tire rotation, steering, braking and car-body spacing support the explanation. Vehicles follow defined track or pit-lane paths. They do not glide sideways or teleport into a new order.
6. Cars A and B use distinct identification marks. Timing panels sit beside the scene rather than covering the cars. A track inset appears only when geography or relative timing matters.
7. Any numbers below are teaching examples. The UI labels them as illustrative. Time-compressed films show their actual lap/event labels so several laps are not mistaken for a few real seconds.
8. Mechanical cutaways and airflow are explicitly schematic. Airflow lines are explanatory graphics, not CFD results. A historical Mercedes model must not be presented as a mechanically accurate 2026 car.
9. Sound is optional and user-enabled. Motion must remain understandable while muted. Reduced-motion mode provides still keyframes with the same timing and cause/effect information.
10. The end frame must answer the opening question. A generic car with a changing label does not meet this requirement.

## Racing, timing and overtaking

### 01. Overtake Mode — 12 seconds — 2026

- **0–3s / establish:** Trackside view of B ahead and A following. A detection-line marker and a concise eligibility indicator establish why A can use the assist. Avoid hard-coding numerical eligibility rules without a checked regulation version.
- **3–8s / action:** A activates additional electrical deployment. A small energy-flow inset links store, motor and driven wheels. A steers out, accelerates relative to B and draws alongside. Tires roll and the camera tracks both vehicles.
- **8–12s / evidence:** A clears B before merging back. Their order changes on the timing tower. Finish with “Successful example; extra deployment does not guarantee a pass.” A replay can include an unsuccessful attempt later, but it must not confuse the first explanation.
- **Required:** two distinguishable F1 cars, track/detection marker, energy diagram, position display. No unexplained battery floating beside the car.

### 02. DRS — 12 seconds — historical, 2011–2025

- **0–3s:** Two cars approach a marked DRS zone. Identify this as a historical system and establish the example's eligibility.
- **3–8s:** Cut to the pursuing car's actual rear-wing mechanism. The flap opens around its hinge. A schematic side view compares closed/open drag, then returns to both cars accelerating down the straight.
- **8–12s:** Show the pursuer drawing alongside; the flap closes for braking. An example pass may complete with clearance, but the caption states that DRS assists a pass rather than guaranteeing one.
- **Required:** an independently animated rear flap, not movement of the whole wing or an unattached plate. Keep 2026 Overtake Mode separate.

### 03. Active Aero — 12 seconds — 2026

- **0–3s:** A purpose-built 2026 schematic car exits a corner in corner configuration. Highlight both front and rear wing elements.
- **3–8s:** At an enabled straight, close-up views show the relevant wing elements switching to the straight-line configuration. Schematic arrows illustrate the lower-drag state. A second car is unnecessary.
- **8–12s:** Before the next corner, restore corner configuration and show the car braking and turning. A side-by-side keyframe compares the two configurations.
- **Required:** a correct contemporary schematic or suitable model. Do not animate a 2022 car's fixed front wing as though it were the real 2026 mechanism.

### 04. Purple Sector — 16 seconds

- **0–4s:** Show a circuit inset divided at real timing boundaries into S1, S2 and S3. A timing board identifies the current S2 best: B, 28.450s. A's car enters S2 and the sector clock starts.
- **4–10s:** Follow A braking, cornering and accelerating through that section. The S2 clock continues; the map marker moves along the same path. Do not color the track purple before the timing result exists.
- **10–13s:** A crosses the S2 timing line in 28.310s. Compare 28.310 against 28.450: an improvement of 0.140s. Only now does S2 turn purple. Caption: “Fastest recorded S2 in this session so far.”
- **13–16s:** Reveal the rest of the lap. Example A: 31.400 + 28.310 + 32.010 = 1:31.720. B: 31.200 + 28.450 + 31.850 = 1:31.500. A has a purple S2 but B still has the faster full lap. A small legend distinguishes overall best from personal improvement.
- **Required:** timed sector crossings, reference driver, consistent arithmetic and a lap comparison. A purple flag or cube is not part of this film.

### 05. Delta Time — 12 seconds

- **0–3s:** Establish the comparison: A's current lap against A's previous best, not an unexplained gap to B. A translucent reference ghost passes a clearly identified timing point.
- **3–8s:** A gains time through one corner, then loses some on exit. A trace and delta change with progress. Define the example's sign convention: current elapsed time minus reference elapsed time.
- **8–12s:** At the same timing point, A's 28.300s versus reference 28.500s yields −0.200s. A is ahead of the reference there. Explain that a race gap, VSC delta and personal-lap delta use different references and must be labeled.
- **Required:** one consistent reference, matching track progress and an explicitly defined sign convention.

### 06. Push Lap — 12 seconds

- **0–3s:** A preparation lap ends. Tire/brake preparation and the start/finish line establish that the next timed lap is the attempt.
- **3–8s:** Three short shots show acceleration, a braking zone and a corner apex. The lap timer runs and sector crossings update it. An inset contrasts this with the slower preparation lap.
- **8–12s:** The car completes the timed lap and receives a valid time. It can improve or fail to improve; “push” describes the effort and purpose, not a guaranteed best time.
- **Required:** a complete lap context, even if the driving sequence is time-compressed.

## Pit strategy

### 07. Undercut — 16 seconds

- **0–4s:** B leads A by 2.0s. Both are on worn tires. Establish pit entry, box, exit and the timing line on a circuit inset. A's objective is to gain position by stopping first.
- **4–8s:** A enters the pit lane, slows at the limit line, stops and receives fresh tires. B continues. Show pit loss separately from driving pace; A's immediate on-road position is provisional.
- **8–12s:** Time compress the next lap. A's fresh tires produce a net 3.0s gain during this pit cycle in this example. B then makes its corresponding stop. The comparison uses equal illustrative pit losses and accounts for the initial 2.0s gap.
- **12–16s:** B reaches the pit exit behind A: A leads by 1.0s after both stops. Caption: “Position gained through the pit cycle, not an on-track overtake.” Show that cold tires or traffic could reverse the outcome.
- **Required:** both pit visits, tire age/state, lap labels and a consistent timing model. Cars changing order on an empty straight is insufficient.

### 08. Overcut — 16 seconds

- **0–4s:** B leads A by 1.5s. B stops first. A stays out with usable tires and clear track ahead. The opening question is whether A can gain time by delaying its stop.
- **4–8s:** Split the view: B is on an out-lap warming its new tires; A continues at competitive pace. A timing panel explains the actual difference rather than awarding old tires a magical speed boost.
- **8–12s:** A gains a net 3.0s across the relevant comparison in this example, then makes its own stop. Pit-lane time is included for both cars, and provisional order stays distinct from the order after both stops.
- **12–16s:** A rejoins 1.5s ahead of B after both stops. Freeze at the pit exit with an annotated comparison. State the conditions that made this example work; it is not an automatic benefit of stopping later.
- **Required:** a visible cold-tire/traffic explanation for B's weaker pace, A's later stop and a measured result after the cycle.

### 09. Box — 12 seconds

- **0–3s:** Cockpit or following shot. “Box, box” appears as a radio transcript while the pit entry is visible ahead.
- **3–8s:** The car follows the actual pit-entry path, brakes before the speed-limit line and follows the pit lane to its assigned box. The crew is ready before arrival.
- **8–12s:** Jacks lift, wheels are serviced, the car lowers and the crew clears before a safe release. End at the pit exit. Explain that “box” means come into the pits, not necessarily that every visit is only a tire change.
- **Required:** pit lane, crew and release logic. No hard-coded record-breaking stop time.

### 10. Pit Window — 16 seconds

- **0–4s:** Establish tire age and a projected stint timeline. A circuit inset shows where A would rejoin relative to traffic if it stopped now.
- **4–9s:** Scrub through illustrative laps 18–24. Tire degradation and projected rejoin gaps update together. Highlight a range, for example laps 20–23, under the stated assumptions.
- **9–13s:** Compare an early stop into traffic, a stop inside the range and a later stop on more degraded tires. Show the predicted time consequences rather than a single unexplained green lap.
- **13–16s:** A weather or Safety Car event shifts the range. Caption: “A planning window changes as race conditions change.”
- **Required:** bounded predictions, a visible rejoin comparison and changing assumptions. No claim that the selected range is universally optimal.

## Race control, classification and traffic

### 11. Safety Car — 16 seconds

- **0–4s:** A stopped car or debris creates a hazard. Race-control signage changes to SC; marshals are shown in a protected working area.
- **4–8s:** A recognizable road-going safety coupe with roof lights emerges from pit exit. It leads the race leader. At least three F1 cars follow; the safety car must never be another F1 car with a label.
- **8–12s:** A wide view and circuit inset show the field collecting behind it. Drivers reduce pace and maintain separation. No routine racing overtakes occur in the queue.
- **12–16s:** Show the safety car's lights going out for the return phase, the road car entering the pits and the leader controlling the queue. Mark the applicable restart line before demonstrating racing resuming.
- **Required:** an appropriate road-car asset, roof-light animation, safe spacing, hazard context and a restart phase. Deployment can be for unsafe conditions, not only a spectacular crash.

### 12. VSC — 12 seconds

- **0–3s:** A hazard prompts a VSC message on trackside light panels. Establish two cars far apart on the circuit inset.
- **3–8s:** Both reduce pace to meet minimum-time requirements. Their cockpit/timing displays show compliance against the required delta. They remain distributed around the circuit; no pacing car appears.
- **8–12s:** Show the ending message and the transition back to racing under the applicable procedure. Caption: “Virtual control of pace; not a physical safety-car queue.” Do not promise perfectly unchanged time gaps.
- **Required:** separate car locations, timing compliance, no physical safety car.

### 13. Blue Flag — 12 seconds

- **0–3s:** Establish race context: leader A on lap 40 approaches B on lap 39. B can be any relevant race position, not necessarily last.
- **3–8s:** A marshal waves a blue flag and a trackside panel shows blue. B chooses a safe place to ease off or leave room predictably; A closes without contact.
- **8–12s:** A passes and continues; lap counters show why this was a lapping situation rather than a fight for the same position. Note that practice and qualifying flag contexts differ.
- **Required:** physical flag/panel, lap counters, two cars and an actual pass. No abrupt sideways evasive move.

### 14. Lapped Car — 16 seconds

- **0–4s:** A circuit inset shows A's completed distance exceeding B's. Display their lap counters and positions so the learner understands the relative progress.
- **4–10s:** A catches B after covering an extra circuit distance. Use a time-compressed map sequence to make that distance visible, then switch to the trackside approach.
- **10–16s:** A passes safely. A synchronized distance/lap display explains the lap deficit. Do not imply that B's counter increases merely because the leader drives past; counters change at the driver's timing line.
- **Required:** distance/lap context and synchronization between map and cars. A lapped car need not be last or universally slow.

### 15. Backmarker — 12 seconds

- **0–3s:** A timing tower locates B near the rear of the field, such as P21, while B is still on the lead lap.
- **3–8s:** B races another rear-running car for position. The animation shows normal racing rather than automatically making B move aside.
- **8–12s:** Contrast with a separate later moment when the leader approaches to lap B and blue flags become relevant. Clearly label the two situations.
- **Required:** race position first, lapping second. Avoid equating rear position with driver incompetence or an automatic duty to surrender position.

### 16. Jump Start — 12 seconds

- **0–3s:** A grid-wide shot establishes stationary cars and the start gantry. Five red lights are visible.
- **3–6s:** A controlled slow-motion view shows one car beginning to move while the red lights remain on. A split timeline aligns wheel movement and the light state.
- **6–9s:** Replay with a legal stationary car beside it. An incident-review notice identifies the evidence without attributing intent.
- **9–12s:** A steward-decision card explains that the applicable regulations determine the sanction. Do not invent a universal fixed penalty or call it deliberate cheating.
- **Required:** synchronized lights and vehicle movement, a legal comparison and an era-aware ruling.

### 17. DNF — 12 seconds

- **0–3s:** A car develops a mechanical issue. The dashboard warning and sound, if enabled, establish the problem without requiring exaggerated smoke.
- **3–8s:** The driver reduces speed and stops in a safe area. Marshals respond; other cars continue along the track.
- **8–12s:** The timing tower marks the car retired/DNF. Add a small final-results note that a retired driver may still be classified depending on distance completed.
- **Required:** actual cessation of racing and a results change. DNF is not synonymous with last place or automatically with unclassified.

### 18. Parc Ferme — 12 seconds

- **0–3s:** Transition into a monitored garage/inspection setting. A visible timeline identifies that parc-ferme conditions are in force; the car need not be physically behind a gate.
- **3–8s:** A technician proposes a setup change while an FIA scrutineer checks it. Compare a restricted setup adjustment with a permitted inspection or approved repair under the stated scenario.
- **8–12s:** Record approval or rejection and show a sealed/recorded specification. Explain that unauthorized changes have consequences under the applicable rules.
- **Required:** garage, technician, scrutineer and a rules decision. No literal magical lock, and no assertion that every maintenance task is banned.

## Hybrid systems and protective structures

### 19. ERS — 12 seconds

- **0–3s:** A car approaches a corner. Overlay a clearly schematic drivetrain cutaway showing motor-generator, energy store and connections.
- **3–8s:** During braking, wheel/drivetrain rotation transfers energy through the motor-generator toward the store. The energy-flow arrows and stored-energy indicator move together.
- **8–12s:** On exit, reverse the electrical flow toward the motor and driven wheels as the car accelerates. The store indicator decreases. Caption explains recovery, storage and deployment as one system.
- **Required:** an energy path rather than a floating battery. Era labels explain that the component arrangement differs across regulations.

### 20. MGU-K — 12 seconds

- **0–3s:** Zoom from a moving car into an isolated motor-generator connected to the drivetrain. Identify shaft, rotor and electrical link schematically.
- **3–8s:** Braking turns the device as a generator. Show shaft rotation and electrical energy flowing to the store.
- **8–12s:** Demonstrate motor operation: the store supplies electrical energy and the machine contributes drivetrain torque. Distinguish this component from the whole ERS.
- **Required:** a mechanical connection and two operating directions. No invented fixed power figure across all eras.

### 21. MGU-H — 12 seconds — historical, 2014–2025

- **0–3s:** Isolate an engine/turbo schematic. Label exhaust turbine, shaft, compressor and MGU-H. Show hot exhaust driving the turbine.
- **3–8s:** Shaft motion drives electrical generation. Trace a permitted example energy path. The electrical machine is linked to the turbo shaft; heat is not drawn directly into a battery.
- **8–12s:** Show the machine assisting turbo-shaft rotation in the other operating direction, explaining turbo response. End with “Historical system; removed for 2026.”
- **Required:** an appropriate historical cutaway, not a generic battery bar. Do not claim that it eliminates all lag or always charges the battery.

### 22. Quali Mode — 12 seconds — historical/era-dependent

- **0–3s:** A historical session label establishes the rule era. An engineer and steering-wheel settings inset establish permitted configuration choices for a qualifying attempt.
- **3–8s:** Compare schematic power/deployment traces for a preparation lap and the timed attempt under that era's rules. The car crosses a timing line and starts the attempt.
- **8–12s:** Show the lap outcome and energy/thermal tradeoffs. Explain the historical nickname rather than asserting that every modern car has a universal “Mode 1” speed switch.
- **Required:** an explicit historical setting and a meaningful comparison; no fabricated universal dial position.

### 23. Halo — 12 seconds

- **0–3s:** Orbit closely around the cockpit, driver helmet and real three-point halo structure. Establish its position relative to the driver's head.
- **3–8s:** Transition to an isolated schematic slow-motion load demonstration. A simplified object contacts the structure; arrows indicate a load path into the chassis.
- **8–12s:** Return to the complete cockpit and explain the protective role and limitations. No graphic injury sequence and no implication that every possible object is deflected safely.
- **Required:** correct attachment points and geometry. An unattached glowing ring around the car is not an adequate halo demonstration.

## Tire behavior

### 24. Flat Spot — 12 seconds

- **0–3s:** A rotating front wheel approaches a braking zone. A sidewall marker makes rotation easy to follow.
- **3–8s:** Under a lock-up, that wheel stops rotating while the car still travels forward. Slow motion shows the same rubber patch sliding along the road, with a localized scuff/smoke effect.
- **8–12s:** Rotation resumes. A magnified view reveals the worn flat patch; subtle wheel/steering vibration appears as it rotates. Compare the damaged outline with the original circular profile.
- **Required:** translation while rotation stops, localized wear and a visible consequence. A random cube touching a torus does not demonstrate the mechanism.

### 25. Marbles — 12 seconds

- **0–3s:** A wide corner view distinguishes the used racing line from the less-used outside line. Rubber fragments are visible beside the main path.
- **3–8s:** An enlarged tire-contact view shows rubber particles accumulating and being picked up when a car runs wide onto that area.
- **8–12s:** The car returns to the cleaner line; the tire close-up and a qualitative grip indicator explain why pickup can reduce grip. It does not automatically spin or leave the circuit.
- **Required:** visible debris, location relative to the racing line, pickup and its effect. No decorative spheres floating beside a stationary tire.

### 26. Graining — 12 seconds

- **0–3s:** Establish tire operating conditions and sliding at a corner. Compare an initially smooth tread surface with a magnified contact patch.
- **3–8s:** Show surface rubber shearing, rolling and adhering in ridges or grains. Label it a surface process and show reduced usable contact qualitatively.
- **8–12s:** Compare the smooth and grained surfaces side by side. State that severity varies and some graining can clean up when conditions improve.
- **Required:** a close-up surface transformation linked to actual sliding. Cold conditions can contribute but must not be presented as the sole possible cause.

### 27. Blistering — 12 seconds

- **0–3s:** A tire cross-section establishes internal heating and layers beneath the visible tread.
- **3–8s:** Excessive internal temperature produces localized separation/blisters. The camera moves from the section to surface patches as damage becomes visible.
- **8–12s:** Compare healthy rubber, surface graining and deeper blister-related damage in a compact diagnostic view. Explain potential performance loss without claiming every blister completely destroys the tire.
- **Required:** an internal-to-surface explanation distinct from graining. Avoid cartoon bubbles presented as an exact physical simulation.

## Implementation order and acceptance checks

1. **Context first:** Safety Car, Purple Sector, Undercut, Overcut, VSC. These currently have the largest gap between their meaning and visible scene.
2. **Traffic and timing:** Overtake Mode, DRS, Delta Time, Push Lap, Blue Flag, Lapped Car, Backmarker, Jump Start and DNF.
3. **Engineering:** ERS, MGU-K, historical MGU-H, Active Aero, Quali Mode, Halo and Parc Ferme.
4. **Tire/pit detail:** Flat Spot, Marbles, Graining, Blistering, Box and Pit Window.

Acceptance is based on the visible mechanism, not just a canvas mounting without an exception:

- Every storyboard is represented by timed keyframes and actual actor/component movement.
- Beginning and end frames make the causal change apparent while muted.
- Pit strategy results reconcile with lap timing, pit loss, tire state and initial gap.
- Purple Sector compares actual displayed numbers and the arithmetic matches.
- Safety Car is a physical road car; VSC has none. Backmarker is not automatically lapped.
- Wheels rotate consistently with travel, actors stay on the intended paths, and vehicle bodies do not intersect.
- Play/pause/seek/replay control the same time base and can reproduce the same state.
- Camera bounds and captions leave the mechanism visible on desktop and mobile.
- Historical and 2026 technologies are visibly distinguished. A missing required asset is identified during implementation rather than silently replaced with an unrelated one.

## Reference checks

Creative scene timing and example numbers above are proposed teaching design, not real telemetry.

- [Official F1 glossary](https://www.formula1.com/en/page/f1-glossary)
- [F1 glossary P–T: parc ferme, pit window, timing and race control](https://www.formula1.com/en/latest/article/f1-glossary-p-t.GBhLQtpeu9b8LrK5VM0F1)
- [F1 glossary K–O: overcut and power-unit terminology](https://www.formula1.com/en/latest/article/f1-glossary-k-o.6g2hrWHA2pyxbXoe8FT9Db)
- [F1 glossary U–Z: undercut and VSC](https://www.formula1.com/en/latest/article/f1-glossary-u-z.5JSlDsnyvYmbK0TCjTs7KB)
- [F1 glossary F–J: tire behavior and other terms](https://www.formula1.com/en/latest/article/f1-glossary-f-j.2g6grJVxT6dFCDpSmgoCQX)
- [FIA explanation of the 2026 technical changes](https://www.fia.com/news/f1s-new-era-everything-you-need-know-about-how-fia-making-formula-1-more-competitive-more)
