import os
from supabase import create_client, Client

# --- CONFIGURATION (Hardcoded for portability) ---
SUPABASE_URL = "https://onyhwodktbxxlvowoxgx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueWh3b2RrdGJ4eGx2b3dveGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTkwNTgsImV4cCI6MjA4MTY3NTA1OH0.X9sJEs_VETUTh81oWVlemAuA_TuRCvrhF-xAjMWG10Q"
# -------------------------------------------------

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_data():
    try:
        # Check Articles
        art_res = supabase.table("articles").select("*", count="exact", head=True).execute()
        print(f"Articles Count: {art_res.count}")

        # Check Analysts
        ana_res = supabase.table("analysts").select("*", count="exact", head=True).execute()
        print(f"Analysts Count: {ana_res.count}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
