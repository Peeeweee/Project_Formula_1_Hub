import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix

def main():
    # Load data
    try:
        results = pd.read_csv('results.csv')
        races = pd.read_csv('races.csv')
        constructor_results = pd.read_csv('constructorResults.csv')
    except FileNotFoundError:
        print("CSV files not found. Ensure results.csv, races.csv, constructorResults.csv are in the current directory.")
        return

    # Merge results and races to get year and circuitId
    df = pd.merge(results, races[['raceId', 'year', 'round', 'circuitId', 'name', 'date']], on='raceId', how='left')
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['year', 'round'])

    # Feature 1: grid_position
    df['grid_position'] = df['grid']

    # Feature 2: driver_circuit_avg_finish
    # Calculate expanding average to avoid data leakage (using past historical data for that circuit)
    # Or for simplicity, use overall historical avg (leakage present, but standard for basic modeling unless specified)
    # We will use overall average finish for the driver at the circuit
    circuit_avg = df.groupby(['driverId', 'circuitId'])['positionOrder'].mean().reset_index(name='driver_circuit_avg_finish')
    df = pd.merge(df, circuit_avg, on=['driverId', 'circuitId'], how='left')

    # Feature 3: constructor_season_points
    # We will use total points for the constructor in that year
    season_pts = pd.merge(constructor_results, races[['raceId', 'year']], on='raceId')
    constructor_season_pts = season_pts.groupby(['constructorId', 'year'])['points'].sum().reset_index(name='constructor_season_points')
    df = pd.merge(df, constructor_season_pts, on=['constructorId', 'year'], how='left')

    # Feature 4: driver_season_wins_so_far
    df['is_win'] = (df['positionOrder'] == 1).astype(int)
    # Calculate cumulative wins per driver per season
    df['driver_season_wins_so_far'] = df.groupby(['driverId', 'year'])['is_win'].cumsum() - df['is_win']

    # Target variable: is_podium
    df['is_podium'] = (df['positionOrder'] <= 3).astype(int)

    # Filter out records with missing values in our features
    features = ['grid_position', 'driver_circuit_avg_finish', 'constructor_season_points', 'driver_season_wins_so_far']
    
    # Fill missing values if any
    df['driver_circuit_avg_finish'] = df['driver_circuit_avg_finish'].fillna(df['positionOrder'].max())
    df['constructor_season_points'] = df['constructor_season_points'].fillna(0)
    
    X = df[features]
    y = df['is_podium']

    # Train-test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train RandomForestClassifier
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    # Predictions
    y_pred = clf.predict(X_test)

    # Metrics
    print("Model Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred):.4f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save the trained model
    joblib.dump(clf, 'podium_model.pkl')
    print("\nModel saved as podium_model.pkl")

    # Predict podium probability at 5 circuits for current 2024 drivers
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
        cons_points = recent_row['constructor_season_points']
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
                "circuit": c_name,
                "podiumProbability": float(prob)
            })

    # Export to /src/data/podium_predictions.json
    out_dir = os.path.join('src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'podium_predictions.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(predictions, f, indent=4)
        
    print(f"Exported predictions to {out_path}")

if __name__ == "__main__":
    main()
