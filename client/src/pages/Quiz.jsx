import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Quiz() {
  const questions = [
    { id: 1, text: 'How does your skin feel after washing your face?', opts: ['Tight and dry', 'Comfortable', 'Oily in T-zone only', 'Oily all over', 'Irritated or stinging'] },
    { id: 2, text: 'How often do you notice shine on your face?', opts: ['Never', 'Rarely', 'Only in T-zone', 'Frequently all over', 'Varies by season'] },
    { id: 3, text: 'How does your skin react to new products?', opts: ['Gets irritated easily', 'No reaction usually', 'Sometimes breaks out', 'Rarely reacts', 'Very sensitive'] },
    { id: 4, text: 'What are your main skin concerns?', opts: ['Dryness and flaking', 'Acne and blackheads', 'Large pores', 'Sensitivity and redness', 'Uneven skin tone'] },
    { id: 5, text: 'How often do you work out or sweat regularly?', opts: ['Daily', '3-5 times per week', '1-2 times per week', 'Rarely or never'] },
    {
      id: 6,
      text: 'Would you like to share your location? This helps us recommend products based on local pollution and climate.',
      opts: ['Yes, share my location', 'No, skip location']
    }
  ];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function selectOpt(opt) {
    setAnswers(prev => ({ ...prev, [questions[idx].id]: opt }));
  }

  function next() {
    if (!answers[questions[idx].id]) return alert('Please select an option');
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
    } else {
      setLoading(true);
      // Handle location sharing
      if (answers[6] === 'Yes, share my location' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            sessionStorage.setItem(
              'glowglam_quiz',
              JSON.stringify({
                ...answers,
                location: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
              })
            );
            setTimeout(() => nav('/results'), 1000);
          },
          err => {
            sessionStorage.setItem('glowglam_quiz', JSON.stringify(answers));
            setTimeout(() => nav('/results'), 1000);
          }
        );
      } else {
        sessionStorage.setItem('glowglam_quiz', JSON.stringify(answers));
        setTimeout(() => nav('/results'), 1000);
      }
    }
  }

  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }

  function skipQuiz() {
    setLoading(true);
    sessionStorage.setItem('glowglam_quiz', JSON.stringify(answers));
    setTimeout(() => nav('/results'), 1000);
  }

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Loading your results...</div>
        </div>
      )}
      <div className="quiz-card">
      <style>{`
        .quiz-card {
          max-width: 480px;
          margin: 40px auto;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .progress-bar {
          flex: 1;
          margin-right: 16px;
          height: 8px;
          background: #ffe5ec;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff7aa2 60%, #ffb6c1 100%);
          width: ${Math.round(((idx + 1) / questions.length) * 100)}%;
          transition: width 0.3s;
        }
        .progress-label {
          font-size: 0.95rem;
          color: #ff7aa2;
          font-weight: 500;
          margin-left: 8px;
          min-width: 110px;
          text-align: right;
        }
        .btn-skip {
          background: none;
          border: none;
          color: #ff7aa2;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 8px;
        }
        .quiz-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .quiz-question {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          align-items: center;
        }
        .option {
          width: 100%;
          max-width: 320px;
          background: #ffe5ec;
          border: 2px solid #ffe5ec;
          border-radius: 8px;
          padding: 14px 20px;
          text-align: left;
          font-size: 1.08rem;
          cursor: pointer;
          transition: border 0.2s, background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(255,122,162,0.04);
        }
        .option:hover {
          background: #fff0f6;
          border: 2px solid #ffb6c1;
          box-shadow: 0 4px 16px rgba(255,122,162,0.08);
        }
        .option.selected {
          border: 2px solid #ff7aa2;
          background: #fff0f6;
          box-shadow: 0 4px 16px rgba(255,122,162,0.12);
        }
        .quiz-footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }
        .btn {
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1.08rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s, color 0.2s;
          box-shadow: 0 2px 8px rgba(255,122,162,0.04);
        }
        .btn-primary {
          background: #ff7aa2;
          color: #fff;
        }
        .btn-secondary {
          background: #ffe5ec;
          color: #ff7aa2;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #ffe5ec;
          border-top: 4px solid #ff7aa2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-text {
          margin-top: 20px;
          font-size: 1.2rem;
          color: #ff7aa2;
          font-weight: 600;
        }
      `}</style>
      <div className="quiz-header">
        <div className="progress-bar">
          <div className="progress-bar-fill"></div>
        </div>
        <span className="progress-label">
          {`Q${idx + 1} of ${questions.length} (${Math.round(((idx + 1) / questions.length) * 100)}%)`}
        </span>
        <button className="btn btn-skip" onClick={skipQuiz}>Skip Quiz</button>
      </div>
      <div className="quiz-content">
        <h4 className="quiz-question">{questions[idx].text}</h4>
        <div className="quiz-options">
          {questions[idx].opts.map(o => (
            <button
              key={o}
              className={`option${answers[questions[idx].id] === o ? ' selected' : ''}`}
              onClick={() => selectOpt(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="quiz-footer">
        <button className="btn btn-secondary" onClick={prev} disabled={idx === 0}>Previous</button>
        <button className="btn btn-primary" onClick={next}>
          {idx === questions.length - 1 ? 'Submit & View Results' : 'Next'}
        </button>
      </div>
    </div>
    </>
  );
}
