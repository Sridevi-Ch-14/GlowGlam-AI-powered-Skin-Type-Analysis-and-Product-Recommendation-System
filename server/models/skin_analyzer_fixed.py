import sys
import json
import numpy as np
import cv2
import os
import tempfile

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    from tensorflow.keras.models import load_model
except ImportError:
    from keras.models import load_model

try:
    from mtcnn.mtcnn import MTCNN
except ImportError:
    MTCNN = None

class SkinAnalyzer:
    def __init__(self, model_path):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model file not found: {model_path}')
        self.model = load_model(model_path, compile=False)
        self.skin_types = ['acne', 'dry', 'normal', 'oily']
        self.img_size = (260, 260)
        if MTCNN is None:
            raise RuntimeError('MTCNN not installed')
        self.face_detector = MTCNN()
    
    def predict_skin_type(self, image_path):
        try:
            if not os.path.exists(image_path):
                return {'error': 'Image file not found'}
            img_bgr = cv2.imread(image_path)
            if img_bgr is None or img_bgr.size == 0:
                return {'error': 'Could not read image'}
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            faces = self.face_detector.detect_faces(img_rgb)
            if not faces:
                return {'error': 'Face not detected in the image'}
            x, y, w, h = faces[0]['box']
            pad = 30
            x1 = max(0, x - pad); y1 = max(0, y - pad)
            x2 = min(img_rgb.shape[1], x + w + pad); y2 = min(img_rgb.shape[0], y + h + pad)
            face = img_rgb[y1:y2, x1:x2]
            if face.size == 0:
                return {'error': 'Failed to crop face'}
            face_resized = cv2.resize(face, self.img_size)
            face_batch = np.expand_dims(face_resized, axis=0)
            preds = self.model.predict(face_batch, verbose=0)
            if preds is None or len(preds) == 0:
                return {'error': 'Model prediction failed'}
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
    try:
        if len(sys.argv) != 3:
            print('{"error": "Incorrect arguments"}')
            sys.exit(0)
        model_path = sys.argv[1]
        image_path = sys.argv[2]
        analyzer = SkinAnalyzer(model_path)
        result = analyzer.predict_skin_type(image_path)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(0)