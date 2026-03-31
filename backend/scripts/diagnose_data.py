import pandas as pd
import os

print("--- Data Diagnosis Script ---")
data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

# --- Diagnose Parquet File ---
parquet_path = os.path.join(data_dir, 'indian_judgments.parquet')
if os.path.exists(parquet_path):
    try:
        print(f"\nDiagnosing: {parquet_path}")
        df_parquet = pd.read_parquet(parquet_path, engine='pyarrow')
        print("Parquet file columns:", df_parquet.columns.tolist())
        
        # Check if 'Text' column exists (case-sensitive)
        if 'Text' in df_parquet.columns:
            print("Found column 'Text'. Renaming it to 'text' for consistency.")
        elif 'text' in df_parquet.columns:
            print("Column 'text' is correctly named.")
        else:
            print("CRITICAL: Neither 'text' nor 'Text' column found in Parquet file.")

    except Exception as e:
        print(f"Error reading Parquet file: {e}")
else:
    print(f"\nParquet file not found at: {parquet_path}")

# --- Diagnose CSV File ---
csv_path = os.path.join(data_dir, 'legal_text_classification.csv')
if os.path.exists(csv_path):
    try:
        print(f"\nDiagnosing: {csv_path}")
        df_csv = pd.read_csv(csv_path)
        print("CSV file columns:", df_csv.columns.tolist())

        if 'text' in df_csv.columns:
             print("Column 'text' is correctly named.")
        else:
             print("CRITICAL: Column 'text' not found in CSV file.")

    except Exception as e:
        print(f"Error reading CSV file: {e}")
else:
    print(f"\nCSV file not found at: {csv_path}")

print("\n--- Diagnosis Complete ---")
