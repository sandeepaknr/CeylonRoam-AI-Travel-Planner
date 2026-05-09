import ssl

# 🔴 අන්තර්ජාලයෙන් Model එක Download වෙද්දී එන SSL Certificate Error එක මඟහැරීම
ssl._create_default_https_context = ssl._create_unverified_context

from flask import Flask, request, jsonify
from flask_cors import CORS # React එකෙන් එන ඉල්ලීම් වලට ඉඩ දෙන්න
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # React එකෙන් එන ඉල්ලීම් භාරගන්න මේක අත්‍යවශ්‍යයි!

# 1. select the device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[*] Server is running on: {device}")

# 2. Load Model and Processor 
model_name = "openai/clip-vit-base-patch32"
processor = CLIPProcessor.from_pretrained(model_name)
model = CLIPModel.from_pretrained(model_name)

# 🔴 වැදගත්: ඔයා Train කරලා Save කරපු මොඩල් එක ලෝඩ් කිරීම
model_path = r"C:\\Users\ASUS\Downloads\\Traveling System (2)\\Traveling System\\Traveling System\\backend\\srilanka_travel_clip_fixed.pth"

if os.path.exists(model_path):
    print(f"[*] Loading trained model from: {model_path}")
    model.load_state_dict(torch.load(model_path, map_location=device))
else:
    print(f"❌ Error: Model file not found at {model_path}. Please check the path.")

model.to(device)
model.eval()

# 3. CSV එකෙන් විස්තර සහ Classes 55 කියවා ගැනීම
csv_file = "image_dataset_info_enriched.csv"
if os.path.exists(csv_file):
    df_meta = pd.read_csv(csv_file)
    # අනුපිටපත් (duplicates) අයින් කරලා Classes ටික ගන්නවා
    unique_classes_df = df_meta.drop_duplicates(subset=['class_name'])
    
    # හරියටම ඔයාගේ ෆෝල්ඩර් 55 පිළිවෙලටම ගන්න ඕනේ
    CLASSES = sorted(unique_classes_df['class_name'].tolist())
    
    # Create Text Prompts
    text_inputs = [f"A photo of {c.replace('_', ' ')}" for c in CLASSES]
    encoded_texts = processor(text=text_inputs, return_tensors="pt", padding=True).to(device)
    print(f"[*] Successfully loaded {len(CLASSES)} places from CSV.")
else:
    print(f"❌ Error: '{csv_file}' සොයාගැනීමට නොහැක. කරුණාකර එය ෆෝල්ඩරයේ ඇති බව තහවුරු කරන්න.")
    CLASSES = []

