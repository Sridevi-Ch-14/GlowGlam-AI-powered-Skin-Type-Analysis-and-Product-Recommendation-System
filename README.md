# 🌟 GlowGlam - AI-Powered Personal Skincare Assistant

<div align="center">
An intelligent skincare analysis system that uses computer vision and deep learning to analyze skin type from camera input and provides personalized product recommendations.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [API](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🤖 AI-Powered Skin Analysis
- **95% Accuracy**: Deep learning model trained on thousands of skin images
- **GlowGlam - AI-Powered Skin Type Analysis and Product Recommendation System

A web-based application that leverages deep learning and computer vision to analyze skin types from facial images and provide personalized skincare product recommendations.

## Overview

GlowGlam is an intelligent skincare analysis platform that combines artificial intelligence with a comprehensive product recommendation engine. The system uses a trained deep learning model to classify skin types with 95% accuracy and suggests appropriate skincare products based on the analysis results.

## Key Features

### AI-Powered Skin Analysis
- Deep learning model trained on extensive skin image datasets
- Real-time skin type classification (Oily, Dry, Normal, Acne, Combination, Sensitive)
- MTCNN-based facial detection with confidence scoring
- Automated identification of skin conditions

### Image Input Methods
- Live camera capture for real-time analysis
- Image upload functionality
- Facial detection validation before processing

### Assessment Quiz
- Six-question comprehensive skin evaluation
- Lifestyle and environmental factor consideration
- Optional location-based recommendations

### Product Recommendation Engine
- Personalized product suggestions based on skin type
- Integration with major e-commerce platforms (Amazon, Nykaa, Myntra, Flipkart)
- Review-based product ranking
- Complete skincare routine recommendations

### User Interface
- Responsive design for all devices
- Intuitive navigation and progress tracking
- Modern, accessible interface

## System Architecture

The application follows a client-server architecture:

- **Frontend**: React-based single-page application
- **Backend**: Node.js/Express REST API
- **AI Engine**: Python-based TensorFlow/Keras model
- **Data Storage**: JSON-based product database

## Installation

### System Requirements
- Node.js 16.x or higher
- Python 3.8 or higher
- Git

### Setup Instructions

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/Sridevi-Ch-14/GlowGlam-AI-powered-Skin-Type-Analysis-and-Product-Recommendation-System.git
cd GlowGlam-AI-powered-Skin-Type-Analysis-and-Product-Recommendation-System
```

#### 2. Install Dependencies

**Backend Server:**
```bash
cd server
npm install
pip install -r requirements.txt
```

**Frontend Client:**
```bash
cd ../client
npm install
```

#### 3. Configure AI Model

1. Download the trained model from [Kaggle](https://www.kaggle.com/harideeprepakulaaa/95-acc-notebook)
2. Place `best_model_95_goal.keras` in `server/saved_models/`
3. Verify installation:
```bash
python setup_model.py
```

#### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```
Server will run on http://localhost:4000

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
Client will run on http://localhost:5173

#### 5. Access the Application
Open your browser and navigate to http://localhost:5173

## Usage

### Image-Based Analysis
1. Select image capture or upload option
2. Provide a clear, front-facing facial photograph
3. Complete the assessment questionnaire
4. Review analysis results and product recommendations

### Quiz-Based Analysis
1. Navigate to quiz section
2. Answer all assessment questions
3. Submit for analysis
4. Review results and recommendations

### Analysis Results
- Primary skin type classification
- Confidence score (0-100%)
- Identified skin conditions
- Personalized product recommendations

## Technology Stack

## Technology Stack

### Frontend
- React 18 - Component-based UI framework
- Vite - Build tool and development server
- React Router - Client-side routing
- CSS3 - Styling and animations

### Backend
- Node.js - JavaScript runtime environment
- Express.js - Web application framework
- Multer - Multipart form data handling
- CORS - Cross-origin resource sharing

### Machine Learning
- TensorFlow/Keras - Deep learning framework
- EfficientNetB2 - Convolutional neural network architecture
- MTCNN - Multi-task Cascaded Convolutional Networks for face detection
- OpenCV - Computer vision library
- NumPy - Numerical computing library

### Data Management
- JSON - Product database storage
- Session Storage - Client-side state management

## API Documentation

## API Documentation

### Endpoints

#### Image Upload
```http
POST /api/upload
Content-Type: multipart/form-data

Request Body: { image: File }
Response: { url: string }
```

#### Skin Type Analysis
```http
POST /api/analyze/image
Content-Type: application/json

Request Body: { imageUrl: string }
Response: {
  skinType: string,
  confidence: number,
  conditions: Array<{ name: string, confidence: number }>
}
```

#### Quiz-Based Analysis
```http
POST /api/analyze/metadata
Content-Type: application/json

Request Body: { quizAnswers: object }
Response: {
  skinType: string,
  confidence: number,
  conditions: Array
}
```

#### Product Recommendations
```http
POST /api/recommendations
Content-Type: application/json

Request Body: {
  skinType: string,
  conditions: Array
}
Response: {
  recommended_products: Array<Product>,
  skin_type: string,
  total_products: number
}
```

## Project Structure

## Project Structure

```
glowglam/
├── client/                      # Frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── api.js              # API client
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Application entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend application
│   ├── data/                    # Product databases
│   ├── knowledge_base/          # Skincare information
│   ├── models/                  # Python ML scripts
│   │   ├── skin_analyzer_simple.py
│   │   ├── skin_analyzer.py
│   │   └── product_recommender.py
│   ├── saved_models/            # Trained ML models
│   ├── uploads/                 # Temporary image storage
│   ├── index.js                 # Express server
│   ├── package.json
│   └── requirements.txt
│
├── .gitignore
├── README.md
└── setup_model.py
```

## Configuration

### Environment Variables
```bash
PORT=4000                    # Server port (default: 4000)
PYTHON_CMD=python3           # Python command
```

### Model Configuration
- Input dimensions: 260x260 pixels
- Classification classes: 4 (acne, dry, normal, oily)
- Base architecture: EfficientNetB2
- Face detection threshold: 90% confidence

## Troubleshooting

### Common Issues

**Model Not Found**
```bash
ls server/saved_models/best_model_95_goal.keras
python setup_model.py
```

**Face Detection Failure**
- Ensure adequate lighting
- Position face directly toward camera
- Remove obstructions (hair, accessories)
- Use high-quality images

**Python Dependencies**
```bash
pip install --upgrade pip
pip install -r server/requirements.txt --force-reinstall
```

**Port Conflicts**
```bash
# Modify server/index.js
const PORT = process.env.PORT || 5000;
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push to your fork
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Kaggle dataset for model training
- E-commerce platforms for product data
- MTCNN library for face detection
- Open-source community contributions
