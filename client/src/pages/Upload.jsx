import React, { useRef, useState, useEffect } from 'react';
import { uploadImage, analyzeImage, submit } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const upRef = useRef();
  const videoRef = useRef();
  const streamRef = useRef();
  const canvasRef = useRef();
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraOn(false);
    }
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .catch(() => {
              setShowModal(true);
              stopCamera();
            });
        }
      }, 100);
    } catch (err) {
      let msg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') {
        msg += 'Permission denied. Please allow access.';
      } else if (err.name === 'NotFoundError') {
        msg += 'No camera device found.';
      } else {
        msg += err.message;
      }
      alert(msg);
    }
  }

  function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setPreview({ file: blob, url });
        stopCamera();
      },
      'image/jpeg',
      0.95
    );
  }

  function retake() {
    setPreview(null);
    openCamera();
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview({ file: f, url });
  }

  async function handleContinue() {
    if (loading) return; // Prevent multiple clicks
    
    if (!preview) {
      setShowModal(true);
      return;
    }

    setLoading(true);
    
    try {
      let file = preview.file;
      if (file instanceof Blob && !(file instanceof File)) {
        file = new File([file], 'capture.jpg', { type: 'image/jpeg' });
      }

      console.log('Uploading file:', file.name, file.size, 'bytes');
      const res = await uploadImage(file);
      console.log('Upload response:', res);
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      const imageUrl = res.url || res.filePath || res.image || res.path;
      if (!imageUrl) {
        console.error('Upload response missing URL:', res);
        throw new Error('Upload failed: no image URL returned. Server response: ' + JSON.stringify(res));
      }
      
      console.log('Image uploaded successfully:', imageUrl);

      let analysis = {};
      try {
        console.log('Starting image analysis for:', imageUrl);
        const analysisResult = await analyzeImage({ imageUrl });
        console.log('Analysis result received:', analysisResult);
        
        if (analysisResult.error) {
          console.error('Analysis error:', analysisResult.error);
          // Store the error so we know analysis was attempted
          analysis = { error: analysisResult.error, attempted: true };
        } else if (analysisResult.skinType) {
          // Valid analysis result
          analysis = analysisResult;
          console.log('Analysis successful - Skin Type:', analysis.skinType, 'Confidence:', analysis.confidence);
        } else {
          console.warn('Analysis returned but no skinType found:', analysisResult);
          analysis = { ...analysisResult, attempted: true };
        }
      } catch (err) {
        console.error('Image analysis failed with exception:', err);
        // Store error info
        analysis = { error: err.message || 'Analysis failed', attempted: true };
      }

      // Always store the analysis result (even if it failed)
      console.log('Storing analysis in sessionStorage:', analysis);
      await submit({ method: 'upload', imageUrl, analysis });
      sessionStorage.setItem('glowglam_analysis', JSON.stringify({ analysis, imageUrl }));

      // Add delay to show processing state
      setTimeout(() => {
        setLoading(false);
        nav('/quiz');
      }, 1500);
    } catch (err) {
      console.error('handleContinue error:', err);
      alert(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="card upload-card">
      <style>{`
        body {
          background: linear-gradient(135deg, #ffe5f5, #ffbbd6ff, #ffa5c9, #ff8dbc);
        }
        .upload-card {
          padding: 20px;
          background: linear-gradient(135deg, #fff4fbff, #fcd1e2ff, #ffb1d2ff, #ffdfecff);
        }
        .upload-card h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #ff4f84ff;
          text-align:center;
          margin-bottom: 6px;
          text-shadow: 0 2px 12px #ffe5ec;
        }
        .upload-card h4 {
          font-size: 1.18rem;
          color: black;
          text-align:center;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .options {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .option {
          text-align: center;
          cursor: pointer;
        }
        .option i {
          font-size: 36px;
          color: #ff7aa2;
        }
        .cam-row {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 30px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .video-box {
          width: 400px;
          height: 300px;
          background: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .video-box video,
        .video-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tips {
          max-width: 300px;
          max-height:400px;
          font-size: 1rem;
          color: #494949ff;
          margin: 4rem 1rem;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .tips ul {
          padding-left: 18px;
          margin: 6px 0;
        }
        .cam-controls {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .upload-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 18px;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }
        .btn-primary {
          background: #ff7aa2;
          color: #fff;
          box-shadow: 0 4px 12px rgba(255, 122, 162, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          background: #ff5185;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 122, 162, 0.4);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn-secondary {
          background: #fff;
          border: 2px solid #ff7aa2;
          color: #ff7aa2;
        }
        .btn-secondary:hover {
          background: #fff0f6;
          transform: translateY(-1px);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .modal {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          max-width: 320px;
        }
        .modal button {
          margin-top: 10px;
        }
      `}</style>

      <h2>Capture Your Skin</h2>
      <h4>Choose how you'd like to provide your photo for analysis</h4>

      <div className="options">
        <div className="option" onClick={openCamera}>
          <i className="fa-solid fa-camera"></i>
          <h3>Take Selfie Now</h3>
          <p>Use your device camera</p>
        </div>
        <div className="option" onClick={() => upRef.current.click()}>
          <i className="fa-solid fa-upload"></i>
          <h3>Upload Image Here</h3>
          <p>Choose from gallery</p>
        </div>
      </div>

      <input
        ref={upRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <div className="cam-row">
        <div className="cam-wrap">
          {!cameraOn && !preview && (
            <div style={{ color: '#666' }}>
              No camera active. Click "Take Selfie Now" to open camera.
            </div>
          )}
          <div className="video-box">
            {cameraOn ? (
              <video ref={videoRef} playsInline muted></video>
            ) : preview ? (
              <img src={preview.url} alt="preview" />
            ) : (
              <div style={{ color: '#999' }}>Camera preview</div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="cam-controls">
            {cameraOn && (
              <button className="btn btn-primary" onClick={capture}>
                Capture
              </button>
            )}
            {preview && (
              <button className="btn btn-secondary" onClick={retake}>
                Retake
              </button>
            )}
            {cameraOn && (
              <button
                className="btn"
                onClick={() => {
                  stopCamera();
                  setPreview(null);
                }}
              >
                Close Camera
              </button>
            )}
          </div>
        </div>

        <div className="tips">
          <strong>Tips for best results:</strong>
          <ul>
            <li>Use natural lighting</li>
            <li>Face the camera directly</li>
            <li>Remove makeup if possible</li>
            <li>Tie back your hair to keep your face visible</li>
            <li>Ensure photo is clear and focused</li>
          </ul>
        </div>
      </div>

      <div className="upload-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Change Method
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleContinue}
          disabled={loading || !preview}
        >
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Processing & Loading Quiz...
            </>
          ) : (
            'Take Quiz'
          )}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Please capture or upload a photo</h3>
            <p>Before continuing, add a photo for analysis or change method.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
