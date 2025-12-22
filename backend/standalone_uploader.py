import json
import os
from supabase import create_client, Client

# --- CONFIGURATION (Hardcoded for portability) ---
SUPABASE_URL = "https://onyhwodktbxxlvowoxgx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueWh3b2RrdGJ4eGx2b3dveGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTkwNTgsImV4cCI6MjA4MTY3NTA1OH0.X9sJEs_VETUTh81oWVlemAuA_TuRCvrhF-xAjMWG10Q"
# -------------------------------------------------

def upload_data():
    print("News Classifier Uploader")
    print(f"Target: {SUPABASE_URL}")
    
    # 1. Ask for file path
    default_file = "new_data.json"
    filename = input(f"Enter the JSON file name (default: {default_file}): ").strip()
    
    if not filename:
        filename = default_file

    # Build absolute path if strictly just a name is given, assuming it's in the same folder as this script
    if not os.path.isabs(filename) and os.path.dirname(filename) == "":
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, filename)
    else:
        file_path = filename

    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        return

    # 2. Read JSON
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return

    # 3. Connect to Supabase
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Error creating Supabase client: {e}")
        return

    # 4. Upload
    articles = data.get('articles', [])
    print(f"\nFound {len(articles)} articles. Uploading...")

    success_count = 0
    fail_count = 0

    for i, art in enumerate(articles):
        # Basic progress
        print(f"Processing {i+1}/{len(articles)}: {art.get('headline')[:40]}...", end="\r")
        
        payload = {
            "headline": art.get("headline"),
            "url": art.get("url"),
            "companies": [], # Let frontend logic handle or DB
            "category": None,
            "source": data.get("source", "Manual Upload"),
            "created_at": art.get("timestamp") or data.get("timestamp") or "now()" 
        }

        try:
            # Upsert based on URL to avoid duplicates
            supabase.table("articles").upsert(payload, on_conflict="url").execute()
            success_count += 1
        except Exception as e:
            print(f"\n[Error] Failed to upload {art.get('url')}: {e}")
            fail_count += 1

    print(f"\n\n[OK] Upload Complete!")
    print(f"Success: {success_count}")
    print(f"Failed:  {fail_count}")

if __name__ == "__main__":
    try:
        upload_data()
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
    input("\nPress Enter to exit...")
