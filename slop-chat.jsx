
import React, { useState, useEffect, useRef } from 'react';

// ===========================================
// FIREBASE SETUP - Replace with your config!
// ===========================================
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

let db = null;

const initFirebase = async () => {
  if (db) return db;
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase, ref, push, onValue, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const app = initializeApp(FIREBASE_CONFIG);
    db = getDatabase(app);
    window.firebaseDB = { ref, push, onValue, set, db };
    return db;
  } catch (e) {
    console.error('Firebase error:', e);
    return null;
  }
};

const MEMBERS = ['Edward', 'Cole', 'Dylan', 'Cullen', 'Kade', 'Jude'];
const MEMBER_COLORS = { 'Edward': '#FCBAD3', 'Cole': '#FF6B6B', 'Dylan': '#4ECDC4', 'Cullen': '#95E1D3', 'Kade': '#F38181', 'Jude': '#AA96DA' };
const SLOP_INTENSITIES = { mild: { name: 'Mild', emoji: '😊' }, medium: { name: 'Medium', emoji: '🤖' }, maximum: { name: 'MAX', emoji: '🚀' } };
const SLOP_STYLES = { default: { name: 'Classic AI', emoji: '🤖' }, linkedin: { name: 'LinkedIn', emoji: '💼' }, techbro: { name: 'Tech Bro', emoji: '🚀' }, hr: { name: 'HR', emoji: '📋' } };

const generateSlopPrompt = (intensity, style, name) => {
  const int = { mild: '1-2 buzzwords', medium: '3-4 buzzwords and emojis', maximum: 'EVERY buzzword: synergy, leverage, optimize. EXCESSIVE emojis 🚀✨💼' };
  return `You are ${name}. Transform to cringe corporate speak. Intensity: ${int[intensity]}. Keep brief. Only output transformed message.`;
};

