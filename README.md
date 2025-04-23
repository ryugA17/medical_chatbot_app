# Medical Symptom Analyzer

A medical symptom analyzer chatbot with a Flask backend and a custom HTML/CSS/JavaScript frontend.

## Features

- Chat interface for symptom analysis
- Possible condition identification with severity levels
- Doctor recommendations based on symptoms
- Searchable database of healthcare professionals
- Responsive design for all devices

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- Groq API key (for the language model)

### Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd medical_chatbot_app
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root directory with your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Place the `doctors_database.csv` file in the project root directory. If you're migrating from the Streamlit version, you can copy it from there.

## Running the Application

Start the Flask server:

```
python app.py
```

Then open your web browser and navigate to:
```
http://127.0.0.1:5000
```

## Usage

1. **Symptom Analysis:**
   - Enter your symptoms in the chat interface
   - Click the send button or press Enter
   - View the analysis results including possible conditions and recommended doctors

2. **Doctor Directory:**
   - Click on "Our Doctors" in the navigation
   - Search for doctors by name or specialization
   - Filter doctors by specialty
   - View doctor details and contact information

## Technology Stack

- **Backend:** Flask, Python
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **AI Model:** Groq's Llama 3.3 70B (via Groq API)

## File Structure

```
medical_chatbot_app/
│
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── doctors_database.csv    # Database of doctors
├── .env                    # Environment variables (API keys)
│
├── static/
│   ├── css/
│   │   └── style.css       # Application styling
│   ├── js/
│   │   └── main.js         # Frontend functionality
│   └── images/             # Image assets
│
└── templates/
    └── index.html          # Main HTML template
```

## Notes

- This application is for demonstration purposes only
- Medical advice provided by AI models should not replace professional medical consultation
- Always consult with a healthcare professional for medical concerns 