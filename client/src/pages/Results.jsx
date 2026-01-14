import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, getRecommendations, analyzeMetadata } from '../api'
export default function Results(){
  const [analysis, setAnalysis] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    const analysisStr = sessionStorage.getItem('glowglam_analysis');
    const quizStr = sessionStorage.getItem('glowglam_quiz');
    
    console.log('Results page - Loading data from sessionStorage');
    console.log('Analysis string:', analysisStr);
    console.log('Quiz string:', quizStr);
    
    let analysisData = null;
    let quizAnswers = null;
    
    if(analysisStr) {
      try {
        const data = JSON.parse(analysisStr);
        analysisData = data.analysis || data;
        console.log('Parsed analysis data:', analysisData);
      } catch (e) {
        console.error('Failed to parse analysis data:', e);
      }
    }
    
    if(quizStr) {
      try {
        quizAnswers = JSON.parse(quizStr);
        console.log('Parsed quiz answers:', quizAnswers);
      } catch (e) {
        console.error('Failed to parse quiz data:', e);
      }
    }
    
    // Priority: Image analysis > Quiz data
    // If we have image analysis with skinType, use it directly
    if (analysisData?.skinType) {
      console.log('Using image analysis data - Skin Type:', analysisData.skinType);
      setAnalysis(analysisData);
      loadRecommendations(analysisData);
    } 
    // If analysis has error (like face not detected), don't supplement with quiz
    else if (analysisData?.error) {
      console.log('Analysis error detected:', analysisData.error);
      setAnalysis(analysisData);
      getProducts().then(setProducts);
      setLoading(false);
    }
    // If analysis was attempted but failed, try to supplement with quiz data
    else if (analysisData?.attempted && !analysisData.skinType && quizAnswers) {
      console.log('Analysis attempted but no skinType, supplementing with quiz data');
      analyzeMetadata({ quizAnswers }).then(quizResult => {
        const mergedAnalysis = {
          ...analysisData,
          skinType: quizResult.skinType,
          conditions: analysisData.conditions || quizResult.conditions || [],
          confidence: quizResult.confidence || 75,
          source: 'quiz'
        };
        console.log('Merged analysis (quiz supplement):', mergedAnalysis);
        setAnalysis(mergedAnalysis);
        loadRecommendations(mergedAnalysis);
      }).catch(() => {
        console.log('Quiz processing failed, using analysis data as-is');
        setAnalysis(analysisData);
        loadRecommendations(analysisData);
      });
    }
    // If we only have quiz data (no image analysis)
    else if (quizAnswers && (!analysisData || !analysisData.attempted)) {
      console.log('Using quiz data only');
      analyzeMetadata({ quizAnswers }).then(quizResult => {
        const quizAnalysis = {
          ...quizResult,
          source: 'quiz'
        };
        console.log('Quiz analysis result:', quizAnalysis);
        setAnalysis(quizAnalysis);
        loadRecommendations(quizAnalysis);
      }).catch(() => {
        console.error('Failed to process quiz data');
        getProducts().then(setProducts);
        setLoading(false);
      });
    } 
    // If we have analysis data but no skinType and no quiz
    else if (analysisData) {
      console.log('Analysis data exists but no skinType and no quiz:', analysisData);
      setAnalysis(analysisData);
      loadRecommendations(analysisData);
    }
    // No data at all
    else {
      console.log('No analysis or quiz data available');
      setAnalysis(null);
      getProducts().then(setProducts);
      setLoading(false);
    }
    
    function loadRecommendations(analysisData) {
      if(analysisData?.skinType) {
        getRecommendations({
          skinType: analysisData.skinType,
          conditions: analysisData.conditions || []
        }).then(res => {
          setRecommendations(res.recommended_products || []);
          setLoading(false);
        }).catch(() => {
          getProducts().then(setProducts);
          setLoading(false);
        });
      } else {
        getProducts().then(setProducts);
        setLoading(false);
      }
    }
  },[])

  function toggle(id){ setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]); }
  const currentProducts = recommendations.length > 0 ? recommendations : products;
  const total = currentProducts.filter((p,idx)=>selected.includes(p.id || idx)).reduce((s,p)=>s+p.price,0);

  return (
    <div className="results-page">
      <style>{`
        .results-page {
          max-width: 1100px;
          margin: 40px auto;
          padding: 24px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 6px 32px rgba(255,122,162,0.08);
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        }
        .h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #ff7aa2;
          text-align: center;
          margin-bottom: 8px;
        }
        .sub {
          text-align: center;
          color: #888;
          font-size: 1.08rem;
          margin-bottom: 24px;
        }
        .card.results-grid {
          display: flex;
          gap: 32px;
          background: #fff0f6;
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 2px 16px rgba(255,122,162,0.06);
        }
        .results-left {
          flex: 2;
          min-width: 0;
        }
        .results-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .results-right img {
          max-width: 220px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(255,122,162,0.08);
        }
        .products {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-top: 18px;
        }
        .product {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(255,122,162,0.06);
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: box-shadow 0.2s;
        }
        .product:hover {
          box-shadow: 0 6px 24px rgba(255,122,162,0.13);
        }
        .product img {
          width: 100%;
          max-width: 160px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .product h4 {
          font-size: 1.08rem;
          font-weight: 600;
          color: #ff7aa2;
          margin: 8px 0 4px 0;
          text-align: center;
        }
        .product div {
          font-size: 0.98rem;
          color: #555;
          text-align: center;
        }
        .product input[type="checkbox"] {
          accent-color: #ff7aa2;
          margin-right: 6px;
        }
        .product a {
          color: #ff7aa2;
          text-decoration: underline;
          font-size: 0.98rem;
        }
        .selected-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffe5ec;
          border-radius: 10px;
          padding: 16px 24px;
          margin-top: 18px;
          box-shadow: 0 2px 8px rgba(255,122,162,0.04);
          font-size: 1.08rem;
        }
        .btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
          margin-right: 8px;
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
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,122,162,0.2);
        }
        .top-nav {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 20px;
        }
        .btn-restart {
          background: #ffe5ec;
          color: #ff7aa2;
          border: 1px solid #ff7aa2;
          padding: 8px 16px;
          font-size: 0.9rem;
        }
        @media (max-width: 900px) {
          .card.results-grid {
            flex-direction: column;
            gap: 18px;
            padding: 18px 8px;
          }
          .results-right {
            justify-content: flex-start;
          }
        }
        @media (max-width: 600px) {
          .results-page {
            padding: 8px;
          }
          .card.results-grid {
            padding: 8px 2px;
          }
          .selected-bar {
            flex-direction: column;
            gap: 8px;
            padding: 10px 8px;
          }
        }
      `}</style>
      <div className="top-nav">
        <button 
          className="btn btn-restart" 
          onClick={() => {
            sessionStorage.removeItem('glowglam_analysis');
            sessionStorage.removeItem('glowglam_quiz');
            navigate('/upload');
          }}
        >
          🔄 Start New Analysis
        </button>
      </div>
      <h2 className="h1">Your Personalized Skin Report</h2>
      <p className="sub">Based on AI analysis and your lifestyle preferences</p>
      <div className="card results-grid">
        <div className="results-left">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <h3 style={{color:'#ff7aa2',marginBottom:6}}>Skin Analysis Summary</h3>
              {analysis?.error ? (
                <div style={{fontSize:'0.95rem',color:'#ff6b6b',marginTop:4,padding:'12px',background:'#ffe5e5',borderRadius:8}}>
                  ⚠️ {analysis.error}
                </div>
              ) : (
                <div>Detected Skin Type: <strong>{analysis?.skinType || '—'}</strong></div>
              )}
              <div style={{marginTop:8}}>Identified Conditions:</div>
              <ul style={{margin:'8px 0 0 0',paddingLeft:18}}>
                {(analysis?.conditions||[]).length > 0 ? (
                  (analysis.conditions).map((c, idx) => (
                    <li key={c.name || idx}>
                      {c.name || c} 
                      {typeof c.confidence === 'number' && ` (${Math.round(c.confidence*100)}%)`}
                    </li>
                  ))
                ) : (
                  <li style={{color:'#999',fontStyle:'italic'}}>No specific conditions identified</li>
                )}
              </ul>
            </div>
            <div style={{background:'#ffdbe6',padding:'8px 14px',borderRadius:8,fontWeight:600,color:'#ff7aa2'}}>
              {analysis?.confidence ? `${analysis.confidence}%` : '—'} Analysis Confidence
            </div>
          </div>

          <h3 style={{marginTop:16,color:'#ff7aa2'}}>Your Personalized Skincare Routine</h3>
          <p className="sub" style={{marginBottom:8}}>Curated products that match your skin type and lifestyle</p>

          {analysis?.error ? (
            <div style={{textAlign:'center',padding:'40px',color:'#999'}}>
              <p>Product recommendations unavailable without skin analysis</p>
            </div>
          ) : loading ? (
            <div style={{textAlign:'center',padding:'40px',color:'#ff7aa2'}}>
              <i className="fa fa-spinner fa-spin" style={{fontSize:'24px'}}></i>
              <p>Getting personalized recommendations...</p>
            </div>
          ) : (
            <div className="products">
              {(recommendations.length > 0 ? recommendations : products).map((p, idx) => (
                <div className="product" key={p.id || idx}>
                  <img src={p.image || 'https://via.placeholder.com/160x120.png?text=Product'} alt={p.name || p.title}/>
                  <h4>{p.name || p.title}</h4>
                  <div>₹{p.price} • ⭐ {p.rating || p.reviews_score || '4.0'} ({p.reviews_count ? p.reviews_count.toLocaleString() : '1000+'} reviews)</div>
                  <div style={{marginTop:8,fontSize:'0.9rem',color:'#666'}}>{p.category}</div>
                  <div style={{marginTop:8}}>
                    <input type="checkbox" checked={selected.includes(p.id || idx)} onChange={()=>toggle(p.id || idx)} /> Select
                  </div>
                  <div style={{marginTop:8,display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center'}}>
                    {p.amazon && <a href={p.amazon} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Amazon</a>}
                    {p.nykaa && <a href={p.nykaa} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Nykaa</a>}
                    {p.myntra && <a href={p.myntra} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Myntra</a>}
                    {p.flipkart && <a href={p.flipkart} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Flipkart</a>}
                    {p.links?.amazon && <a href={p.links.amazon} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Amazon</a>}
                    {p.links?.myntra && <a href={p.links.myntra} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Myntra</a>}
                    {p.links?.flipkart && <a href={p.links.flipkart} target="_blank" rel="noreferrer" style={{fontSize:'0.85rem',color:'#ff7aa2',textDecoration:'underline'}}>🛒 Flipkart</a>}
                  </div>
                  {p.reviews_count && (
                    <div style={{marginTop:4,fontSize:'0.8rem',color:'#888',textAlign:'center'}}>
                      {p.reviews_count.toLocaleString()} reviews
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="results-right">
          <img src="/result.jpg" alt="product"/>
        </div>
      </div>

      <div style={{marginTop:18}}>
        <div className="selected-bar">
          <div>{selected.length} products selected • Total: ₹{total}</div>
          <div>
            <button className="btn btn-secondary">Buy Selected ({selected.length})</button>
            <button className="btn btn-primary">Buy Full Routine</button>
          </div>
        </div>

      </div>
    </div>
  )
}