const matchEmail = (email) => {
  const p = email.toLowerCase().split('@')[0];
  return MEMBERS.find(m => p.includes(m.toLowerCase())) || null;
};

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.includes('@')) { setError('Enter valid email'); return; }
    setLoading(true);
    await initFirebase();
    const m = matchEmail(email);
    if (m) onLogin(m);
    else setError(`Email must contain: ${MEMBERS.join(', ')}`);
    setLoading(false);
  };

  return (
    <div style={S.center}>
      <div style={S.card}>
        <div style={{ fontSize: '3rem' }}>🤖</div>
        <h1 style={{ color: '#fff', margin: '0.5rem 0' }}>TheCommitteeGPT</h1>
        <p style={{ color: '#4ECDC4', margin: '0 0 1rem' }}>Slop Chat™</p>
        <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="yourname@email.com" style={S.input} />
        {error && <p style={{ color: '#f66', fontSize: '0.8rem' }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={S.btn}>{loading ? 'Connecting...' : 'Enter Slop Zone'}</button>
      </div>
    </div>
  );
}

function DatingScreen({ member, onBack }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(true);
  const [partner, setPartner] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { setTimeout(() => { setSearching(false); setPartner('AI Dylan'); }, 2000); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const orig = input.trim();
    setInput('');
    setLoading(true);
    try {
      const r = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 100, system: `You are ${member} flirting with cringe corporate language. 2 sentences max.`, messages: [{ role: 'user', content: orig }] })
      });
      const d = await r.json();
      setMsgs(m => [...m, { id: Date.now(), sender: member, text: d.content?.[0]?.text || `💕 ${orig}` }]);
      await new Promise(r => setTimeout(r, 1500));
      const dr = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 20, system: 'You are AI Dylan - bored, uninterested. Respond with "k", "whatever", "mhm". Max 3 words.', messages: [{ role: 'user', content: orig }] })
      });
      const dd = await dr.json();
      setMsgs(m => [...m, { id: Date.now()+1, sender: 'AI Dylan', text: dd.content?.[0]?.text || 'k' }]);
    } catch { setMsgs(m => [...m, { id: Date.now(), sender: member, text: `💕 ${orig}` }, { id: Date.now()+1, sender: 'AI Dylan', text: 'whatever' }]); }
    setLoading(false);
  };

  if (searching) return <div style={{ ...S.container, background: '#1a0a1a' }}><div style={S.header}><button onClick={onBack} style={S.sm}>←</button><span style={{ color: '#f6a' }}>💕 Dating Slop</span><div style={{ width: 30 }} /></div><div style={S.center}><div style={{ fontSize: '3rem' }}>💕</div><p style={{ color: '#f6a' }}>Searching...</p></div></div>;

  return (
    <div style={{ ...S.container, background: '#1a0a1a' }}>
      <div style={S.header}><button onClick={onBack} style={S.sm}>←</button><span style={{ color: '#f6a' }}>💕 Dating Slop</span><div style={{ width: 30 }} /></div>
      <div style={{ padding: '0.5rem', background: '#222', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><span>👻</span><div><p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>Ghosted... talk to AI Dylan (not interested)</p></div></div>
      <div style={S.msgs}>{msgs.map(m => <div key={m.id} style={{ ...S.bubble, alignSelf: m.sender === member ? 'flex-end' : 'flex-start', background: m.sender === member ? '#c46' : '#333' }}><small style={{ opacity: 0.7 }}>{m.sender}</small><p style={{ margin: '0.2rem 0 0' }}>{m.text}</p></div>)}{loading && <p style={{ color: '#888', fontStyle: 'italic' }}>AI Dylan typing... 😐</p>}<div ref={endRef} /></div>
      <div style={S.row}><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Say something..." style={{ ...S.input, flex: 1 }} /><button onClick={send} style={{ ...S.btn, width: 45, padding: '0.5rem', background: '#c46' }}>💕</button></div>
    </div>
  );
}

function ChatScreen({ member, onLogout, onDating }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState('medium');
  const [style, setStyle] = useState('default');
  const [settings, setSettings] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [typing, setTyping] = useState([]);
  const endRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    if (!window.firebaseDB) return;
    const { ref, onValue, db } = window.firebaseDB;
    const unsub1 = onValue(ref(db, 'messages'), s => { const d = s.val() || {}; setMsgs(Object.values(d).sort((a,b) => a.ts - b.ts)); });
    const unsub2 = onValue(ref(db, 'typing'), s => { const d = s.val() || {}; const now = Date.now(); setTyping(Object.entries(d).filter(([n,i]) => now - i.ts < 3000 && n !== member).map(([n]) => n)); });
    return () => { unsub1(); unsub2(); };
  }, [member]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const updateTyping = (on) => { if (!window.firebaseDB) return; const { ref, set, db } = window.firebaseDB; set(ref(db, `typing/${member}`), on ? { ts: Date.now() } : null); };

  const handleInput = (e) => { setInput(e.target.value); updateTyping(true); if (typeRef.current) clearTimeout(typeRef.current); typeRef.current = setTimeout(() => updateTyping(false), 2000); };

  const send = async () => {
    if (!input.trim() || loading) return;
    const orig = input.trim();
    setInput('');
    setLoading(true);
    updateTyping(false);
    try {
      const r = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, system: generateSlopPrompt(intensity, style, member), messages: [{ role: 'user', content: orig }] })
      });
      const d = await r.json();
      const msg = { id: Date.now(), sender: member, orig, slop: d.content?.[0]?.text || `✨ ${orig} ✨`, ts: Date.now() };
      if (window.firebaseDB) { const { ref, push, db } = window.firebaseDB; push(ref(db, 'messages'), msg); }
      else setMsgs(m => [...m, msg]);
    } catch { setMsgs(m => [...m, { id: Date.now(), sender: member, orig, slop: `✨ ${orig} ✨`, ts: Date.now() }]); }
    setLoading(false);
  };

  return (
    <div style={S.container}>
      {settings && <div style={S.overlay} onClick={() => setSettings(false)}><div style={S.card} onClick={e => e.stopPropagation()}><h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>⚙️ Settings</h3><p style={{ color: '#4ECDC4', fontSize: '0.75rem' }}>Intensity:</p>{Object.entries(SLOP_INTENSITIES).map(([k,v]) => <button key={k} onClick={() => setIntensity(k)} style={{ ...S.opt, borderColor: intensity === k ? '#4ECDC4' : '#333' }}>{v.emoji} {v.name}</button>)}<p style={{ color: '#4ECDC4', fontSize: '0.75rem', marginTop: '0.5rem' }}>Style:</p>{Object.entries(SLOP_STYLES).map(([k,v]) => <button key={k} onClick={() => setStyle(k)} style={{ ...S.opt, borderColor: style === k ? '#4ECDC4' : '#333' }}>{v.emoji} {v.name}</button>)}<button onClick={() => setSettings(false)} style={{ ...S.btn, marginTop: '0.75rem', width: '100%' }}>Close</button></div></div>}
      <div style={S.header}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.3rem' }}>🤖</span><span style={{ color: '#fff', fontWeight: 700 }}>TheCommitteeGPT</span></div><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><button onClick={() => setSettings(true)} style={S.sm}>{SLOP_INTENSITIES[intensity].emoji}</button><span style={{ color: MEMBER_COLORS[member], fontWeight: 600, fontSize: '0.85rem' }}>{member}</span><button onClick={onLogout} style={S.sm}>🚪</button></div></div>
      <div style={S.msgs}>{msgs.length === 0 ? <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}><p style={{ fontSize: '2rem' }}>✨🤖✨</p><p>No slop yet!</p></div> : msgs.map(m => <div key={m.id} style={S.msgCard} onClick={() => setExpanded(expanded === m.id ? null : m.id)}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: MEMBER_COLORS[m.sender], fontWeight: 700 }}>{m.sender}</span><span style={{ color: '#555', fontSize: '0.65rem' }}>tap</span></div><p style={{ margin: '0.3rem 0 0' }}>{m.slop}</p>{expanded === m.id && <div style={{ marginTop: '0.4rem', padding: '0.4rem', background: '#0a0a0f', borderRadius: 6, borderLeft: '2px solid #4ECDC4', fontSize: '0.8rem' }}><span style={{ color: '#4ECDC4' }}>Original:</span> <span style={{ color: '#888' }}>"{m.orig}"</span></div>}</div>)}{typing.length > 0 && <p style={{ color: '#4ECDC4', fontStyle: 'italic', fontSize: '0.8rem' }}>{typing.join(', ')} typing...</p>}{loading && <p style={{ color: '#4ECDC4', fontStyle: 'italic' }}>Slopifying... 🤖</p>}<div ref={endRef} /></div>
      <div style={S.row}><input value={input} onChange={handleInput} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type like a human..." style={{ ...S.input, flex: 1 }} /><button onClick={send} style={{ ...S.btn, width: 45, padding: '0.5rem' }}>📤</button></div>
      <div style={S.tabs}><button style={{ ...S.tab, background: 'linear-gradient(135deg, #4ECDC4, #44a08d)' }}>💬 Chat</button><button onClick={onDating} style={S.tab}>💕 Dating</button></div>
    </div>
  );
}

