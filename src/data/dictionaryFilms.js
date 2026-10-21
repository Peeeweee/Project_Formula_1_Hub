// Each entry has its own cause, mechanism and visible evidence, on one timeline.
const film = (kind, duration, definition, beats) => ({kind, duration, definition, chapters: beats.map((text,i)=>({at:duration*i/4, label:['Context','Action','Comparison','Result'][i],text}))});
export const DICTIONARY_FILMS = {
 'Safety Car': film('safety',16,'A physical safety car leads the field at controlled pace when conditions make normal racing unsafe.',[
  'A stopped car creates a hazard. SC panels warn drivers while marshals prepare to work.',
  'A road-going safety car with flashing roof lights joins ahead of the race leader. F1 cars slow and follow.',
  'The field collects behind the safety car. The queue keeps safe spacing; this is not ordinary racing.',
  'The roof lights go out and the safety car returns to the pits. The leader controls the queue until racing can resume at the marked line.'
 ]),
 'VSC': film('vsc',12,'The Virtual Safety Car controls pace through minimum-time requirements, without deploying a physical pacing car.',[
  'Two cars are spread around the circuit when race control activates VSC panels.',
  'Drivers reduce pace and monitor their time against the required minimum-time delta.',
  'Both cars remain distributed around the circuit. No road car leads them and the field is not deliberately bunched.',
  'The ending message is followed by the return to racing. Actual time gaps can still change slightly.'
 ]),
 'Purple Sector': film('sector',16,'Purple marks the fastest recorded time in that sector of the session so far. It does not necessarily mean the fastest whole lap.',[
  'The circuit has three timing sectors. Driver B holds the current S2 best of 28.450 seconds.',
  'Driver A enters S2. Follow the car and its sector timer through braking, cornering and acceleration.',
  'Watch the S2 timing line: A records 28.310 seconds there, 0.140 seconds faster. Purple appears only after crossing.',
  'A has the best S2, but a 1:31.720 lap. B still has the quicker complete lap at 1:31.500.'
 ]),
 'Undercut': film('undercut',16,'Stopping before a rival to try to gain position through the pit cycle, using the pace of fresh tires.',[
  'B leads A by 2.0 seconds. Both have used tires. A chooses to stop first.',
  'A takes the pit entry, observes the speed limit, stops for fresh tires and rejoins while B stays out.',
  'A gains a net 3.0 seconds in this example. B then makes its corresponding stop; both pit losses count.',
  'After both stops, A leads by 1.0 second. This position was gained through the pit cycle, not by driving past B on the straight.'
 ]),
 'Overcut': film('overcut',16,'Delaying a pit stop to try to gain time on a rival, for example when their out-lap is compromised and the remaining tires still work well.',[
  'B leads A by 1.5 seconds. B pits first; A stays out with usable tires and clear track.',
  'B receives fresh tires and begins warming them on the out-lap. A stays out at competitive pace in clean air.',
  'A gains a net 3.0 seconds in this example, then takes its own pit stop. The comparison includes both pit losses.',
  'A rejoins 1.5 seconds ahead after both stops. Stopping later only worked because of the pace difference shown.'
 ]),
 'Box': film('box',12,'A radio instruction to enter the pit lane for service, which can include tires or repairs.',[
  'The engineer calls "Box, box" as the driver approaches the designated pit entry.',
  'The car follows the entry path and slows before the pit-lane speed-limit line.',
  'The crew lifts the car, changes the wheels and lowers it. Crew and equipment must clear the car.',
  'The car is released when safe and follows pit exit back to the circuit. Service times vary.'
 ]),
 'Pit Window': film('window',16,'A range of laps considered suitable for a stop under assumptions about tires, traffic, weather and race conditions.',[
  'A has aging tires. The strategy screen predicts where it would rejoin if it stopped now.',
  'Compare laps 18 through 24: early stops meet traffic, while delaying increases tire-related time loss.',
  'Under these illustrative assumptions, laps 20 through 23 form a useful stopping window.',
  'A change in conditions moves the predicted window. A pit window is a changing plan, not one universally perfect lap.'
 ]),
 'Overtake Mode': film('passing',12,'A 2026 electrical overtaking assist available under specified eligibility conditions, separate from active aero.',[
  'B leads A. The detection marker and eligibility indication establish why A can use the assist in this example.',
  'Additional electrical deployment assists acceleration. A steers out before closing on B.',
  'A draws alongside B in a separate lane. The two cars retain physical clearance.',
  'A clears B and merges back in this successful example. Additional deployment never guarantees a pass.'
 ]),
 'DRS': film('drs',12,'The historical 2011-2025 rear-wing system reduced drag in permitted zones to assist overtaking.',[
  'Two cars approach a historical DRS zone. A is the eligible pursuer in this example.',
  'The rear-wing flap opens around its hinge. The linked wing inset shows the mechanical change.',
  'With reduced drag, A draws alongside B. Airflow graphics are explanatory, not CFD measurements.',
  'A completes this example pass and the flap closes for braking. DRS assisted the attempt; it did not guarantee its success.'
 ]),
 'Active Aero': film('aero',12,'The 2026 system changes front and rear wing configurations between straight-line and cornering conditions in permitted zones.',[
  'A 2026 schematic identifies front and rear wing elements in corner configuration.',
  'Entering a permitted straight, the movable elements change to a lower-drag configuration.',
  'Compare straight-line and corner configurations. This is a schematic mechanism, not a modified 2022 car.',
  'The wings restore corner configuration for braking and turning. Active aero is distinct from Overtake Mode.'
 ]),
 'Delta Time': film('delta',12,'A time difference relative to a defined reference, such as a previous lap, another car or a required target time.',[
  'This comparison uses A\'s current lap against its previous best, at matching positions on the circuit.',
  'A gains time through a corner, then loses part of that gain on exit. The ghost represents the reference lap.',
  'At the same timing point, current 28.300 minus reference 28.500 equals -0.200 seconds.',
  'A is 0.200 seconds ahead of this reference there. A race gap or VSC delta requires its own clearly identified reference.'
 ]),
 'Push Lap': film('push',12,'A deliberate timed lap driven at high pace. It need not be perfect or produce a personal best.',[
  'A finishes its preparation lap with tires and brakes ready, then approaches the start line.',
  'Crossing the line starts the timed attempt. Acceleration and braking occur along the racing line.',
  'The car crosses the sector boundaries. The timer follows the same lap rather than resetting for every camera shot.',
  'The complete lap is recorded. A push lap describes the attempt, not a guaranteed fastest time.'
 ]),
 'Blue Flag': film('blue',12,'In a race, a blue flag warns a driver being lapped to allow the lapping car through. Other sessions use it differently.',[
  'Leader A is on lap 40 and approaches B, which is on lap 39.',
  'A marshal waves a blue flag and the trackside panel shows blue. B prepares a predictable, safe yielding maneuver.',
  'B leaves room while A passes. This is not a fight for the same race position.',
  'A continues and B resumes its line. The lap counters explain why the blue flag applied.'
 ]),
 'Lapped Car': film('lapped',16,'A car overtaken by another that has covered an additional lap distance. It need not be last in the race.',[
  'The circuit inset establishes the different distances completed by A and B.',
  'A catches B after covering an extra circuit distance. Follow the lap counters and map markers.',
  'A passes B safely. B\'s own lap counter only changes when B reaches its timing line.',
  'The distance comparison shows B a lap down relative to A. Being lapped is not the same thing as simply running near the back.'
 ]),
 'Backmarker': film('backmarker',12,'A car running near the rear of the field. That position alone does not mean it has been lapped.',[
  'The timing tower places B near the rear, P21, still on the lead lap.',
  'B races C, P20, for position. No blue flag requires B to surrender this normal position fight.',
  'Contrast a later situation when the leader approaches to lap B. Now the lap context changes.',
  'Only the lapping situation brings the relevant blue-flag obligation. Rear position and lap deficit are different concepts.'
 ]),
 'Jump Start': film('start',12,'Movement before the permitted race start is assessed under the start procedure and applicable regulations.',[
  'The grid is stationary and the five red lights are illuminated.',
  'A begins moving while the red lights remain on. A slow-motion timeline aligns wheel movement and light state.',
  'Compare B, which remains stationary until lights out. The difference is visible, not inferred from a label.',
  'The incident is reviewed by the stewards. A sanction depends on the applicable regulations; the animation does not infer intent.'
 ]),
 'DNF': film('dnf',12,'Did Not Finish: a driver retires before completing the race, for example following a mechanical issue or incident.',[
  'A develops a mechanical problem. A warning and falling pace establish the issue.',
  'The driver slows and pulls into a safe area away from the racing line.',
  'A stops while the other car continues. A marshal responds from the protected trackside area.',
  'The timing tower marks A retired. Depending on distance completed, a retired driver may still be classified.'
 ]),
 'Parc Ferm\u00e9': film('inspection',12,'A monitored rules condition that restricts setup changes while allowing specified work under the applicable regulations.',[
  'The car enters a monitored garage with parc-ferme conditions in force.',
  'A technician proposes a setup adjustment. The scrutineer checks it against the recorded specification.',
  'Compare a restricted setup change with permitted inspection or approved repair. The car is not physically locked against all work.',
  'The inspection record shows approval or rejection. Unauthorized changes can have sporting consequences.'
 ]),
 'ERS': film('ers',12,'The energy recovery system combines recovery, storage and deployment through the hybrid power unit.',[
  'The car approaches a braking zone. A schematic identifies the drivetrain, electric machine and energy store.',
  'Braking drives generation. Animated energy flows from drivetrain to machine to store.',
  'On exit, the flow reverses: the store supplies the motor, contributing drivetrain torque.',
  'The recovered energy has been deployed. Component arrangements and limits depend on the regulation era.'
 ]),
 'MGUK': film('mguk',12,'The MGU-K is a drivetrain-linked motor-generator that recovers kinetic energy and can deliver electrical power back to the drivetrain.',[
  'The cutaway identifies the shaft, rotor and electrical link of the motor-generator.',
  'Under braking, shaft rotation drives generation and the energy store receives electrical energy.',
  'In motor operation, electricity returns from the store and the machine contributes drivetrain torque.',
  'The same component has two operating roles. It is one part of ERS, not a separate battery.'
 ]),
 'MGUH': film('mguh',12,'The historical 2014-2025 turbo-linked motor-generator exchanged energy with the turbo shaft. It was removed for 2026.',[
  'A historical cutaway identifies exhaust turbine, compressor, common shaft and MGU-H.',
  'Exhaust drives the turbine. Shaft energy can drive electrical generation; heat does not directly flow into a battery.',
  'The machine can also assist turbo-shaft rotation, influencing turbo response.',
  'This is a historical system, removed for 2026. It did not eliminate every source of turbo lag or continuously charge the store.'
 ]),
 'Quali Mode': film('quali',12,'A historical nickname for aggressive qualifying power settings; permitted settings and deployment depend on the era.',[
  'A historical qualifying attempt is identified. The engineer and steering-wheel inset establish the permitted setup choices.',
  'A preparation lap uses a different illustrative deployment profile from the timed attempt.',
  'The driver starts the push lap. The comparison shows deployment and thermal tradeoffs, not a universal magic switch.',
  'The lap result is recorded. Available modes and power-unit rules vary across eras.'
 ]),
 'Halo': film('halo',12,'The cockpit protection structure transfers loads through its chassis attachments and reduces the risk of head injury.',[
  'A close cockpit view identifies the driver helmet and all three halo attachment regions.',
  'An isolated schematic object approaches the protective structure in slow motion.',
  'The object contacts the structure. Arrows show a simplified load path into the chassis.',
  'The driver space and load paths remain visible. This is not a crash simulation or a guarantee of protection in every accident.'
 ]),
 'Flat Spot': film('flat',12,'A localized worn patch caused when a locked tire slides over the road instead of rolling.',[
  'The front tire rotates while the car approaches a braking zone. The sidewall marker makes rotation visible.',
  'The wheel locks: rotation stops while the tire continues traveling over the asphalt.',
  'The same contact patch wears. A magnified outline reveals the localized flattening.',
  'Rotation resumes. The damaged profile causes an illustrative vibration as the flat patch returns to the road.'
 ]),
 'Marbles': film('marbles',12,'Loose rubber particles accumulate away from the main racing line and can reduce grip when picked up by tires.',[
  'The corner has a cleaner racing line and visible rubber debris off-line.',
  'The tire runs onto the debris. The contact-patch view shows particles being picked up.',
  'Rubber pickup reduces clean tire contact in this example. The vehicle does not automatically spin off.',
  'Returning to the used line helps explain why drivers avoid the debris. The grip effect depends on conditions.'
 ]),
 'Graining': film('graining',12,'Sliding can shear surface rubber into grains or ridges that affect tire contact and grip.',[
  'The tire slides under unsuitable operating conditions. The initially smooth surface is visible.',
  'A magnified contact patch shows surface rubber tearing, rolling and adhering in ridges.',
  'Compare the smooth and grained surfaces. This is surface damage rather than deep thermal separation.',
  'The severity varies, and some graining can clean up as conditions improve. Cold conditions are not its only possible cause.'
 ]),
 'Blistering': film('blistering',12,'Excessive heat within a tire can cause localized separation, blisters and missing surface patches.',[
  'A cross-section reveals heat building within the tire, below the visible tread.',
  'Localized internal separation develops and progresses toward the surface.',
  'Surface patches reveal blister-related damage. Compare it with the shallower ridges of graining.',
  'Performance can deteriorate, but the severity varies. Not every blister destroys the tire or forces retirement.'
 ])
};
export function dictionaryFilm(term){const result=DICTIONARY_FILMS[term];if(!result)throw new Error(`Missing dictionary film: ${term}`);return result;}
export function filmChapter(film,time){return Math.min(3,Math.max(0,Math.floor(Math.min(time,film.duration)/film.duration*4)));}
