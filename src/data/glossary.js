export const GLOSSARY = [
  {
    term: 'DRS',
    definition: 'Drag Reduction System. It is a movable flap on the rear wing that reduces air drag and helps you go faster on straights.',
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
    result: 'The gaps between all cars remain perfectly frozen while marshals clear the track.'
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
    definition: 'It translates to "closed park." It is a locked zone where teams cannot touch the cars overnight after qualifying.',
    engine: 'race_control',
    action: 'Qualifying finishes and the cars are parked in the garage.',
    demonstration: 'FIA officials lock down the cars with virtual seals.',
    result: 'Mechanics are forbidden from changing any performance parts before the race.'
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
    result: 'The driver climbs out and is officially retired from the classification.'
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
    result: 'The driver remains completely safe and continues racing.'
  },
  {
    term: 'MGUK',
    definition: 'A part of the engine that catches energy when you brake. It turns that heat into electricity to make the car faster.',
    engine: 'car_physics',
    action: 'The driver hits the brakes hard for a hairpin turn.',
    demonstration: 'Kinetic energy from the spinning axle is absorbed by the Motor Generator Unit.',
    result: 'The battery charges, ready to deploy 160 extra horsepower later.'
  },
  {
    term: 'MGUH',
    definition: 'A part of the engine that catches heat from the exhaust pipe. It also turns heat into electricity.',
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
    definition: 'When the tire gets so hot that the rubber boils and bubbles pop out. It ruins the tire and slows you down.',
    engine: 'tire_physics',
    action: 'The inside of the tire overheats drastically.',
    demonstration: 'Chunks of rubber literally boil and explode off the surface.',
    result: 'Deep holes form in the tire, destroying its performance completely.'
  },
  {
    term: 'Quali Mode',
    definition: 'Turning the engine up to maximum power. You only use it for one lap because it can damage the engine.',
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
    result: 'Sensors detect the movement and the driver receives a 5-second penalty.'
  },
  {
    term: 'Backmarker',
    definition: 'A slow driver at the very back of the race. The leaders often have to drive past them.',
    engine: 'strategy',
    action: 'The race leader catches up to the 20th place car.',
    demonstration: 'The 20th place car is driving much slower than the front runner.',
    result: 'The slow car is designated a backmarker and must yield to the leader.'
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
    definition: 'A blue flag tells a slow driver that a fast driver is behind them. The slow driver must move out of the way.',
    engine: 'race_control',
    action: 'A leader approaches a lapped car.',
    demonstration: 'Marshals wave physical blue flags and blue lights flash in the cockpit.',
    result: 'The lapped car moves off the racing line to safely let the leader pass.'
  }
];
