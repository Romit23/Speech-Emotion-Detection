from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import torch

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

device = 0 if torch.cuda.is_available() else -1

# Load the emotion detection model
emotion_model = pipeline("text2text-generation", model="mrm8488/t5-base-finetuned-emotion", device=device)

# Define request body model
class TextRequest(BaseModel):
    text: str

@app.post("/emotion")
async def detect_emotion(request: TextRequest):
    text = request.text
    result = emotion_model(text, max_length=2)
    emotion = result[0]['generated_text']
    return {"emotion": emotion}