import os
import json
from supabase import create_client, Client

# Manually parsing .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
env_vars = {}
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                env_vars[key] = value

SUPABASE_URL = env_vars.get('VITE_SUPABASE_URL')
SUPABASE_KEY = env_vars.get('VITE_SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Could not find credentials in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Data extracted from src/types/analyst.ts
analysts_data = [
  {
    "name": "Alan Lee",
    "companies": [
      "AMC Entertainment", "AMC Entertainment Holdings, Inc.", "AMC Theatres", "AMC",
      "B.G.P., Inc.", "B.G.P., Inc. (dba Peltz Shoes) (DIP)", "B.G.P., Inc. dba Peltz Shoes", "Peltz Shoes", "Peltz Shoes (DIP)",
      "BJ's Restaurants", "BJ's Restaurants, Inc.", "BJ's Restaurant & Brewhouse", "BJ's",
      "Bloomin' Brands", "Bloomin' Brands, Inc.", "Outback", "Outback Steakhouse",
      "Bojangles'", "Bojangles", "Bojangles, Inc.",
      "Boot Barn", "Boot Barn, Inc.", "Boot Barn Holdings, Inc.",
      "Brinker", "Brinker International, Inc.", "Chili's", "Chili's Grill & Bar",
      "Caleres", "Caleres, Inc.", "Famous Footwear",
      "Cardenas Markets", "Cardenas Markets, LLC", "Cardenas",
      "CAVA", "CAVA Grill", "CAVA Group, Inc.",
      "CEC Entertainment", "CEC Entertainment, LLC", "Chuck E. Cheese", "Chuck E. Cheese's",
      "Cheesecake Factory", "The Cheesecake Factory", "The Cheesecake Factory Incorporated",
      "Chick-fil-A", "Chick Fil A", "Chick-fil-A, Inc.",
      "Chipotle", "Chipotle Mexican Grill", "Chipotle Mexican Grill, Inc.",
      "Chuy's", "Chuy's Restaurants", "Chuy's acquired by Darden", "Chuy's Acquired by Darden (Olive Garden)",
      "Darden", "Darden Restaurants", "Darden Restaurants, Inc.", "Olive Garden",
      "Cinemark", "Cinemark Theatres", "Cinemark Holdings, Inc.",
      "Cineplex", "Cineplex Inc.",
      "Cineworld", "Cineworld Group plc", "Regal Cinemas", "Regal",
      "Coborn's", "Coborns", "Coborn's, Inc.",
      "Cracker Barrel", "Cracker Barrel Old Country Store, Inc.",
      "Dave & Buster's", "Dave and Buster's", "Dave & Buster's Entertainment, Inc.",
      "Deichmann Group", "Deichmann", "Deichmann SE", "Rack Room Shoes", "Finish Line (legacy US locations)",
      "Denny's", "Denny's Corporation",
      "Designer Brands", "Designer Brands Inc.", "DSW", "DSW Designer Shoe Warehouse",
      "Dine Brands", "Dine Brands Global, Inc.", "Applebee's", "IHOP",
      "El Pollo Loco", "El Pollo Loco Holdings, Inc.",
      "Fiesta Restaurant Group", "Fiesta Restaurant Group, Inc.", "Pollo Tropical", "Taco Cabana",
      "First Watch", "First Watch Restaurant Group, Inc.",
      "Fleet Feet", "Fleet Feet Sports", "Fleet Feet, Inc.",
      "Foot Locker", "Footlocker", "Foot Locker, Inc.",
      "Genesco", "Genesco Inc.", "Journeys", "Johnston & Murphy",
      "Hooters", "Hooters of America", "Hooters of America, LLC",
      "Jack In The Box", "Jack in the Box", "Jack in the Box Inc.",
      "JD Sports", "JD Sports Fashion plc", "Finish Line",
      "Lucky Strike Entertainment", "Lucky Strike Entertainment, LLC", "Bowlero", "Bowlero Corp",
      "McDonald's", "McDonalds", "McDonald's Corporation",
      "Noodles & Co.", "Noodles and Company", "Noodles & Company",
      "Pinstripes", "Pinstripes Holdings, Inc.",
      "Portillo's", "Portillo's Restaurants", "Portillo's Inc.",
      "Potbelly", "Potbelly Sandwich Shop", "Potbelly Corporation",
      "Raising Cane's", "Raising Canes", "Raising Cane's Restaurants, LLC",
      "Red Lobster", "Red Lobster (DIP)", "Red Lobster Management LLC",
      "Red Robin", "Red Robin Gourmet Burgers, Inc.",
      "Redner's Markets", "Redners", "Redner's Markets, Inc.",
      "Restaurant Brands", "Restaurant Brands International", "Restaurant Brands International Inc.", "Burger King", "Tim Hortons", "Popeyes",
      "Round One", "Round1", "Round One Corporation",
      "Rouse's", "Rouse's Enterprises", "Rouse's Enterprises, LLC",
      "Rubio's", "Rubio's Restaurants", "Rubio's Restaurants, Inc. (DIP)", "Rubio's Coastal Grill, Inc.",
      "Shake Shack", "Shake Shack Inc.",
      "Shoe Carnival", "Shoe Carnival, Inc.",
      "Skechers", "Skechers USA", "Skechers U.S.A., Inc.",
      "Starbucks", "Starbucks Coffee", "Starbucks Corporation",
      "Steak 'n Shake", "Steak n Shake", "Steak 'n Shake (Biglari)", "Biglari Holdings Inc.",
      "Tawa Supermarket", "Tawa Supermarket, Inc.", "99 Ranch Market",
      "Texas Roadhouse", "Texas Roadhouse, Inc.",
      "TGI Fridays", "TGI Fridays, Inc.", "TGI Fridays (DIP)",
      "The Marcus Corporation", "Marcus Theatres",
      "Wendy's", "Wendys", "The Wendy's Company",
      "Wingstop", "Wingstop Inc.",
      "YUM!", "Yum Brands", "Yum! Brands, Inc.", "KFC", "Pizza Hut", "Taco Bell"
    ]
  },
  {
    "name": "Albert Furst",
    "companies": [
      "Albertsons", "Albertsons Companies", "Albertsons Companies, Inc.", "Albertsons LLC",
      "Safeway", "Vons", "Jewel-Osco", "Acme Markets", "Shaw's", "Star Market",
      "Tom Thumb", "Randalls", "Carrs", "United Supermarkets", "Market Street", "Pavilions",
      "Beyond, Inc.", "Beyond Inc", "Beyond, Inc. (dba Bed Bath & Beyond)",
      "Bed Bath & Beyond", "Bed Bath and Beyond", "BB&B", "Buybuy BABY", "buybuy BABY",
      "Kirkland's", "Kirklands", "Kirkland's, Inc.",
      "SpartanNash", "SpartanNash Company", "SpartanNash Company, Inc.",
      "Nash Finch", "Family Fare", "D&W Fresh Market", "Martin's Super Markets",
      "The Container Store", "Container Store", "The Container Store Group", "The Container Store Group, Inc.",
      "The ODP Corporation", "ODP Corporation", "Office Depot", "OfficeMax", "ODP Business Solutions",
      "United Natural Foods", "United Natural Foods, Inc.", "UNFI", "Supervalu",
      "Wayfair", "Wayfair Inc.", "Wayfair LLC", "Joss & Main", "AllModern", "Birch Lane", "Perigold"
    ]
  },
  {
    "name": "Dean Tsoukalis",
    "companies": [
      "Alliance Entertainment Holding", "Alliance Entertainment",
      "Global Industrial", "Global Industrial Company",
      "Ingram Micro", "Ingram Micro Inc.",
      "Newegg", "Newegg Commerce, Inc.",
      "PC Connection", "PC Connection, Inc.", "Connection",
      "TD SYNNEX", "TD Synnex Corporation", "Synnex",
      "Upbound Group", "Upbound Group, Inc.", "Rent-A-Center"
    ]
  },
  {
    "name": "Desiree Biles",
    "companies": [
      "AMCON", "AMCON Distributing Company",
      "Aramark", "Aramark Corporation",
      "Casey's General Stores", "Casey's", "Casey's General Stores, Inc.",
      "Cintas", "Cintas Corporation",
      "The Chefs' Warehouse", "Chefs' Warehouse", "The Chefs' Warehouse, Inc."
    ]
  },
  {
    "name": "Emily Manley",
    "companies": [
      "Bath & Body Works", "Bath and Body Works", "Bath & Body Works, Inc.",
      "Burlington Stores", "Burlington", "Burlington Stores, Inc.",
      "Chico's", "Chico's FAS", "Chico's FAS, Inc.",
      "Destination XL", "Destination XL Group", "DXL",
      "Dillard's", "Dillards", "Dillard's, Inc.",
      "Duluth Trading", "Duluth Trading Company",
      "Lands' End", "Lands End", "Lands' End, Inc.",
      "Lululemon", "lululemon athletica", "Lululemon Athletica Inc.",
      "Regis Corporation", "Regis",
      "Ross Stores", "Ross", "Ross Dress for Less", "Ross Stores, Inc.",
      "Sally Beauty", "Sally Beauty Holdings", "Sally Beauty Holdings, Inc.",
      "Savers", "Savers Value Village",
      "The Children's Place", "Children's Place", "The Children's Place, Inc.",
      "TJX Companies", "TJX", "The TJX Companies, Inc.", "T.J. Maxx", "Marshalls", "HomeGoods",
      "Ulta Beauty", "Ulta", "Ulta Beauty, Inc.",
      "Victoria's Secret", "Victoria's Secret & Co.",
      "Zumiez", "Zumiez Inc."
    ]
  },
  {
    "name": "Gerard Machado",
    "companies": [
      "Abercrombie & Fitch", "Abercrombie", "Abercrombie & Fitch Co.",
      "American Eagle", "American Eagle Outfitters", "AEO",
      "Beacon Roofing Supply", "Beacon Roofing Supply, Inc.",
      "BlueLinx", "BlueLinx Holdings Inc.",
      "Boise Cascade", "Boise Cascade Company",
      "Builders FirstSource", "Builders FirstSource, Inc.",
      "Carter's", "Carters", "Carter's, Inc.",
      "Cato", "The Cato Corporation",
      "Citi Trends", "Citi Trends, Inc.",
      "Fastenal", "Fastenal Company",
      "Ferguson Enterprises", "Ferguson", "Ferguson plc",
      "Floor & Decor", "Floor and Decor", "Floor & Decor Holdings, Inc.",
      "Henry Schein", "Henry Schein, Inc.",
      "MSC Industrial Direct", "MSC Industrial", "MSC Industrial Direct Co., Inc.",
      "Owens & Minor", "Owens and Minor", "Owens & Minor, Inc.",
      "Patrick Industries", "Patrick Industries, Inc.",
      "Revolve Group", "Revolve", "Revolve Group, Inc.",
      "Sherwin-Williams", "Sherwin Williams", "The Sherwin-Williams Company",
      "Stitch Fix", "Stitch Fix, Inc.",
      "The Buckle", "Buckle", "The Buckle, Inc.",
      "The Gap", "Gap", "Gap Inc.", "Old Navy", "Banana Republic", "Athleta",
      "Tile Shop", "The Tile Shop", "Tile Shop Holdings, Inc.",
      "Tilly's", "Tillys", "Tilly's, Inc.",
      "Urban Outfitters", "Urban Outfitters, Inc.", "Anthropologie", "Free People",
      "W.W. Grainger", "Grainger", "W.W. Grainger, Inc.",
      "WESCO", "WESCO International", "WESCO International, Inc."
    ]
  },
  {
    "name": "Jake Isbell",
    "companies": [
      "Arhaus", "Arhaus Furniture", "Arhaus, Inc.",
      "Ethan Allen", "Ethan Allen Interiors", "Ethan Allen Interiors Inc.",
      "Havertys", "Haverty Furniture", "Haverty Furniture Companies", "Haverty Furniture Companies, Inc.",
      "La-Z-Boy", "La Z Boy", "La-Z-Boy Furniture Galleries", "La-Z-Boy Incorporated", "La-Z-Boy Inc.",
      "Life Time", "Life Time Fitness", "Life Time, Inc.", "Lifetime Fitness",
      "Planet Fitness", "Planet Fitness, Inc.",
      "Restoration Hardware", "RH", "RH Brand", "RH Group", "RH, Inc.",
      "Sleep Number", "Sleep Number Corporation",
      "Somnigroup International", "Somnigroup International Inc.", "Tempur Sealy", "Tempur Sealy International", "Tempur Sealy International, Inc.",
      "Williams Sonoma", "Williams-Sonoma", "Williams-Sonoma, Inc.", "Pottery Barn", "West Elm", "Rejuvenation", "Mark and Graham",
      "Xponential Fitness", "Xponential Fitness, Inc.", "Club Pilates", "Pure Barre", "CycleBar", "StretchLab", "Row House", "AKT", "YogaSix"
    ]
  },
  {
    "name": "Jim Rice",
    "companies": ["J.Jill", "J. Jill", "J Jill", "J.Jill, Inc.", "J. Jill, Inc.", "J Jill, Inc."]
  },
  {
    "name": "Michael Blackburn",
    "companies": [
      "Dick's Sporting Goods", "Dicks Sporting Goods", "Dick Sporting Goods", "Dick's Sporting Goods, Inc.", "DICK'S",
      "Kohl's", "Kohls", "Kohl's Corporation", "Kohls Corporation",
      "Macy's", "Macys", "Macy's, Inc.", "Bloomingdale's", "Bluemercury",
      "McKesson", "McKesson Corp.", "McKesson Corporation",
      "Nordstrom", "Nordstrom, Inc.", "Nordstrom Rack", "Nordstrom Local",
      "Sportsman's Warehouse", "Sportsmans Warehouse", "Sportsman's Warehouse Holdings", "Sportsman's Warehouse Holdings, Inc.",
      "Walgreens", "Walgreen", "Walgreens Boots Alliance", "Walgreens Boots Alliance, Inc."
    ]
  },
  {
    "name": "Michael Infranco",
    "companies": [
      "Advance Auto Parts", "Advance Auto", "Advance Auto Parts, Inc.",
      "AutoZone", "Auto Zone", "AutoZone, Inc.",
      "Carvana", "Carvana Co.", "Carvana Group",
      "Central Garden & Pet", "Central Garden and Pet", "Central Garden & Pet Company",
      "DoorDash", "Door Dash", "DoorDash, Inc.",
      "Genuine Parts", "Genuine Parts Company", "Genuine Parts Company (GPC)",
      "Home Depot", "The Home Depot", "The Home Depot, Inc.",
      "Instacart", "Maplebear", "Maplebear Inc.", "Instacart (Maplebear)",
      "Kroger", "The Kroger Co.", "Kroger Co.", "Fred Meyer", "Ralphs", "King Soopers", "Harris Teeter", "Smith's", "Fry's Food Stores", "Dillons", "Baker's", "City Market", "Mariano's",
      "Lowe's", "Lowes", "Lowe's Companies", "Lowe's Companies, Inc.",
      "Monro", "Monro, Inc.", "Monro Muffler Brake", "Mr. Tire",
      "O'Reilly Automotive", "O'Reilly Auto Parts", "OReilly Auto Parts", "O'Reilly Automotive, Inc.",
      "Tractor Supply", "Tractor Supply Company", "Tractor Supply Company (TSC)",
      "Village Super Market", "Village Super Market, Inc.", "ShopRite", "ShopRite of New Jersey",
      "Weis Markets", "Weis Markets, Inc."
    ]
  },
  {
    "name": "Ramona Bolozan",
    "companies": [
      "Barnes & Noble Education", "Barnes and Noble Education", "Barnes & Noble Education, Inc.", "BNED", "BNC Services",
      "Blue Apron", "Blue Apron Holdings", "Blue Apron Holdings, Inc.",
      "Build-A-Bear", "Build A Bear", "Build-A-Bear Workshop", "Build-A-Bear Workshop, Inc.",
      "Carnival", "Carnival Corporation", "Carnival Corporation & plc", "Carnival Cruise Line", "Princess Cruises", "Holland America Line", "Costa Cruises",
      "Farmer Bros.", "Farmer Brothers", "Farmer Brothers Company",
      "NCL", "Norwegian Cruise Line", "Norwegian Cruise Line Holdings", "Norwegian Cruise Line Holdings Ltd.",
      "Qurate Retail", "Qurate Retail Group", "Qurate Retail, Inc.", "QVC", "HSN",
      "Royal Caribbean", "Royal Caribbean Cruises", "Royal Caribbean Group", "Royal Caribbean Cruises Ltd.", "Celebrity Cruises", "Silversea Cruises",
      "Signet Jewelers", "Signet Jewelers Limited", "Kay Jewelers", "Zales", "Jared", "Piercing Pagoda"
    ]
  },
  {
    "name": "Robert Altun",
    "companies": [
      "Academy Sports", "Academy Sports + Outdoors", "Academy Sports and Outdoors", "Academy, Ltd.",
      "Big 5 Sporting Goods", "Big Five Sporting Goods", "Big 5 Sporting Goods Corporation",
      "BJ's Wholesale Club", "BJs Wholesale Club", "BJ's Wholesale", "BJ's Wholesale Club Holdings", "BJ's Wholesale Club Holdings, Inc.",
      "Camping World", "Camping World Holdings", "Camping World Holdings, Inc.", "Good Sam",
      "Costco", "Costco Wholesale", "Costco Wholesale Corporation",
      "GameStop", "Gamestop", "GameStop Corp.", "EB Games",
      "Hibbett", "Hibbett Sports", "Hibbett, Inc.",
      "Ollie's Bargain Outlet", "Ollies Bargain Outlet", "Ollie's Bargain Outlet Holdings", "Ollie's Bargain Outlet Holdings, Inc.",
      "PriceSmart", "PriceSmart, Inc.",
      "Target", "Target Corporation",
      "Topgolf Callaway", "Topgolf Callaway Brands", "Topgolf Callaway Brands Corp.", "Topgolf", "Callaway Golf",
      "Vail Resorts", "Vail Resorts, Inc.",
      "Walmart", "Wal-Mart", "Walmart Inc.", "Sam's Club"
    ]
  },
  {
    "name": "Robert Marzo",
    "companies": [
      "Performance Food Group", "Performance Food Group Company", "Performance Food Group Company, Inc.", "PFG", "Performance Foodservice", "Vistar", "Reinhart Foodservice",
      "Sysco", "Sysco Corporation", "Sysco Corp.", "SYSCO"
    ]
  },
  {
    "name": "Shalom Yusufov",
    "companies": [
      "Leslie's", "Leslies", "Leslie's Pool Supplies", "Leslie's, Inc.",
      "Tenet Healthcare", "Tenet Healthcare Corporation", "Tenet Health", "Tenet",
      "Warby Parker", "Warby Parker Inc.", "Warby Parker LLC"
    ]
  },
  {
    "name": "Taylor Ricketts",
    "companies": [
      "Ingles Markets", "Ingles", "Ingles Markets, Inc.",
      "Mister Car Wash", "Mister Car Wash, Inc.", "Mr. Car Wash",
      "Natural Grocers", "Natural Grocers by Vitamin Cottage", "Vitamin Cottage", "Vitamin Cottage, Inc.",
      "PETCO", "Petco", "Petco Animal Supplies", "Petco Health and Wellness Company", "Petco Health and Wellness Company, Inc.",
      "Sprouts", "Sprouts Farmers Market", "Sprouts Farmers Market, Inc.",
      "US Foods", "US Foods Holding", "US Foods Holding Corp.", "U.S. Foods"
    ]
  }
]

print(f"Seeding {len(analysts_data)} analysts...")

for analyst in analysts_data:
    try:
        # Check if exists by name to avoid duplicates
        existing = supabase.table("analysts").select("id").eq("name", analyst["name"]).execute()
        if existing.data and len(existing.data) > 0:
            print(f"Skipping {analyst['name']} (already exists)")
            continue
            
        res = supabase.table("analysts").insert({
            "name": analyst["name"],
            "companies": analyst["companies"]
        }).execute()
        print(f"Inserted: {analyst['name']}")
    except Exception as e:
        print(f"Error inserting {analyst['name']}: {e}")

print("Seeding complete!")
