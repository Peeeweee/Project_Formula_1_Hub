// Precise Vector Paths & Specs for all 24 Formula 1 Circuits (No Generic Cars)

export const TRACK_SPECS = {
  bahrain: {
    name: 'Bahrain International Circuit',
    locality: 'Sakhir',
    country: 'Bahrain',
    viewBox: '0 0 500 400',
    path: 'M 140 340 L 140 120 Q 140 60 200 60 L 360 60 Q 420 60 420 120 L 420 180 Q 420 220 360 220 L 260 220 Q 240 220 240 250 L 240 310 Q 240 340 280 340 L 380 340 Q 420 340 420 290 L 420 270 L 380 270 Q 360 270 360 340 L 140 340 Z',
    lapRecord: '1:31.447 (Pedro de la Rosa, 2005)',
    turns: 15,
    length: '5.412 km',
    raceDistance: '308.238 km',
    drsZones: 3,
    firstGP: 2004
  },
  jeddah: {
    name: 'Jeddah Corniche Circuit',
    locality: 'Jeddah',
    country: 'Saudi Arabia',
    viewBox: '0 0 350 500',
    path: 'M 175 460 L 165 250 Q 160 120 175 40 Q 190 40 185 120 L 175 250 L 185 460 Z',
    lapRecord: '1:30.734 (Lewis Hamilton, 2021)',
    turns: 27,
    length: '6.174 km',
    raceDistance: '308.450 km',
    drsZones: 3,
    firstGP: 2021
  },
  albert_park: {
    name: 'Albert Park Circuit',
    locality: 'Melbourne',
    country: 'Australia',
    viewBox: '0 0 500 400',
    path: 'M 140 330 C 100 240 120 120 220 80 C 320 40 420 80 440 160 C 450 230 420 280 340 310 C 260 340 220 270 190 260 C 160 250 150 300 140 330 Z',
    lapRecord: '1:19.813 (Charles Leclerc, 2024)',
    turns: 14,
    length: '5.278 km',
    raceDistance: '306.124 km',
    drsZones: 4,
    firstGP: 1996
  },
  suzuka: {
    name: 'Suzuka International Racing Course',
    locality: 'Suzuka',
    country: 'Japan',
    viewBox: '0 0 500 400',
    path: 'M 120 280 C 90 200 140 140 200 170 C 260 200 320 150 380 180 C 440 210 440 310 370 340 C 300 370 240 290 190 240 C 140 190 130 240 120 280 Z',
    lapRecord: '1:30.983 (Lewis Hamilton, 2019)',
    turns: 18,
    length: '5.807 km',
    raceDistance: '307.471 km',
    drsZones: 1,
    firstGP: 1987
  },
  shanghai: {
    name: 'Shanghai International Circuit',
    locality: 'Shanghai',
    country: 'China',
    viewBox: '0 0 500 400',
    path: 'M 110 330 L 110 140 C 140 70 260 70 220 160 C 180 230 280 210 390 210 C 450 210 450 310 390 310 L 230 310 L 110 330 Z',
    lapRecord: '1:32.238 (Michael Schumacher, 2004)',
    turns: 16,
    length: '5.451 km',
    raceDistance: '305.066 km',
    drsZones: 2,
    firstGP: 2004
  },
  miami: {
    name: 'Miami International Autodrome',
    locality: 'Miami',
    country: 'USA',
    viewBox: '0 0 500 400',
    path: 'M 90 120 L 410 120 L 410 220 L 260 220 L 260 310 L 410 310 L 410 350 L 90 350 Z',
    lapRecord: '1:29.708 (Max Verstappen, 2023)',
    turns: 19,
    length: '5.412 km',
    raceDistance: '308.326 km',
    drsZones: 3,
    firstGP: 2022
  },
  imola: {
    name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    country: 'Italy',
    viewBox: '0 0 500 380',
    path: 'M 90 280 L 160 90 L 340 90 L 430 190 L 360 290 L 210 290 L 160 230 L 90 280 Z',
    lapRecord: '1:15.484 (Lewis Hamilton, 2020)',
    turns: 19,
    length: '4.909 km',
    raceDistance: '309.049 km',
    drsZones: 1,
    firstGP: 1980
  },
  monaco: {
    name: 'Circuit de Monaco',
    locality: 'Monte Carlo',
    country: 'Monaco',
    viewBox: '0 0 500 400',
    path: 'M 140 330 L 90 290 L 110 180 L 190 120 L 320 90 L 410 140 L 390 200 L 330 220 L 310 300 L 210 350 Z',
    lapRecord: '1:12.909 (Lewis Hamilton, 2021)',
    turns: 19,
    length: '3.337 km',
    raceDistance: '260.286 km',
    drsZones: 1,
    firstGP: 1950
  },
  villeneuve: {
    name: 'Circuit Gilles Villeneuve',
    locality: 'Montreal',
    country: 'Canada',
    viewBox: '0 0 500 280',
    path: 'M 60 140 L 440 90 C 480 90 480 190 440 190 L 60 140 Z',
    lapRecord: '1:13.078 (Valtteri Bottas, 2019)',
    turns: 14,
    length: '4.361 km',
    raceDistance: '305.270 km',
    drsZones: 2,
    firstGP: 1978
  },
  catalunya: {
    name: 'Circuit de Barcelona-Catalunya',
    locality: 'Montmeló',
    country: 'Spain',
    viewBox: '0 0 500 380',
    path: 'M 120 310 L 120 120 C 200 80 320 90 400 130 C 440 150 430 230 380 250 L 310 230 L 250 310 Z',
    lapRecord: '1:16.330 (Max Verstappen, 2023)',
    turns: 14,
    length: '4.657 km',
    raceDistance: '307.236 km',
    drsZones: 2,
    firstGP: 1991
  },
  red_bull_ring: {
    name: 'Red Bull Ring',
    locality: 'Spielberg',
    country: 'Austria',
    viewBox: '0 0 500 380',
    path: 'M 110 300 L 130 110 L 320 130 L 430 210 L 360 300 L 230 240 Z',
    lapRecord: '1:05.619 (Carlos Sainz, 2020)',
    turns: 10,
    length: '4.318 km',
    raceDistance: '306.452 km',
    drsZones: 3,
    firstGP: 1970
  },
  silverstone: {
    name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'UK',
    viewBox: '0 0 500 420',
    path: 'M 160 340 L 110 220 L 190 120 L 310 90 L 440 160 L 400 300 L 300 270 L 230 360 Z',
    lapRecord: '1:27.097 (Max Verstappen, 2020)',
    turns: 18,
    length: '5.891 km',
    raceDistance: '306.198 km',
    drsZones: 2,
    firstGP: 1950
  },
  hungaroring: {
    name: 'Hungaroring',
    locality: 'Budapest',
    country: 'Hungary',
    viewBox: '0 0 500 400',
    path: 'M 130 320 L 130 130 L 270 90 L 400 150 L 400 270 L 290 340 L 210 260 Z',
    lapRecord: '1:16.627 (Lewis Hamilton, 2020)',
    turns: 14,
    length: '4.381 km',
    raceDistance: '306.630 km',
    drsZones: 2,
    firstGP: 1986
  },
  spa: {
    name: 'Circuit de Spa-Francorchamps',
    locality: 'Stavelot',
    country: 'Belgium',
    viewBox: '0 0 500 440',
    path: 'M 110 370 L 130 220 L 230 130 L 400 70 L 460 190 L 370 320 L 260 300 L 190 400 Z',
    lapRecord: '1:46.286 (Valtteri Bottas, 2018)',
    turns: 19,
    length: '7.004 km',
    raceDistance: '308.052 km',
    drsZones: 2,
    firstGP: 1950
  },
  zandvoort: {
    name: 'Circuit Zandvoort',
    locality: 'Zandvoort',
    country: 'Netherlands',
    viewBox: '0 0 480 420',
    path: 'M 130 360 L 110 160 L 210 90 L 360 110 L 380 240 L 270 280 L 230 360 Z',
    lapRecord: '1:11.097 (Lewis Hamilton, 2021)',
    turns: 14,
    length: '4.259 km',
    raceDistance: '306.587 km',
    drsZones: 2,
    firstGP: 1952
  },
  monza: {
    name: 'Autodromo Nazionale Monza',
    locality: 'Monza',
    country: 'Italy',
    viewBox: '0 0 500 320',
    path: 'M 90 240 L 90 90 L 440 90 C 480 90 480 240 440 240 L 260 220 L 190 260 Z',
    lapRecord: '1:21.046 (Rubens Barrichello, 2004)',
    turns: 11,
    length: '5.793 km',
    raceDistance: '306.720 km',
    drsZones: 2,
    firstGP: 1950
  },
  baku: {
    name: 'Baku City Circuit',
    locality: 'Baku',
    country: 'Azerbaijan',
    viewBox: '0 0 500 380',
    path: 'M 90 280 L 90 90 L 300 90 L 320 180 L 440 180 L 440 280 Z',
    lapRecord: '1:43.009 (Charles Leclerc, 2019)',
    turns: 20,
    length: '6.003 km',
    raceDistance: '306.049 km',
    drsZones: 2,
    firstGP: 2016
  },
  marina_bay: {
    name: 'Marina Bay Street Circuit',
    locality: 'Marina Bay',
    country: 'Singapore',
    viewBox: '0 0 500 420',
    path: 'M 110 340 L 110 130 L 240 90 L 400 130 L 400 280 L 300 360 L 210 300 Z',
    lapRecord: '1:35.867 (Lewis Hamilton, 2023)',
    turns: 19,
    length: '4.940 km',
    raceDistance: '306.143 km',
    drsZones: 3,
    firstGP: 2008
  },
  americas: {
    name: 'Circuit of The Americas',
    locality: 'Austin',
    country: 'USA',
    viewBox: '0 0 500 420',
    path: 'M 110 340 L 150 110 L 320 90 L 440 190 L 380 320 L 250 280 L 190 360 Z',
    lapRecord: '1:36.169 (Charles Leclerc, 2019)',
    turns: 20,
    length: '5.513 km',
    raceDistance: '308.405 km',
    drsZones: 2,
    firstGP: 2012
  },
  rodriguez: {
    name: 'Autódromo Hermanos Rodríguez',
    locality: 'Mexico City',
    country: 'Mexico',
    viewBox: '0 0 500 380',
    path: 'M 90 280 L 90 90 L 400 90 L 440 180 L 370 280 L 230 280 Z',
    lapRecord: '1:17.774 (Valtteri Bottas, 2021)',
    turns: 17,
    length: '4.304 km',
    raceDistance: '305.354 km',
    drsZones: 3,
    firstGP: 1962
  },
  interlagos: {
    name: 'Autódromo José Carlos Pace',
    locality: 'São Paulo',
    country: 'Brazil',
    viewBox: '0 0 500 400',
    path: 'M 130 320 L 130 110 L 340 90 L 420 200 L 340 300 L 230 220 Z',
    lapRecord: '1:10.540 (Valtteri Bottas, 2018)',
    turns: 15,
    length: '4.309 km',
    raceDistance: '305.879 km',
    drsZones: 2,
    firstGP: 1973
  },
  las_vegas: {
    name: 'Las Vegas Strip Circuit',
    locality: 'Las Vegas',
    country: 'USA',
    viewBox: '0 0 500 320',
    path: 'M 90 240 L 90 110 L 440 110 L 440 240 L 260 240 L 190 170 Z',
    lapRecord: '1:35.490 (Oscar Piastri, 2023)',
    turns: 17,
    length: '6.201 km',
    raceDistance: '310.050 km',
    drsZones: 2,
    firstGP: 2023
  },
  losail: {
    name: 'Lusail International Circuit',
    locality: 'Lusail',
    country: 'Qatar',
    viewBox: '0 0 500 400',
    path: 'M 110 340 L 110 130 L 300 90 L 420 180 L 380 320 L 250 280 Z',
    lapRecord: '1:24.319 (Max Verstappen, 2023)',
    turns: 16,
    length: '5.419 km',
    raceDistance: '308.611 km',
    drsZones: 1,
    firstGP: 2021
  },
  yas_marina: {
    name: 'Yas Marina Circuit',
    locality: 'Abu Dhabi',
    country: 'UAE',
    viewBox: '0 0 500 400',
    path: 'M 110 320 L 130 110 L 340 90 L 440 190 L 360 320 L 230 300 Z',
    lapRecord: '1:26.103 (Max Verstappen, 2021)',
    turns: 16,
    length: '5.281 km',
    raceDistance: '306.183 km',
    drsZones: 2,
    firstGP: 2009
  }
};

