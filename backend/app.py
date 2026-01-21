"""
Flask server with emotion detection and text-to-speech synthesis.
Uses transformers for emotion detection and edge-tts for speech generation.
"""

import os
import asyncio
import json
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import pipeline
import edge_tts
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize emotion detection pipeline
print("Loading emotion detection model...")
emotion_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    device=-1  # CPU, use 0 for GPU
)

# Output directory for audio files
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Emotion to voice parameter mapping
EMOTION_MAPPING = {
    'joy': {'pitch': '+20Hz', 'rate': '+30%'},
    'sadness': {'pitch': '-15Hz', 'rate': '-25%'},
    'anger': {'pitch': '+10Hz', 'rate': '+50%'},
    'neutral': {'pitch': '+0Hz', 'rate': '+0%'},
    'fear': {'pitch': '+15Hz', 'rate': '+20%'},
    'disgust': {'pitch': '-10Hz', 'rate': '-15%'},
    'surprise': {'pitch': '+25Hz', 'rate': '+15%'},
}

def calculate_voice_params(emotion: str, confidence: float) -> dict:
    """
    Advanced Intensity Scaling using non-linear quadratic mapping.
    Research-backed prosody adjustment based on emotional confidence.
    
    Applies quadratic scaling: multiplier = 1.0 + (confidence ** 2)
    High-confidence emotions (>0.85) receive 1.4x boost for maximum impact.
    
    Args:
        emotion: Detected emotion label
        confidence: Confidence score (0.0-1.0)
    
    Returns:
        Dictionary with pitch, rate, and volume adjustments for TTS
    """
    base_params = EMOTION_MAPPING.get(emotion, EMOTION_MAPPING['neutral'])
    
    # Non-linear quadratic scaling for natural prosody curves
    # confidence^2 creates exponential emotional intensity at high confidence
    multiplier = 1.0 + (confidence ** 2)
    
    # Apply 1.4x boost for high-confidence emotions (confidence > 0.85)
    if confidence > 0.85:
        multiplier *= 1.4
    
    # Parse and scale Pitch (in Hz)
    pitch_value = int(base_params['pitch'].replace('Hz', ''))
    scaled_pitch = int(pitch_value * multiplier)
    
    # Parse and scale Rate (in percentage)
    rate_value = int(base_params['rate'].replace('%', ''))
    scaled_rate = int(rate_value * multiplier)
    
    # Volume scaling based on confidence threshold
    volume = '+0%' if confidence < 0.8 else '+15%'
    
    return {
        'pitch': f'{scaled_pitch:+d}Hz',
        'rate': f'{scaled_rate:+d}%',
        'volume': volume
    }

async def generate_speech(text: str, emotion: str, confidence: float) -> str:
    """
    Generate speech audio file using edge-tts with emotion-based parameters.
    Uses pitch and rate parameters for prosody instead of SSML markup.
    
    Args:
        text: Text to synthesize
        emotion: Detected emotion
        confidence: Confidence score
    
    Returns:
        Path to generated audio file
    """
    voice_params = calculate_voice_params(emotion, confidence)
    
    # Use plain text - edge-tts prosody handled via pitch/rate parameters
    ssml_text = text.strip()
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"audio_{emotion}_{timestamp}.mp3"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # Create TTS communication object with SSML and dynamic parameters
    communicate = edge_tts.Communicate(
        text=ssml_text,
        voice="en-US-AriaNeural",
        pitch=voice_params['pitch'],
        rate=voice_params['rate']
    )
    
    # Save audio file
    await communicate.save(filepath)
    
    return filename

@app.route('/')
def home():
    """Root endpoint."""
    return jsonify({'message': 'Welcome to Emotion Detection & Speech Synthesis API'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

@app.route('/process', methods=['POST'])
def process_emotion():
    """
    Process text for emotion detection and generate speech.
    
    Expected JSON body:
    {
        "text": "Your text here"
    }
    
    Returns:
    {
        "emotion": "joy",
        "confidence": 0.95,
        "audio_url": "/outputs/audio_joy_20260121_123456.mp3"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing "text" field in request body'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Text field cannot be empty'}), 400
        
        # Detect emotion using transformer model
        result = emotion_pipeline(text)
        emotion = result[0]['label']
        confidence = round(result[0]['score'], 4)
        
        # Windows async fix: Manual event loop management to prevent 'Event loop is closed' errors
        # This approach is more stable on Windows than asyncio.run()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            filename = loop.run_until_complete(generate_speech(text, emotion, confidence))
        finally:
            loop.close()
        
        return jsonify({
            'emotion': emotion,
            'confidence': confidence,
            'audio_url': f'/outputs/{filename}',
            'text': text
        }), 200
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/outputs/<filename>', methods=['GET'])
def get_audio(filename: str):
    """
    Serve audio files from outputs directory.
    """
    from flask import send_from_directory
    try:
        return send_from_directory(OUTPUT_DIR, filename)
    except FileNotFoundError:
        return jsonify({'error': 'Audio file not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
