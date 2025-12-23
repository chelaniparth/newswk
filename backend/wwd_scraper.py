import json
import time
import random
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from supabase import create_client, Client
import traceback

# --- CONFIGURATION ---
MAX_PAGES = 1
SUPABASE_URL = "https://onyhwodktbxxlvowoxgx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueWh3b2RrdGJ4eGx2b3dveGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTkwNTgsImV4cCI6MjA4MTY3NTA1OH0.X9sJEs_VETUTh81oWVlemAuA_TuRCvrhF-xAjMWG10Q"
SUPABASE_TABLE = "articles"
SOURCE_NAME = "WWD Business News"
# ---------------------

def setup_driver():
    options = Options()
    
    agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]
    
    options.add_argument(f"user-agent={random.choice(agents)}")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1920,1080")
    
    prefs = {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False,
        "profile.default_content_setting_values.notifications": 2
    }
    options.add_experimental_option("prefs", prefs)
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            """
        })
    except Exception as e:
        print(f"Chrome driver error: {e}")
        raise
    
    return driver

def parse_relative_time(time_str):
    if not time_str:
        return None
        
    time_str_lower = time_str.lower().strip()
    now = datetime.now()
    
    try:
        date_formats = [
            '%b %d, %Y, %I:%M%p',
            '%B %d, %Y, %I:%M%p',
            '%b %d, %Y',
            '%B %d, %Y',
            '%m/%d/%Y',
            '%Y-%m-%d'
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(time_str.strip(), fmt)
                return parsed_date.isoformat() # CHANGED: Return ISO format for DB
            except:
                continue
        
        numbers = ''.join(filter(str.isdigit, time_str_lower))
        
        dt_val = None
        if 'hr' in time_str_lower or 'hour' in time_str_lower or 'min' in time_str_lower or 'minute' in time_str_lower:
            dt_val = now
        
        elif 'day' in time_str_lower:
            if numbers:
                num = int(numbers)
                dt_val = now - timedelta(days=num)
        
        elif 'week' in time_str_lower:
            if numbers:
                num = int(numbers)
                dt_val = now - timedelta(weeks=num)
        
        elif 'month' in time_str_lower:
            if numbers:
                num = int(numbers)
                dt_val = now - timedelta(days=num * 30)
        
        elif 'yesterday' in time_str_lower:
            dt_val = now - timedelta(days=1)
            
        elif 'today' in time_str_lower or 'just now' in time_str_lower:
            dt_val = now
            
        if dt_val:
            return dt_val.isoformat()
        
    except Exception as e:
        pass
    
    return None

def extract_article_metadata(article_container):
    metadata = {
        'author': None,        # CHANGED: Default to None instead of 'N/A'
        'publish_date': None,  # CHANGED: Default to None instead of 'N/A'
        'category': None       # CHANGED: Default to None instead of 'N/A'
    }
    
    author_selectors = [
        ".c-tagline__author-name",
        ".c-tagline a span",
        "div[class*='byline'] a span",
        "div[class*='author'] a span",
        ".article-byline a span",
        "span[class*='author']"
    ]
    
    for selector in author_selectors:
        try:
            author_elem = article_container.find_element(By.CSS_SELECTOR, selector)
            text = author_elem.text.strip()
            if text and len(text) > 1:
                metadata['author'] = text
                break
        except:
            continue
    
    date_selectors = [
        "time.c-timestamp",
        "time",
        "div[class*='timestamp'] time",
        ".article-timestamp time"
    ]
    
    for selector in date_selectors:
        try:
            time_elem = article_container.find_element(By.CSS_SELECTOR, selector)
            
            aria_label = time_elem.get_attribute('aria-label')
            text_content = time_elem.text.strip()
            datetime_attr = time_elem.get_attribute('datetime')
            
            if aria_label and aria_label.strip():
                parsed_date = parse_relative_time(aria_label)
                if parsed_date:
                    metadata['publish_date'] = parsed_date
                    break
            
            if text_content:
                parsed_date = parse_relative_time(text_content)
                if parsed_date:
                    metadata['publish_date'] = parsed_date
                    break
            
            if datetime_attr:
                try:
                    if 'T' in datetime_attr:
                        dt = datetime.fromisoformat(datetime_attr.replace('Z', '+00:00'))
                    else:
                        dt = datetime.strptime(datetime_attr, '%Y-%m-%d')
                    
                    metadata['publish_date'] = dt.isoformat()
                    break
                except:
                    pass
            
            if text_content:
                # Last resort try to parse or just leave as None if strictly not usable
                parsed = parse_relative_time(text_content)
                if parsed:
                    metadata['publish_date'] = parsed
                    break
                
        except:
            continue
    
    category_selectors = [
        ".c-card__meta a:nth-child(2)",
        ".c-card__meta a[rel='category']",
        "[class*='category'] a",
        "[class*='meta'] a:last-child"
    ]
   
    for selector in category_selectors:
        try:
            cat_elem = article_container.find_element(By.CSS_SELECTOR, selector)
            text = cat_elem.text.strip()
            if text and len(text) > 1 and text.lower() not in ['wwd', 'news']:
                metadata['category'] = text
                break
        except:
            continue
            
    return metadata

def fetch_articles_from_page(driver, url, page_num):
    articles = []
    
    try:
        print(f"\nPage {page_num}: {url}")
        driver.get(url)
        
        wait = WebDriverWait(driver, 15)
        try:
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "main")))
        except: 
            pass # proceed anyway
            
        time.sleep(random.uniform(3, 5))
        
        print("  → Scrolling to load content...")
        # Simple scroll
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        driver.execute_script("window.scrollTo(0, 0);")
        
        article_containers = []
        
        container_selectors = [
            "section div.river-items-wrapper > div",
            "div[class*='river-items'] > div",
            "section > div > div"
        ]
        
        for selector in container_selectors:
            containers = driver.find_elements(By.CSS_SELECTOR, selector)
            if containers and len(containers) > 2:
                article_containers = containers
                print(f"  → Found {len(containers)} article containers using: {selector}")
                break
        
        if not article_containers:
            print("  → No article containers found, trying links directly...")
            article_containers = driver.find_elements(By.CSS_SELECTOR, "h3 a[href*='/business-news/'], h2 a[href*='/business-news/']")
             # This fallback might need different logic, but assuming container logic holds mostly
        
        print(f"  → Processing up to {len(article_containers)} items...")
        
        seen_urls = set()
        
        for container in article_containers:
            try:
                # Find headline/url
                headline_elem = None
                url_link = None
                headline_text = None
                
                # Try finding link inside
                try:
                    headline_elem = container.find_element(By.CSS_SELECTOR, "h3 a, h2 a, a.c-title")
                except:
                    # If container itself is the link (fallback case)
                    if container.tag_name == 'a':
                        headline_elem = container

                if headline_elem:
                    headline_text = headline_elem.text.strip()
                    url_link = headline_elem.get_attribute('href')
                
                if not headline_text or not url_link:
                    # Sometimes text is nested differently
                    if headline_elem:
                        url_link = headline_elem.get_attribute('href')
                        headline_text = container.text.split('\n')[0].strip() # Heuristic

                if not headline_text or not url_link:
                    continue
                
                if url_link in seen_urls:
                    continue
                
                if len(headline_text) < 5: 
                    continue
                
                # Skip invalid terms
                skip_terms = ['subscribe', 'sign up', 'log in', 'newsletter']
                if any(term in headline_text.lower() for term in skip_terms):
                    continue
                
                seen_urls.add(url_link)
                
                # Extract Metadata
                metadata = extract_article_metadata(container)
                
                article_data = {
                    'headline': headline_text,
                    'url': url_link,
                    'page': page_num,
                    'author': metadata['author'],       # Will be None or string
                    'publish_date': metadata['publish_date'], # Will be None or ISO string
                    'category': metadata['category'],   # Will be None or string
                    'source': SOURCE_NAME
                }
                
                articles.append(article_data)
                
            except Exception as e:
                # print(f"Item error: {e}")
                continue
        
        print(f"  → Extracted {len(articles)} valid articles")
        
    except Exception as e:
        print(f"  → Error fetching page: {e}")
    
    return articles

def generate_page_url(page_num):
    base_url = "https://wwd.com/business-news"
    if page_num == 1:
        return f"{base_url}/"
    else:
        return f"{base_url}/page/{page_num}/"

def get_existing_urls_from_supabase(supabase: Client):
    try:
        response = supabase.table(SUPABASE_TABLE).select("url").execute()
        existing_urls = {article['url'] for article in response.data}
        return existing_urls
    except Exception as e:
        print(f"Warning: Could not fetch existing URLs: {e}")
        return set()

def send_to_supabase(articles):
    if not articles:
        return

    print("\n" + "="*60)
    print("Connecting to Supabase...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Deduplicate against DB
        existing_urls = get_existing_urls_from_supabase(supabase)
        new_articles = [a for a in articles if a['url'] not in existing_urls]
        
        print(f"Total Scraped: {len(articles)}")
        print(f"New Articles to Insert: {len(new_articles)}")
        
        if not new_articles:
            print("No new data to upload.")
            return

        batch_size = 50
        print(f"Uploading in batches of {batch_size}...")
        
        count = 0
        for i in range(0, len(new_articles), batch_size):
            batch = new_articles[i:i + batch_size]
            try:
                # We use upsert if needed, or simple insert since we filtered
                supabase.table(SUPABASE_TABLE).insert(batch).execute()
                count += len(batch)
                print(f"  ✓ Batch {i//batch_size + 1}: {len(batch)} items sent.")
            except Exception as e:
                print(f"  ✗ Batch {i//batch_size + 1} Failed: {e}")
                
        print(f"Upload process finished. Total inserted: {count}")

    except Exception as e:
        print(f"Supabase connection error: {e}")
    print("="*60 + "\n")

def scrape_wwd_business_news(max_pages=MAX_PAGES):
    print(f"Starting Scraper (Target: {max_pages} pages)...")
    
    all_articles = []
    driver = setup_driver()
    
    try:
        for page_num in range(1, max_pages + 1):
            url = generate_page_url(page_num)
            articles = fetch_articles_from_page(driver, url, page_num)
            if articles:
                all_articles.extend(articles)
            
            if page_num < max_pages:
                time.sleep(random.uniform(2, 4))
                
        # Send to DB
        send_to_supabase(all_articles)
        
    except Exception as e:
        print(f"Fatal error: {e}")
        traceback.print_exc()
    finally:
        driver.quit()
        print("Driver closed.")

if __name__ == "__main__":
    scrape_wwd_business_news(max_pages=MAX_PAGES)
