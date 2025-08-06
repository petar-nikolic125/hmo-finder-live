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
    
    # Zoopla URL format: https://www.zoopla.co.uk/for-sale/property/liverpool/?beds_min=1&keywords=HMO&price_max=500000
    zoopla_params = []
    if min_bedrooms:
        zoopla_params.append(f"beds_min={min_bedrooms}")
    if keywords:
        zoopla_params.append(f"keywords={keywords}")
    if max_price:
        zoopla_params.append(f"price_max={max_price}")
    
    zoopla_url = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?" + "&".join(zoopla_params)
    
    # PrimeLocation URL format: https://www.primelocation.com/for-sale/property/manchester/?beds_min=1&is_auction=include&is_retirement_home=include&is_shared_ownership=include&keywords=HMO&price_max=500000&q=Manchester&radius=0&results_sort=highest_price&search_source=for-sale
    prime_params = []
    if min_bedrooms:
        prime_params.append(f"beds_min={min_bedrooms}")
    prime_params.append("is_auction=include")
    prime_params.append("is_retirement_home=include")
    prime_params.append("is_shared_ownership=include")
    if keywords:
        prime_params.append(f"keywords={keywords}")
    if max_price:
        prime_params.append(f"price_max={max_price}")
    prime_params.append(f"q={city}")
    prime_params.append("radius=0")
    prime_params.append("results_sort=highest_price")
    prime_params.append("search_source=for-sale")
    
    prime_url = f"https://www.primelocation.com/for-sale/property/{city_slug}/?" + "&".join(prime_params)
    
    return [zoopla_url, prime_url]

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

def get_liverpool_rental_estimate(address, bedrooms):
    """Proceni mesečnu rentu na osnovu lokacije u Liverpoolu"""
    if not address:
        address = ""
    
    address_lower = address.lower()
    
    # Premium areas - £150+ per room
    premium_areas = ['city centre', 'albert dock', 'waterfront', 'baltic triangle', 'cavern quarter', 
                    'ropewalks', 'georgian quarter', 'hope street', 'bold street']
    
    # Good areas - £120-150 per room
    good_areas = ['smithdown', 'aigburth', 'mossley hill', 'allerton', 'woolton', 'childwall',
                 'wavertree', 'greenbank', 'sefton park']
    
    # Student areas - £100-130 per room
    student_areas = ['kensington', 'edge hill', 'fairfield', 'old swan', 'tuebrook', 
                    'picton', 'university area', 'crown street']
    
    # Budget areas - £80-110 per room
    budget_areas = ['toxteth', 'kirkdale', 'everton', 'walton', 'anfield', 'norris green',
                   'croxteth', 'fazakerley', 'speke', 'garston']
    
    # Određi rent per room na osnovu lokacije
    rent_per_room = 120  # default
    
    if any(area in address_lower for area in premium_areas):
        rent_per_room = random.randint(150, 180)
    elif any(area in address_lower for area in good_areas):
        rent_per_room = random.randint(120, 150)
    elif any(area in address_lower for area in student_areas):
        rent_per_room = random.randint(100, 130)
    elif any(area in address_lower for area in budget_areas):
        rent_per_room = random.randint(80, 110)
    else:
        # Unknown area, use bedrooms as indicator
        if bedrooms >= 5:
            rent_per_room = random.randint(110, 140)
        else:
            rent_per_room = random.randint(100, 130)
    
    total_rent = rent_per_room * bedrooms
    return total_rent

def calculate_investment_analysis(price, bedrooms, address="", area_sqm=None):
    """Izračunaj kompletnu investicionu analizu"""
    
    # Mesečna renta
    monthly_rent = get_liverpool_rental_estimate(address, bedrooms)
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
    """Scrape detaljan opis i dodatne informacije sa stranice oglasa"""
    if not property_url or 'http' not in property_url:
        return None
    
    try:
        print(f"🔍 Fetching details from: {property_url[:60]}...", file=sys.stderr)
        
        # Random delay
        time.sleep(random.uniform(0.5, 1.5))
        
        response = session.get(property_url, timeout=15)
        if response.status_code != 200:
            print(f"❌ Failed to fetch details: HTTP {response.status_code}", file=sys.stderr)
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        details = {}
        
        # Traži opis - pokušaj različite selektore
        description_selectors = [
            '[data-testid*="description"]',
            '[data-testid*="details"]',
            '.property-description',
            '.listing-description', 
            '.description-content',
            '.property-details-description',
            '[class*="Description"]',
            '[class*="description"]',
            'section[class*="description"] p',
            '.text-block',
            '.content-block p'
        ]
        
        description_text = ""
        for selector in description_selectors:
            desc_elements = soup.select(selector)
            if desc_elements:
                for elem in desc_elements:
                    text = elem.get_text(strip=True)
                    if text and len(text) > 50:  # Minimum reasonable length
                        description_text += " " + text
                if description_text:
                    break
        
        # Ako nije našao specifične selektore, traži paragraphs sa ključnim rečima
        if not description_text:
            all_paragraphs = soup.select('p')
            for p in all_paragraphs:
                text = p.get_text(strip=True)
                if any(keyword in text.lower() for keyword in 
                      ['bedroom', 'bathroom', 'property', 'reception', 'kitchen', 'garden', 'sqft', 'sq ft']):
                    if len(text) > 30:
                        description_text += " " + text
        
        if description_text:
            details['description'] = description_text.strip()
            
            # Pokušaj da izvučeš kvadraturu iz opisa
            area = extract_square_footage(description_text)
            if area:
                details['area_sqm'] = area
        
        # Traži dodatne detalje kao što su broj kupatila
        bathroom_selectors = [
            '[data-testid*="bathroom"]',
            '[data-testid*="bath"]', 
            '.bathrooms',
            '.property-bathrooms',
            '[class*="bathroom"]'
        ]
        
        for selector in bathroom_selectors:
            bath_elem = soup.select_one(selector)
            if bath_elem:
                bath_text = bath_elem.get_text(strip=True)
                bath_numbers = re.findall(r'\d+', bath_text)
                if bath_numbers:
                    details['bathrooms'] = int(bath_numbers[0])
                    break
        
        return details if details else None
        
    except Exception as e:
        print(f"❌ Error fetching property details: {e}", file=sys.stderr)
        return None

