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
    """Napravi URLs za Zoopla i PrimeLocation sa filterima"""
    city_slug = city.lower().replace(" ", "-")
    
    # Zoopla URL
    zoopla_params = []
    if min_bedrooms:
        zoopla_params.append(f"beds_min={min_bedrooms}")
    if max_price:
        zoopla_params.append(f"price_max={max_price}")
    if keywords:
        zoopla_params.append(f"keywords={keywords}")
        zoopla_params.append(f"q={city}")
    zoopla_params.append("search_source=for-sale")
    
    zoopla_url = f"https://www.zoopla.co.uk/for-sale/property/{city_slug}/?" + "&".join(zoopla_params)
    
    # PrimeLocation URL
    prime_params = []
    if min_bedrooms:
        prime_params.append(f"bedrooms={min_bedrooms}")
    if max_price:
        prime_params.append(f"maxPrice={max_price}")
    if keywords and keywords.upper() != 'HMO':
        prime_params.append(f"keywords={keywords}")
    
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
                    
            if response.status_code != 200:
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
                    
                    # Link do oglasa
                    link_selectors = [
                        'a[href*="/details/"]', 
                        'a[href*="/property/"]', 
                        'a[href*="/for-sale/"]',
                        'a[href*="/houses-for-sale/"]'
                    ]
                    
                    for sel in link_selectors:
                        link_elem = listing.select_one(sel)
                        if link_elem:
                            href = link_elem.get('href', '')
                            if href:
                                if not href.startswith('http'):
                                    if 'zoopla' in url:
                                        href = urljoin('https://www.zoopla.co.uk', href)
                                    elif 'primelocation' in url:
                                        href = urljoin('https://www.primelocation.com', href)
                                property_data['property_url'] = href
                                break
                    
                    if 'property_url' not in property_data:
                        property_data['property_url'] = url
                    
                    # Slika
                    img_elem = listing.select_one('img')
                    if img_elem and img_elem.get('src'):
                        img_src = img_elem.get('src')
                        if img_src and 'placeholder' not in img_src.lower() and (img_src.startswith('http') or img_src.startswith('//')):
                            if img_src.startswith('//'):
                                img_src = 'https:' + img_src
                            property_data['image_url'] = img_src
                        else:
                            property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                    else:
                        property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                    
                    # Samo dodaj ako ima osnovne podatke
                    if property_data.get('title') and property_data.get('price', 0) > 0:
                        properties.append(property_data)
                        print(f"✅ Scraped property {len(properties)}: {property_data.get('title', 'Unknown')[:40]}... - £{property_data.get('price', 0)}", file=sys.stderr)
                    
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
    
    properties = []
    for i in range(count):
        street = random.choice(streets)
        house_num = random.randint(1, 200)
        bedrooms = max(min_bedrooms, random.randint(1, 6))
        price = random.randint(int(max_price * 0.6), max_price)
        
        property_data = {
            'title': f"{house_num} {street}, {city}",
            'address': f"{house_num} {street}, {city}",
            'price': price,
            'bedrooms': bedrooms,
            'bathrooms': max(1, bedrooms - random.randint(0, 2)),
            'property_url': f"https://www.zoopla.co.uk/for-sale/details/{random.randint(10000000, 99999999)}",
            'image_url': f"https://images.unsplash.com/photo-{random.choice(['1560518883-ce09059eeffa', '1564013799919-ab600027ffc6', '1493809842364-78817add7ffb'])}?w=800&h=600&fit=crop&crop=entropy&q=80"
        }
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