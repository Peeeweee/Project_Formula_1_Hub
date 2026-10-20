import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix

def build_features(results, races, constructor_results):
    # Merge results and races to get year and circuitId
    df = pd.merge(results, races[['raceId', 'year', 'round', 'circuitId', 'name', 'date']], on='raceId', how='left')
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['year', 'round'])

    # Feature 1: grid_position
    df['grid_position'] = df['grid']

    # Features use information available strictly before each race.
    df['driver_circuit_avg_finish'] = df.groupby(['driverId', 'circuitId'])['positionOrder'].transform(
        lambda finishes: finishes.shift(1).expanding().mean()
    )
    season_pts = pd.merge(constructor_results, races[['raceId', 'year', 'round']], on='raceId')
    season_pts = season_pts.groupby(['constructorId', 'year', 'round', 'raceId'], as_index=False)['points'].sum()
    season_pts = season_pts.sort_values(['year', 'round', 'raceId'])
    season_pts['constructor_season_points'] = season_pts.groupby(['constructorId', 'year'])['points'].cumsum() - season_pts['points']
    df = pd.merge(df, season_pts[['constructorId', 'raceId', 'constructor_season_points']], on=['constructorId', 'raceId'], how='left')

    # Feature 4: driver_season_wins_so_far
    df['is_win'] = (df['positionOrder'] == 1).astype(int)
    # Calculate cumulative wins per driver per season
    df['driver_season_wins_so_far'] = df.groupby(['driverId', 'year'])['is_win'].cumsum() - df['is_win']

    # Target variable: is_podium
    df['is_podium'] = (df['positionOrder'] <= 3).astype(int)

    # Filter out records with missing values in our features
    features = ['grid_position', 'driver_circuit_avg_finish', 'constructor_season_points', 'driver_season_wins_so_far']
    
    # Fill missing values if any
    df['driver_circuit_avg_finish'] = df['driver_circuit_avg_finish'].fillna(10)
    df['constructor_season_points'] = df['constructor_season_points'].fillna(0)
    
    return df


def main():
    # Load data
    try:
        results = pd.read_csv('results.csv')
        races = pd.read_csv('races.csv')
        constructor_results = pd.read_csv('constructorResults.csv')
    except FileNotFoundError:
        print("CSV files not found. Ensure results.csv, races.csv, constructorResults.csv are in the current directory.")
        return

    df = build_features(results, races, constructor_results)
    features = ['grid_position', 'driver_circuit_avg_finish', 'constructor_season_points', 'driver_season_wins_so_far']

    X = df[features]
    y = df['is_podium']

    # Hold out the newest 20% of whole races, not randomly selected entrants.
    race_order = df['raceId'].drop_duplicates().tolist()
    if len(race_order) < 5:
        raise ValueError('At least five races are required for chronological evaluation.')
    split_at = max(1, int(len(race_order) * 0.8))
    training_ids = set(race_order[:split_at])
    training = df['raceId'].isin(training_ids)
    X_train, X_test = X[training], X[~training]
    y_train, y_test = y[training], y[~training]
    if y_train.nunique() < 2:
        raise ValueError('Training data needs both podium and non-podium outcomes.')

    # Train RandomForestClassifier
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    # Predictions
    y_pred = clf.predict(X_test)

    # Metrics
    print("Model Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred, zero_division=0):.4f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save the trained model
    joblib.dump(clf, 'podium_model.pkl')
    print("\nModel saved as podium_model.pkl")

    # Generate explicitly hypothetical scenarios at five circuits.
    # Since we don't have exactly who is in 2024 if the dataset is older or newer,
    # we'll find drivers who raced in the most recent year available in the dataset.
    latest_year = df['year'].max()
    current_drivers = df[df['year'] == latest_year]['driverId'].unique()

    # Target Circuits mapping (assuming some standard circuit names or IDs, 
    # we'll map by common names in the 'name' column of races)
    # For robust matching, we find the circuitId from races dataframe
    circuit_names = ["Monaco", "Silverstone", "Monza", "Spa", "Suzuka"]
    # Simple regex search in races['name'] to find matching circuit IDs
    target_circuits = {}
    for c_name in circuit_names:
        # Find circuit id where race name contains the circuit name
        match = races[races['name'].str.contains(c_name, case=False, na=False)]
        if not match.empty:
            target_circuits[c_name] = match['circuitId'].iloc[0]
        else:
            # Fallback IDs if names don't match exactly (typical kaggle dataset circuitIds)
            pass

    # Manually defined typical circuitIds if text matching fails
    fallback_ids = {"Monaco": 6, "Silverstone": 9, "Monza": 14, "Spa": 13, "Suzuka": 22}
    for c_name, c_id in fallback_ids.items():
        if c_name not in target_circuits:
            target_circuits[c_name] = c_id

    try:
        drivers = pd.read_csv('drivers.csv')
        driver_names = dict(zip(drivers.driverId, drivers.forename.astype(str) + ' ' + drivers.surname.astype(str)))
    except FileNotFoundError:
        driver_names = {}
    predictions = []
    
    # We need realistic baseline values for current year
    # We'll calculate constructor_season_points using the most recent constructor for that driver
    
    for driver in current_drivers:
        # Get their latest constructor
        driver_recent = df[(df['driverId'] == driver) & (df['year'] == latest_year)].sort_values(by='round', ascending=False)
        if driver_recent.empty:
            continue
            
        recent_row = driver_recent.iloc[0]
        constructor = recent_row['constructorId']
        last_race_points = constructor_results.loc[(constructor_results['raceId'] == recent_row['raceId']) & (constructor_results['constructorId'] == constructor), 'points'].sum()
        cons_points = recent_row['constructor_season_points'] + last_race_points
        wins_so_far = recent_row['driver_season_wins_so_far'] + recent_row['is_win'] # end of season wins
        
        for c_name, c_id in target_circuits.items():
            # Get driver's circuit avg
            c_avg_df = df[(df['driverId'] == driver) & (df['circuitId'] == c_id)]
            if not c_avg_df.empty:
                c_avg = c_avg_df['positionOrder'].mean()
            else:
                c_avg = 10 # dummy middle of pack if never raced there
                
            # Assume starting grid is their average finish for the sake of prediction simulation
            sim_grid = int(c_avg) if not np.isnan(c_avg) else 10
            
            X_sim = pd.DataFrame([{
                'grid_position': sim_grid,
                'driver_circuit_avg_finish': c_avg,
                'constructor_season_points': cons_points,
                'driver_season_wins_so_far': wins_so_far
            }])
            
            # Predict Probability
            prob = clf.predict_proba(X_sim)[0][1] # Probability of class 1 (Podium)
            
            predictions.append({
                "driverId": int(driver),
                "driverName": driver_names.get(driver, f"Driver {driver}"),
                "kind": "hypothetical scenario",
                "datasetThrough": str(df["date"].max().date()),
                "circuit": c_name,
                "podiumProbability": float(prob)
            })

    # Export to /src/data/podium_predictions.json
    out_dir = os.path.join('src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'podium_predictions.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(predictions, f, indent=4)
        
    metadata = {
        "kind": "hypothetical scenario", "datasetThrough": str(df['date'].max().date()),
        "evaluation": "chronological holdout of the newest 20% of races",
        "trainingRaces": len(training_ids), "testRaces": len(race_order) - len(training_ids),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "assumptions": "Grid approximated from historical finish. Probabilities are uncalibrated; not live forecasts."
    }
    with open(os.path.join(out_dir, 'podium_model_metadata.json'), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"Exported predictions to {out_path}")

if __name__ == "__main__":
    main()
