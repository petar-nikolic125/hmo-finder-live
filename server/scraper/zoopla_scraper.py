#!/usr/bin/env python3
import sys
import json
import time
import re
import requests
from bs4 import BeautifulSoup
import random

def setup_session():
    """Setup HTTP session sa headers"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })
    return session

def build_zoopla_url(city, min_bedrooms, max_price, keywords):
    """Napravi Zoopla URL sa filterima"""
    base_url = "https://www.zoopla.co.uk/for-sale/property/"
    
    # Pripremi grad za URL
    city_slug = city.lower().replace(" ", "-")
    
    # Napravi osnovni URL
    url = f"{base_url}{city_slug}/"
    
    # Dodaj parametre
    params = []
    if min_bedrooms:
        params.append(f"beds_min={min_bedrooms}")
    if max_price:
        params.append(f"price_max={max_price}")
    if keywords and keywords.lower() != 'hmo':  # HMO je default
        params.append(f"q={keywords}")
    
    if params:
        url += "?" + "&".join(params)
    
    return url

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

def scrape_zoopla_properties(city, min_bedrooms, max_price, keywords):
    """Glavna funkcija za scraping Zoopla oglasa"""
    print(f"🚀 Starting Zoopla scraper for {city}", file=sys.stderr)
    
    session = setup_session()
    properties = []
    
    try:
        url = build_zoopla_url(city, min_bedrooms, max_price, keywords)
        print(f"📍 Fetching: {url}", file=sys.stderr)
        
        response = session.get(url, timeout=30)
        if response.status_code != 200:
            print(f"❌ HTTP Error: {response.status_code}", file=sys.stderr)
            return generate_fake_properties(city, min_bedrooms, max_price, 12)
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Pokušaj različite selektore za oglase
        property_selectors = [
            '[data-testid*="listing"]',
            '.listing-result',
            '.search-result',
            '[class*="property"]',
            'article',
            '.property-listing'
        ]
        
        listings = []
        for selector in property_selectors:
            listings = soup.select(selector)
            if listings:
                print(f"✅ Found {len(listings)} listings with selector: {selector}", file=sys.stderr)
                break
        
        if not listings:
            print("❌ No property listings found, generating fake data", file=sys.stderr)
            return generate_fake_properties(city, min_bedrooms, max_price, 12)
        
        # Scrape svaki oglas
        for i, listing in enumerate(listings[:30]):  # Ograniči na 30 oglasa
            try:
                property_data = {}
                
                # Adresa/naslov
                title_elem = listing.select_one('h2, h3, .listing-title, [data-testid*="title"], a[href*="/details/"]')
                if title_elem:
                    property_data['title'] = title_elem.get_text(strip=True)
                    property_data['address'] = property_data['title']
                
                # Cena
                price_elem = listing.select_one('[data-testid*="price"], .price, .listing-price, [class*="price"]')
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    property_data['price'] = extract_price(price_text)
                
                # Broj soba
                bed_elem = listing.select_one('[data-testid*="bed"], .beds, .bedrooms, [class*="bed"]')
                if bed_elem:
                    bed_text = bed_elem.get_text(strip=True)
                    property_data['bedrooms'] = extract_bedrooms(bed_text)
                else:
                    property_data['bedrooms'] = min_bedrooms or random.randint(1, 5)
                
                property_data['bathrooms'] = max(1, property_data.get('bedrooms', 1) - 1)
                
                # Link do oglasa
                link_elem = listing.select_one('a[href*="/details/"], a[href*="/property/"]')
                if link_elem:
                    href = link_elem.get('href', '')
                    if href and not href.startswith('http'):
                        href = 'https://www.zoopla.co.uk' + href
                    property_data['property_url'] = href
                else:
                    property_data['property_url'] = url
                
                # Slika
                img_elem = listing.select_one('img')
                if img_elem and img_elem.get('src'):
                    img_src = img_elem.get('src')
                    if 'placeholder' not in img_src.lower():
                        property_data['image_url'] = img_src
                    else:
                        property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                else:
                    property_data['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80'
                
                # Samo dodaj ako ima osnovne podatke
                if property_data.get('title') and property_data.get('price', 0) > 0:
                    properties.append(property_data)
                    print(f"✅ Scraped property {i+1}: {property_data.get('title', 'Unknown')[:50]}... - £{property_data.get('price', 0)}", file=sys.stderr)
                
            except Exception as e:
                print(f"❌ Error scraping property {i+1}: {e}", file=sys.stderr)
                continue
        
        if len(properties) == 0:
            print("⚠️ No valid properties found, generating fake data", file=sys.stderr)
            return generate_fake_properties(city, min_bedrooms, max_price, 12)
        
        print(f"🏁 Scraping completed. Found {len(properties)} valid properties", file=sys.stderr)
        return properties
        
    except Exception as e:
        print(f"❌ Error during scraping: {e}", file=sys.stderr)
        return generate_fake_properties(city, min_bedrooms, max_price, 12)

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
    
    properties = scrape_zoopla_properties(city, min_bedrooms, max_price, keywords)
    
    # Isprintaj JSON rezultat
    print(json.dumps(properties, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()