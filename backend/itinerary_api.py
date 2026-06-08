import sys
import io
import os
from dotenv import load_dotenv

# Fix encoding issues with Emoji / Unicode characters in Windows Terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
import pandas as pd
import re
import math
from datetime import datetime, timedelta
import requests
import urllib.parse
from google import genai
import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# geminai api 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return float(R * c)

def clean_price(price_str):
    if pd.isna(price_str) or str(price_str) == "Pending": return 0
    numbers = re.findall(r'\d+', str(price_str))
    return int(numbers[0]) if numbers else 0

def enhance_search_keywords(user_interests):
    combined_text = " ".join(user_interests).lower()
    expanded_keywords = []
    
    # "All around Sri Lanka logic"user want go all around sri lanaka 
    if "all around" in combined_text or "whole island" in combined_text:
        expanded_keywords.extend(["beach", "mountain", "temple", "safari", "culture", "waterfall"])
        
    if any(w in combined_text for w in ["up country", "hill", "mountain", "cold"]):
        expanded_keywords.extend(["mountain", "hill", "waterfall", "tea", "peak", "hike", "nuwara", "ella", "badulla"])
    if any(w in combined_text for w in ["beach", "sea", "ocean", "surf"]):
        expanded_keywords.extend(["beach", "ocean", "coast", "surf", "coral", "bay", "galle", "mirissa", "matara"])
    if any(w in combined_text for w in ["wild", "animal", "safari", "park", "nature"]):
        expanded_keywords.extend(["national park", "safari", "elephant", "wildlife", "bird", "yala", "udawalawe"])
    if any(w in combined_text for w in ["history", "culture", "temple", "ruin"]):
        expanded_keywords.extend(["temple", "ruin", "ancient", "history", "heritage", "stupa", "sigiriya", "polonnaruwa", "anuradhapura"])
    if any(w in combined_text for w in ["camp", "camping", "tent"]):
        expanded_keywords.extend(["camp", "camping", "tent", "peak", "hike"])
    expanded_keywords.extend(user_interests)
    return list(set([k.strip().lower() for k in expanded_keywords if k.strip()]))

def get_location_coordinates(location_name, df):
    loc_pattern = str(location_name).strip().lower()
    matches = df[df['district'].astype(str).str.lower().str.contains(loc_pattern, na=False) |
                 df['name'].astype(str).str.lower().str.contains(loc_pattern, na=False)]
    if not matches.empty:
        return float(matches.iloc[0]['latitude']), float(matches.iloc[0]['longitude'])
    return 6.9271, 79.8612 

def get_weather_forecast(lat, lon, target_date_str):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,precipitation_sum&timezone=Asia%2FColombo"
        response = requests.get(url, timeout=5)
        data = response.json()
        if "daily" in data and "time" in data["daily"]:
            dates = data["daily"]["time"]
            if target_date_str in dates:
                index = dates.index(target_date_str)
                weather_code = data["daily"]["weathercode"][index]
                precipitation = data["daily"]["precipitation_sum"][index]
                is_raining = weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99] or precipitation > 2.0
                return is_raining
    except Exception:
        pass
    return False

def estimate_visit_time(category):
    cat_lower = str(category).lower()
    if any(w in cat_lower for w in ['national park', 'safari', 'wildlife']): return 3.5 
    if any(w in cat_lower for w in ['mountain', 'hike', 'peak', 'rock']): return 3.0    
    if any(w in cat_lower for w in ['beach', 'ocean', 'coast']): return 2.0             
    if any(w in cat_lower for w in ['museum', 'temple', 'history', 'ruin', 'stupa']): return 1.5 
    if any(w in cat_lower for w in ['waterfall', 'viewpoint', 'lake']): return 1.0      
    return 1.5 

def check_accessibility(category, name):
    cat_lower = str(category).lower()
    name_lower = str(name).lower()
    hard_keywords = ['mountain', 'hike', 'peak', 'rock', 'cliff']
    if any(w in cat_lower for w in hard_keywords) or any(w in name_lower for w in hard_keywords):
        return False 
    return True 

