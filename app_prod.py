# Production Flask app configuration
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Production configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    
    # Enable CORS with production settings
    CORS(app, origins=[
        "https://your-app-name.vercel.app",  # Replace with your Vercel domain
        "http://localhost:3000",  # For local development
    ])
    
    # Set up directories
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    EDITED_FOLDER = os.environ.get('EDITED_FOLDER', 'edited')
    HTML_FOLDER = os.environ.get('HTML_FOLDER', 'saved_html')
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(EDITED_FOLDER, exist_ok=True)
    os.makedirs(HTML_FOLDER, exist_ok=True)
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['EDITED_FOLDER'] = EDITED_FOLDER
    app.config['HTML_FOLDER'] = HTML_FOLDER
    
    return app

# Import your existing app routes here
# from app import *  # This will import all your existing routes
