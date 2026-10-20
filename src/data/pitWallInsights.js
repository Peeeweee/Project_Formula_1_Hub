// Educational examples, not measured Mercedes telemetry or a fitted race model.
export const STRATEGY_EXAMPLE = { pitLoss: 20, oldLap: 92, freshLap: 90, oldDegradation: .12, freshDegradation: .06 };
export function strategyProjection(example = STRATEGY_EXAMPLE) {
  let saving = 0;
  return Array.from({ length: 16 }, (_, lap) => {
    if (lap) saving += example.oldLap - example.freshLap + (example.oldDegradation - example.freshDegradation) * (lap - 1);
    return { lap, saving, net: saving - example.pitLoss };
  });
}
export const PIT_INSIGHTS = [
  { tab: 'CAR / INPUTS', title: 'Read the car.', text: 'Engineers align sensor samples by time to compare braking, acceleration and tire behavior.', mechanism: 'Driver brakes onto the marks; wheel crews hold position.', status: 'POSITIONING', jack: 'DOWN', wheels: 'FITTED', channels: [12, 84, 40], analysis: 'SAMPLE / ALIGN / COMPARE', detail: 'One timestamp links each channel. Misaligned samples can suggest a cause that happened later.' },
  { tab: 'MECHANICS', title: 'Lift before service.', text: 'Front and rear jacks unload the tires so the four wheel crews can work in parallel.', mechanism: 'Jack operators raise the car; wheel-gun operators move in.', status: 'CAR LIFTED', jack: 'UP', wheels: 'UNLOCKING', channels: [0, 100, 12], analysis: 'PARALLEL OPERATIONS', detail: 'The slowest wheel crew can determine the stop time. Completing tasks together matters more than averaging them.' },
  { tab: 'TIRES / SERVICE', title: 'Fresh rubber. New stint.', text: 'Gunners release the nuts; carriers remove used wheels and fit replacements.', mechanism: 'Four corners follow remove, replace, then secure.', status: 'WHEEL SERVICE', jack: 'UP', wheels: 'CHANGING', channels: [0, 100, 8], analysis: 'TIRE DEGRADATION', detail: 'Compare lap-time trends at similar fuel loads and track conditions before attributing slower laps to tire wear.' },
  { tab: 'QUALITY CHECK', title: 'Every corner confirmed.', text: 'Wheels must be secured before lowering. A fast stop still needs a safe release.', mechanism: 'Wheel crews finish securing; the jacks keep the car lifted.', status: 'WHEELS SECURED', jack: 'UP', wheels: 'SECURE', channels: [0, 100, 10], analysis: 'VALIDATE BEFORE DECIDING', detail: 'Check missing samples and unusual readings. A single outlier should not become a strategy decision.' },
  { tab: 'STRATEGY MODEL', title: 'When does a stop pay?', text: 'Estimate whether faster laps on fresh tires can repay the time spent in the pit lane.', mechanism: 'Jacks lower; crews retreat; release controller checks traffic.', status: 'CHECKING LANE', jack: 'DOWN', wheels: 'SECURE', channels: [0, 70, 22], analysis: 'CUMULATIVE TIME GAIN', detail: 'Pit-lane loss includes entry, travel, the stationary stop and exit. It is longer than the wheel-change time alone.' },
  { tab: 'RELEASE / FORECAST', title: 'Measure the next stint.', text: 'Compare predicted lap times with what actually happens, then update the next decision.', mechanism: 'Lane confirmed clear; the driver accelerates away.', status: 'RELEASED', jack: 'DOWN', wheels: 'SECURE', channels: [88, 0, 92], analysis: 'PREDICT / OBSERVE / UPDATE', detail: 'Traffic, tire warm-up and track changes create uncertainty. A forecast is a range of outcomes, not a guarantee.' },
];