# 4. ෆොටෝ එකක් ආවාම වැඩ කරන විදිහ (API Endpoint)
@app.route('/predict', methods=['POST'])
def predict():
    if not CLASSES:
        return jsonify({"error": "Server is missing class data from CSV."}), 500

    if 'image' not in request.files:
        return jsonify({"error": "කරුණාකර Image එකක් Upload කරන්න"}), 400
        
    file = request.files['image']
    
    try:
        # Image එක Open කරලා RGB වලට හරවා ගැනීම
        image = Image.open(file.stream).convert("RGB")
        inputs = processor(images=image, return_tensors="pt").to(device)
        
        # Inference (Prediction)
        with torch.no_grad():
            outputs = model(
                pixel_values=inputs.pixel_values, 
                input_ids=encoded_texts.input_ids, 
                attention_mask=encoded_texts.attention_mask
            )
            
            probs = outputs.logits_per_image.softmax(dim=1)
            pred_idx = probs.argmax(dim=1).item()
            confidence = probs[0][pred_idx].item() * 100 # ප්‍රතිශතයක් බවට පත්කිරීම
            
            predicted_class = CLASSES[pred_idx]
            
        # 🔴 Confidence එක 75% ට වඩා අඩු නම් Error එකක් යවනවා
        if confidence < 75.0:
            return jsonify({
                "status": "error",
                "message": f"I can't detect a clear travel destination in this photo. Please upload a better image. (Confidence: {round(confidence, 2)}%)"
            })
            
        # 🔴 Confidence එක 75% ට වැඩියි නම් (හරියට අඳුරගත්තා නම්) අදාළ විස්තර යවනවා
        place_info = unique_classes_df[unique_classes_df['class_name'] == predicted_class].iloc[0]
        
        return jsonify({
            "status": "success",
            "predicted_place": place_info['Display_Name'],    # උදා: Adam's Peak
            "district": place_info['District'],               # උදා: Nuwara Eliya
            "category": place_info['Category'],               # උදා: Mountain/Pilgrimage
            "description": place_info['Description'],         # උදා: A tall, sacred mountain...
            "confidence": round(confidence, 2)
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ══════════════════════════════════════════════════════════════
# /chat — Gemini AI Travel Expert Chatbot
# ══════════════════════════════════════════════════════════════
from google import genai as google_genai

GEMINI_API_KEY = "AIzaSyDcKRUq8ICxmdJbnf1CgMFmnb2T5ViA6As"

SYSTEM_PROMPT_TEMPLATE = """You are "Roamy", a highly professional, respectful, and knowledgeable Sri Lankan Travel Expert built into the CeylonRoam trip planning app.

Tone & Conduct:
- Always maintain a warm, hospitable, and deeply respectful Sri Lankan tone.
- Starting with "Ayubowan" occasionally is perfectly fine and encouraged.
- Do NOT use overly casual or colloquial slang such as "Machang", "Malli", "Bro", "Dude" or similar informal terms at any point.
- Address the user respectfully. If their name is provided, use it naturally (e.g. "That's a wonderful choice, {addressee}!"). If no name is provided, address them as "Sir/Madam" where appropriate.
- Keep every answer CONCISE — ideally 2–4 short sentences or a small bullet list. Never write long essays.
- Use relevant emojis sparingly to add warmth (🌴🐘🚂🏖️🍛), but keep it professional.

Your Expertise:
- Sri Lanka destinations, districts, national parks, beaches, temples, hill country, and hidden gems.
- Sri Lankan food, culture, festivals (Vesak, Perahera, Poya days), etiquette, and customs.
- Practical travel: visas (ETA), SIM cards, currency (LKR), getting around, and safety.
- Scenic trains (especially the Kandy–Ella route and observation deck seating).
- Monsoon seasons and the best time to visit each region.
- Budget guidance, typical cost ranges, and finding authentic local experiences.

Strict Rules:
- If someone asks something completely unrelated to travel or Sri Lanka, politely redirect: "I specialise in Sri Lanka travel, Sir/Madam. May I help you with destinations, transport, food, or planning tips? 🌴"
- Never fabricate specific hotel prices or flight costs — advise checking booking platforms.
- Always be accurate: South-West Monsoon runs May–Sep; North-East Monsoon runs Oct–Jan.
"""

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"status": "error", "message": "No message provided."}), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({"status": "error", "message": "Message is empty."}), 400

        # Extract optional user name sent from the React frontend
        user_name = (data.get('userName') or '').strip()
        addressee = user_name if user_name else "Sir/Madam"

        # Personalise the system prompt with the correct form of address
        personalised_prompt = SYSTEM_PROMPT_TEMPLATE.replace("{addressee}", addressee)

        client = google_genai.Client(api_key=GEMINI_API_KEY)

        # Build full prompt: personalised system instructions + user turn
        full_prompt = (
            f"{personalised_prompt}\n\n"
            f"[The user's name is: {user_name if user_name else 'unknown — use Sir/Madam'}]\n\n"
            f"User: {user_message}\n"
            f"Roamy:"
        )

        # Try models in order of preference (most capable first)
        models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']
        reply_text = None

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                reply_text = response.text.strip()
                break
            except Exception:
                continue

        if not reply_text:
            return jsonify({"status": "error", "message": "AI model unavailable. Please try again shortly."}), 503

        return jsonify({"status": "success", "reply": reply_text})

    except Exception as e:
        print(f"[/chat ERROR] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    # Server එක Port 5001 හරහා Start වෙනවා
    app.run(debug=True, host='0.0.0.0', port=5001)
