import os
from supabase import create_client, Client
from typing import List, Optional
import datetime

# --- CONFIGURATION ---
# You can set these in your environment variables or replace directly here for testing.
# For production/scheduling, ALWAYS use environment variables.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "YOUR_SUPABASE_PROJECT_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "YOUR_SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for backend scripts!

if not SUPABASE_URL or not SUPABASE_KEY or "YOUR_" in SUPABASE_URL:
    print("Error: Please set SUPABASE_URL and SUPABASE_KEY environment variables.")
    print("Note: Use the 'Service Role Key' (secret) for this script, not the Anon key.")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_article(headline: str, url: str, companies: List[str], category: Optional[str] = None, source: str = "Scraper"):
    """
    Uploads a single article to the Supabase 'articles' table.
    Upserts based on 'url' (requires unique constraint on url in DB).
    """
    data = {
        "headline": headline,
        "url": url,
        "companies": companies,
        "category": category,
        "source": source,
        "created_at": datetime.datetime.now().isoformat()
    }

    try:
        # 'upsert' will insert or update if validation fails (e.g. duplicate URL)
        # on_conflict='url' tells Supabase to handle duplicates by updating or ignoring.
        # However, supabase-py upsert usually handles the primary key or unique constraints defined in DB.
        response = supabase.table("articles").upsert(data, on_conflict="url").execute()
        
        # Check for errors - simplified check for latest supabase-py
        # Note: API changes often, print response to debug if needed.
        if hasattr(response, 'error') and response.error:
            print(f"Error uploading {url}: {response.error}")
        else:
            print(f"Successfully uploaded: {headline[:30]}...")
            
    except Exception as e:
        print(f"Exception during upload for {url}: {str(e)}")

# --- EXAMPLE USAGE ---
# This block runs only if you execute this script directly: 'python upload_data.py'
    print("--- Starting Test Upload ---")
    
    # 1. Mock Data (Based on your provided JSON structure)
    scraped_data = {
      "source": "WWD Business News",
      "url": "https://wwd.com/business-news/",
      "days": 7,
      "cutoff_date": "2025-12-12",
      "total": 165,
      "pages": 10,
      "timestamp": "2025-12-19T11:39:44.202566",
      "articles": [
        {
          "headline": "Bulgari Names Laura Burdese Chief Executive Officer",
          "url": "https://wwd.com/business-news/human-resources/bulgari-laura-burdese-new-chief-executive-officer-1238428660/",
          "page": 1
        },
        {
          "headline": "BARACUTA’S FALL 2025 COLLECTION MERGES BRITISH HERITAGE AND MODERN STYLE",
          "url": "https://wwd.com/business-news/business-features/baracuta-fall-2025-collection-british-heritage-modern-style-1238371531/",
          "page": 1
        },
        {
          "headline": "GOVERNMENT & TRADE",
          "url": "https://wwd.com/business-news/government-trade/",
          "page": 1
        }
      ]
    }

    # 2. Iterate and Upload
    # Note: We extract common fields like 'source' from the top level
    source_name = scraped_data.get("source", "Scraper")
    
    for art in scraped_data.get("articles", []):
        # Filter out potential navigation links if possible (basic check)
        # OR just upload everything and let frontend filter it.
        # Here we upload everything.
        
        upload_article(
            headline=art.get("headline"),
            url=art.get("url"),
            # Your JSON doesn't have companies/category yet, so we pass empty/None
            # The frontend will classify them automatically on load!
            companies=[], 
            category=None,
            source=source_name
        )
    
    print("--- Finished Test Upload ---")
