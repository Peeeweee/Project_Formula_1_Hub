import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import os

def main():
    # Load data
    try:
        results = pd.read_csv('results.csv')
        drivers = pd.read_csv('drivers.csv')
        qualifying = pd.read_csv('qualifying.csv')
    except FileNotFoundError:
        print("CSV files not found in the current directory. Please ensure results.csv, drivers.csv, and qualifying.csv are present.")
        return

    # Engineer Features
    
    # 1. results.csv features
    # Total races per driver
    driver_races = results.groupby('driverId').size().reset_index(name='races')
    
    # Position gain: grid - positionOrder
    results['position_gain'] = results['grid'] - results['positionOrder']
    # If grid is 0, they started from pit lane, position gain might be skewed, but we'll stick to grid - positionOrder
    avg_gain = results.groupby('driverId')['position_gain'].mean().reset_index(name='avg_position_gain')
    
    # Podiums and Wins
    results['is_podium'] = (results['positionOrder'] <= 3).astype(int)
    results['is_win'] = (results['positionOrder'] == 1).astype(int)
    
    # DNF: position is '\N'
    results['is_dnf'] = (results['position'] == '\\N').astype(int)
    
    driver_stats = results.groupby('driverId').agg(
        podiums=('is_podium', 'sum'),
        wins=('is_win', 'sum'),
        dnfs=('is_dnf', 'sum')
    ).reset_index()
    
    # 2. qualifying.csv features
    quali_avg = qualifying.groupby('driverId')['position'].mean().reset_index(name='quali_avg')
    
    # Merge all
    df = pd.merge(driver_races, avg_gain, on='driverId')
    df = pd.merge(df, driver_stats, on='driverId')
    df = pd.merge(df, quali_avg, on='driverId', how='left')
    
    # Calculate rates
    df['podium_rate'] = df['podiums'] / df['races']
    df['win_rate'] = df['wins'] / df['races']
    df['dnf_rate'] = df['dnfs'] / df['races']
    
    # Fill missing quali_avg with max quali or mean (for drivers who never qualified but raced)
    df['quali_avg'] = df['quali_avg'].fillna(df['quali_avg'].max() + 1)
    
    # Filter drivers with a minimum number of races to get meaningful clusters (e.g., at least 10 races)
    df = df[df['races'] >= 10].copy()
    
    features = ['avg_position_gain', 'podium_rate', 'dnf_rate', 'quali_avg', 'win_rate']
    X = df[features]
    
    # Normalize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # KMeans
    kmeans = KMeans(n_clusters=4, random_state=42)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    # Label Clusters based on centroids
    centroids = pd.DataFrame(scaler.inverse_transform(kmeans.cluster_centers_), columns=features)
    centroids['cluster'] = centroids.index
    
    # We will rank the clusters based on certain attributes to assign labels:
    # "Race Day Warrior": High avg_position_gain
    # "Quali Specialist": Good (low) quali_avg, but maybe lower position gain
    # "Consistent Scorer": Good podium rate, low dnf rate, but maybe not as many wins
    # "Backmarker": High quali_avg, high dnf_rate, low win/podium
    
    cluster_labels = {}
    for i, row in centroids.iterrows():
        # A simple heuristic to assign labels
        # Calculate a score for each label based on normalized metrics
        c = i
        cluster_labels[c] = f"Cluster {c}"
        
    # Assigning descriptive labels:
    # Sort clusters by win_rate and podium_rate
    sorted_by_win = centroids.sort_values(by=['win_rate', 'podium_rate'], ascending=False).index.tolist()
    sorted_by_quali = centroids.sort_values(by='quali_avg', ascending=True).index.tolist()
    sorted_by_gain = centroids.sort_values(by='avg_position_gain', ascending=False).index.tolist()
    sorted_by_dnf = centroids.sort_values(by='dnf_rate', ascending=False).index.tolist()
    
    labels_assigned = {}
    
    # 1. Backmarker: Highest Quali Avg (worst qualifying)
    backmarker_cluster = centroids.loc[centroids['quali_avg'].idxmax()]['cluster']
    labels_assigned[backmarker_cluster] = "Backmarker"
    
    # 2. Consistent Scorer: Top win/podium not already assigned
    for c in sorted_by_win:
        if c not in labels_assigned.values() and c not in labels_assigned:
            labels_assigned[c] = "Consistent Scorer"
            break
            
    # 3. Race Day Warrior: Highest avg_position_gain not assigned
    for c in sorted_by_gain:
        if c not in labels_assigned.values() and c not in labels_assigned:
            labels_assigned[c] = "Race Day Warrior"
            break
            
    # 4. Quali Specialist: Whatever is left
    for c in range(4):
        if c not in labels_assigned:
            labels_assigned[c] = "Quali Specialist"
            break
            
    df['clusterLabel'] = df['cluster'].map(labels_assigned)
    
    # Merge with driver names
    drivers['name'] = drivers['forename'] + " " + drivers['surname']
    export_df = pd.merge(df, drivers[['driverId', 'name']], on='driverId', how='left')
    
    # Prepare export JSON
    out_cols = ['driverId', 'name', 'cluster', 'clusterLabel'] + features
    out_data = export_df[out_cols].to_dict(orient='records')
    
    out_dir = os.path.join('src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'driver_clusters.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, indent=4)
        
    print(f"Exported clustering results to {out_path}")
    print("\nCluster Statistics:")
    print(centroids.join(pd.Series(labels_assigned, name='Label'), on='cluster'))
    
if __name__ == "__main__":
    main()
