#!/usr/bin/env python3
"""
Setup script to download and place the trained model
Run this after downloading your model from Kaggle
"""

import os
import shutil
import sys

def setup_model():
    model_source = "best_model_95_goal.keras"  # Your model file
    model_dest = "server/models/best_model_95_goal.keras"
    
    if os.path.exists(model_source):
        print(f"Moving {model_source} to {model_dest}")
        shutil.move(model_source, model_dest)
        print("Model setup complete!")
    else:
        print(f"Model file {model_source} not found.")
        print("Please download your model from Kaggle and place it in this directory.")
        print("Then run this script again.")
        return False
    
    return True

def install_dependencies():
    print("Installing Python dependencies...")
    os.system("pip install -r server/requirements.txt")

if __name__ == "__main__":
    print("Setting up GlowGlam AI models...")
    
    if setup_model():
        install_dependencies()
        print("\nSetup complete! You can now run:")
        print("1. cd server && npm start")
        print("2. cd client && npm run dev")
    else:
        sys.exit(1)