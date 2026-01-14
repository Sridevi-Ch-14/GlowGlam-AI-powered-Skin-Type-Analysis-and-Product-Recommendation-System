# GlowGlam - AI Skin Type Analysis & Product Recommendation System

Web application using deep learning to analyze skin types from facial images and recommend personalized skincare products.

## Features

- AI-powered skin type classification (95% accuracy)
- Real-time camera capture and image upload
- 6-question assessment quiz
- Personalized product recommendations from Amazon, Nykaa, Myntra, Flipkart
- Responsive web interface

## Tech Stack

**Frontend:** React 18, Vite, React Router  
**Backend:** Node.js, Express.js  
**AI/ML:** TensorFlow/Keras, EfficientNetB2, MTCNN, OpenCV  

## Installation

### Prerequisites
- Node.js 16+
- Python 3.8+

### Setup

```bash
# Clone repository
git clone https://github.com/Sridevi-Ch-14/GlowGlam-AI-powered-Skin-Type-Analysis-and-Product-Recommendation-System.git
cd GlowGlam-AI-powered-Skin-Type-Analysis-and-Product-Recommendation-System

# Install dependencies
cd server && npm install && pip install -r requirements.txt
cd ../client && npm install

# Download model from Kaggle and place in server/saved_models/
# https://www.kaggle.com/harideeprepakulaaa/95-acc-notebook

# Start application
cd server && npm start        # Terminal 1 - http://localhost:4000
cd client && npm run dev      # Terminal 2 - http://localhost:5173
```

## API Endpoints

```
POST /api/upload              - Upload image
POST /api/analyze/image       - Analyze skin type from image
POST /api/analyze/metadata    - Analyze from quiz answers
POST /api/recommendations     - Get product recommendations
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
│   ├── models/      # Python ML scripts
│   ├── data/        # Product database
│   └── saved_models/# AI model (download separately)
└── setup_model.py
```

## License

MIT License
