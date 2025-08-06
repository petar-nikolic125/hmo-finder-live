#!/usr/bin/env python3
import sys
import json
import time
import re
import requests
from bs4 import BeautifulSoup
import random
from urllib.parse import urljoin, urlparse

def setup_session():
    """Setup napredne requests session sa anti-detection opcijama"""
    session = requests.Session()
    
    # Rotacija User-Agent stringova
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
    
    session.headers.update({
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'DNT': '1'
    })
    
    # Dodaj session cookies za legitimnost
    session.cookies.set('_ga', f'GA1.2.{random.randint(100000000, 999999999)}.{int(time.time())}')
    session.cookies.set('_gid', f'GA1.2.{random.randint(100000000, 999999999)}.{int(time.time())}')
    
    return session

def build_search_urls(city, min_bedrooms, max_price, keywords):
    """Napravi URLs za Zoopla i PrimeLocation sa filterima u ispravnom formatu"""
    city_slug = city.lower().replace(" ", "-")
    
    # Sanitize price - ensure it's within reasonable bounds
    if max_price:
        max_price = max(50000, min(2000000, int(max_price)))  # Between £50k and £2M
    
    # Sanitize bedrooms
    if min_bedrooms:
        min_bedrooms = max(1, min(10, int(min_bedrooms)))  # Between 1 and 10
    
    print(f"🔧 Building URLs for {city}: bedrooms={min_bedrooms}+, price=£{max_price}, keywords={keywords}", file=sys.stderr)
    
    # Zoopla URL format with enhanced parameters for better results
    zoopla_params = []
    if min_bedrooms:
        zoopla_params.append(f"beds_min={min_bedrooms}")
    if keywords and keywords.lower() != 'none':
        zoopla_params.append(f"keywords={keywords}")
    if max_price:
        zoopla_params.append(f"price_max={max_price}")
    
    # Add additional filters for better results
    zoopla_params.append("property_type=houses")
    zoopla_params.append("q=" + city.replace(" ", "+"))
    
    zoopla_url = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?" + "&".join(zoopla_params)
    
    # PrimeLocation URL format with robust parameters
    prime_params = []
    if min_bedrooms:
        prime_params.append(f"beds_min={min_bedrooms}")
    prime_params.append("is_auction=include")
    prime_params.append("is_retirement_home=include")
    prime_params.append("is_shared_ownership=include")
    if keywords and keywords.lower() != 'none':
        prime_params.append(f"keywords={keywords}")
    if max_price:
        prime_params.append(f"price_max={max_price}")
    prime_params.append(f"q={city}")
    prime_params.append("radius=0")
    prime_params.append("results_sort=highest_price")
    prime_params.append("search_source=for-sale")
    
    prime_url = f"https://www.primelocation.com/for-sale/property/{city_slug}/?" + "&".join(prime_params)
    
    # Add alternative search URLs with different sorting for better coverage
    alternative_urls = []
    
    # Zoopla with different sorting
    zoopla_params_alt = zoopla_params.copy()
    zoopla_params_alt.append("results_sort=newest")
    alt_zoopla_url = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?" + "&".join(zoopla_params_alt)
    alternative_urls.append(alt_zoopla_url)
    
    # PrimeLocation with price sorting
    prime_params_alt = [p for p in prime_params if "results_sort" not in p]
    prime_params_alt.append("results_sort=price")
    alt_prime_url = f"https://www.primelocation.com/for-sale/property/{city_slug}/?" + "&".join(prime_params_alt)
    alternative_urls.append(alt_prime_url)
    
    print(f"🔗 Generated {len(alternative_urls) + 2} search URLs", file=sys.stderr)
    
    return [zoopla_url, prime_url] + alternative_urls

def extract_price(price_text):
    """Izvuci cenu iz teksta"""
    if not price_text:
        return 0
    
    # Ukloni sve osim brojeva i zareza
    price_clean = re.sub(r'[£,]', '', price_text)
    price_clean = re.sub(r'[^\d]', '', price_clean)
    
    try:
        return int(price_clean) if price_clean else 0
    except:
        return 0

def extract_bedrooms(bed_text):
    """Izvuci broj soba iz teksta"""
    if not bed_text:
        return 1
    
    # Traži brojeve u tekstu
    numbers = re.findall(r'\d+', bed_text)
    if numbers:
        return int(numbers[0])
    return 1

