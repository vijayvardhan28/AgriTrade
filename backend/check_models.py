import google.generativeai as genai
import os

GEMINI_API_KEY = "AIzaSyCiceauLezyGHSiggTm_3_hg0IJTn4thog"
genai.configure(api_key=GEMINI_API_KEY)

try:
    with open("available_models.txt", "w") as f:
        f.write("Available models:\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
    print("Models saved to available_models.txt")
except Exception as e:
    print(f"Error: {e}")
