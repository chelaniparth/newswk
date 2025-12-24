# News Classifier

A professional news classification dashboard built with React, TypeScript, and Supabase.

## Project Overview

News Classifier Pro scrapes business news articles (e.g., from WWD), classifies them by category and company, and provides a powerful filtering interface for analysts.

**Key Features:**
- **Automated Scraping:** Python-based scraper (`backend/wwd_scraper.py`) fetches latest news.
- **Smart Filtering:** Filter by Date (Calendar/Presets), Company, Analyst, Source, and Category.
- **Unclassified Management:** Dedicated filter to identify and tag unclassified articles.
- **Analyst Portfolios:** Assign analysts to specific companies for personalized views.
- **Supabase Backend:** Robust PostgreSQL database with Row Level Security (RLS).

## Tech Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Supabase (PostgreSQL), Python (Selenium Scraper)
- **State Management:** React Query, React Hooks

## Setup Instructions

### 1. Prerequisites
- Node.js & npm
- Python 3.8+ (for scraper)
- Supabase Account

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend (Scraper) Setup
Navigate to the `backend/` directory:

```bash
# Install Python dependencies
pip install selenium supabase webdriver_manager

# Run the scraper
python wwd_scraper.py
```

## Database Schema

The project uses two main tables in Supabase:
- `articles`: Stores news content (headline, url, source, metadata).
- `analysts`: Stores analyst profiles and their assigned companies.

## License

Private / Internal Tool
