import React, { useState } from 'react'
import { analyzeMetadata, submit } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Manual() {
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function toggleConcern(c) {
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function handleContinue() {
    if (loading) return;
    
    if (!skinType) {
      setModalMessage("Please select your skin type to continue analyzing your skin.");
      setShowModal(true);
      return;
    }
    if (concerns.length === 0) {
      setModalMessage("Please select at least one skin concern so we can give you accurate recommendations.");
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeMetadata({ skinType, concerns });
      await submit({ method: 'manual', skinType, concerns, analysis });
      sessionStorage.setItem('glowglam_analysis', JSON.stringify({ analysis }));
      
      setTimeout(() => {
        setLoading(false);
        nav('/quiz');
      }, 1000);
    } catch (err) {
      setLoading(false);
      alert('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="manual-card">
      <style>{`
        body {
          background: linear-gradient(135deg, #ffe5f5, #ffbbd6ff, #ffa5c9, #ff8dbc);
          font-family: 'Quicksand', 'Segoe UI', sans-serif;
        }

        .manual-card {
          max-width: 600px;
          margin: auto;
          padding: 28px 24px;
          background: linear-gradient(135deg, #fff4fbff, #fcd1e2ff, #ffb1d2ff, #ffdfecff);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(255, 122, 162, 0.15);
          text-align: center;
        }

        .manual-card h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #ff4f84ff;
          margin-bottom: 6px;
          text-shadow: 0 2px 8px #ffe5ec;
        }

        .manual-card p {
          font-size: 1rem;
          color: #666;
          margin-bottom: 20px;
        }

        .skin-type-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 12px;
        }

        .skin-type-options label {
          position: relative;
          padding: 6px 12px;
          background: #ffe5f5;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .skin-type-options label:hover {
          background: #ffbbd6;
        }

        .skin-type-options input[type="radio"] {
          appearance: none;
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border: 2px solid #ff7aa2;
          border-radius: 50%;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }

        .skin-type-options input[type="radio"]:checked::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ff4f84;
        }

        .concerns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .concerns-grid label {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 12px;
          background: #ffe5f5;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .concerns-grid label:hover {
          background: #ffbbd6;
        }

        .concerns-grid input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border: 2px solid #ff7aa2;
          border-radius: 4px;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }

        .concerns-grid input[type="checkbox"]:checked {
          background: #ff5b9fff;
          border-color: #ff4f84;
        }

        .concerns-grid input[type="checkbox"]:checked::after {
          content: '✔';
          color: white;
          font-size: 12px;
          position: absolute;
          top:-1.5px;
          left:2px;
          
        }

        .action-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-top: 24px;
        }

        .btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-primary {
          background: #ff7aa2;
          color: #fff;
        }

        .btn-primary:hover {
          background: #ff5185;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #ffe5ec;
          color: #ff7aa2;
        }

        .btn-secondary:hover {
          background: #ffd0e0;
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background: #fff;
          padding: 24px 20px;
          border-radius: 14px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 8px 30px rgba(255,122,162,0.2);
        }

        .modal button {
          margin-top: 16px;
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          background: #ff7aa2;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal button:hover {
          background: #ff5185;
        }

        @media (max-width: 500px) {
          .concerns-grid {
            grid-template-columns: 1fr;
          }
          .skin-type-options {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <h3>Tell Us About Your Skin</h3>
      <p>Help us understand your skin type and current concerns</p>

      <div className="skin-type">
        <label>Skin Type (required)</label>
        <div className="skin-type-options">
          {['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'].map(type => (
            <label key={type}>
              <input
                type="radio"
                name="skinType"
                value={type}
                checked={skinType === type}
                onChange={() => setSkinType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      <br></br>
      <div className="concerns">
        <label>Current Skin Concerns (select at least 1)</label>
        <div className="concerns-grid">
          {['Acne','Fine Lines','Dark Spots','Dryness','Oiliness','Sensitivity','Dullness','Large Pores','Redness','Uneven Skin Tone'].map(c => (
            <label key={c}>
              <input
                type="checkbox"
                checked={concerns.includes(c)}
                onChange={() => toggleConcern(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={() => window.history.back()} disabled={loading}>Change Method</button>
        <button className="btn btn-primary" onClick={handleContinue} disabled={loading || !skinType || concerns.length === 0}>
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Loading Quiz...
            </>
          ) : (
            'Take Quiz'
          )}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
