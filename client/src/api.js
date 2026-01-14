const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export async function getProducts(){ const res = await fetch(`${BASE}/api/products`); return res.json(); }
export async function uploadImage(file){ const fd = new FormData(); fd.append('image', file); const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: fd }); return res.json(); }
export async function analyzeImage(body){ 
  const res = await fetch(`${BASE}/api/analyze/image`, { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify(body) 
  }); 
  if (!res.ok) {
    // Check if response is JSON before trying to parse
    const contentType = res.headers.get('content-type');
    let errorData;
    if (contentType && contentType.includes('application/json')) {
      errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
    } else {
      // If it's HTML or other format, read as text
      const text = await res.text().catch(() => '');
      errorData = { error: `Server error: ${res.statusText}`, details: text.substring(0, 200) };
    }
    throw new Error(errorData.error || `Analysis failed: ${res.statusText}`);
  }
  return res.json(); 
}
export async function analyzeMetadata(body){ const res = await fetch(`${BASE}/api/analyze/metadata`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); return res.json(); }
export async function getRecommendations(body){ 
  const res = await fetch(`${BASE}/api/recommendations`, { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify(body) 
  }); 
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorData;
    if (contentType && contentType.includes('application/json')) {
      errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
    } else {
      const text = await res.text().catch(() => '');
      errorData = { error: `Server error: ${res.statusText}`, details: text.substring(0, 200) };
    }
    throw new Error(errorData.error || `Recommendations failed: ${res.statusText}`);
  }
  return res.json(); 
}
export async function submit(payload){ const res = await fetch(`${BASE}/api/submissions`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }); return res.json(); }
