import os
import json
import hashlib
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pymupdf as fitz
import uvicorn
from dotenv import load_dotenv

# Database & AI
from tinydb import TinyDB
from google import genai
from google.genai import types

# Twilio SMS
from twilio.rest import Client

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Twilio Credentials
TWILIO_ACCOUNT_SID = "your_account_sid" 
TWILIO_AUTH_TOKEN = "your_actual_copied_32_char_token"
TWILIO_PHONE_NUMBER = "+17372508034"
app = FastAPI(title="Contract Risk Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = TinyDB('contracts_nosql.json')

# ---------------- SMS ALERT LOGIC (UPDATED) ----------------
def send_high_risk_sms(filename, risk_score, target_phone):
    if not target_phone:
        print("[SMS CANCELLED] No phone number was provided by the user.")
        return False

    message_body = f"🚨 ContractIQ ALERT: '{filename}' flagged as HIGH RISK ({risk_score}/10). Immediate legal review required."
    print(f"\n[SMS SYSTEM TRIGGERED] Attempting to send to {target_phone}: {message_body}")
    
    try:
        if TWILIO_ACCOUNT_SID == "your_account_sid":
            print(f"[SMS SIMULATION] Twilio keys not set. Simulating SMS sent to {target_phone}.")
            return True
            
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = twilio_client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=target_phone
        )
        print(f"[SMS SUCCESS] Message sent. SID: {message.sid}")
        return True
    except Exception as e:
        print(f"[SMS FAILED] Error: {str(e)}")
        return False

# ---------------- API ENDPOINTS ----------------
@app.get("/")
def read_root():
    return {"message": "Contract AI API is running with NoSQL, Signatures & SMS enabled."}

@app.post("/analyze-contract/")
async def analyze_contract(file: UploadFile = File(...), phone: str = Form(None)):
    print(f"\n--- NEW UPLOAD DETECTED: {file.filename} ---")
    try:
        print("1. Reading file...")
        file_content = await file.read()
        
        print("2. Generating digital signature...")
        digital_signature = hashlib.sha256(file_content).hexdigest()
        
        print("3. Extracting text with OCR (PyMuPDF)...")
        doc = fitz.open(stream=file_content, filetype="pdf")
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()
        doc.close()
        
        print("4. Sending to Gemini AI...")
        prompt = f"""
        You are an expert legal AI assistant. Analyze the following contract or document text.
        Extract the information and format your response strictly as a JSON object with the following keys:
        - "summary": A 2-3 sentence plain English summary of the document.
        - "obligations": A list of key commitments, payment duties, or services required.
        - "deadlines": A list of important dates, expiry dates, or renewal dates.
        - "risk_score": A number from 1 to 10 indicating the legal or financial risk (10 being highest).
        - "risk_explanation": A brief explanation of why you gave that risk score.
        
        Document Text:
        {extracted_text}
        """

        response = client.models.generate_content(
            model='gemini-3.6-flash', 
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        print("5. AI Analysis Complete! Parsing JSON...")
        ai_data = json.loads(response.text)
        
        print("6. Checking Risk Level for SMS Alert...")
        risk_score = ai_data.get("risk_score", 0)
        if risk_score >= 7:
            # Pass the dynamically entered phone number to the SMS function
            send_high_risk_sms(file.filename, risk_score, phone)
        else:
            print(f"   -> Risk Score is {risk_score}. No SMS required.")
        
        print("7. Saving to NoSQL Database...")
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        document_record = {
            "filename": file.filename,
            "digital_signature": digital_signature,
            "upload_timestamp": current_time,
            "ai_analysis": ai_data 
        }
        db.insert(document_record)
        
        print("--- PROCESS FINISHED SUCCESSFULLY ---\n")
        return {
            "filename": file.filename,
            "digital_signature": digital_signature,
            "database_status": "Successfully logged to NoSQL Database",
            "analysis": ai_data
        }
        
    except Exception as e:
        print(f"!!! ERROR DURING PROCESSING !!!\n{str(e)}\n")
        return {"error": f"AI Processing failed: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)