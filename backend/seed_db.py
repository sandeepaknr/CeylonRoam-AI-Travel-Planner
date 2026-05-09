import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

def seed_database():
    print("Loading environment variables...")
    load_dotenv()
    
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("Error: MONGO_URI not found in .env file.")
        return
        
    print("Connecting to MongoDB...")
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection by requesting server info
        client.server_info()
        
        # The database is specified in the MONGO_URI (e.g., /Travel)
        db = client.get_database() 
        print(f"Connected to database: {db.name}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    # Drop existing collections to prevent duplicates
    print("Dropping existing 'places' and 'hotels' collections...")
    db.places.drop()
    db.hotels.drop()

    # Load data from CSV
    print("Reading CSV files...")
    try:
        places_df = pd.read_csv("srilanka_places_master.csv")
        hotels_df = pd.read_csv("hotels_data_final.csv")
    except Exception as e:
        print(f"Error reading CSV files: {e}")
        return

    # Convert DataFrames to list of dictionaries
    places_data = places_df.to_dict(orient="records")
    hotels_data = hotels_df.to_dict(orient="records")

    # Insert into MongoDB
    print("Inserting places into MongoDB...")
    if places_data:
        db.places.insert_many(places_data)
        print(f"Successfully inserted {len(places_data)} places.")
        
    print("Inserting hotels into MongoDB...")
    if hotels_data:
        db.hotels.insert_many(hotels_data)
        print(f"Successfully inserted {len(hotels_data)} hotels.")

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
