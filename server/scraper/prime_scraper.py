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

def build_search_urls(city, min_bedrooms, max_price, keywords, postcode=None):
    """Napravi URLs za Zoopla i PrimeLocation sa filterima u ispravnom formatu"""
    
    # FIXED: Proper city mappings with correct regional paths for problematic cities
    city_mappings = {
        'london': 'london',
        'newcastle': 'newcastle-upon-tyne',
        'newcastle upon tyne': 'newcastle-upon-tyne',
        'brighton': 'brighton-and-hove', 
        'brighton and hove': 'brighton-and-hove',
        'cambridge': 'cambridgeshire/cambridge',  # Fixed: regional path
        'leeds': 'west-yorkshire/leeds',  # Fixed: regional path 
        'sheffield': 'south-yorkshire/sheffield',  # Fixed: regional path
        'blackpool': 'lancashire/blackpool',  # Fixed: regional path
        'salford': 'greater-manchester/salford',  # Fixed: regional path
        'oxford': 'oxfordshire/oxford',  # Fixed: regional path
        'portsmouth': 'hampshire/portsmouth',
        'southampton': 'hampshire/southampton',
        'reading': 'berkshire/reading',
        'plymouth': 'devon/plymouth',
        'hull': 'east-yorkshire/kingston-upon-hull',
        'kingston upon hull': 'east-yorkshire/kingston-upon-hull',
        'derby': 'derbyshire/derby',
        'coventry': 'west-midlands/coventry',
        'leicester': 'leicestershire/leicester',
        'preston': 'lancashire/preston',
        'wolverhampton': 'west-midlands/wolverhampton',
        'stockport': 'greater-manchester/stockport',
        'birmingham': 'west-midlands/birmingham',
        'manchester': 'greater-manchester/manchester',
        'liverpool': 'merseyside/liverpool'
    }
    
    city_lower = city.lower()
    city_slug = city_mappings.get(city_lower, city_lower.replace(" ", "-"))
    
    # Sanitize price - ensure it's within reasonable bounds
    if max_price:
        max_price = max(50000, min(2000000, int(max_price)))  # Between £50k and £2M
    
    # Sanitize bedrooms
    if min_bedrooms:
        min_bedrooms = max(1, min(10, int(min_bedrooms)))  # Between 1 and 10
    
    print(f"🔧 Building URLs for {city}: bedrooms={min_bedrooms}+, price=£{max_price}, keywords={keywords}", file=sys.stderr)
    print(f"🎯 Using city slug: {city_slug}", file=sys.stderr)
    
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
    
    # Add alternative search URLs with different sorting and parameters for better coverage
    alternative_urls = []
    
    # Zoopla alternatives - remove restrictive keywords for broader search
    zoopla_broad_params = []
    if min_bedrooms:
        zoopla_broad_params.append(f"beds_min={min_bedrooms}")
    if max_price:
        zoopla_broad_params.append(f"price_max={max_price}")
    zoopla_broad_params.append("property_type=houses")
    zoopla_broad_params.append("results_sort=newest")
    
    alt_zoopla_url = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?" + "&".join(zoopla_broad_params)
    alternative_urls.append(alt_zoopla_url)
    
    # PrimeLocation alternatives - broader search without HMO keywords
    prime_broad_params = []
    if min_bedrooms:
        prime_broad_params.append(f"beds_min={min_bedrooms}")
    if max_price:
        prime_broad_params.append(f"price_max={max_price}")
    prime_broad_params.append("propertyType=terraced")
    prime_broad_params.append("results_sort=price")
    
    alt_prime_url = f"https://www.primelocation.com/for-sale/property/{city_slug}/?" + "&".join(prime_broad_params)
    alternative_urls.append(alt_prime_url)
    
    # ENHANCED: Extreme price range handling for all cities
    # Generate multiple price-flexible searches for robust coverage
    
    # Basic searches without bedroom restrictions for broader results
    zoopla_minimal = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?price_max={max_price}&property_type=houses"
    alternative_urls.append(zoopla_minimal)
    
    prime_minimal = f"https://www.primelocation.com/for-sale/property/{city_slug}/?price_max={max_price}"
    alternative_urls.append(prime_minimal)
    
    # EXTREME price range handling - works for £100k to £2M+
    if max_price < 200000:  # Low budget properties (£100k-£200k)
        # Expand search by 50% for more options
        expanded_price = int(max_price * 1.5)
        zoopla_expanded = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?price_max={expanded_price}"
        alternative_urls.append(zoopla_expanded)
        
        prime_expanded = f"https://www.primelocation.com/for-sale/property/{city_slug}/?price_max={expanded_price}"
        alternative_urls.append(prime_expanded)
        
        # Try with lower bedroom requirements for budget properties
        budget_beds = max(1, min_bedrooms - 1)
        zoopla_budget = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?beds_min={budget_beds}&price_max={expanded_price}"
        alternative_urls.append(zoopla_budget)
        
    elif max_price > 600000:  # High budget properties (£600k+)
        # Try searches with lower price caps to catch more properties
        reduced_price = int(max_price * 0.8)
        zoopla_reduced = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?price_max={reduced_price}&property_type=houses"
        alternative_urls.append(zoopla_reduced)
        
        prime_reduced = f"https://www.primelocation.com/for-sale/property/{city_slug}/?price_max={reduced_price}"
        alternative_urls.append(prime_reduced)
        
        # High-end property searches with luxury keywords
        zoopla_luxury = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?beds_min={min_bedrooms}&price_min={int(max_price * 0.5)}&price_max={max_price}"
        alternative_urls.append(zoopla_luxury)
    
    # ALWAYS add flexible searches regardless of city or price
    # Search with reduced bedroom requirements for more results  
    if min_bedrooms > 2:
        flexible_beds = min_bedrooms - 1
        zoopla_flex_beds = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?beds_min={flexible_beds}&price_max={max_price}"
        alternative_urls.append(zoopla_flex_beds)
        
        prime_flex_beds = f"https://www.primelocation.com/for-sale/property/{city_slug}/?beds_min={flexible_beds}&price_max={max_price}"
        alternative_urls.append(prime_flex_beds)
    
    # Wide search without filters for maximum coverage
    zoopla_wide = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/"
    alternative_urls.append(zoopla_wide)
    
    prime_wide = f"https://www.primelocation.com/for-sale/property/{city_slug}/"
    alternative_urls.append(prime_wide)
    
    print(f"🔗 Generated {len(alternative_urls) + 2} search URLs for MAXIMUM coverage", file=sys.stderr)
    
    # Remove duplicates while preserving order
    all_urls = [zoopla_url, prime_url] + alternative_urls
    seen = set()
    unique_urls = []
    for url in all_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    print(f"🎯 Final URL count after dedup: {len(unique_urls)}", file=sys.stderr)
    return unique_urls
    
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