export const getTrackSpecs = (circuitId, circuitName = '') => {
  if (!circuitId && !circuitName) return TRACK_SPECS.bahrain;
  
  const idLower = (circuitId || '').toLowerCase();
  const nameLower = (circuitName || '').toLowerCase();

  for (const key of Object.keys(TRACK_SPECS)) {
    if (idLower.includes(key) || nameLower.includes(key)) {
      return TRACK_SPECS[key];
    }
  }

  if (nameLower.includes('monaco')) return TRACK_SPECS.monaco;
  if (nameLower.includes('silverstone')) return TRACK_SPECS.silverstone;
  if (nameLower.includes('spa')) return TRACK_SPECS.spa;
  if (nameLower.includes('monza')) return TRACK_SPECS.monza;
  if (nameLower.includes('albert park') || nameLower.includes('australia')) return TRACK_SPECS.albert_park;
  if (nameLower.includes('suzuka') || nameLower.includes('japan')) return TRACK_SPECS.suzuka;
  if (nameLower.includes('interlagos') || nameLower.includes('brazil')) return TRACK_SPECS.interlagos;
  if (nameLower.includes('miami')) return TRACK_SPECS.miami;
  if (nameLower.includes('las vegas')) return TRACK_SPECS.las_vegas;
  if (nameLower.includes('baku')) return TRACK_SPECS.baku;
  if (nameLower.includes('singapore') || nameLower.includes('marina bay')) return TRACK_SPECS.marina_bay;

  return TRACK_SPECS.bahrain;
};
