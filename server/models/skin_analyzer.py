import sys
import json
import numpy as np
import cv2
import os
import tempfile
import warnings
import locale

# Fix Windows encoding issues
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    from tensorflow.keras.models import load_model
except ImportError:
    from keras.models import load_model  # fallback

try:
    from mtcnn.mtcnn import MTCNN
except ImportError:
    MTCNN = None

class SkinAnalyzer:
    def __init__(self, model_path):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model file not found: {model_path}')
        # Load model
        self.model = load_model(model_path, compile=False)
        # Class names from training
        self.skin_types = ['acne', 'dry', 'normal', 'oily']
        # EfficientNetB2 expected input size
        self.img_size = (260, 260)
        # Face detector
        if MTCNN is None:
            raise RuntimeError('MTCNN not installed. Please: pip install mtcnn')
        self.face_detector = MTCNN()
    
    def predict_skin_type(self, image_path):
        try:
            if not os.path.exists(image_path):
                return {'error': f'Image file not found: {image_path}'}
            img_bgr = cv2.imread(image_path)
            if img_bgr is None or img_bgr.size == 0:
                return {'error': f'Could not read image: {image_path}'}
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            # Face detection
            faces = self.face_detector.detect_faces(img_rgb)
            if not faces or len(faces) == 0:
                return {'error': 'Face not found'}
            # Check face detection confidence
            if faces[0].get('confidence', 0) < 0.9:
                return {'error': 'Face not found'}
            x, y, w, h = faces[0]['box']
            pad = 30
            x1 = max(0, x - pad); y1 = max(0, y - pad)
            x2 = min(img_rgb.shape[1], x + w + pad); y2 = min(img_rgb.shape[0], y + h + pad)
            face = img_rgb[y1:y2, x1:x2]
            if face.size == 0:
                return {'error': 'Failed to crop the face from the image.'}
            # Resize to 260x260, no normalization (model has preprocessing)
            face_resized = cv2.resize(face, self.img_size)
            face_batch = np.expand_dims(face_resized, axis=0)
            # Predict
            preds = self.model.predict(face_batch, verbose=0)
            if preds is None or len(preds) == 0:
                return {'error': 'Model prediction failed: empty output'}
            arr = preds[0]
            idx = int(np.argmax(arr))
            if idx < 0 or idx >= len(self.skin_types):
                return {'error': f'Invalid predicted index: {idx}'}
            confidence = float(arr[idx]) * 100.0
            skin_type = self.skin_types[idx]
            return {
                'skinType': skin_type.capitalize(),
                'confidence': round(confidence, 1),
                'conditions': self._conditions_from_type(skin_type)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _conditions_from_type(self, skin_type):
        conditions = []
        if skin_type == 'acne':
            conditions.append({'name': 'Acne Prone', 'confidence': 0.9})
        if skin_type == 'oily':
            conditions.append({'name': 'Excess Oil', 'confidence': 0.85})
        if skin_type == 'dry':
            conditions.append({'name': 'Dryness', 'confidence': 0.85})
        if skin_type == 'normal':
            conditions.append({'name': 'Balanced Skin', 'confidence': 0.8})
        return conditions

if __name__ == '__main__':
    # Always print result via temp file to avoid TF noise on stdout
    result_file = None
    try:
        if len(sys.argv) != 3:
            out = {'error': 'Incorrect number of arguments. Expected model_path and image_path.'}
            # Fall back: print direct JSON for argument error
            print(json.dumps(out), flush=True)
            sys.exit(0)
        model_path = sys.argv[1]
        image_path = sys.argv[2]
        # Create temp file
        fd, result_file = tempfile.mkstemp(suffix='.json', text=True)
        os.close(fd)
        analyzer = SkinAnalyzer(model_path)
        # Suppress noisy stdout during predict
        stdout_bak, stderr_bak = sys.stdout, sys.stderr
        devnull = open(os.devnull, 'w')
        sys.stdout, sys.stderr = devnull, devnull
        try:
            result = analyzer.predict_skin_type(image_path)
        finally:
            sys.stdout, sys.stderr = stdout_bak, stderr_bak
            devnull.close()
        with open(result_file, 'w', encoding='utf-8', errors='replace') as f:
            f.write(json.dumps(result, ensure_ascii=True))
        print(f'GLOWGLAM_RESULT_FILE:{result_file}', flush=True)
        sys.exit(0)
    except Exception as e:
        try:
            if result_file:
                with open(result_file, 'w', encoding='utf-8', errors='replace') as f:
                    f.write(json.dumps({'error': f'Failed to initialize analyzer: {str(e)}'}, ensure_ascii=True))
                print(f'GLOWGLAM_RESULT_FILE:{result_file}', flush=True)
            else:
                print(json.dumps({'error': f'Failed to initialize analyzer: {str(e)}'}), flush=True)
        except:
            print(json.dumps({'error': f'Analyzer crashed: {str(e)}'}), flush=True)
        sys.exit(0)