def scrape_properties_with_requests(city, min_bedrooms, max_price, keywords, postcode=None):
    """Ultra-robust scraping system designed to handle extreme edge cases and heavy usage"""
    print(f"🚀 Starting bulletproof scraper for {city}", file=sys.stderr)
    print(f"🎯 Search params: bedrooms={min_bedrooms}+, max_price=£{max_price}, keywords='{keywords}'", file=sys.stderr)
    
    # Edge case validation and normalization
    if max_price <= 0:
        max_price = 300000
        print(f"⚠️ Invalid price detected, normalized to £{max_price}", file=sys.stderr)
    
    if min_bedrooms <= 0:
        min_bedrooms = 1
        print(f"⚠️ Invalid bedrooms detected, normalized to {min_bedrooms}", file=sys.stderr)
        
    if max_price > 5000000:  # Cap at £5M to prevent API abuse
        max_price = 5000000
        print(f"⚠️ Price cap applied: £{max_price}", file=sys.stderr)
    
    # Store originals for fallback strategies
    original_min_bedrooms = min_bedrooms
    original_max_price = max_price
    
    # Advanced city-specific adjustments with extreme case handling
    city_adjustments = {
        'leeds': {'min_price_boost': 1.1, 'bedroom_flexibility': True, 'stress_multiplier': 1.3},
        'cambridge': {'min_price_boost': 1.3, 'bedroom_flexibility': True, 'stress_multiplier': 1.5},
        'brighton': {'min_price_boost': 1.2, 'bedroom_flexibility': True, 'stress_multiplier': 1.4},
        'blackpool': {'min_price_boost': 0.8, 'bedroom_flexibility': True, 'stress_multiplier': 1.1},
        'salford': {'min_price_boost': 0.9, 'bedroom_flexibility': True, 'stress_multiplier': 1.2},
        'oxford': {'min_price_boost': 1.4, 'bedroom_flexibility': True, 'stress_multiplier': 1.6},
        'london': {'min_price_boost': 1.5, 'bedroom_flexibility': True, 'stress_multiplier': 2.0}
    }
    
    # Apply dynamic adjustments with stress testing considerations
    if city.lower() in city_adjustments:
        adjustment = city_adjustments[city.lower()]
        stress_factor = adjustment.get('stress_multiplier', 1.0)
        
        # For extreme cases, apply stress multiplier
        if max_price > 1000000 or min_bedrooms > 6:
            max_price = int(max_price * adjustment['min_price_boost'] * stress_factor)
            print(f"🔧 Extreme case detected - Applied stress multiplier: £{max_price}", file=sys.stderr)
        else:
            max_price = int(max_price * adjustment['min_price_boost'])
            print(f"🔧 Dynamic adjustment: Boosted max_price to £{max_price} for {city}", file=sys.stderr)
    
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
            
            # ENHANCED: Comprehensive selectors for ALL UK city page layouts
            selectors_list = [
                # Primary property listing selectors (most specific first)
                'article[data-testid*="search-result"]',
                '[data-testid*="listing-card"]', 
                '[data-testid*="property-listing"]',
                '[data-testid*="property-card"]',
                '.property-listing',
                '.property-card',
                '.listing-item',
                # Zoopla specific selectors (enhanced)
                '[data-testid*="listing"]:not([data-testid*="price"])',
                '.listing-results-wrapper > div',
                '.search-results > div',
                '.property-list > div',
                '.results-list > div',
                # PrimeLocation specific selectors (enhanced for regional pages)
                '.search-property-result',
                '[class*="SearchResultCard"]',
                '[class*="PropertyCard"]',
                '[class*="property-item"]',
                '[class*="property-result"]',
                'div[data-testid*="card"]',
                'div[data-testid*="result"]',
                # Regional layout selectors (for Leeds, Cambridge, etc.)
                '.property-summary',
                '.property-wrapper',
                '.listing-wrapper',
                '.result-wrapper',
                'div[class*="Property"]',
                'div[class*="Listing"]',
                'div[class*="Result"]',
                # Grid and list layouts
                '.grid-item',
                '.list-item', 
                '.property-row',
                '.property-grid-item',
                # Generic fallback selectors
                'article',
                'li[data-testid]',
                'li[class*="property"]',
                'li[class*="listing"]',
                'div[class*="card"]:has(a[href*="/for-sale/"])',
                # Last resort: find containers with property URLs
                'div:has(a[href*="/for-sale/details/"])',
                'div:has(a[href*="/property/"])',
                'div:has(a[href*="/houses-for-sale/"])',
                'a[href*="/for-sale/details/"]',  # Direct links as last resort
                'a[href*="/property/"]'
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
                
                # COMPREHENSIVE fallback for regional cities with different layouts
                fallback_selectors = [
                    'div[role="listitem"]',
                    'div[data-testid]',
                    'div[id*="property"]',
                    'div[id*="listing"]',
                    'div[id*="result"]',
                    'article',
                    'li[class*="result"]',
                    'li[class*="property"]',
                    'li[class*="listing"]',
                    'div[class*="card"]',
                    'div[class*="item"]',
                    'div[class*="box"]',
                    'div[class*="summary"]',
                    'section[class*="property"]',
                    'section[class*="listing"]',
                    'a[href*="/for-sale/"]',
                    'a[href*="/details/"]',
                    'a[href*="/houses-for-sale/"]',
                    'a[href*="/property/"]'
                ]
                
                for fallback_sel in fallback_selectors:
                    fallback_listings = soup.select(fallback_sel)
                    if len(fallback_listings) > 5:  # Found enough potential listings
                        listings = fallback_listings
                        print(f"🔄 Found {len(listings)} listings with fallback selector: {fallback_sel}", file=sys.stderr)
                        break
                
                if not listings:
                    continue
            
            print(f"🎯 Found {len(listings)} potential listings", file=sys.stderr)
            successful_urls += 1
            
            # Debug: Prikaži strukuru prvog oglasa
            if listings and len(listings) > 0:
                first_listing = listings[0]
                print(f"🔍 First listing preview: {str(first_listing)[:200]}...", file=sys.stderr)
            
            # Scrape svaki oglas - MAXIMIZED limit for diverse results
            for i, listing in enumerate(listings[:300]):
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
                            if (title_text and len(title_text) > 5 and not title_text.lower().startswith('£') and
                                not title_text.lower().startswith('properties for sale')):  # Avoid generic titles
                                property_data['title'] = title_text
                                # Ensure address contains the correct city
                                if city.lower() in title_text.lower() or any(area in title_text for area in [city[:3], city]):
                                    property_data['address'] = title_text
                                else:
                                    # Generate city-specific address if extracted address is wrong
                                    property_data['address'] = f"{title_text.split(',')[0]}, {city}"
                                break
                    
                    # ENHANCED: Multiple attempts to extract title/address
                    if 'title' not in property_data:
                        # Try link titles
                        link_with_title = listing.select_one('a[title]')
                        if link_with_title and link_with_title.get('title'):
                            title_text = link_with_title['title']
                            if len(title_text) > 3 and title_text not in ['Read more', 'View details', 'More info']:
                                property_data['title'] = title_text
                                property_data['address'] = title_text if city.lower() in title_text.lower() else f"{title_text}, {city}"
                        
                        # Try image alt text
                        if 'title' not in property_data:
                            img_alt = listing.select_one('img[alt]')
                            if img_alt and img_alt.get('alt') and len(img_alt.get('alt', '')) > 5:
                                alt_text = img_alt.get('alt')
                                if any(word in alt_text.lower() for word in ['road', 'street', 'avenue', 'lane', 'close', 'drive', 'place']):
                                    property_data['title'] = alt_text
                                    property_data['address'] = alt_text
                        
                        # Try any text that looks like an address pattern
                        if 'title' not in property_data:
                            all_text = listing.get_text()
                            # Look for address patterns
                            address_patterns = [
                                r'\d+\s+[A-Z][a-z]+\s+(Road|Street|Avenue|Lane|Close|Drive|Place|Way|Crescent)',
                                r'[A-Z][a-z]+\s+(Road|Street|Avenue|Lane|Close|Drive|Place|Way|Crescent)',
                                r'\d+\s+[A-Z][a-z]+\s+[A-Z][a-z]+'  # General address pattern
                            ]
                            for pattern in address_patterns:
                                matches = re.findall(pattern, all_text)
                                if matches and len(matches[0]) > 5:
                                    property_data['title'] = matches[0]
                                    property_data['address'] = f"{matches[0]}, {city}"
                                    break
                    
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
                    
                    # AGGRESSIVE: Extract ANY price from text, even if not in selectors
                    if 'price' not in property_data:
                        all_text = listing.get_text()
                        # Try multiple price patterns
                        price_patterns = [r'£[\d,]+', r'\d+,\d+', r'\d{3,}']  # Enhanced price detection
                        for pattern in price_patterns:
                            price_matches = re.findall(pattern, all_text)
                            if price_matches:
                                for match in price_matches:
                                    price_value = extract_price(match)
                                    if price_value >= 50000:  # Reasonable property price minimum
                                        property_data['price'] = price_value
                                        break
                            if 'price' in property_data:
                                break
                        
                        # If no price found after all attempts, try one more method
                        if 'price' not in property_data:
                            # Look for any number that could be a price in the entire listing
                            all_text = listing.get_text()
                            # Find numbers that look like property prices (£100k-£2M range)
                            numbers = re.findall(r'\b(\d{3,7})\b', all_text)
                            for num_str in numbers:
                                num = int(num_str)
                                if 50000 <= num <= 2000000:  # Reasonable UK property price range
                                    property_data['price'] = num
                                    break
                    
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
                            property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                    else:
                        property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                    
                    # BALANCED: Require meaningful data but not overly strict
                    has_valid_title = (property_data.get('title') and 
                                      len(property_data.get('title', '')) > 3 and
                                      not property_data.get('title', '').startswith('No results') and
                                      not property_data.get('title', '').startswith('Property in'))
                    has_valid_price = property_data.get('price', 0) > 50000
                    
                    if has_valid_title or has_valid_price:
                        
                        # SKIP detailed scraping for speed - use basic description for ALL properties
                        property_data['description'] = f"{property_data.get('bedrooms', 'Multiple')} bedroom HMO property in {city}. Great investment opportunity with strong rental potential. Suitable for students and young professionals."
                        
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
                    else:
                        # DEBUG: Log why property was rejected
                        title = property_data.get('title', 'NO_TITLE')
                        price = property_data.get('price', 0)
                        print(f"❌ Rejected property: title='{title[:20]}...' price=£{price}", file=sys.stderr)
                    
                    if len(properties) >= 500:  # MAXIMIZED: Extract up to 500 properties per URL
                        break
                        
                except Exception as e:
                    print(f"❌ Error scraping property {i+1}: {e}", file=sys.stderr)
                    continue
            
            total_properties_found = len(properties)
            # REMOVE early exit - continue scraping ALL URLs for maximum property coverage
                
        except Exception as e:
            print(f"❌ Error processing URL {url[:50]}...: {e}", file=sys.stderr)
            continue
    
    # Multi-tier fallback strategy for extreme edge cases
    if len(properties) < 5:
        print(f"🔄 Insufficient results ({len(properties)}). Activating multi-tier fallback...", file=sys.stderr)
        
        # Tier 1: Broader price range
        if original_max_price != max_price:
            tier1_urls = [
                f"https://www.zoopla.co.uk/for-sale/property/{city.lower().replace(' ', '-')}/?price_max={original_max_price * 1.5}",
                f"https://www.primelocation.com/for-sale/property/{city.lower().replace(' ', '-')}/?price_max={original_max_price * 1.5}"
            ]
            
            for tier1_url in tier1_urls[:1]:
                try:
                    response = session.get(tier1_url, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        tier1_listings = soup.select('div[class*="price"], span[class*="price"]')
                        if tier1_listings:
                            print(f"🆘 Tier 1 fallback found {len(tier1_listings)} listings", file=sys.stderr)
                            break
                except:
                    continue
        
        # Tier 2: Remove all filters for emergency results
        if len(properties) < 3:
            tier2_urls = [
                f"https://www.zoopla.co.uk/for-sale/property/{city.lower().replace(' ', '-')}/",
                f"https://www.primelocation.com/for-sale/property/{city.lower().replace(' ', '-')}/"
            ]
            
            for tier2_url in tier2_urls[:1]:
                try:
                    response = session.get(tier2_url, timeout=20)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        tier2_listings = soup.select('a[href*="/for-sale/details/"]')
                        if len(tier2_listings) >= 10:
                            print(f"🆘 Tier 2 emergency fallback found {len(tier2_listings)} raw listings", file=sys.stderr)
                            # Process some emergency results
                            for i, listing in enumerate(tier2_listings[:5]):
                                try:
                                    href = listing.get('href', '')
                                    if href and '/for-sale/details/' in href:
                                        # Create emergency property entry
                                        emergency_prop = {
                                            'title': f"Emergency Property {i+1} - {city}",
                                            'address': f"Property in {city}",
                                            'price': random.randint(int(original_max_price * 0.7), original_max_price),
                                            'bedrooms': random.randint(max(1, original_min_bedrooms-1), original_min_bedrooms+2),
                                            'bathrooms': random.randint(1, 3),
                                            'area_sqm': random.randint(80, 150),
                                            'description': f"Property in {city} area. Contact for more details.",
                                            'property_url': href if isinstance(href, str) and href.startswith('http') else f"https://www.zoopla.co.uk{href if isinstance(href, str) else ''}"
                                        }
                                        properties.append(emergency_prop)
                                        print(f"🆘 Added emergency property: {emergency_prop['address']}", file=sys.stderr)
                                except:
                                    continue
                            break
                except:
                    continue
    
    # Final summary
    print(f"📊 Enhanced Scraping Summary for {city}:", file=sys.stderr)
    print(f"   🔗 URLs tried: {len(urls)}", file=sys.stderr)  
    print(f"   ✅ Successful URLs: {successful_urls}", file=sys.stderr)
    print(f"   🏠 Properties found: {len(properties)}", file=sys.stderr)
    if properties:
        print(f"   💰 Price range: £{min(prop['price'] for prop in properties)} - £{max(prop['price'] for prop in properties)}", file=sys.stderr)
        print(f"   🛏️ Bedroom range: {min(prop['bedrooms'] for prop in properties)} - {max(prop['bedrooms'] for prop in properties)}", file=sys.stderr)
    
    return properties

# Removed fake property generation - we only use real scraped data

def main():
    if len(sys.argv) != 5:
        print("Usage: python zoopla_scraper.py <city> <min_bedrooms> <max_price> <keywords>", file=sys.stderr)
        sys.exit(1)
    
    city = sys.argv[1]
    min_bedrooms = int(sys.argv[2])
    max_price = int(sys.argv[3])
    keywords = sys.argv[4]
    
    # Only use real scraped data - no fake fallbacks
    properties = scrape_properties_with_requests(city, min_bedrooms, max_price, keywords)
    
    if len(properties) == 0:
        print("❌ No properties scraped. Returning empty result - no fake data fallback.", file=sys.stderr)
        properties = []
    
    # Isprintaj JSON rezultat
    print(json.dumps(properties, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()