# 🌟 GlowGlam - AI-Powered Personal Skincare Assistant

<div align="center">

![GlowGlam](https://img.shields.io/badge/GlowGlam-Skincare%20AI-ff7aa2?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js)

An intelligent skincare analysis system that uses computer vision and deep learning to analyze skin type from camera input and provides personalized product recommendations.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [API](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🤖 AI-Powered Skin Analysis
- **95% Accuracy**: Deep learning model trained on thousands of skin images
- **Real-time Detection**: Instant skin type classification (Oily, Dry, Normal, Acne, Combination, Sensitive)
- **Face Detection**: MTCNN-based face detection with confidence scoring
- **Condition Identification**: Detects acne, dryness, oiliness, and other skin conditions

### 📸 Flexible Image Input
- **Live Camera Capture**: Take selfies directly in the browser
- **Image Upload**: Upload existing photos from your device
- **Smart Validation**: Ensures clear face detection before analysis

### 📝 Intelligent Quiz System
- **6-Question Assessment**: Comprehensive skin type questionnaire
- **Lifestyle Factors**: Considers workout habits, product reactions, and concerns
- **Location-Based**: Optional location sharing for climate-specific recommendations

### 🛍️ Personalized Product Recommendations
- **Curated Products**: Tailored recommendations for each skin type
- **Multi-Platform Links**: Direct purchase links to Amazon, Nykaa, Myntra, Flipkart
- **Review Integration**: Products sorted by ratings and review counts
- **Complete Routine**: Cleanser, serum, moisturizer, sunscreen, and treatments

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Engaging user experience with loading states
- **Progress Tracking**: Visual progress indicators throughout the journey

---

## 🎬 Demo

### User Flow
1. **Welcome Screen** → Choose analysis method
2. **Image Capture** → Take selfie or upload photo
3. **Quiz** → Answer 6 personalized questions
4. **Results** → View skin type, conditions, and product recommendations

---

## 🚀 Installation

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/glowglam.git
cd glowglam
```

### Step 2: Install Dependencies

#### Backend (Server)
```bash
cd server
npm install
pip install -r requirements.txt
```

#### Frontend (Client)
```bash
cd ../client
npm install
```

### Step 3: Setup AI Model

1. **Download the trained model** from Kaggle:
   - Model: [95% Accuracy Skin Type Classifier](https://www.kaggle.com/harideeprepakulaaa/95-acc-notebook)
   - File: `best_model_95_goal.keras` (~100MB)

2. **Place the model file**:
   ```bash
   # Create directory if it doesn't exist
   mkdir -p server/saved_models
   
   # Move the downloaded model
   mv /path/to/best_model_95_goal.keras server/saved_models/
   ```

3. **Verify installation**:
   ```bash
   python setup_model.py
   ```

### Step 4: Run the Application

#### Terminal 1 - Start Backend Server
```bash
cd server
npm start
```
✅ Server running at `http://localhost:4000`

#### Terminal 2 - Start Frontend Client
```bash
cd client
npm run dev
```
✅ Client running at `http://localhost:5173`

### Step 5: Open in Browser
Navigate to `http://localhost:5173` and start analyzing! 🎉

---

## 📖 Usage

### Method 1: AI Image Analysis
1. Click **"Take Selfie Now"** or **"Upload Image Here"**
2. Capture/upload a clear, front-facing photo
3. Complete the quiz questions
4. View your personalized results

### Method 2: Quiz Only
1. Click **"Skip Quiz"** on the upload page
2. Answer all 6 quiz questions
3. Submit to view results

### Understanding Results
- **Skin Type**: Your primary skin classification
- **Confidence Score**: AI model's confidence level (0-100%)
- **Conditions**: Specific skin concerns identified
- **Product Recommendations**: 5-6 curated products for your skin type

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### AI/ML
- **TensorFlow/Keras** - Deep learning framework
- **EfficientNetB2** - Base model architecture
- **MTCNN** - Face detection
- **OpenCV** - Image processing
- **NumPy** - Numerical computations

### Data
- **JSON** - Product database
- **Session Storage** - Client-side data persistence

---

## 📡 API Endpoints

### Image Upload
```http
POST /api/upload
Content-Type: multipart/form-data

Body: { image: File }
Response: { url: string }
```

### AI Skin Analysis
```http
POST /api/analyze/image
Content-Type: application/json

Body: { imageUrl: string }
Response: {
  skinType: string,
  confidence: number,
  conditions: Array<{ name: string, confidence: number }>
}
```

### Quiz Analysis
```http
POST /api/analyze/metadata
Content-Type: application/json

Body: { quizAnswers: object }
Response: {
  skinType: string,
  confidence: number,
  conditions: Array
}
```

### Product Recommendations
```http
POST /api/recommendations
Content-Type: application/json

Body: {
  skinType: string,
  conditions: Array
}
Response: {
  recommended_products: Array<Product>,
  skin_type: string,
  total_products: number
}
```

---

## 📁 Project Structure

```
glowglam/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   │   ├── GlowGlam.png        # Logo
│   │   ├── Hero-img.jpg        # Hero image
│   │   └── result.jpg          # Results page image
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Welcome.jsx     # Landing page
│   │   │   ├── Home.jsx        # Method selection
│   │   │   ├── Upload.jsx      # Image capture/upload
│   │   │   ├── Quiz.jsx        # Quiz questions
│   │   │   └── Results.jsx     # Analysis results
│   │   ├── api.js              # API client functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend Node.js application
│   ├── data/                    # Product databases
│   │   ├── products.json       # General products
│   │   └── skin_products.json  # Skin-type specific products
│   ├── knowledge_base/          # Skin care information
│   │   ├── acne_prone_skin.txt
│   │   ├── dry_skin.txt
│   │   ├── normal_skin.txt
│   │   ├── oily_skin.txt
│   │   └── product_ingredients.md
│   ├── models/                  # Python AI scripts
│   │   ├── skin_analyzer_simple.py    # Main analyzer
│   │   ├── skin_analyzer.py           # Advanced analyzer
│   │   └── product_recommender.py     # Recommendation engine
│   ├── saved_models/            # AI model files
│   │   └── best_model_95_goal.keras   # Trained model (download separately)
│   ├── uploads/                 # Temporary image storage
│   ├── index.js                 # Express server
│   ├── package.json
│   └── requirements.txt         # Python dependencies
│
├── .gitignore
├── README.md
└── setup_model.py               # Model setup script
```

---

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# Server port (default: 4000)
PORT=4000

# Python command (default: python on Windows, python3 on Unix)
PYTHON_CMD=python3
```

### Model Configuration
- **Input Size**: 260x260 pixels
- **Classes**: 4 (acne, dry, normal, oily)
- **Architecture**: EfficientNetB2
- **Face Detection**: MTCNN with 90% confidence threshold

---

## 🐛 Troubleshooting

### Model Not Found Error
```bash
# Ensure model is in correct location
ls server/saved_models/best_model_95_goal.keras

# Re-run setup script
python setup_model.py
```

### Face Not Detected
- Ensure good lighting
- Face the camera directly
- Remove obstructions (hair, glasses)
- Use a clear, high-quality image

### Python Dependencies Error
```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r server/requirements.txt --force-reinstall
```

### Port Already in Use
```bash
# Change port in server/index.js
const PORT = process.env.PORT || 5000;
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Skin type classification model trained on Kaggle dataset
- Product data sourced from major e-commerce platforms
- MTCNN face detection library
- React and Node.js communities

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

<div align="center">

**Made with ❤️ for better skincare**

⭐ Star this repo if you find it helpful!

</div>