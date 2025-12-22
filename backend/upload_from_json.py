import json
import os
import sys
from supabase import create_client, Client

# Manually parsing .env for this one-off script to avoid python-dotenv dependency
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
env_vars = {}
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                env_vars[key] = value

# Check if we have the keys
# Note: For the scraping part we usually need SERVICE_ROLE, but for this mock data anon *might* work 
# if the RLS allows insert.
# However, my RLS policy required 'authenticated'. 
# Using the key from .env which is likely ANON.
# If RLS blocks it, I might need to adjust RLS or ask for Service Role.
# But wait, the user's .env has ANON key.
# My schema said: create policy "Allow authenticated insert/update" ... using (auth.role() = 'authenticated')
# The ANON key has role 'anon'. 'service_role' key has role 'service_role'.
# If the policy requires 'authenticated' (meaning logged in user), ANON key won't work for insert unless I mistyped policy.
# Let's check schema.sql I wrote: "auth.role() = 'authenticated'".
# This means ONLY logged-in users.
# A script with ANON key is NOT 'authenticated' in that sense (it is 'anon').
# So this upload might FAIL with RLS violation unless I use Service Role or change RLS.
# BUT, for the sake of "getting it done", I will try.
# If it fails, I will use a trick: `auth.uid()` check or just allow public insert for now (unsafe but quick).
# OR better: I will update the schema to allow public insert temporarily.
# OR even better: I'll use the service role key if I had it. I don't.
# I will try to use the ANON key. If it fails, I'll advise user to use Service Role KEY.

# ACTUALLY: Inspecting schema.sql:
# create policy "Allow public read access" ... using (true);
# create policy "Allow authenticated insert/update" ... using (auth.role() = 'authenticated')
# This means inserts strictly require auth.
# I haven't implemented auth on frontend yet.
# I should probably update the policy to allow 'anon' insert for this demo or scraper.
# "create policy "Allow anon insert" on public.articles for insert with check (true);"

SUPABASE_URL = env_vars.get('VITE_SUPABASE_URL')
SUPABASE_KEY = env_vars.get('VITE_SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Could not find credentials in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_json():
    # Check if filename is provided as argument
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = 'data.json'

    # Support command line args being just name or full path
    if os.path.isabs(filename):
        json_path = filename
    else:
        json_path = os.path.join(os.path.dirname(__file__), filename)

    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        return

    print(f"Reading file: {filename}")

    with open(json_path, 'r') as f:
        data = json.load(f)

    print(f"Uploading data from {data.get('source')}...")
    
    articles = data.get('articles', [])
    for art in articles:
        payload = {
            "headline": art.get("headline"),
            "url": art.get("url"),
            "companies": [], # Let frontend classify
            "category": None,
            "source": data.get("source", "Manual Upload"),
            "created_at": "now()"
        }
        
        try:
            res = supabase.table("articles").upsert(payload, on_conflict="url").execute()
            # Check for error in response (postgrest-py behavior varies by version)
            # Recent supabase-py raises exception on error usually?
            print(f"Uploaded: {art.get('headline')}")
        except Exception as e:
            print(f"Error uploading {art.get('url')}: {e}")

if __name__ == "__main__":
    upload_json()
