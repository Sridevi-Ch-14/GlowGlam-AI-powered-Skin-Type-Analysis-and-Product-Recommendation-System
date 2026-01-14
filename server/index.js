const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// Increase body size limit to handle larger image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Setup Upload Directory ---
// Ensure the 'uploads' directory exists for temporary file storage.
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Configure multer with file size limit (10MB)
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB in bytes
  }
});

// --- Data & Product Endpoints ---
// In-memory store for demo
const submissions = [];

// Load product catalog from a JSON file.
const products = require('./data/products.json');

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/recommendations', (req, res) => {
  const { skinType, conditions } = req.body;
  if (!skinType) return res.status(400).json({ error: 'Skin type required' });
  
  console.log(`\n📦 Product Recommendations Request`);
  console.log(`Skin Type: ${skinType}`);
  console.log(`Conditions: ${JSON.stringify(conditions || [])}`);
  
  const pythonCmd = process.platform === 'win32' ? 'python' : (process.env.PYTHON_CMD || 'python3');
  const scriptPath = path.join(__dirname, 'models', 'product_recommender.py');
  
  const python = spawn(pythonCmd, [
    scriptPath,
    skinType,
    JSON.stringify(conditions || [])
  ], {
    cwd: __dirname,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });
  
  let result = '';
  let errorData = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    errorData += data.toString();
  });
  
  python.on('close', (code) => {
    if (code === 0) {
      try {
        const recommendations = JSON.parse(result);
        console.log(`✓ Found ${recommendations.total_products || 0} products for ${skinType}`);
        res.json(recommendations);
      } catch (e) {
        console.error('Failed to parse recommendations:', e.message);
        console.error('Raw output:', result.substring(0, 500));
        res.status(500).json({ 
          error: 'Failed to parse recommendations',
          details: result.substring(0, 200)
        });
      }
    } else {
      console.error(`Python script exited with code ${code}`);
      console.error('Stderr:', errorData);
      res.status(500).json({ 
        error: 'Recommendation system failed',
        details: errorData || result
      });
    }
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('Upload request received');
  console.log('File in request:', !!req.file);
  if (req.file) {
    console.log('File details:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  }
  
  if (!req.file) {
    console.error('No file in upload request');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return a relative URL path that the client can use.
  const url = `/uploads/${req.file.filename}`;
  console.log('Upload successful, returning URL:', url);
  res.json({ url });
});

// Serve uploaded files statically so the client can access them via the URL.
app.use('/uploads', express.static(UPLOAD_DIR));


// --- AI Image Analysis Endpoint (UPGRADED) ---
app.post('/api/analyze/image', (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
  
  // Construct absolute paths for the model and the temporary image file.
  // Remove leading slash from imageUrl to properly join paths on all platforms
  const imagePath = path.join(__dirname, imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl);
  const modelPath = path.join(__dirname, 'saved_models', 'best_model_95_goal.keras');
  
  console.log('Analyzing image:', imagePath);
  console.log('Using model:', modelPath);
  
  // --- Robust Error Handling ---
  // Check if files exist before calling the Python script.
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: `Image file not found at path: ${imagePath}` });
  }
  if (!fs.existsSync(modelPath)) {
    return res.status(500).json({ error: `AI model not found at path: ${modelPath}. Please ensure the trained model is placed in the 'server/saved_models' directory.` });
  }

  // --- Spawn Python Child Process ---
  // Call skin_analyzer.py with the correct model and image paths as arguments.
  // Try 'python' first, fallback to 'python3' if needed (for cross-platform compatibility)
  const pythonCmd = process.platform === 'win32' ? 'python' : (process.env.PYTHON_CMD || 'python3');
  
  // Use absolute paths to avoid any path resolution issues
  const scriptPath = path.join(__dirname, 'models', 'skin_analyzer_simple.py');
  const absoluteModelPath = path.resolve(modelPath);
  const absoluteImagePath = path.resolve(imagePath);
  
  console.log('\n' + '='.repeat(80));
  console.log('📸 NEW IMAGE ANALYSIS REQUEST');
  console.log('='.repeat(80));
  console.log('Image path:', imagePath);
  console.log('Model path:', modelPath);
  console.log('Python command:', pythonCmd);
  console.log('Script path:', scriptPath);
  console.log('Absolute model path:', absoluteModelPath);
  console.log('Absolute image path:', absoluteImagePath);
  console.log('Image exists:', fs.existsSync(imagePath));
  console.log('Model exists:', fs.existsSync(modelPath));
  console.log('='.repeat(80));
  
  const python = spawn(pythonCmd, [
    scriptPath, 
    absoluteModelPath, 
    absoluteImagePath
  ], {
    cwd: __dirname,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });
  
  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  let errorData = '';
  python.stderr.on('data', (data) => {
    // Capture any errors from the Python script for better debugging.
    errorData += data.toString();
  });
  
  python.on('close', (code) => {
    console.log('\n' + '='.repeat(80));
    console.log('PYTHON SCRIPT EXECUTION COMPLETE');
    console.log('='.repeat(80));
    console.log(`Exit code: ${code}`);
    console.log(`Stdout length: ${result.length} characters`);
    console.log(`Stderr length: ${errorData.length} characters`);
    
    if (errorData.length > 0) {
      console.log('\n--- STDERR OUTPUT (Python errors/warnings) ---');
      console.log(errorData);
      console.log('--- END STDERR ---\n');
    }
    
    if (result.length > 0) {
      console.log('\n--- STDOUT OUTPUT (Python script output) ---');
      // Show first 500 and last 500 chars if output is long
      if (result.length > 1000) {
        console.log('First 500 chars:', result.substring(0, 500));
        console.log('... (output truncated) ...');
        console.log('Last 500 chars:', result.substring(result.length - 500));
      } else {
        console.log(result);
      }
      console.log('--- END STDOUT ---\n');
    } else {
      console.log('WARNING: Python script produced NO stdout output!');
    }
    
    if (code !== 0) {
      // If the Python script exited with an error.
      console.error(`\n❌ Python script exited with error code ${code}`);
      console.error('This usually means the Python script crashed or encountered an error.');
      // Don't delete the image if analysis failed - might need for debugging
      return res.status(500).json({ 
        error: 'Model analysis failed.', 
        details: errorData || result,
        exitCode: code
      });
    }
    
    // --- Cleanup ---
    // Delete the temporary uploaded image after successful processing.
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (unlinkErr) {
        console.warn('Failed to delete temporary image:', unlinkErr);
      }
    }
    
    // --- Success ---
    // Try to parse the JSON output from the Python script.
    try {
      console.log('Attempting to parse Python script output...');
      
      // Simple JSON extraction from output
      const lines = result.trim().split('\n').filter(line => line.trim().length > 0);
      console.log(`Total lines in output: ${lines.length}`);
      
      let jsonLine = null;
      
      // Find the last line that looks like JSON
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            JSON.parse(line);
            jsonLine = line;
            console.log(`Found valid JSON at position ${i}`);
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (!jsonLine) {
        console.error('No JSON output found');
        throw new Error('No JSON output found');
      }
      
      console.log('\n--- FOUND JSON RESULT ---');
      console.log('JSON length:', jsonLine.length, 'characters');
      console.log('JSON preview (first 200 chars):', jsonLine.substring(0, 200) + '...');
      console.log('--- END JSON PREVIEW ---\n');
      
      const analysis = JSON.parse(jsonLine);
      console.log('✓ JSON parsed successfully');
      
      if (analysis.error) {
        // Handle application-level errors returned by the Python script (e.g., "Face not detected").
        console.error('\n❌ ANALYSIS ERROR (from Python script):');
        console.error('Error message:', analysis.error);
        if (analysis.traceback) {
          console.error('Traceback:', analysis.traceback);
        }
        console.log('='.repeat(80) + '\n');
        return res.status(400).json(analysis);
      }
      
      // Verify the analysis result has required fields
      if (!analysis.skinType) {
        console.error('\n❌ ANALYSIS RESULT MISSING REQUIRED FIELDS:');
        console.error('Full analysis object:', JSON.stringify(analysis, null, 2));
        console.log('='.repeat(80) + '\n');
        return res.status(500).json({ error: 'Model analysis returned incomplete result', details: analysis });
      }
      
      console.log('\n✅ ANALYSIS SUCCESSFUL!');
      console.log('Result:', {
        skinType: analysis.skinType,
        confidence: analysis.confidence,
        conditionsCount: analysis.conditions?.length || 0
      });
      if (analysis.debug) {
        console.log('Debug info available:', Object.keys(analysis.debug));
        if (analysis.debug.all_confidences) {
          console.log('All class probabilities:', analysis.debug.all_confidences);
        }
      }
      console.log('='.repeat(80) + '\n');
      res.json(analysis);
    } catch (e) {
      // Handle cases where the output is not valid JSON.
      console.error('\n' + '='.repeat(80));
      console.error('❌ JSON PARSING FAILED');
      console.error('='.repeat(80));
      console.error(`Parse error: ${e.message}`);
      console.error(`Raw output length: ${result.length} characters`);
      console.error(`Stderr length: ${errorData.length} characters`);
      
      if (errorData.length > 0) {
        console.error('\n--- FULL STDERR OUTPUT ---');
        console.error(errorData);
        console.error('--- END STDERR ---');
      }
      
      if (result.length > 0) {
        console.error('\n--- FULL STDOUT OUTPUT ---');
        // Show full output if reasonable size, otherwise show chunks
        if (result.length < 5000) {
          console.error(result);
        } else {
          console.error('First 2000 chars:', result.substring(0, 2000));
          console.error('... (truncated) ...');
          console.error('Last 2000 chars:', result.substring(result.length - 2000));
        }
        console.error('--- END STDOUT ---');
      } else {
        console.error('WARNING: Python script produced NO stdout output!');
      }
      
      console.error('='.repeat(80) + '\n');
      
      res.status(500).json({ 
        error: 'Failed to parse analysis result from the model.', 
        details: result.length > 1000 ? result.substring(0, 1000) : result,
        stderr: errorData.length > 500 ? errorData.substring(0, 500) : errorData,
        parseError: e.message
      });
    }
  });
});

