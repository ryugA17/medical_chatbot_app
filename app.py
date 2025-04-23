import os
import json
import pandas as pd
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client with API key from .env
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("Warning: GROQ_API_KEY not found in environment variables. Please add it to your .env file.")

# Initialize Groq client
client = Groq(api_key=groq_api_key)

# Function to load doctors database from CSV
def load_doctors_database():
    try:
        # Try to load from CSV file
        df = pd.read_csv("doctors_database.csv")
        # Convert DataFrame to list of dictionaries
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error loading doctors database: {e}")
        # Return a default database as fallback
        return [
            {"name": "Dr. Alice Johnson", "specialization": "Cardiology", "experience": "15 years", "contact": "555-0123"},
            {"name": "Dr. Robert Smith", "specialization": "Neurology", "experience": "12 years", "contact": "555-0124"},
            {"name": "Dr. Jennifer Garcia", "specialization": "General Practice", "experience": "8 years", "contact": "555-0133"},
        ]

# Load doctors database
DOCTORS_DATABASE = load_doctors_database()

def generate_medical_response(symptoms):
    """Use Groq API to analyze symptoms and recommend doctors"""
    
    system_prompt = f"""
    You are a medical assistant chatbot designed to provide preliminary analysis of symptoms.
    
    Your responsibilities are:
    1. Analyze the symptoms provided by the user
    2. Identify possible conditions that match these symptoms (list 2-4 possibilities with varying levels of severity)
    3. Suggest general treatment approaches for each condition
    4. Recommend which type of specialist the user should consult
    5. Recommend specific doctors from the database based on the appropriate specialization

    Always include appropriate medical disclaimers and encourage seeking professional medical advice.
    
    Doctor database: {json.dumps(DOCTORS_DATABASE)}
    
    IMPORTANT: Your response must be in valid JSON format with the following structure:
    {{
        "possible_conditions": [
            {{
                "condition": "Name of condition",
                "likelihood": "low/medium/high",
                "description": "Brief description",
                "general_treatment": "General treatment approaches",
                "recommended_specialist": "Type of specialist"
            }}
        ],
        "recommended_doctors": [
            {{
                "name": "Doctor name",
                "specialization": "Doctor specialization",
                "experience": "Experience",
                "contact": "Contact info"
            }}
        ],
        "general_advice": "General advice about the symptoms",
        "disclaimer": "Medical disclaimer"
    }}
    """
    user_message = f"Analyze these symptoms: {symptoms}"
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_completion_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        return {
            "error": f"An error occurred: {str(e)}",
            "possible_conditions": [],
            "recommended_doctors": [],
            "general_advice": "Unable to analyze symptoms at this time.",
            "disclaimer": "This is not medical advice. Please consult a healthcare professional."
        }

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_symptoms():
    """API endpoint to analyze symptoms"""
    data = request.json
    symptoms = data.get('symptoms', '')
    
    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400
    
    result = generate_medical_response(symptoms)
    return jsonify(result)

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """API endpoint to get all doctors"""
    return jsonify(DOCTORS_DATABASE)

@app.route('/api/doctors/search', methods=['GET'])
def search_doctors():
    """API endpoint to search for doctors"""
    search_term = request.args.get('q', '').lower()
    specialty = request.args.get('specialty', '')
    
    filtered_doctors = DOCTORS_DATABASE
    
    if search_term:
        filtered_doctors = [doc for doc in filtered_doctors if search_term in doc["name"].lower() or 
                           (doc.get("specialization") and search_term in doc["specialization"].lower())]
    
    if specialty and specialty != "All Specialties":
        filtered_doctors = [doc for doc in filtered_doctors if doc.get("specialization") == specialty]
    
    return jsonify(filtered_doctors)

if __name__ == '__main__':
    # Copy the doctors database from the original project if it exists
    if not os.path.exists('doctors_database.csv') and os.path.exists('../Medical_chatbot/doctors_database.csv'):
        try:
            import shutil
            shutil.copy('../Medical_chatbot/doctors_database.csv', 'doctors_database.csv')
            print("Copied doctors_database.csv from original project")
        except Exception as e:
            print(f"Error copying doctors database: {e}")
    
    # Create a .env file with the Groq API key if not exists
    if not os.path.exists('.env') and os.path.exists('../Medical_chatbot/.env'):
        try:
            import shutil
            shutil.copy('../Medical_chatbot/.env', '.env')
            print("Copied .env file from original project")
        except Exception as e:
            print(f"Error copying .env file: {e}")
    
    app.run(debug=True) 