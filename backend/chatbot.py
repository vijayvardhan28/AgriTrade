import os
import google.generativeai as genai
from flask import jsonify

# Configure Gemini API
# Using the provided API key
GEMINI_API_KEY = "api here please"
genai.configure(api_key=GEMINI_API_KEY)

def get_agriculture_response(message, history=[], language="English"):
    """
    Generates a response for agriculture-related queries using Gemini.
    """
    if not GEMINI_API_KEY:
        return {
            "text": "Error: Gemini API Key is not configured.",
            "is_agriculture": False
        }

    try:
        # Create the model - using gemini-2.0-flash as it is available
        model = genai.GenerativeModel('gemini-2.0-flash')

        # System prompt to enforce agriculture context
        system_prompt = f"""
        You are an expert agricultural assistant. Your purpose is to help farmers and agriculture enthusiasts with their questions.
        
        RULES:
        1. You must ONLY answer questions related to agriculture, farming, crops, soil, weather for farming, pest control, livestock, and government agricultural schemes.
        2. If a user asks a question that is NOT related to agriculture (e.g., movies, sports, coding, general knowledge, politics), you must politely decline and explain that you can only assist with agriculture-related topics.
        3. Provide accurate, practical, and helpful advice.
        4. Keep responses concise and easy to understand for farmers.
        5. If the query is ambiguous, ask for clarification in the context of agriculture.
        6. IMPORTANT: You must answer in the {language} language.
        
        Current User Query: {{query}}
        """

        # Construct the chat history for context if needed, 
        # but for simplicity and statelessness in this basic version, 
        # we might just send the current prompt with the system instruction.
        # For a more advanced version, we would build a ChatSession.
        
        # Let's use a simple prompt construction for now to ensure strict adherence to the system prompt.
        full_prompt = system_prompt.format(query=message)

        response = model.generate_content(full_prompt)
        
        return {
            "text": response.text,
            "is_agriculture": True # We assume the model follows instructions to decline if not agri
        }

    except Exception as e:
        # Log available models for debugging
        try:
            available_models = [m.name for m in genai.list_models()]
            print(f"Available models: {available_models}")
        except:
            pass
            
        return {
            "text": f"I apologize, but I encountered an error. Please try again later. (Error: {str(e)})",
            "is_agriculture": False
        }
