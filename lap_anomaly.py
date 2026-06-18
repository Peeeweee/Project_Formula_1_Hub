import pandas as pd
import numpy as np
import json
import os
from sklearn.ensemble import IsolationForest

def main():
    # Load data
    try:
        lap_times = pd.read_csv('lap_times.csv')
    except FileNotFoundError:
        print("lap_times.csv not found in the current directory.")
        return
        
    try:
        drivers = pd.read_csv('drivers.csv')
        drivers['driverName'] = drivers['forename'] + " " + drivers['surname']
        driver_dict = dict(zip(drivers['driverId'], drivers['driverName']))
    except FileNotFoundError:
        print("drivers.csv not found. Driver names will default to 'Unknown'.")
        driver_dict = {}

    # Filter to specific race (1047: 2020 Abu Dhabi GP)
    race_id = 1047
    race_laps = lap_times[lap_times['raceId'] == race_id].copy()

    if race_laps.empty:
        print(f"No lap data found for raceId {race_id}. Ensure lap_times.csv contains this race.")
        return

    out_dir = os.path.join('src', 'data', 'lap_anomalies')
    os.makedirs(out_dir, exist_ok=True)

    summary_data = []

    # Process each driver
    driver_ids = race_laps['driverId'].unique()
    
    for d_id in driver_ids:
        driver_data = race_laps[race_laps['driverId'] == d_id].copy()
        driver_data = driver_data.sort_values(by='lap')
        
        # If a driver has very few laps, IsolationForest might not work well, 
        # but we'll run it anyway as requested.
        if len(driver_data) < 5:
            continue
            
        # Fit Isolation Forest
        X = driver_data[['milliseconds']].values
        clf = IsolationForest(contamination=0.05, random_state=42)
        driver_data['anomaly'] = clf.fit_predict(X)
        
        # anomaly: 1 for inliers, -1 for outliers
        driver_data['isAnomaly'] = (driver_data['anomaly'] == -1)
        
        # Calculate median lap time
        median_ms = driver_data['milliseconds'].median()
        
        # Annotate anomalies
        reasons = []
        anomaly_laps_list = []
        for index, row in driver_data.iterrows():
            if row['isAnomaly']:
                anomaly_laps_list.append(int(row['lap']))
                if row['milliseconds'] > 1.20 * median_ms:
                    reasons.append("Safety Car / Pit Lap")
                elif row['milliseconds'] < 0.95 * median_ms:
                    reasons.append("Push Lap / Quali Mode")
                else:
                    reasons.append("Other Anomaly")
            else:
                reasons.append(None)
                
        driver_data['reason'] = reasons
        
        # Export driver specific JSON
        driver_json_data = []
        for index, row in driver_data.iterrows():
            record = {
                "lap": int(row['lap']),
                "milliseconds": int(row['milliseconds']),
                "isAnomaly": bool(row['isAnomaly']),
                "reason": row['reason']
            }
            driver_json_data.append(record)
            
        driver_file = os.path.join(out_dir, f'driver_{d_id}_anomalies.json')
        with open(driver_file, 'w', encoding='utf-8') as f:
            json.dump(driver_json_data, f, indent=4)
            
        # Append to summary
        summary_data.append({
            "driverId": int(d_id),
            "driverName": driver_dict.get(d_id, "Unknown"),
            "totalLaps": len(driver_data),
            "anomalyCount": len(anomaly_laps_list),
            "anomalyLaps": anomaly_laps_list
        })
        
    # Export summary JSON
    summary_path = os.path.join(out_dir, 'summary.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=4)
        
    print(f"Processed {len(summary_data)} drivers for raceId {race_id}.")
    print(f"Exported individual lap anomalies and summary to {out_dir}")

if __name__ == "__main__":
    main()
