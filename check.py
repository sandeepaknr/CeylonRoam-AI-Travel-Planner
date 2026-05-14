import os
from google import genai

# Paste your new API Key here
GEMINI_API_KEY = "AIzaSyBDtmmsK1qN8Anl1PhTAjDHb6-dDlmLz4s" 

def check_available_models():
    if not GEMINI_API_KEY or GEMINI_API_KEY == "AIzaSy_YOUR_API_KEY_HERE":
        print("❌ Error: Please add your API Key to the code.")
        return

    try:
        print("🔍 Searching available models from Google servers...\n")
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Retrieve the list of models associated with the API Key
        models_list = client.models.list()
        
        count = 0
        print("✅ Models supported by your API Key:\n")
        print("="*50)
        
        for model in models_list:
            # Filter only models that support Text/Story generation (generateContent)
            if 'generateContent' in model.supported_actions:
                # Strip the 'models/' prefix to get just the name for readability
                model_name = model.name.replace("models/", "") 
                print(f"👉 {model_name}")
                count += 1
                
        print("="*50)
        print(f"🎉 Total Models count: {count}")

    except Exception as e:
        print(f"❌ An error occurred while loading Models:\n{e}")

if __name__ == "__main__":
    check_available_models()