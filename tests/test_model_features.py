"""Small synthetic checks; these do not claim performance on real F1 data."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('podium_predictor', ROOT / 'podium_predictor.py')
predictor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(predictor)


def fixtures():
    races = pd.DataFrame([
        dict(raceId=r, year=2024, round=r, circuitId=6, name='Monaco Grand Prix', date=f'2024-01-{r:02}')
        for r in range(1, 7)
    ])
    results = pd.DataFrame([
        dict(raceId=r, driverId=d, constructorId=d, grid=d, positionOrder=(d + r) % 5 + 1)
        for r in range(1, 7) for d in range(1, 4)
    ])
    constructors = pd.DataFrame([
        dict(raceId=r, constructorId=d, points=10 * d + r)
        for r in range(1, 7) for d in range(1, 4)
    ])
    return results, races, constructors


class PredictionTests(unittest.TestCase):
    def test_features_exclude_current_and_future_outcomes(self):
        results, races, constructors = fixtures()
        before = predictor.build_features(results, races, constructors)
        first = before[(before.raceId == 1) & (before.driverId == 1)].iloc[0]
        second = before[(before.raceId == 2) & (before.driverId == 1)].iloc[0]
        self.assertEqual(first.constructor_season_points, 0)
        self.assertEqual(first.driver_circuit_avg_finish, 10)
        self.assertEqual(second.constructor_season_points, 11)
        self.assertEqual(second.driver_circuit_avg_finish, first.positionOrder)
        changed = results.copy()
        changed.loc[changed.raceId >= 3, 'positionOrder'] = 20
        changed_points = constructors.copy()
        changed_points.loc[changed_points.raceId >= 3, 'points'] = 10000
        after = predictor.build_features(changed, races, changed_points)
        features = ['grid_position', 'driver_circuit_avg_finish', 'constructor_season_points', 'driver_season_wins_so_far']
        pd.testing.assert_frame_equal(before.loc[before.raceId <= 3, features], after.loc[after.raceId <= 3, features])

    def test_training_exports_names_and_chronological_metadata(self):
        results, races, constructors = fixtures()
        with tempfile.TemporaryDirectory(prefix='model-check-', dir=ROOT / 'tests') as folder:
            folder = Path(folder)
            results.to_csv(folder / 'results.csv', index=False)
            races.to_csv(folder / 'races.csv', index=False)
            constructors.to_csv(folder / 'constructorResults.csv', index=False)
            pd.DataFrame([dict(driverId=d, forename='Driver', surname=str(d)) for d in range(1, 4)]).to_csv(folder / 'drivers.csv', index=False)
            run = subprocess.run([sys.executable, str(ROOT / 'podium_predictor.py')], cwd=folder, capture_output=True, text=True, timeout=60)
            self.assertEqual(run.returncode, 0, run.stderr)
            output = folder / 'src' / 'data'
            predictions = json.loads((output / 'podium_predictions.json').read_text())
            metadata = json.loads((output / 'podium_model_metadata.json').read_text())
            self.assertEqual(metadata['trainingRaces'], 4)
            self.assertEqual(metadata['testRaces'], 2)
            self.assertEqual(metadata['datasetThrough'], '2024-01-06')
            self.assertEqual(len(predictions), 15)
            self.assertTrue(all(row['driverName'].startswith('Driver ') for row in predictions))
            self.assertTrue(all(0 <= row['podiumProbability'] <= 1 for row in predictions))


if __name__ == '__main__':
    unittest.main()
