# Formula DC-1

Formula DC-1 is a modern, data-driven web application tailored for Formula 1 fans and analysts. It visualizes race data, provides insights into driver performance, and leverages machine learning to predict race outcomes and detect lap anomalies.

## Tech Stack

**Frontend:**
- React (with Vite)
- Tailwind CSS (for styling)
- Framer Motion (for animations)
- D3.js & Recharts (for data visualization)
- Three.js (for 3D rendering)
- React Router (for navigation)

**Data Science & Machine Learning:**
- Python 3
- Pandas & NumPy (for data manipulation)
- Scikit-Learn (for clustering and classification models)

## Key Web Features

The application is divided into several dedicated sections:
- **Start Here:** An engaging introduction and landing page.
- **Racers:** Detailed insights into driver statistics, comparing historical performance, and visualizing driver clustering categories.
- **Cars:** Exploration of F1 constructors and 3D car visualizations.
- **Live Season:** Tracking and visualizing current season standings and race-by-race progress.
- **Pit Wall AI:** An AI-powered dashboard offering predictive insights and lap analysis based on historical data models.

## AI & Data Processing Scripts

The project includes several Python scripts that process raw F1 CSV datasets into structured JSON formats consumed by the frontend:

1. **`driver_clustering.py`**
   - **Purpose:** Groups drivers into behavioral clusters ("Race Day Warrior", "Quali Specialist", "Consistent Scorer", "Backmarker").
   - **Method:** Uses Scikit-Learn's `KMeans` algorithm on features like grid position gain, podium rate, DNF rate, and average qualifying position.

2. **`lap_anomaly.py`**
   - **Purpose:** Detects anomalous lap times to identify Safety Car periods, pit stops, or extraordinary push laps.
   - **Method:** Uses Scikit-Learn's `IsolationForest` anomaly detection algorithm on race lap times.

3. **`podium_predictor.py`**
   - **Purpose:** Predicts the probability of a driver finishing on the podium for specific circuits.
   - **Method:** Uses a `RandomForestClassifier` trained on historical grid positions, circuit averages, constructor points, and recent form.

## Setup & Installation

### Web Application

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

### Data Scripts

1. Ensure you have the required Python libraries installed:
   ```bash
   pip install pandas numpy scikit-learn
   ```

2. Place the required dataset CSVs (`results.csv`, `drivers.csv`, `qualifying.csv`, `lap_times.csv`, `races.csv`, `constructorResults.csv`) in the project root directory.

3. Run any of the scripts to generate new data for the frontend:
   ```bash
   python driver_clustering.py
   python lap_anomaly.py
   python podium_predictor.py
   ```
