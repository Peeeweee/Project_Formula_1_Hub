const TERMS = [
  {
    term: 'DRS',
    definition: 'Drag Reduction System: the rear-wing overtaking aid used in F1 from 2011 through 2025. It reduces drag in eligible zones. The 2026 cars use different active-aero and overtaking systems.',
    engine: 'car_physics',
    action: 'The driver presses a button, opening the rear wing flap.',
    demonstration: 'Air drag lines immediately straighten out, showing less wind resistance.',
    result: 'The car rapidly accelerates to a higher top speed to overtake.'
  },
  {
    term: 'ERS',
    definition: 'Energy Recovery System. It saves energy when you brake and lets you use it later as an electric boost.',
    engine: 'car_physics',
    action: 'The car brakes heavily into a corner, glowing the brakes.',
    demonstration: 'A battery gauge fills up with harvested kinetic energy.',
    result: 'The driver deploys the energy on the straight for a massive speed boost.'
  },
  {
    term: 'Undercut',
    definition: 'Pitting earlier than the other driver to gain track position. You get fresh tires first and drive faster while they are still on old tires.',
    engine: 'strategy',
    action: 'The trailing car pits early for fresh tires while the leader stays out.',
    demonstration: 'The trailing car sets blazing fast sector times on new rubber.',
    result: 'When the leader finally pits, they emerge behind the car that pitted earlier.'
  },
  {
    term: 'Overcut',
    definition: 'Staying out longer on old tires while the other driver pits. If they are slow warming up their new tires, you can pass them when you finally stop.',
    engine: 'strategy',
    action: 'The leader pits, but struggles to warm up their new cold tires.',
    demonstration: 'The trailing car stays out and pushes hard in clean air.',
    result: 'The trailing car pits later and emerges ahead of the original leader.'
  },
  {
    term: 'VSC',
    definition: 'Virtual Safety Car. A digital warning that forces everyone to slow down equally because of a small crash on the track.',
    engine: 'race_control',
    action: 'A hazard is detected. Race control activates the VSC screens.',
    demonstration: 'All drivers must instantly reduce speed to a target delta time.',
    result: 'Minimum time requirements slow the field while marshals work. Time gaps can still change slightly.'
  },
  {
    term: 'Safety Car',
    definition: 'A real car that drives on the track to slow everyone down after a big crash. It bunches all the racers back together safely.',
    engine: 'race_control',
    action: 'A severe crash happens. The physical Safety Car is deployed.',
    demonstration: 'The safety car drives slowly, forcing the leader to follow it.',
    result: 'The entire field bunches up into a tight line, erasing all time gaps.'
  },
  {
    term: 'Parc Fermé',
    definition: 'It means "closed park." These are restrictions on changing car setup during specified parts of a weekend; permitted maintenance and repairs still exist.',
    engine: 'race_control',
    action: 'Qualifying finishes and the cars are parked in the garage.',
    demonstration: 'FIA officials lock down the cars with virtual seals.',
    result: 'Teams must follow setup restrictions and obtain approval for permitted work; unauthorised changes can lead to penalties.'
  },
  {
    term: 'Box',
    definition: 'The message teams say on the radio when they want you to drive into the pit lane for new tires.',
    engine: 'strategy',
    action: 'The race engineer radios "Box, Box" to the driver.',
    demonstration: 'The driver swerves into the pit lane entry at the final corner.',
    result: 'The pit crew changes all four tires in under 3 seconds.'
  },
  {
    term: 'DNF',
    definition: 'Did Not Finish. This means a driver crashed or their car broke down, so they could not complete the race.',
    engine: 'race_control',
    action: 'A car suffers a massive engine failure on the main straight.',
    demonstration: 'Smoke pours from the rear and the driver pulls to the side.',
    result: 'The driver retires. Depending on distance completed, they may still appear as classified in the final result.'
  },
  {
    term: 'Pit Window',
    definition: 'The perfect time in the race to stop for new tires. It depends on how worn your current tires are.',
    engine: 'strategy',
    action: 'Tire performance begins dropping off heavily.',
    demonstration: 'A strategic window highlights the optimal laps to stop without losing positions into traffic.',
    result: 'The driver pits precisely in this window to maximize race time.'
  },
  {
    term: 'Halo',
    definition: 'A strong metal bar shaped like a wishbone above the driver. It protects your head from flying parts in a crash.',
    engine: 'car_physics',
    action: 'Debris from another car flies towards the driver\'s helmet.',
    demonstration: 'The titanium Halo structure deflects the incoming object.',
    result: 'The Halo reduces the risk of head injury. No safety device can guarantee protection in every accident.'
  },
  {
    term: 'MGUK',
    definition: 'Motor Generator Unit–Kinetic: an electric machine that recovers kinetic energy through the drivetrain during braking and can deliver electrical power back to the drivetrain.',
    engine: 'car_physics',
    action: 'The driver hits the brakes hard for a hairpin turn.',
    demonstration: 'Kinetic energy from the spinning axle is absorbed by the Motor Generator Unit.',
    result: 'Recovered energy can be stored and later deployed. Electrical power limits differ between the 2014–2025 and 2026 regulations.'
  },
  {
    term: 'MGUH',
    definition: 'Motor Generator Unit–Heat: a turbo-linked electrical machine used in the 2014–2025 power units. It was removed for 2026.',
    engine: 'car_physics',
    action: 'Hot exhaust gases flow out of the roaring engine.',
    demonstration: 'The MGU-H spins with the turbocharger to capture heat energy.',
    result: 'It eliminates turbo lag and continuously feeds electricity to the battery.'
  },
  {
    term: 'Flat Spot',
    definition: 'A flat patch on your round tire. It happens if you brake too hard and the wheel stops spinning while the car slides.',
    engine: 'tire_physics',
    action: 'The driver locks up the brakes, stopping the wheel rotation.',
    demonstration: 'The tire drags across the harsh asphalt, wearing down one specific spot.',
    result: 'The tire is now out of shape, causing severe vibrations through the steering wheel.'
  },
  {
    term: 'Marbles',
    definition: 'Little bits of rubber that fall off the tires. They pile up on the sides of the track and make it very slippery.',
    engine: 'tire_physics',
    action: 'Tires naturally shred hot rubber as they corner at high speeds.',
    demonstration: 'These rubber balls collect on the outside of the racing line.',
    result: 'If a car drives over them, they lose grip instantly and slide off the track.'
  },
  {
    term: 'Graining',
    definition: 'When the tire surface rips slightly and rubber sticks to it. It makes the tire bumpy and you lose grip.',
    engine: 'tire_physics',
    action: 'A cold tire slides sideways across the track surface.',
    demonstration: 'The surface tears and rolls up into small waves of rubber.',
    result: 'The tire has less contact with the road, severely reducing grip.'
  },
  {
    term: 'Blistering',
    definition: 'Damage caused by excessive heat within the tire, which can separate rubber layers and leave blisters or missing patches.',
    engine: 'tire_physics',
    action: 'The inside of the tire overheats drastically.',
    demonstration: 'Heat damages the rubber structure, causing blisters and patches of missing tread.',
    result: 'Deep holes form in the tire, destroying its performance completely.'
  },
  {
    term: 'Quali Mode',
    definition: 'A historical nickname for aggressive qualifying power settings. Engine-mode rules and electrical deployment vary by era; it is not a universal current one-lap engine switch.',
    engine: 'car_physics',
    action: 'The driver switches the steering wheel dial to "Engine Mode 1".',
    demonstration: 'The internal combustion engine runs at extreme limits, draining the battery fully.',
    result: 'The car achieves absolute maximum speed for one magical qualifying lap.'
  },
  {
    term: 'Push Lap',
    definition: 'A lap where you drive as fast as you possibly can. You give it 100% effort to get a good time.',
    engine: 'strategy',
    action: 'The driver crosses the start line and unleashes full pace.',
    demonstration: 'They hit every apex perfectly and brake at the absolute limit.',
    result: 'They cross the line to set their fastest lap time of the session.'
  },
  {
    term: 'Purple Sector',
    definition: 'The track is divided into three parts called sectors. Purple means you were the absolute fastest person in that section.',
    engine: 'race_control',
    action: 'A driver completes the first third of the track.',
    demonstration: 'The timing screen records their time and compares it to everyone else.',
    result: 'The sector box flashes PURPLE, meaning it is the overall fastest time of the day.'
  },
  {
    term: 'Delta Time',
    definition: 'The time difference between you and someone else. It shows if you are catching up or falling behind.',
    engine: 'race_control',
    action: 'Two cars are racing remotely on track.',
    demonstration: 'The steering wheel displays a live "+" or "-" time comparison.',
    result: 'A negative green delta means you are driving faster than the target.'
  },
  {
    term: 'Jump Start',
    definition: 'When you start driving before the red lights turn off. You get a time penalty for cheating the start.',
    engine: 'race_control',
    action: 'The five red lights are illuminated on the gantry.',
    demonstration: 'A car twitches forward before the lights go out.',
    result: 'The stewards assess the start and apply the penalty allowed by the applicable regulations.'
  },
  {
    term: 'Backmarker',
    definition: 'A car running near the back of the field. Its pace can reflect car performance, damage or strategy, as well as driving.',
    engine: 'strategy',
    action: 'The race leader catches up to the 20th place car.',
    demonstration: 'The 20th place car is driving much slower than the front runner.',
    result: 'If the car is being lapped, blue-flag rules apply; being near the back alone does not require giving up a racing position.'
  },
  {
    term: 'Lapped Car',
    definition: 'A car that is so slow the leader has driven a whole extra lap around the track and caught up to them again.',
    engine: 'strategy',
    action: 'The leader completes lap 40 while the last place car is still on lap 39.',
    demonstration: 'The leader appears in the mirrors of the last place car.',
    result: 'The last place car becomes "lapped" and effectively a lap down in the race.'
  },
  {
    term: 'Blue Flag',
    definition: 'In a race, blue flags warn a driver they are about to be lapped and must let the lapping car through. Practice and qualifying use blue flags differently.',
    engine: 'race_control',
    action: 'A leader approaches a lapped car.',
    demonstration: 'Marshals wave physical blue flags and blue lights flash in the cockpit.',
    result: 'The lapped car moves off the racing line to safely let the leader pass.'
  }
];


TERMS.unshift(
  { term: 'Active Aero', definition: '2026: front and rear wings change configuration in designated zones to balance cornering downforce with lower drag on straights.', action: 'The car reaches an enabled straight-line zone.', demonstration: 'The wings change to a lower-drag configuration.', result: 'Drag is reduced on the straight; corner configuration is restored for braking and cornering.' },
  { term: 'Overtake Mode', definition: '2026: an electrical overtaking assist for eligible drivers close to the car ahead. It is separate from active aero.', action: 'A driver meets the eligibility conditions at the detection point.', demonstration: 'Additional electrical deployment is made available under the rules.', result: 'The driver has an extra tool to attempt an overtake, but passing is not guaranteed.' }
);
export const GLOSSARY = TERMS.map(term => ({ ...term, era: ['DRS', 'MGUH', 'Quali Mode'].includes(term.term) ? 'Historical / era-dependent' : ['Active Aero', 'Overtake Mode'].includes(term.term) ? '2026 regulations' : 'General concept · rules vary by season' }));
