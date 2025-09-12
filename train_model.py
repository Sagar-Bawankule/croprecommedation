import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score # Import evaluation metrics
import pickle
import json # To save evaluation metrics

def train_and_save_models():
    """
    Loads the dataset, trains only the RandomForest classifier, and saves the model,
    scaler, label encoder, and evaluation metrics.
    """
    # Load the dataset [1]
    try:
        df = pd.read_csv('Crop_recommendation.csv')
    except FileNotFoundError:
        print("Error: 'Crop_recommendation.csv' not found.")
        print("Please make sure the dataset file is in the same directory.")
        return

    print("Dataset loaded successfully.")

    # --- 1. Data Preprocessing ---
    # Separate features (X) and target (y)
    X = df.drop('label', axis=1)
    y = df['label']

    # Encode the categorical target variable
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    print("Labels encoded.")

    # Split the dataset into training and testing sets (80/20 split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"Data split into training ({len(X_train)} rows) and testing ({len(X_test)} rows) sets.")

    # Standardize the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("Features scaled using StandardScaler.")

    # --- 2. Model Training and Evaluation ---
    # Only train the RandomForest model
    name = 'RandomForest'
    model = RandomForestClassifier(n_estimators=100, random_state=42)

    print(f"\n--- Training and Evaluating {name} ---")
    print(f"Training {name}...")
    model.fit(X_train_scaled, y_train)
    print(f"Evaluating {name}...")
    y_pred = model.predict(X_test_scaled)

    # For a single model, we can calculate and print metrics directly
    accuracy = accuracy_score(y_test, y_pred)
    # Use zero_division=0 to handle cases where no positive predictions are made
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    evaluation_metrics = {
        name: {
            'Accuracy': accuracy,
            'Precision': precision,
            'Recall': recall,
            'F1-score': f1
        }
    }
    print(f"{name} - Accuracy: {accuracy:.4f}")
    print(f"{name} - Precision: {precision:.4f}")
    print(f"{name} - Recall: {recall:.4f}")
    print(f"{name} - F1-score: {f1:.4f}")


    # --- 3. Save Components ---
    print("\n--- Saving Components ---")
    # Save the trained RandomForest model
    with open(f'{name.lower()}_model.pkl', 'wb') as model_file:
        pickle.dump(model, model_file)
    print(f"- {name.lower()}_model.pkl saved.")

    # Save the scaler and label encoder
    with open('scaler.pkl', 'wb') as scaler_file:
        pickle.dump(scaler, scaler_file)
    print("- scaler.pkl saved.")
    with open('label_encoder.pkl', 'wb') as encoder_file:
        pickle.dump(label_encoder, encoder_file)
    print("- label_encoder.pkl saved.")

    # Save evaluation metrics
    with open('model_evaluation_metrics.json', 'w') as metrics_file:
        json.dump(evaluation_metrics, metrics_file, indent=4)
    print("- model_evaluation_metrics.json saved.")

if __name__ == '__main__':
    train_and_save_models()