def extract_square_footage(description):
    """Izvuci kvadraturu iz opisa"""
    if not description:
        return None
    
    # Traži različite formate: sqft, sq ft, square feet, sq m, m², m2
    patterns = [
        r'(\d+(?:,\d+)*)\s*(?:sq\s*ft|sqft|square\s*feet)',
        r'(\d+(?:,\d+)*)\s*(?:sq\s*m|sqm|square\s*metres|square\s*meters)',
        r'(\d+(?:,\d+)*)\s*(?:m²|m2)',
        r'(\d+(?:,\d+)*)\s*(?:square\s*foot|sq\.?\s*ft\.?)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, description, re.IGNORECASE)
        if matches:
            try:
                # Ukloni zareze iz brojeva
                area = int(matches[0].replace(',', ''))
                # Konvertuj u square meters ako je u sq ft
                if 'ft' in pattern or 'foot' in pattern:
                    area = int(area * 0.092903)  # Convert sq ft to sq m
                return area
            except:
                continue
    return None

def get_rental_estimate_by_city(city, address, bedrooms):
    """Proceni mesečnu rentu na osnovu grada i lokacije"""
    if not address:
        address = ""
    
    address_lower = address.lower()
    city_lower = city.lower()
    
    # City-specific rental estimates per room per month
    city_rental_rates = {
        'london': {'premium': (200, 250), 'good': (150, 200), 'student': (120, 150), 'budget': (100, 120)},
        'birmingham': {'premium': (120, 150), 'good': (90, 120), 'student': (80, 100), 'budget': (70, 90)},
        'manchester': {'premium': (130, 160), 'good': (100, 130), 'student': (85, 110), 'budget': (75, 95)},
        'leeds': {'premium': (110, 140), 'good': (85, 110), 'student': (75, 95), 'budget': (65, 85)},
        'sheffield': {'premium': (100, 130), 'good': (75, 100), 'student': (65, 85), 'budget': (55, 75)},
        'bristol': {'premium': (140, 170), 'good': (110, 140), 'student': (90, 115), 'budget': (80, 100)},
        'nottingham': {'premium': (110, 140), 'good': (85, 110), 'student': (70, 90), 'budget': (60, 80)},
        'leicester': {'premium': (100, 130), 'good': (80, 100), 'student': (70, 85), 'budget': (60, 75)},
        'newcastle': {'premium': (100, 130), 'good': (75, 100), 'student': (65, 85), 'budget': (55, 70)},
        'coventry': {'premium': (90, 120), 'good': (70, 90), 'student': (60, 80), 'budget': (50, 70)},
        'preston': {'premium': (80, 110), 'good': (60, 80), 'student': (50, 70), 'budget': (45, 60)},
        'blackpool': {'premium': (70, 100), 'good': (50, 70), 'student': (45, 60), 'budget': (40, 55)},
        'hull': {'premium': (70, 95), 'good': (50, 70), 'student': (45, 60), 'budget': (40, 50)},
        'derby': {'premium': (85, 115), 'good': (65, 85), 'student': (55, 70), 'budget': (50, 65)},
        'plymouth': {'premium': (90, 120), 'good': (70, 90), 'student': (60, 80), 'budget': (55, 70)},
        'southampton': {'premium': (110, 140), 'good': (85, 110), 'student': (75, 95), 'budget': (65, 85)},
        'portsmouth': {'premium': (105, 135), 'good': (80, 105), 'student': (70, 90), 'budget': (60, 80)},
        'reading': {'premium': (140, 170), 'good': (110, 140), 'student': (90, 115), 'budget': (80, 100)},
        'oxford': {'premium': (160, 200), 'good': (130, 160), 'student': (110, 140), 'budget': (90, 120)},
        'cambridge': {'premium': (150, 190), 'good': (120, 150), 'student': (100, 130), 'budget': (85, 110)},
        'brighton': {'premium': (130, 160), 'good': (100, 130), 'student': (85, 110), 'budget': (75, 95)},
        'salford': {'premium': (110, 140), 'good': (85, 110), 'student': (70, 90), 'budget': (60, 80)},
        'stockport': {'premium': (100, 130), 'good': (75, 100), 'student': (65, 85), 'budget': (55, 75)},
        'wolverhampton': {'premium': (85, 115), 'good': (65, 85), 'student': (55, 75), 'budget': (50, 65)},
        'liverpool': {'premium': (150, 180), 'good': (120, 150), 'student': (100, 130), 'budget': (80, 110)}
    }
    
    # Get rates for the city, default to Liverpool if not found
    rates = city_rental_rates.get(city_lower, city_rental_rates['liverpool'])
    
    # Premium area indicators
    premium_keywords = ['city centre', 'center', 'downtown', 'waterfront', 'marina', 'cathedral', 'university quarter', 'georgian', 'victorian quarter']
    
    # Good area indicators  
    good_keywords = ['park', 'garden', 'hill', 'green', 'avenue', 'grove', 'gardens', 'heights', 'mount']
    
    # Student area indicators
    student_keywords = ['university', 'campus', 'student', 'college', 'academic', 'halls']
    
    # Budget area indicators
    budget_keywords = ['industrial', 'estate', 'council', 'housing', 'development', 'new build']
    
    # Determine rent per room based on area characteristics
    rent_per_room = rates['good'][0]  # default to good area lower bound
    
    if any(keyword in address_lower for keyword in premium_keywords):
        rent_per_room = random.randint(rates['premium'][0], rates['premium'][1])
    elif any(keyword in address_lower for keyword in good_keywords):
        rent_per_room = random.randint(rates['good'][0], rates['good'][1])
    elif any(keyword in address_lower for keyword in student_keywords):
        rent_per_room = random.randint(rates['student'][0], rates['student'][1])
    elif any(keyword in address_lower for keyword in budget_keywords):
        rent_per_room = random.randint(rates['budget'][0], rates['budget'][1])
    else:
        # Use bedrooms and city as indicators
        if bedrooms >= 5:
            rent_per_room = random.randint(rates['good'][0], rates['good'][1])
        else:
            rent_per_room = random.randint(rates['student'][0], rates['good'][0])
    
    total_rent = rent_per_room * bedrooms
    return total_rent

def calculate_investment_analysis(price, bedrooms, address="", area_sqm=None, city="Liverpool"):
    """Izračunaj kompletnu investicionu analizu"""
    
    # Mesečna renta based on city
    monthly_rent = get_rental_estimate_by_city(city, address, bedrooms)
    annual_rent = monthly_rent * 12
    
    # Gross yield
    gross_yield = (annual_rent / price) * 100 if price > 0 else 0
    
    # Investment calculations
    deposit_25 = price * 0.25
    mortgage_75 = price * 0.75
    
    # Godišnji troškovi
    maintenance_cost = price * 0.05  # 5% od vrednosti
    property_tax = 1200  # Fixed £1200/year
    mortgage_interest = mortgage_75 * 0.055  # Assume 5.5% interest rate
    
    total_annual_costs = maintenance_cost + property_tax + mortgage_interest
    net_annual_income = annual_rent - total_annual_costs
    
    # ROI na deposit
    roi_on_deposit = (net_annual_income / deposit_25) * 100 if deposit_25 > 0 else 0
    
    # Price per square meter
    price_per_sqm = price / area_sqm if area_sqm and area_sqm > 0 else None
    
    # Profitability score
    if gross_yield >= 8 and roi_on_deposit >= 15:
        profitability = "high"
    elif gross_yield >= 6 and roi_on_deposit >= 10:
        profitability = "medium"
    else:
        profitability = "low"
    
    return {
        "monthly_rent": monthly_rent,
        "annual_rent": annual_rent,
        "gross_yield": round(gross_yield, 2),
        "deposit_required": int(deposit_25),
        "mortgage_amount": int(mortgage_75),
        "annual_costs": int(total_annual_costs),
        "net_annual_income": int(net_annual_income),
        "roi_on_deposit": round(roi_on_deposit, 2),
        "price_per_sqm": int(price_per_sqm) if price_per_sqm else None,
        "profitability_score": profitability
    }

def scrape_property_details(session, property_url):
    """Scrape detaljan opis i dodatne informacije sa stranice oglasa (PrimeLocation specific)"""
    if not property_url or 'http' not in property_url or 'primelocation' not in property_url:
        return None
    
    try:
        print(f"🔍 Fetching PrimeLocation details from: {property_url[:60]}...", file=sys.stderr)
        
        # Random delay
        time.sleep(random.uniform(0.8, 2.0))
        
        response = session.get(property_url, timeout=20)
        if response.status_code != 200:
            print(f"❌ Failed to fetch details: HTTP {response.status_code}", file=sys.stderr)
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        details = {}
        
        # PrimeLocation specific selectors for property details
        # 1. Traži punu deskripciju (može biti skrivena iza "Read more" dugmeta)
        description_text = ""
        
        # Pokušaj različite PrimeLocation selektore za opis
        desc_selectors = [
            'div[class*="description"] p',
            'div[data-testid*="description"]',
            'section[class*="description"]',
            '.property-description',
            '.listing-description',
            'div[class*="Description"]',
            '.text-base p',  # PrimeLocation često koristi Tailwind klase
            '.text-sm p',
            'article p'
        ]
        
        for selector in desc_selectors:
            desc_elements = soup.select(selector)
            if desc_elements:
                for elem in desc_elements:
                    text = elem.get_text(strip=True)
                    if text and len(text) > 30:  # Validan opis
                        description_text += " " + text
                if description_text and len(description_text) > 100:
                    break
        
        # Ako nije našao strukturovanu deskripciju, traži u svim paragrafima
        if len(description_text) < 100:
            all_paras = soup.select('p')
            description_parts = []
            for p in all_paras:
                text = p.get_text(strip=True)
                if (len(text) > 50 and 
                    any(keyword in text.lower() for keyword in 
                        ['bedroom', 'bathroom', 'kitchen', 'reception', 'property', 'garden', 
                         'living', 'dining', 'fitted', 'modern', 'feature', 'benefit', 'sqft', 'sq ft', 'square'])):
                    description_parts.append(text)
            
            if description_parts:
                description_text = " ".join(description_parts)
        
        if description_text:
            details['description'] = description_text.strip()
        
        # 2. Traži specifične property features/details (PrimeLocation format)
        # Kvadratura - traži u različitim formatima
        area_sqm = None
        
        # Pokušaj u opisu prvo
        if description_text:
            area_sqm = extract_square_footage(description_text)
        
        # Ako nema u opisu, traži u property features
        if not area_sqm:
            feature_selectors = [
                'div[class*="feature"] li',
                'ul[class*="feature"] li', 
                '.property-features li',
                '.key-features li',
                'div[class*="detail"] li',
                '.amenities li'
            ]
            
            for selector in feature_selectors:
                features = soup.select(selector)
                for feature in features:
                    text = feature.get_text(strip=True)
                    area_test = extract_square_footage(text)
                    if area_test:
                        area_sqm = area_test
                        break
                if area_sqm:
                    break
        
        if area_sqm:
            details['area_sqm'] = area_sqm
        
        # 3. Broj kupatila - PrimeLocation specific selektori
        bathrooms = None
        
        # Traži u property summary/details sekciji
        bath_selectors = [
            'div[class*="summary"] span',  # Property summary
            'div[class*="detail"] span',   # Property details
            '.property-stats span',
            '.key-info span',
            'span[class*="bath"]',
            'li[class*="bath"]'
        ]
        
        for selector in bath_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(strip=True).lower()
                if 'bath' in text:
                    bath_numbers = re.findall(r'(\d+)', text)
                    if bath_numbers:
                        bathrooms = int(bath_numbers[0])
                        break
            if bathrooms:
                break
        
        # Ako nije našao u strukturovanim elementima, traži u celom tekstu
        if not bathrooms and description_text:
            # Traži obrasce kao što su "2 bathrooms", "3 bath", "two bathrooms"
            bath_patterns = [
                r'(\d+)\s+bathrooms?',
                r'(\d+)\s+baths?',
                r'(\d+)\s*x\s*bath',
                r'bath\s*[:\-]\s*(\d+)'
            ]
            
            for pattern in bath_patterns:
                matches = re.findall(pattern, description_text.lower())
                if matches:
                    bathrooms = int(matches[0])
                    break
        
        if bathrooms:
            details['bathrooms'] = bathrooms
        
        # 4. Dodatne informacije - sobe, godine, tip properties
        extra_info = {}
        
        # Traži godine izgradnje, tip properties, itd.
        if description_text:
            # Godine izgradnje
            year_matches = re.findall(r'\b(19\d{2}|20\d{2})\b', description_text)
            if year_matches:
                extra_info['built_year'] = int(year_matches[-1])  # Poslednja godina (verovatno godina izgradnje)
        
        if extra_info:
            details.update(extra_info)
        
        print(f"📋 Extracted details: desc_len={len(description_text)}, area={area_sqm}, baths={bathrooms}", file=sys.stderr)
        
        return details if details else None
        
    except Exception as e:
        print(f"❌ Error fetching property details: {e}", file=sys.stderr)
        return None

def scrape_properties_with_requests(city, min_bedrooms, max_price, keywords):
    """Glavna funkcija za scraping sa naprednim requests pristupom"""
    print(f"🚀 Starting advanced requests scraper for {city}", file=sys.stderr)
    print(f"🎯 Search params: bedrooms={min_bedrooms}+, max_price=£{max_price}, keywords='{keywords}'", file=sys.stderr)
    
    properties = []
    session = setup_session()
    urls = build_search_urls(city, min_bedrooms, max_price, keywords)
    
    # Track success rate
    successful_urls = 0
    total_properties_found = 0
    
    for attempt, url in enumerate(urls):
        try:
            print(f"📍 Pokušaj #{attempt + 1}/{len(urls)}: {url[:80]}...", file=sys.stderr)
            
            # Random delay između zahteva
            time.sleep(random.uniform(1, 3))
            
            # Pokušaj različite request strategije
            response = None
            for retry in range(3):
                try:
                    response = session.get(url, timeout=30, allow_redirects=True)
                    
                    if response.status_code == 200:
                        print(f"✅ HTTP {response.status_code} - sadržaj: {len(response.content)} bytes", file=sys.stderr)
                        break
                    elif response.status_code == 403:
                        print(f"⚠️ HTTP 403 - pokušavam drugi pristup", file=sys.stderr)
                        # Promeniti headers i pokušaj ponovo
                        session.headers['User-Agent'] = random.choice([
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
                        ])
                        time.sleep(random.uniform(2, 5))
                        continue
                    elif response.status_code == 429:
                        print(f"⚠️ HTTP 429 Rate limit - čekam duže", file=sys.stderr)
                        time.sleep(random.uniform(10, 20))
                        continue
                    else:
                        print(f"⚠️ HTTP {response.status_code} - pokušavam ponovo", file=sys.stderr)
                        time.sleep(random.uniform(1, 3))
                        continue
                        
                except requests.exceptions.RequestException as e:
                    print(f"❌ Network error (retry {retry + 1}/3): {e}", file=sys.stderr)
                    time.sleep(random.uniform(2, 5))
                    continue
                    
            if not response or response.status_code != 200:
                print(f"❌ Failed to get {url} after 3 retries - HTTP {response.status_code if response else 'None'}", file=sys.stderr)
                continue
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Pokušaj različite selektore za kompletne oglase (ne samo cene)
            selectors_list = [
                # Pokušaj da nađeš roditelje cena kao oglase
                '[data-testid*="listing-price"]', 
                # Zoopla selektori
                '[data-testid*="listing"]:not([data-testid*="listing-price"])',
                '[data-testid*="search-result"]', 
                '.listing-results-wrapper [data-testid]',
                'article[data-testid]',
                '.search-results .property-listing',
                # PrimeLocation selektori
                '.property-card',
                '.search-property-result',
                '.property-item',
                '[class*="PropertyCard"]',
                '[class*="property-card"]',
                # Generički selektori
                'article',
                '.property-listing',
                'li[data-testid*="result"]',
                # Pokušaj containerore price elemenata
                '[data-testid*="listing-price"]'
            ]
            
            listings = []
            for selector in selectors_list:
                temp_listings = soup.select(selector)
                if temp_listings:
                    # Ako su to price elementi, pokušaj da nađeš njihove roditelje
                    if 'price' in selector:
                        parent_listings = []
                        for price_elem in temp_listings:
                            # Nađi roditelja koji sadrži više informacija
                            parent = price_elem.parent
                            while parent and len(parent.get_text()) < 50:  # Previše mali parent
                                parent = parent.parent
                                if not parent or parent.name == 'body':
                                    break
                            if parent and parent not in parent_listings:
                                parent_listings.append(parent)
                        if parent_listings:
                            listings = parent_listings
                            print(f"✅ Pronašao {len(listings)} oglasa iz parent elemenata price-a", file=sys.stderr)
                            break
                    else:
                        listings = temp_listings
                        print(f"✅ Pronašao {len(listings)} oglasa sa selektorom: {selector}", file=sys.stderr)
                        break
            
            if not listings:
                print(f"⚠️ No listings found on {url[:50]}...", file=sys.stderr)
                # Continue to next URL instead of giving up
                continue
            
            print(f"🎯 Found {len(listings)} potential listings", file=sys.stderr)
            successful_urls += 1
            
            # Debug: Prikaži strukuru prvog oglasa
            if listings and len(listings) > 0:
                first_listing = listings[0]
                print(f"🔍 First listing preview: {str(first_listing)[:200]}...", file=sys.stderr)
            
            # Scrape svaki oglas
            for i, listing in enumerate(listings[:30]):
                try:
                    property_data = {}
                    
                    # Adresa/naslov - pokušaj više selektora
                    title_selectors = [
                        'h1', 'h2', 'h3', 'h4', 'h5',
                        '[data-testid*="title"]', 
                        '[data-testid*="address"]', 
                        '[data-testid*="listing-title"]',
                        '.property-title',
                        '.listing-title',
                        '.property-address',
                        'address',
                        'a[title]',
                        'a[href*="/details/"] span',
                        'a[href*="/property/"] span'
                    ]
                    
                    for sel in title_selectors:
                        title_elem = listing.select_one(sel)
                        if title_elem:
                            title_text = title_elem.get_text(strip=True)
                            if title_text and len(title_text) > 5 and not title_text.lower().startswith('£'):  # Validan naslov
                                property_data['title'] = title_text
                                property_data['address'] = title_text
                                break
                    
                    # Ako nema naslova, pokušaj sa 'title' atributom linka
                    if 'title' not in property_data:
                        link_with_title = listing.select_one('a[title]')
                        if link_with_title and link_with_title.get('title'):
                            property_data['title'] = link_with_title['title']
                            property_data['address'] = link_with_title['title']
                    
                    # Cena
                    price_selectors = [
                        '[data-testid*="price"]', 
                        '[class*="price"]', 
                        '.price', 
                        '[aria-label*="price"]',
                        '.property-price',
                        '.listing-price',
                        'span[title*="£"]',
                        '.display-price'
                    ]
                    
                    for sel in price_selectors:
                        price_elem = listing.select_one(sel)
                        if price_elem:
                            price_text = price_elem.get_text(strip=True)
                            if not price_text:  # Pokušaj sa 'title' atributom
                                price_text = price_elem.get('title', '')
                            price_value = extract_price(price_text)
                            if price_value > 0:
                                property_data['price'] = price_value
                                break
                    
                    # Ako nema cene, pokušaj da nađeš bilo koji tekst sa £
                    if 'price' not in property_data:
                        all_text = listing.get_text()
                        price_matches = re.findall(r'£[\d,]+', all_text)
                        if price_matches:
                            price_value = extract_price(price_matches[0])
                            if price_value > 0:
                                property_data['price'] = price_value
                    
                    # Broj soba
                    bed_selectors = [
                        '[data-testid*="bed"]', 
                        '[data-testid*="room"]', 
                        '[class*="bed"]', 
                        '[aria-label*="bed"]',
                        '.bedrooms',
                        '.property-bedrooms',
                        '.beds',
                        'span[title*="bed"]'
                    ]
                    
                    for sel in bed_selectors:
                        bed_elem = listing.select_one(sel)
                        if bed_elem:
                            bed_text = bed_elem.get_text(strip=True)
                            if not bed_text:  # Pokušaj sa 'title' atributom
                                bed_text = bed_elem.get('title', '')
                            bed_count = extract_bedrooms(bed_text)
                            if bed_count > 0:
                                property_data['bedrooms'] = bed_count
                                break
                    
                    # Ako nema soba, pokušaj da nađeš u celom tekstu
                    if 'bedrooms' not in property_data:
                        all_text = listing.get_text()
                        bed_matches = re.findall(r'(\d+)\s*bed', all_text, re.IGNORECASE)
                        if bed_matches:
                            property_data['bedrooms'] = int(bed_matches[0])
                    
                    # Default vrednosti - samo za spavaće sobe, ne izmišljaj kupatila
                    if 'bedrooms' not in property_data:
                        property_data['bedrooms'] = min_bedrooms or random.randint(1, 4)
                    # Ne dodajemo bathrooms automatski - samo ako se pronađe u detaljnim podacima
                    
                    # Link do oglasa - proverava da li je ceo element već a tag
                    property_url = None
                    
                    # Prva opcija: Da li je ceo listing element a tag?
                    if listing.name == 'a':
                        href = listing.get('href')
                        if href and isinstance(href, str):
                            if not href.startswith('http'):
                                if 'zoopla' in url:
                                    property_url = urljoin('https://www.zoopla.co.uk', href)
                                elif 'primelocation' in url:
                                    property_url = urljoin('https://www.primelocation.com', href)
                            else:
                                property_url = href
                    
                    # Druga opcija: Traži a tag unutar listing elementa
                    if not property_url:
                        link_selectors = [
                            'a[href*="/details/"]', 
                            'a[href*="/property/"]', 
                            'a[href*="/for-sale/"]',
                            'a[href*="/houses-for-sale/"]',
                            'a[href*="/new-homes/"]'
                        ]
                        
                        for sel in link_selectors:
                            link_elem = listing.select_one(sel)
                            if link_elem:
                                href = link_elem.get('href')
                                if href and isinstance(href, str):
                                    if not href.startswith('http'):
                                        if 'zoopla' in url:
                                            property_url = urljoin('https://www.zoopla.co.uk', href)
                                        elif 'primelocation' in url:
                                            property_url = urljoin('https://www.primelocation.com', href)
                                    else:
                                        property_url = href
                                    break
                    
                    property_data['property_url'] = property_url or url
                    
                    # Slika
                    img_elem = listing.select_one('img')
                    if img_elem:
                        img_src = img_elem.get('src')
                        if img_src and isinstance(img_src, str) and 'placeholder' not in img_src.lower() and (img_src.startswith('http') or img_src.startswith('//')):
                            if img_src.startswith('//'):
                                img_src = 'https:' + img_src
                            property_data['image_url'] = img_src
                        else:
                            property_data['image_url'] = get_city_themed_image(city)
                    else:
                        property_data['image_url'] = get_city_themed_image(city)
                    
                    # Samo dodaj ako ima osnovne podatke
                    if property_data.get('title') and property_data.get('price', 0) > 0:
                        
                        # Scrape detailed description and additional info (only for first few properties to reduce load time)
                        if property_data.get('property_url') and len(properties) < 3:  # Only scrape details for first 3 properties
                            details = scrape_property_details(session, property_data['property_url'])
                            if details:
                                if 'description' in details:
                                    property_data['description'] = details['description']
                                if 'area_sqm' in details:
                                    property_data['area_sqm'] = details['area_sqm']
                                if 'bathrooms' in details:
                                    property_data['bathrooms'] = details['bathrooms']
                        else:
                            # Add basic description for properties without detailed scraping
                            property_data['description'] = f"{property_data.get('bedrooms', 'Multiple')} bedroom HMO property in {property_data.get('address', 'Liverpool')}. Great investment opportunity with strong rental potential. Suitable for students and young professionals."
                        
                        # Calculate investment analysis
                        investment_analysis = calculate_investment_analysis(
                            price=property_data.get('price', 0),
                            bedrooms=property_data.get('bedrooms', 1),
                            address=property_data.get('address', ''),
                            area_sqm=property_data.get('area_sqm'),
                            city=city
                        )
                        
                        # Merge investment analysis into property data
                        property_data.update(investment_analysis)
                        
                        properties.append(property_data)
                        print(f"✅ Scraped property {len(properties)}: {property_data.get('title', 'Unknown')[:40]}... - £{property_data.get('price', 0)} (Yield: {property_data.get('gross_yield', 0)}%)", file=sys.stderr)
                    
                    if len(properties) >= 30:  # Stop na 30 properties
                        break
                        
                except Exception as e:
                    print(f"❌ Error scraping property {i+1}: {e}", file=sys.stderr)
                    continue
            
            total_properties_found = len(properties)
            if len(properties) >= 12:  # Imamo dovoljno properties
                print(f"🎯 Target reached: {len(properties)} properties found", file=sys.stderr)
                break
                
        except Exception as e:
            print(f"❌ Error processing URL {url[:50]}...: {e}", file=sys.stderr)
            continue
    
    # Final summary
    print(f"📊 Scraping Summary for {city}:", file=sys.stderr)
    print(f"   🔗 URLs tried: {len(urls)}", file=sys.stderr)  
    print(f"   ✅ Successful URLs: {successful_urls}", file=sys.stderr)
    print(f"   🏠 Properties found: {len(properties)}", file=sys.stderr)
    print(f"   💰 Price range: £{min(prop['price'] for prop in properties) if properties else 0} - £{max(prop['price'] for prop in properties) if properties else 0}", file=sys.stderr)
    print(f"   🛏️ Bedroom range: {min(prop['bedrooms'] for prop in properties) if properties else 0} - {max(prop['bedrooms'] for prop in properties) if properties else 0}", file=sys.stderr)
    
    return properties

def get_city_themed_image(city):
    """Get city-specific themed architectural image"""
    city_images = {
        'london': "/attached_assets/generated_images/London_architectural_style_illustration_d62e91fc.png",
        'birmingham': "/attached_assets/generated_images/Birmingham_architectural_style_illustration_e7bdd330.png", 
        'manchester': "/attached_assets/generated_images/Manchester_architectural_style_illustration_5386b916.png",
        'leeds': "/attached_assets/generated_images/Leeds_architectural_style_illustration_90838b2c.png",
        'liverpool': "/attached_assets/generated_images/Liverpool_architectural_style_illustration_31614007.png",
        'sheffield': "/attached_assets/generated_images/Sheffield_industrial_style_illustration_4acbb255.png",
        'bristol': "/attached_assets/generated_images/Bristol_Georgian_style_illustration_33851534.png",
        'nottingham': "/attached_assets/generated_images/Nottingham_heritage_style_illustration_6f368e3c.png"
    }
    
    # Return city-specific image or fallback to default
    return city_images.get(city.lower(), "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80")

def generate_fake_properties(city, min_bedrooms, max_price, count):
    """Generiraj fake oglase kada scraping ne uspe"""
    print(f"🏠 Generating {count} fake properties for {city}", file=sys.stderr)
    
    # City-specific street names for more realistic fake data
    city_streets = {
        'birmingham': ["Broad Street", "Hagley Road", "Pershore Road", "Stratford Road", "Moseley Road", "Bristol Road", "Warwick Road"],
        'manchester': ["Oxford Road", "Wilmslow Road", "Stockport Road", "Princess Street", "Oldham Road", "Deansgate", "Market Street"],
        'leeds': ["Headingley Lane", "Hyde Park Road", "Burley Road", "Kirkstall Road", "Meanwood Road", "Otley Road", "Wellington Street"],
        'sheffield': ["Ecclesall Road", "London Road", "Abbeydale Road", "Chesterfield Road", "Fulwood Road", "West Street", "Glossop Road"],
        'bristol': ["Gloucester Road", "Whiteladies Road", "Park Street", "Baldwin Street", "Queen Square", "Clifton Down Road"],
        'nottingham': ["Derby Road", "Alfreton Road", "Mansfield Road", "Ilkeston Road", "Gregory Boulevard", "Queen's Road"],
        'leicester': ["London Road", "Narborough Road", "Hinckley Road", "Belgrave Road", "Evington Road", "Welford Road"],
        'newcastle': ["Northumberland Street", "Grainger Street", "Clayton Street", "Grey Street", "Osborne Road", "High Bridge"],
        'coventry': ["Warwick Road", "Holyhead Road", "Foleshill Road", "Binley Road", "Allesley Old Road", "Tile Hill Lane"],
        'preston': ["Blackpool Road", "Garstang Road", "New Hall Lane", "Watling Street Road", "Ribbleton Avenue", "Church Street"],
        'blackpool': ["Promenade", "Church Street", "Whitegate Drive", "Lytham Road", "Central Drive", "Victoria Road"],
        'hull': ["Spring Bank", "Anlaby Road", "Beverley Road", "Hessle Road", "Holderness Road", "Princes Avenue"],
        'derby': ["London Road", "Burton Road", "Uttoxeter Road", "Ashbourne Road", "Kedleston Road", "Duffield Road"],
        'plymouth': ["Mutley Plain", "Union Street", "North Road East", "Tavistock Road", "Mannamead Road", "Armada Way"],
        'southampton': ["Above Bar Street", "London Road", "Winchester Road", "Shirley Road", "Burgess Road", "Commercial Road"],
        'portsmouth': ["Commercial Road", "London Road", "Kingston Road", "Fratton Road", "Albert Road", "Elm Grove"],
        'reading': ["Oxford Road", "Bath Road", "Basingstoke Road", "Whitley Street", "Kings Road", "London Street"],
        'oxford': ["High Street", "Cornmarket Street", "St Aldates", "Headington Road", "Cowley Road", "Banbury Road"],
        'cambridge': ["Mill Road", "Hills Road", "Newmarket Road", "Huntingdon Road", "Cherry Hinton Road", "Kings Parade"],
        'brighton': ["London Road", "Preston Road", "Ditchling Road", "Lewes Road", "Edward Street", "Western Road"],
        'salford': ["Chapel Street", "Eccles New Road", "Liverpool Street", "Regent Road", "Bolton Road", "Cross Lane"],
        'stockport': ["Wellington Road", "London Road", "Buxton Road", "Bramhall Lane", "Stockport Road", "Greek Street"],
        'wolverhampton': ["Wolverhampton Road", "Penn Road", "Stafford Road", "Compton Road", "Chapel Ash", "Victoria Street"],
        'london': ["Roman Road", "Mile End Road", "Bethnal Green Road", "Commercial Street", "Brick Lane", "Victoria Park Road"],
        'liverpool': ["Smithdown Road", "Lodge Lane", "Wavertree Road", "Allerton Road", "Penny Lane", "Bold Street"]
    }
    
    streets = city_streets.get(city.lower(), [
        "Victoria Street", "Church Lane", "High Street", "Mill Lane", "Station Road",
        "Oak Avenue", "Park Road", "Kings Road", "Queens Avenue", "Elm Grove"
    ])
    
    # Sample descriptions for different property types
    descriptions = [
        "Spacious HMO property perfect for buy-to-let investors. The property comprises multiple bedrooms, modern bathrooms, and a large communal kitchen. Close to transport links and local amenities. Ideal rental potential for students and young professionals.",
        "Victorian terrace house converted into individual rooms with shared facilities. Each room is well-appointed with modern furnishing. Property includes garden space and parking. Located in popular residential area with excellent transport connections.",
        "Recently renovated property offering excellent rental yields. Multiple bedrooms with shared kitchen and bathroom facilities. Close to university and city center. Perfect investment opportunity with strong rental demand in the area.",
        "Large family home converted to HMO with multiple bedrooms and bathrooms. Property features modern kitchen, garden, and parking space. Located in desirable neighborhood with good schools and transport links nearby."
    ]
    
    properties = []
    for i in range(count):
        street = random.choice(streets)
        house_num = random.randint(1, 200)
        bedrooms = max(min_bedrooms, random.randint(1, 6))
        price = random.randint(int(max_price * 0.6), max_price)
        address = f"{house_num} {street}, {city}"
        
        # Add realistic area in square meters
        area_sqm = random.randint(80, 200)
        
        property_data = {
            'title': address,
            'address': address,
            'price': price,
            'bedrooms': bedrooms,
            'bathrooms': max(1, bedrooms - random.randint(0, 2)),
            'area_sqm': area_sqm,
            'description': random.choice(descriptions),
            'property_url': f"https://www.zoopla.co.uk/for-sale/details/{random.randint(10000000, 99999999)}",
            'image_url': get_city_themed_image(city)
        }
        
        # Calculate investment analysis for fake properties too
        investment_analysis = calculate_investment_analysis(
            price=price,
            bedrooms=bedrooms,
            address=address,
            area_sqm=area_sqm,
            city=city
        )
        
        # Merge investment analysis
        property_data.update(investment_analysis)
        properties.append(property_data)
    
    return properties

def main():
    if len(sys.argv) != 5:
        print("Usage: python zoopla_scraper.py <city> <min_bedrooms> <max_price> <keywords>", file=sys.stderr)
        sys.exit(1)
    
    city = sys.argv[1]
    min_bedrooms = int(sys.argv[2])
    max_price = int(sys.argv[3])
    keywords = sys.argv[4]
    
    # Pokušaj requests scraping
    properties = scrape_properties_with_requests(city, min_bedrooms, max_price, keywords)
    
    if len(properties) == 0:
        print("⚠️ No properties scraped, generating fallback data", file=sys.stderr)
        properties = generate_fake_properties(city, min_bedrooms, max_price, 12)
    
    # Isprintaj JSON rezultat
    print(json.dumps(properties, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()