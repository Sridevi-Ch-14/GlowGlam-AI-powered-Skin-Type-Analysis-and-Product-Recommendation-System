import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  return (
    <div className="home">
      <style>{`

        body{
          background: linear-gradient(135deg, #ffe5f5, #ffbbd6, #ffa5c9, #ff8dbc);  
        }

        .home {
          text-align: center;
          padding: 20px;
          font-family: 'Segoe UI', sans-serif;
        }

        .h1 {
          font-size: 2.4rem;
          font-weight: 700;
          color: #ff5185;
          margin-bottom: 12px;
        }

        .sub {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 28px;
        }

        .options {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .option {
          flex: 1;
          min-width: 260px;
          max-width: 400px;
          background: #fff6f9;
          padding: 24px;
          border-radius: 14px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 10px rgba(255, 122, 162, 0.08);
        }

        .option:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(255, 122, 162, 0.15);
        }

        .option i {
          font-size: 36px;
          color: #ff7aa2;
          margin-bottom: 12px;
        }

        .option h3 {
          margin: 10px 0;
          font-size: 1.4rem;
          color: #333;
        }

        .option p {
          font-size: 0.95rem;
          color: #555;
          line-height: 1.5;
        }

        .data-security {
          margin-top: 20px;
          font-size: 0.95rem;
          color: #444;
        }

        @media (max-width: 768px) {
          .options {
            flex-direction: column;
            align-items: center;
          }
          .option {
            max-width: 90%;
          }
        }
      `}</style>

      <h2 className="h1">Let's Analyze Your Skin</h2>
      <p className="sub">Choose your preferred method to get started with your personalized skincare analysis</p>

      <div className="options">
        <div className="option" onClick={() => nav('/upload')}>
          <i className="fa-solid fa-camera"></i>
          <h3>Upload Your Photo</h3>
          <p>Get AI-powered analysis of your skin using computer vision technology. We use secure AI to detect skin concerns like acne, fine lines, dryness, and more.</p>
        </div>

        <div className="option" onClick={() => nav('/manual')}>
          <i className="fa-solid fa-pen-to-square"></i>
          <h3>Manual Input</h3>
          <p>Prefer not to upload a photo? Tell us about your skin manually. Share your skin type and concerns directly for personalized recommendations.</p>
        </div>
      </div>

      <div className="data-security">
        🔒 <strong>Your data is secure</strong> and never shared with third parties
      </div>
    </div>
  )
}