def generate_multi_day_itinerary(holidays_csv, start_date_str, num_days, start_location, total_budget, group_size, transport_mode, user_interests, has_vulnerable_members, force_free_places=False):
    mongo_uri = os.getenv("MONGO_URI")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client.get_database()
        
        places_cursor = db.places.find({})
        hotels_cursor = db.hotels.find({})
        
        places_df = pd.DataFrame(list(places_cursor))
        hotels_df = pd.DataFrame(list(hotels_cursor))
        
        if '_id' in places_df.columns:
            places_df = places_df.drop(columns=['_id'])
        if '_id' in hotels_df.columns:
            hotels_df = hotels_df.drop(columns=['_id'])
            
        if places_df.empty or hotels_df.empty:
            return {"status": "error", "message": "MongoDB collections are empty. Please run the seeder script."}
            
    except Exception as e:
        return {"status": "error", "message": f"Database connection or query failed: {e}"}

    holidays_df = pd.read_csv(holidays_csv)
    
    places_df['clean_fee'] = places_df['entrance_fee_lkr'].apply(clean_price)
    places_df['rating'] = pd.to_numeric(places_df['rating'], errors='coerce').fillna(0)
    places_df.loc[places_df['rating'] > 5.0, 'rating'] = 5.0

    start_lat, start_lon = get_location_coordinates(start_location, places_df)
    
    expanded_interests = enhance_search_keywords(user_interests)
    interest_pattern = r'\b(?:' + '|'.join([re.escape(i) for i in expanded_interests]) + r')\b'
    
    # fisrst find the distric or user interest
    preferred_districts = []
    all_districts_in_db = places_df['district'].str.lower().unique().tolist()
    
    for interest in expanded_interests:
        if interest in all_districts_in_db:
            if interest == "ella":
                preferred_districts.append("badulla")
            else:
                preferred_districts.append(interest)
                
    if "ella" in expanded_interests and "badulla" not in preferred_districts:
        preferred_districts.append("badulla")

    #  filter places
    filtered_places = places_df[
        places_df['name'].astype(str).str.lower().str.contains(interest_pattern, regex=True, na=False) |
        places_df['description'].astype(str).str.lower().str.contains(interest_pattern, regex=True, na=False) |
        places_df['category'].astype(str).str.lower().str.contains(interest_pattern, regex=True, na=False) |
        places_df['district'].astype(str).str.lower().str.contains(interest_pattern, regex=True, na=False)
    ]
    
    if filtered_places.empty:
        filtered_places = places_df 
        
    available_districts = filtered_places['district'].unique().tolist()
    
    # creat route (Priority & All Around Sri Lanka Logic)
    route_districts = []
    curr_lat, curr_lon = start_lat, start_lon
    unvisited = available_districts.copy()
    
    for day_num in range(num_days):
        if not unvisited:
            unvisited = available_districts.copy() 
            
        best_dist = None
        
        # first its have Preferred District, it gives first
        priority_dists = [d for d in unvisited if d.lower() in preferred_districts]
        
        if priority_dists:
            best_dist = priority_dists[0]
            # go all places in that distric remove it
            dist_places_count = len(filtered_places[filtered_places['district'] == best_dist])
            if (route_districts.count(best_dist) + 1) * 3 >= dist_places_count:
                unvisited.remove(best_dist)
                
        else:
            # its done go to the near district (Touring)
            min_distance = float('inf')
            best_lat, best_lon = curr_lat, curr_lon
            
            for dist in unvisited:
                dist_places = filtered_places[filtered_places['district'] == dist]
                if not dist_places.empty:
                    dist_lat = float(dist_places['latitude'].mean())
                    dist_lon = float(dist_places['longitude'].mean())
                    d = calculate_distance(curr_lat, curr_lon, dist_lat, dist_lon)
                    if d < min_distance:
                        min_distance = d
                        best_dist = dist
                        best_lat, best_lon = dist_lat, dist_lon
            
            if best_dist:
                unvisited.remove(best_dist)
                curr_lat, curr_lon = best_lat, best_lon

        if best_dist:
            route_districts.append(best_dist)

    tm_lower = transport_mode.lower()
    if "car" in tm_lower or "van" in tm_lower: 
        cost_per_km, speed_kmph = 200, 45
    elif "tuk" in tm_lower: 
        cost_per_km, speed_kmph = 150, 25
    elif "bike" in tm_lower or "motor" in tm_lower: 
        cost_per_km, speed_kmph = 30, 35
    else: 
        cost_per_km, speed_kmph = 50, 30 
    
    daily_budget = float(total_budget / num_days)
    rooms_needed = max(1, int(group_size // 2))
    
    itinerary = []
    total_spent = 0.0
    used_places = set() 
    
    curr_route_lat, curr_route_lon = start_lat, start_lon
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    day_start_point = f"{start_location}, Sri Lanka"
    
    for day in range(1, num_days + 1):
        if day - 1 < len(route_districts):
            target_district = route_districts[day - 1]
        else:
            target_district = route_districts[-1] if route_districts else start_location

        current_date = start_date + timedelta(days=day-1)
        current_date_str = current_date.strftime("%Y-%m-%d")
        
        holiday_warning = ""
        holiday_info = holidays_df[holidays_df['date'] == current_date_str]
        if not holiday_info.empty:
            h_name = str(holiday_info.iloc[0]['holiday_name'])
            is_poya = bool(holiday_info.iloc[0]['is_poya'])
            holiday_warning = f"⚠️ Holiday: {h_name}"
            if is_poya: holiday_warning += " (Poya Day: Meat/Liquor shops closed!)"
        
        dist_places = filtered_places[filtered_places['district'] == target_district]
        
        if not dist_places.empty:
            anchor_place = dist_places.sort_values(by='rating', ascending=False).iloc[0]
            anchor_lat, anchor_lon = float(anchor_place['latitude']), float(anchor_place['longitude'])
        else:
            fallback_places = places_df[places_df['district'] == target_district]
            if not fallback_places.empty:
                anchor_lat, anchor_lon = float(fallback_places['latitude'].mean()), float(fallback_places['longitude'].mean())
                dist_places = fallback_places
            else:
                anchor_lat, anchor_lon = start_lat, start_lon
        
        is_raining = get_weather_forecast(anchor_lat, anchor_lon, current_date_str)
        weather_warning = ""
        if is_raining:
            weather_warning = f"⛈️ WEATHER ALERT: Rain expected in {target_district}. Prioritizing indoor places."
        
        travel_dist = calculate_distance(curr_route_lat, curr_route_lon, anchor_lat, anchor_lon)
        daily_transport_cost = float((travel_dist + 30) * cost_per_km)
        curr_route_lat, curr_route_lon = anchor_lat, anchor_lon
        
        dist_hotels = hotels_df.copy()
        dist_hotels['distance_to_anchor'] = dist_hotels.apply(
            lambda row: calculate_distance(anchor_lat, anchor_lon, float(row['latitude']), float(row['longitude'])), axis=1)
        nearby_hotels = dist_hotels[dist_hotels['distance_to_anchor'] <= 20]
        
        selected_hotel = None
        hotel_cost = 0.0
        if not nearby_hotels.empty:
            nearby_hotels = nearby_hotels.sort_values(by='rating', ascending=False)
            for _, hotel in nearby_hotels.iterrows():
                daily_room_cost = float(hotel['room_rate_lkr']) * rooms_needed
                if (daily_room_cost + daily_transport_cost) <= (daily_budget * 0.7):
                    selected_hotel = hotel
                    hotel_cost = daily_room_cost
                    break
            if selected_hotel is None:
                selected_hotel = nearby_hotels.sort_values(by='room_rate_lkr').iloc[0]
                hotel_cost = float(selected_hotel['room_rate_lkr']) * rooms_needed
        
        hotel_lat = float(selected_hotel['latitude']) if selected_hotel is not None else anchor_lat
        hotel_lon = float(selected_hotel['longitude']) if selected_hotel is not None else anchor_lon 
            
        dist_places = dist_places.copy()
        dist_places['distance_to_hotel'] = dist_places.apply(
            lambda row: calculate_distance(hotel_lat, hotel_lon, float(row['latitude']), float(row['longitude'])), axis=1)
        nearby_places = dist_places[dist_places['distance_to_hotel'] <= 35] 
        
        day_remaining_budget = daily_budget - (hotel_cost + daily_transport_cost)
        
        if day_remaining_budget < 0 and not force_free_places:
            return {
                "status": "budget_insufficient", 
                "message": f"Budget insufficient for Day {day}. Transport & Hotel itself costs LKR {int(hotel_cost + daily_transport_cost)}.",
                "required_amount": int(hotel_cost + daily_transport_cost)
            }
        
        if day_remaining_budget < 0:
            day_remaining_budget = 0
            
        DAILY_TIME_LIMIT = 9.0 
        time_spent_today = 0.0
        
        day_places = []
        suggested_places = [] 
        
        nearby_places_sorted = nearby_places.sort_values(by='distance_to_hotel', ascending=True) 
        curr_tour_lat, curr_tour_lon = hotel_lat, hotel_lon
        
        for _, row in nearby_places_sorted.iterrows():
            place_name = str(row['name'])
            if place_name in used_places: continue
            place_ticket_cost = int(row['clean_fee']) * group_size 
            
            if force_free_places and place_ticket_cost > 0:
                continue
            
            dist_to_next = calculate_distance(curr_tour_lat, curr_tour_lon, float(row['latitude']), float(row['longitude']))
            travel_time_hrs = float(dist_to_next / speed_kmph)
            visit_time_hrs = float(estimate_visit_time(row['category']))
            total_time_req = travel_time_hrs + visit_time_hrs
            
            is_accessible = check_accessibility(row['category'], row['name'])
            access_warning = ""
            if has_vulnerable_members and not is_accessible:
                access_warning = "⚠️ Difficult Terrain: Requires hiking/walking. May be hard for kids or seniors."

            if place_ticket_cost <= day_remaining_budget and (time_spent_today + total_time_req) <= DAILY_TIME_LIMIT and len(day_places) < 3:
                day_places.append({
                    "Name": place_name,
                    "Category": str(row['category']),
                    "Tickets_Cost": int(place_ticket_cost), 
                    "Distance_to_Hotel": float(round(row['distance_to_hotel'], 1)),
                    "Travel_Time": float(round(travel_time_hrs, 1)),
                    "Visit_Time": float(visit_time_hrs),
                    "Access_Warning": access_warning 
                })
                day_remaining_budget -= place_ticket_cost
                time_spent_today += total_time_req
                used_places.add(place_name)
                curr_tour_lat, curr_tour_lon = float(row['latitude']), float(row['longitude'])
            
            elif len(suggested_places) < 2 and place_name not in used_places:
                suggested_places.append({
                    "Name": place_name,
                    "Distance_to_Hotel": float(round(row['distance_to_hotel'], 1)),
                    "Tickets_Cost": int(place_ticket_cost),
                    "Access_Warning": access_warning
                })

        day_total_cost = float(hotel_cost + daily_transport_cost + sum(p['Tickets_Cost'] for p in day_places))
        total_spent += day_total_cost
        
        route_points = [day_start_point]
        for p in day_places:
            route_points.append(f"{p['Name']}, Sri Lanka")
            
        if selected_hotel is not None:
            hotel_exact_loc = f"{float(selected_hotel['latitude'])},{float(selected_hotel['longitude'])}"
            route_points.append(hotel_exact_loc)
            day_start_point = hotel_exact_loc 
        else:
            fallback_loc = f"{anchor_lat},{anchor_lon}"
            route_points.append(fallback_loc)
            day_start_point = fallback_loc
            
        encoded_points = [urllib.parse.quote(pt) for pt in route_points]
        map_url = "https://www.google.com/maps/dir/" + "/".join(encoded_points)
        
        itinerary.append({
            "Day": int(day),
            "Date": str(current_date_str),
            "Holiday_Warning": str(holiday_warning),
            "Weather_Warning": str(weather_warning), 
            "Region": str(target_district),
            "Hotel": str(selected_hotel['name']) if selected_hotel is not None else "Local Guest House",
            "Hotel_Cost": float(round(hotel_cost, 2)),
            "Transport_Cost": float(round(daily_transport_cost, 2)),
            "Places": day_places,
            "Suggestions": suggested_places, 
            "Total_Time_Spent": float(round(time_spent_today, 1)),
            "Daily_Total": float(round(day_total_cost, 2)),
            "Map_URL": str(map_url) 
        })

    return {
        "status": "success",
        "num_days": int(num_days),
        "itinerary": itinerary,
        "total_cost": float(round(total_spent, 2)),
        "remaining_budget": float(round(total_budget - total_spent, 2)),
        "vulnerable_members": bool(has_vulnerable_members)
    }

def get_ai_story(structured_data, start_loc, start_date, interests, transport_mode):
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
        You are a highly sought-after Sri Lankan Travel Expert. I will provide you with a computer-generated {structured_data['num_days']}-day tour itinerary across Sri Lanka.
        
        Tour Details:
        - Starts from: {start_loc}
        - Mode of Transport: {transport_mode}

        Here is the day-by-day structured itinerary:
        {structured_data['itinerary']}
        
        Total Estimated Trip Cost: LKR {structured_data['total_cost']}

        Please write a captivating and detailed travel blog-style itinerary. Include:
        1. Catchy title.
        2. A Day-by-Day breakdown mentioning places.
        3. Advise caution if 'Access_Warning' is present.
        """
        
        # Models selected from the list that are confirmed to work correctly:
        models_to_try = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash']
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                return response.text
            except Exception:
                continue
        return "Enjoy your amazing trip to Sri Lanka!"
    except Exception as e:
        return f"AI Story generation failed."

if __name__ == "__main__":
    try:
        input_data = sys.argv[1]
        args = json.loads(input_data)
        
        start_date = args.get('start_date', (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"))
        num_days = int(args.get('num_days', 3))
        start_loc = args.get('start_loc', 'Colombo')
        total_budget = int(args.get('budget', 50000))
        group_size = int(args.get('group_size', 2))
        transport = args.get('transport', 'Car')
        interests = [i.strip() for i in args.get('interests', '').split(',')]
        has_vulnerable = args.get('has_vulnerable', False)
        force_free_places = args.get('force_free_places', False)

        result = generate_multi_day_itinerary(
            holidays_csv="srilanka_holidays.csv",
            start_date_str=start_date,
            num_days=num_days,
            start_location=start_loc,
            total_budget=total_budget,
            group_size=group_size,
            transport_mode=transport,
            user_interests=interests,
            has_vulnerable_members=has_vulnerable,
            force_free_places=force_free_places
        )

        if result["status"] == "success":
            story = get_ai_story(result, start_loc, start_date, interests, transport)
            result['ai_story'] = story
            
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))