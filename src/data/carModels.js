export const carModels = [
  {
    id: 'mercedes_w13',
    name: 'Mercedes-AMG W13',
    year: '2022',
    modelUrl: `${import.meta.env.BASE_URL}mercedes-intro.glb`,
    specs: [
      { label: 'Chassis',    value: 'Mercedes W13' },
      { label: 'Season',     value: '2022 F1 World Championship' },
      { label: 'Engine',     value: 'Mercedes-AMG F1 M13 E Performance' },
      { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
      { label: 'Weight',     value: '798 kg (min)' },
      { label: 'Drivers',    value: 'Hamilton #44 · Russell #63' },
      { label: 'Team',       value: 'Mercedes-AMG Petronas F1' },
    ],
    teamLabel: 'PETRONAS F1 TEAM',
    brandBadge: 'AMG',
    brandColor: '#00d2be'
  },
  {
    id: 'ferrari_sf25',
    name: 'Ferrari SF-25',
    year: '2025',
    modelUrl: `${import.meta.env.BASE_URL}ferrari_sf-25.glb`,
    specs: [
      { label: 'Chassis',    value: 'Ferrari SF-25' },
      { label: 'Season',     value: '2025 F1 World Championship' },
      { label: 'Engine',     value: 'Ferrari 066/14' },
      { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
      { label: 'Weight',     value: '800 kg (2025 minimum, no fuel)' },
      { label: 'Drivers',    value: 'Leclerc #16 · Hamilton #44' },
      { label: 'Team',       value: 'Scuderia Ferrari HP' },
    ],
    teamLabel: 'SCUDERIA FERRARI',
    brandBadge: 'SF',
    brandColor: '#e10600'
  },
  {
    id: 'redbull_rb22',
    name: 'Red Bull Racing RB22',
    year: '2026',
    modelUrl: `${import.meta.env.BASE_URL}2026_red_bull_racing_rb22.glb`,
    specs: [
      { label: 'Chassis',    value: 'Red Bull RB22' },
      { label: 'Season',     value: '2026 F1 World Championship' },
      { label: 'Engine',     value: 'Red Bull Ford Powertrains' },
      { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
      { label: 'Weight',     value: '2026 limits vary by session / tire mass' },
      { label: 'Drivers',    value: 'See the season entry list' },
      { label: 'Team',       value: 'Oracle Red Bull Racing' },
    ],
    teamLabel: 'RED BULL RACING',
    brandBadge: 'RBR',
    brandColor: '#1e3a8a'
  },
  {
    id: 'mclaren_mcl35m',
    name: 'McLaren MCL35M',
    year: '2021',
    modelUrl: `${import.meta.env.BASE_URL}f1_2021_mclaren_mcl35m.glb`,
    specs: [
      { label: 'Chassis',    value: 'McLaren MCL35M' },
      { label: 'Season',     value: '2021 F1 World Championship' },
      { label: 'Engine',     value: 'Mercedes-AMG F1 M12 E Performance' },
      { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
      { label: 'Weight',     value: '752 kg (min)' },
      { label: 'Drivers',    value: 'Norris #4 · Ricciardo #3' },
      { label: 'Team',       value: 'McLaren F1 Team' },
    ],
    teamLabel: 'MCLAREN F1',
    brandBadge: 'MCL',
    brandColor: '#ff8700'
  },
  {
    id: 'alpine_a525',
    name: 'Alpine A525',
    year: '2025',
    modelUrl: `${import.meta.env.BASE_URL}2025_alpine_a525.glb`,
    specs: [
      { label: 'Chassis',    value: 'Alpine A525' },
      { label: 'Season',     value: '2025 F1 World Championship' },
      { label: 'Engine',     value: 'Renault E-Tech RE25' },
      { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
      { label: 'Weight',     value: '800 kg (2025 minimum, no fuel)' },
      { label: 'Drivers',    value: 'Gasly #10 · Doohan #7' },
      { label: 'Team',       value: 'BWT Alpine F1 Team' },
    ],
    teamLabel: 'ALPINE F1',
    brandBadge: 'ALP',
    brandColor: '#ff87bc'
  }
];