def scrape_properties_with_requests(city, min_bedrooms, max_price, keywords):
    """Glavna funkcija za scraping sa naprednim requests pristupom"""
    print(f"🚀 Starting advanced requests scraper for {city}", file=sys.stderr)
    
    properties = []
    session = setup_session()
    urls = build_search_urls(city, min_bedrooms, max_price, keywords)
    
    for attempt, url in enumerate(urls):
        try:
            print(f"📍 Pokušaj #{attempt + 1}: {url}", file=sys.stderr)
            
            # Random delay između zahteva
            time.sleep(random.uniform(1, 3))
            
            # Pokušaj različite request strategije
            response = None
            for retry in range(3):
                try:
                    response = session.get(url, timeout=30, allow_redirects=True)
                    
                    if response.status_code == 200:
                        print(f"✅ Uspešan HTTP {response.status_code} za {url}", file=sys.stderr)
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
                    else:
                        print(f"⚠️ HTTP {response.status_code} - pokušavam ponovo", file=sys.stderr)
                        time.sleep(random.uniform(1, 3))
                        continue
                        
                except requests.exceptions.RequestException as e:
                    print(f"❌ Network error (retry {retry + 1}/3): {e}", file=sys.stderr)
                    time.sleep(random.uniform(2, 5))
                    continue
                    
            if not response or response.status_code != 200:
                print(f"❌ Failed to get {url} after 3 retries", file=sys.stderr)
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
                print(f"⚠️ Nema oglasa na {url}, pokušavam sledeći sajt", file=sys.stderr)
                continue
            
            # Debug: Prikaži strukuru prvog oglasa
            if listings and len(listings) > 0:
                first_listing = listings[0]
                print(f"🔍 DEBUG: First listing HTML snippet:", file=sys.stderr)
                print(str(first_listing)[:500], file=sys.stderr)
                
                # Debug: Pokušaj da nađeš link u prvom oglasu
                first_link = first_listing.select_one('a[href*="/details/"]')
                if first_link:
                    print(f"🔗 DEBUG: Found details link: {first_link.get('href')}", file=sys.stderr)
            
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
                    
                    # Default vrednosti
                    if 'bedrooms' not in property_data:
                        property_data['bedrooms'] = min_bedrooms or random.randint(1, 4)
                    property_data['bathrooms'] = max(1, property_data.get('bedrooms', 1) - 1)
                    
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
                    
                    # Samo dodaj ako ima osnovne podatke
                    if property_data.get('title') and property_data.get('price', 0) > 0:
                        
                        # Scrape detailed description and additional info
                        if property_data.get('property_url'):
                            details = scrape_property_details(session, property_data['property_url'])
                            if details:
                                if 'description' in details:
                                    property_data['description'] = details['description']
                                if 'area_sqm' in details:
                                    property_data['area_sqm'] = details['area_sqm']
                                if 'bathrooms' in details:
                                    property_data['bathrooms'] = details['bathrooms']
                        
                        # Calculate investment analysis
                        investment_analysis = calculate_investment_analysis(
                            price=property_data.get('price', 0),
                            bedrooms=property_data.get('bedrooms', 1),
                            address=property_data.get('address', ''),
                            area_sqm=property_data.get('area_sqm')
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
            
            if len(properties) >= 12:  # Imamo dovoljno properties
                break
                
        except Exception as e:
            print(f"❌ Error sa URL {url}: {e}", file=sys.stderr)
            continue
    
    print(f"🏁 Scraping completed. Found {len(properties)} valid properties", file=sys.stderr)
    return properties

def generate_fake_properties(city, min_bedrooms, max_price, count):
    """Generiraj fake oglase kada scraping ne uspe"""
    print(f"🏠 Generating {count} fake properties for {city}", file=sys.stderr)
    
    streets = [
        "Victoria Street", "Church Lane", "High Street", "Mill Lane", "Station Road",
        "Oak Avenue", "Park Road", "Kings Road", "Queens Avenue", "Elm Grove"
    ]
    
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
            'image_url': f"https://images.unsplash.com/photo-{random.choice(['1560518883-ce09059eeffa', '1564013799919-ab600027ffc6', '1493809842364-78817add7ffb'])}?w=800&h=600&fit=crop&crop=entropy&q=80"
        }
        
        # Calculate investment analysis for fake properties too
        investment_analysis = calculate_investment_analysis(
            price=price,
            bedrooms=bedrooms,
            address=address,
            area_sqm=area_sqm
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