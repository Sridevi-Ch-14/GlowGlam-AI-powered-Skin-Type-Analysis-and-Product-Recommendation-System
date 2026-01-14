import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Welcome() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <div className="welcome-bg">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italianno&display=swap');

        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: linear-gradient(135deg, #ffe5f5, #ffbbd6, #ffa5c9, #ff8dbc);
          font-family: 'Segoe UI', sans-serif;
        }

        .header {
          font-size: 4rem;
          font-weight: 700;
          color: #ff4e84;
          font-family: 'Italianno', cursive;
          text-align: center;
          padding: 20px 0;
          margin-bottom: 20px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;  
          background: rgba(255, 245, 250, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          gap: 40px;
          min-height: 70vh;
        }

        .hero-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 24px;
          max-width: 600px;
        }

        .h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #ff5185;
          margin: 0;
        }

        .h1 span {
          color: #333;
        }

        .sub {
          font-size: 1.1rem;
          color: #666;
        }

        .feature-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff6f9;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 1rem;
          color: #ff7aa2;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(255, 122, 162, 0.08);
        }

        .btn {
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #ff7aa2;
          color: #fff;
        }

        .btn-secondary {
          background: #ffe5ec;
          color: #ff7aa2;
        }

        .hero-right {
          flex: 0 0 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-right img {
          width: 100%;
          max-width: 380px;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          object-fit: contain;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #fff;
          border-radius: 14px;
          padding: 28px 22px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 6px 32px rgba(255,122,162,0.12);
        }

        @media (max-width: 1024px) {
          .hero {
            flex-direction: column;
            padding: 30px 20px;
            gap: 30px;
            min-height: auto;
          }
          .hero-right {
            flex: none;
            order: -1;
          }
          .h1 {
            font-size: 2.2rem;
            text-align: center;
          }
          .sub {
            text-align: center;
            font-size: 1rem;
          }
          .hero-right img {
            max-width: 300px;
          }
          .feature-row {
            justify-content: center;
          }
          .header {
            font-size: 3rem;
          }
        }
        
        @media (max-width: 600px) {
          .hero {
            padding: 20px 15px;
          }
          .h1 {
            font-size: 1.8rem;
          }
          .header {
            font-size: 2.5rem;
          }
          .feature {
            font-size: 0.9rem;
            padding: 8px 12px;
          }
          .btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }

      `}</style>

      {/* Header */}
      <div className="header">GlowGlam</div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <h1 className="h1">
            <span>AI-Powered</span> Personal Skincare <span>Assistant</span>
          </h1>
          <p className="sub">
            Discover personalized skincare routines tailored to your unique skin type, lifestyle, and environment. Get expert recommendations powered by AI.
          </p>
          <div className="feature-row">
            <div className="feature"><i className="fa-solid fa-robot"></i> AI-powered Analysis</div>
            <div className="feature"><i className="fa-solid fa-user-check"></i> Personalized Care</div>
            <div className="feature"><i className="fa-solid fa-shield-heart"></i> Safe & Trusted</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn btn-primary" onClick={() => nav("/home")}>Get Started</button>
            <button className="btn btn-secondary" onClick={() => setShow(true)}>Learn How it works</button>
          </div>
        </div>

        <div className="hero-right">
          <img src="/Hero-img.jpg" alt="GlowGlam Products" />
        </div>
      </div>

      {/* Modal */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <h3>How GlowGlam Works</h3>
              <button onClick={() => setShow(false)} style={{cursor:"pointer", border:"1px solid pink", background:"white", borderRadius:"6px"}}>✕</button>
            </div>
            <ol style={{marginTop:12, lineHeight:1.6}}>
              <li>Upload a photo or tell us about your skin.</li>
              <li>Answer a short quiz about your lifestyle and habits.</li>
              <li>Our AI analyzes the inputs to detect concerns.</li>
              <li>Receive a personalized routine with product suggestions.</li>
            </ol>
            <div style={{textAlign:"right", marginTop:12}}>
              <button className="btn btn-primary" onClick={() => setShow(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


