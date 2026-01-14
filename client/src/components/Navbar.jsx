import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar(){
  const nav = useNavigate();
  return (
    <nav className="navbar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Domine:wght@400..700&display=swap');
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 40px 0 40px;
          z-index: 100;
          background: transparent;
        }
        .navbar .back-link {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ff7aa2;
          background: none;
          // border: 2px solid white;
          // border-radius:20%;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
        }
        .navbar .logo {
          font-size: 2.1rem;
          font-family: 'Domine', cursive;
          letter-spacing: 0.02em;
          text-decoration: none;
          font-weight: 700;
          color: #e75172ff;
          text-shadow: 0px 0px 6px rgba(255, 178, 178, 0.603);
        }
        @media (max-width: 900px) {
          .navbar {
            padding: 16px 12px 0 12px;
          }
          .navbar .logo {
            font-size: 2rem;
          }
          .navbar .back-link {
            font-size: 1.5rem;
          }
        }
      `}</style>
      <a className="back-link" onClick={() => nav(-1)}>&larr; Back</a>
      <a onClick={() => nav('/')} className="logo">✨GlowGlam</a>
    </nav>
  )
}