// --- Quiz & Manual Input Endpoint ---
app.post('/api/analyze/metadata', (req, res) => {
  const { skinType, concerns, quizAnswers } = req.body || {};
  
  let finalSkinType = skinType;
  if (quizAnswers && !skinType) {
    finalSkinType = processQuizAnswers(quizAnswers);
  }
  
  // Don't return a default if no quiz answers provided
  if (!finalSkinType && (!quizAnswers || Object.keys(quizAnswers).length === 0)) {
    return res.status(400).json({ error: 'No quiz answers provided' });
  }
  
  const conditions = (concerns || []).map(c => ({ name: c, confidence: 0.8 }));
  const result = {
    skinType: finalSkinType,
    conditions,
    confidence: 85
  };
  res.json(result);
});

function processQuizAnswers(answers) {
  // This is your existing quiz logic.
  const scores = { Oily: 0, Dry: 0, Combination: 0, Sensitive: 0, Normal: 0 };
  
  Object.values(answers).forEach(answer => {
    // Ensure answer is a string before calling toLowerCase
    if (!answer || typeof answer !== 'string') {
      return; // Skip non-string answers
    }
    const ans = answer.toLowerCase();
    
    if (ans.includes('tight') || ans.includes('dry')) scores.Dry += 3;
    if (ans.includes('oily all over')) scores.Oily += 3;
    if (ans.includes('t-zone')) scores.Combination += 3;
    if (ans.includes('irritated') || ans.includes('stinging')) scores.Sensitive += 3;
    if (ans.includes('comfortable')) scores.Normal += 2;
    if (ans.includes('never')) scores.Dry += 2;
    if (ans.includes('frequently')) scores.Oily += 3;
    if (ans.includes('only in t-zone')) scores.Combination += 3;
    if (ans.includes('varies')) scores.Combination += 1;
    if (ans.includes('irritated easily') || ans.includes('very sensitive')) scores.Sensitive += 3;
    if (ans.includes('breaks out')) scores.Oily += 2;
    if (ans.includes('no reaction')) scores.Normal += 2;
    if (ans.includes('dryness') || ans.includes('flaking')) scores.Dry += 3;
    if (ans.includes('acne') || ans.includes('blackheads')) scores.Oily += 3;
    if (ans.includes('large pores')) scores.Oily += 2;
    if (ans.includes('sensitivity') || ans.includes('redness')) scores.Sensitive += 3;
    if (ans.includes('uneven')) scores.Normal += 1;
  });
  
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

app.post('/api/submissions', (req, res) => {
  const payload = req.body || {};
  payload.id = submissions.length + 1;
  payload.createdAt = new Date();
  submissions.push(payload);
  res.json({ ok: true, id: payload.id });
});

app.get('/', (req, res) => res.send('GlowGlam API is running'));

// 404 handler for API routes (must come before error handler)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));