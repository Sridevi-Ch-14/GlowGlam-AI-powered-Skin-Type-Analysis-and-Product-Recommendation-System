import sys
import json
import numpy as np
import cv2
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Set UTF-8 encoding for stdout
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    from tensorflow.keras.models import load_model
except:
    from keras.models import load_model

try:
    from mtcnn.mtcnn import MTCNN
except:
    MTCNN = None

def analyze_skin(model_path, image_path):
    try:
        if not os.path.exists(model_path):
            return {"error": "Face not found"}
        if not os.path.exists(image_path):
            return {"error": "Face not found"}
            
        model = load_model(model_path, compile=False)
        skin_types = ['acne', 'dry', 'normal', 'oily']
        
        if MTCNN is None:
            sys.stderr.write("MTCNN not available\n")
            return {"error": "Face not found"}
            
        detector = MTCNN()
        
        img = cv2.imread(image_path)
        if img is None:
            sys.stderr.write("Cannot read image\n")
            return {"error": "Face not found"}
            
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        faces = detector.detect_faces(img_rgb)
        
        if not faces or len(faces) == 0:
            sys.stderr.write("No face detected in image\n")
            return {"error": "Face not found"}
        
        # Check face detection confidence
        if faces[0].get('confidence', 0) < 0.9:
            sys.stderr.write(f"Face detection confidence too low: {faces[0].get('confidence', 0)}\n")
            return {"error": "Face not found"}
            
        x, y, w, h = faces[0]['box']
        pad = 30
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_rgb.shape[1], x + w + pad)
        y2 = min(img_rgb.shape[0], y + h + pad)
        
        face = img_rgb[y1:y2, x1:x2]
        if face.size == 0:
            sys.stderr.write("Face crop failed\n")
            return {"error": "Face not found"}
            
        face_resized = cv2.resize(face, (260, 260))
        face_batch = np.expand_dims(face_resized, axis=0)
        
        preds = model.predict(face_batch, verbose=0)
        if preds is None or len(preds) == 0:
            sys.stderr.write("Prediction failed\n")
            return {"error": "Face not found"}
            
        arr = preds[0]
        idx = int(np.argmax(arr))
        confidence = float(arr[idx]) * 100.0
        skin_type = skin_types[idx]
        
        conditions = []
        if skin_type == 'acne':
            conditions.append({"name": "Acne Prone", "confidence": 0.9})
        elif skin_type == 'oily':
            conditions.append({"name": "Excess Oil", "confidence": 0.85})
        elif skin_type == 'dry':
            conditions.append({"name": "Dryness", "confidence": 0.85})
        else:
            conditions.append({"name": "Balanced Skin", "confidence": 0.8})
            
        return {
            "skinType": skin_type.capitalize(),
            "confidence": round(confidence, 1),
            "conditions": conditions
        }
        
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        return {"error": "Face not found"}

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}, ensure_ascii=True))
    else:
        result = analyze_skin(sys.argv[1], sys.argv[2])
        print(json.dumps(result, ensure_ascii=True))