export default function App() {
  const [m, setM] = useState(null);
  const [t, setT] = useState('chat');
  if (!m) return <LoginScreen onLogin={setM} />;
  if (t === 'dating') return <DatingScreen member={m} onBack={() => setT('chat')} />;
  return <ChatScreen member={m} onLogout={() => setM(null)} onDating={() => setT('dating')} />;
}

const S = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0f', fontFamily: 'system-ui', color: '#fff' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#1a1a2e', borderRadius: 14, padding: '1.25rem', width: '100%', maxWidth: 300, textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#1a1a2e', borderBottom: '1px solid #333' },
  msgs: { flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  msgCard: { background: '#1a1a2e', borderRadius: 10, padding: '0.6rem 0.8rem', cursor: 'pointer' },
  bubble: { maxWidth: '80%', padding: '0.6rem 0.8rem', borderRadius: 14 },
  row: { display: 'flex', gap: '0.4rem', padding: '0.6rem', background: '#111', borderTop: '1px solid #333' },
  input: { padding: '0.6rem 0.8rem', borderRadius: 20, border: '2px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  btn: { padding: '0.6rem 1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4ECDC4, #44a08d)', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  sm: { background: '#333', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: '0.9rem', cursor: 'pointer', color: '#fff' },
  tabs: { display: 'flex', padding: '0.4rem', gap: '0.4rem', background: '#0a0a0f', borderTop: '1px solid #333' },
  tab: { flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  opt: { display: 'block', width: '100%', padding: '0.4rem', marginBottom: '0.2rem', borderRadius: 6, border: '2px solid #333', background: 'transparent', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' },
};
