import { useState, useEffect, useRef, useCallback } from 'react';

// Word Art presets
const WORD_ART_PRESETS = [
  {
    id: 'rainbow',
    label: 'Rainbow',
    preview: 'Rainbow',
    style: 'background: linear-gradient(90deg, #ff0080, #ff8c00, #ffe100, #00d2ff, #3a7bd5, #9b59b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'fire',
    label: 'Fire',
    preview: 'Fire',
    style: 'background: linear-gradient(180deg, #fff700 0%, #ff8c00 40%, #ff2200 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 900; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: 'Ocean',
    style: 'background: linear-gradient(135deg, #00c6ff, #0072ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'neon-pink',
    label: 'Neon Pink',
    preview: 'Neon',
    style: 'color: #ff2d9b; text-shadow: 0 0 8px #ff2d9b, 0 0 20px #ff2d9b, 0 0 40px #ff2d9b; font-weight: 800; letter-spacing: 0.05em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'neon-cyan',
    label: 'Neon Blue',
    preview: 'Neon',
    style: 'color: #00f5ff; text-shadow: 0 0 8px #00f5ff, 0 0 20px #00f5ff, 0 0 40px #00bfff; font-weight: 800; letter-spacing: 0.05em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'neon-green',
    label: 'Neon Green',
    preview: 'Neon',
    style: 'color: #39ff14; text-shadow: 0 0 8px #39ff14, 0 0 20px #39ff14, 0 0 40px #00ff00; font-weight: 800; letter-spacing: 0.05em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'gold',
    label: 'Gold',
    preview: 'Gold',
    style: 'background: linear-gradient(135deg, #f7971e, #ffd200, #f7971e, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 900; letter-spacing: 0.03em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'shadow-3d',
    label: '3D Shadow',
    preview: '3D',
    style: 'color: #fff; text-shadow: 1px 1px 0 #b0b0b0, 2px 2px 0 #a0a0a0, 3px 3px 0 #909090, 4px 4px 0 #808080, 5px 5px 8px rgba(0,0,0,0.4); font-weight: 900; letter-spacing: 0.05em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'retro',
    label: 'Retro',
    preview: 'Retro',
    style: 'background: linear-gradient(180deg, #fd1d1d, #fcb045); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 900; letter-spacing: 0.08em; font-style: italic; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    preview: 'Galaxy',
    style: 'background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'mint',
    label: 'Mint',
    preview: 'Mint',
    style: 'background: linear-gradient(135deg, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; display: inline; vertical-align: baseline; font-size: 32px;',
  },
  {
    id: 'chrome',
    label: 'Chrome',
    preview: 'Chrome',
    style: 'background: linear-gradient(180deg, #e0e0e0 0%, #ffffff 30%, #b0b0b0 50%, #ffffff 70%, #c8c8c8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 900; letter-spacing: 0.05em; display: inline; vertical-align: baseline; font-size: 32px;',
  },
];

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    title: 'Getting Started 🖋️',
    content: '<p>Welcome to <strong>Hokka</strong>! Use the toolbar above to format your text.</p><p><br></p><p>Features:</p><ul><li>🚀 Font family selection</li><li>🔠 Font size control</li><li><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s> text styles</li><li>🎨 Beautiful themes</li><li>📂 Auto-save (LocalStorage)</li></ul><p><br></p><p>Clear this page or press <strong>+</strong> in the top left to create a new document.</p>',
    updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: '2',
    title: 'Idea Scratchpad 💡',
    content: '<p>Great ideas often start with simple sketches.</p><p><br></p><ul><li>Project idea: <em>A modern rich text editor built with React.</em></li><li>Design: <strong>Minimalist</strong>, easy on the eyes, focus mode.</li><li>Stack: Vite + React + Tailwind v4</li></ul>',
    updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
];

const FONTS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
];

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

const THEMES = {
  peach: {
    name: 'Peach',
    bg: 'bg-[#fff5f0] text-[#5c3a21]',
    editorBg: 'bg-white border-[#fce3d5] text-[#5c3a21]',
    sidebarBg: 'bg-[#fdf0e9] border-[#f8dbcc]',
    cardBg: 'bg-white border-[#fce3d5]',
    accent: 'bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white',
    accentText: 'text-[#ff7b88]',
    buttonBg: 'bg-white hover:bg-[#fff5f0] border-[#fce3d5] text-[#5c3a21]',
    activeDocBg: 'bg-white border-[#ffb3ba] text-[#5c3a21]',
    hoverDocBg: 'hover:bg-white/60',
    toolbarBg: 'bg-[#fff5f0]/95 border-[#fce3d5]',
    toolbarBtn: 'hover:bg-[#fce3d5] text-[#5c3a21] border-[#fce3d5]',
    toolbarBtnActive: 'bg-[#ff9a9e]/20 text-[#ff7b88] border-[#ff9a9e]/40',
    selectBg: 'bg-white border-[#fce3d5] text-[#5c3a21]',
    placeholderColor: '#c4a693',
    editorColor: '#5c3a21',
    pageBg: '#f8dfd8',
    paperBg: '#ffffff',
    paperColor: '#5c3a21',
    paperShadow: '0 4px 24px rgba(255,154,158,0.2)',
    rulerBg: '#fdf0e9',
    rulerBorder: '#f8dbcc',
    rulerTick: '#f0b8b0',
    rulerText: '#d08888',
  },
  matcha: {
    name: 'Matcha',
    bg: 'bg-[#f4f7f2] text-[#2c3d24]',
    editorBg: 'bg-white border-[#e0ebd8] text-[#2c3d24]',
    sidebarBg: 'bg-[#ebf0e6] border-[#d8e3ce]',
    cardBg: 'bg-white border-[#e0ebd8]',
    accent: 'bg-gradient-to-br from-[#a2b997] to-[#cbe3db] text-[#2c3d24]',
    accentText: 'text-[#87a07a]',
    buttonBg: 'bg-white hover:bg-[#f4f7f2] border-[#e0ebd8] text-[#2c3d24]',
    activeDocBg: 'bg-white border-[#c0d6ad] text-[#2c3d24]',
    hoverDocBg: 'hover:bg-white/60',
    toolbarBg: 'bg-[#f4f7f2]/95 border-[#e0ebd8]',
    toolbarBtn: 'hover:bg-[#e0ebd8] text-[#2c3d24] border-[#e0ebd8]',
    toolbarBtnActive: 'bg-[#a2b997]/20 text-[#87a07a] border-[#a2b997]/40',
    selectBg: 'bg-white border-[#e0ebd8] text-[#2c3d24]',
    placeholderColor: '#9fb691',
    editorColor: '#2c3d24',
    pageBg: '#d8e8cc',
    paperBg: '#ffffff',
    paperColor: '#2c3d24',
    paperShadow: '0 4px 24px rgba(162,185,151,0.25)',
    rulerBg: '#ebf0e6',
    rulerBorder: '#d8e3ce',
    rulerTick: '#b0c8a0',
    rulerText: '#87a07a',
  },
  lavender: {
    name: 'Lavender',
    bg: 'bg-[#12101e] text-[#e0ddf3]',
    editorBg: 'bg-[#18152c]/80 border-[#2d284f] text-[#e0ddf3]',
    sidebarBg: 'bg-[#0f0d19] border-[#201b35]',
    cardBg: 'bg-[#18152c]/80 border-[#2d284f]',
    accent: 'bg-gradient-to-br from-[#b399ff] to-[#ff99f0] text-slate-950 font-semibold',
    accentText: 'text-[#b399ff]',
    buttonBg: 'bg-[#18152c] hover:bg-[#201c3b] border-[#2d284f] text-[#e0ddf3]',
    activeDocBg: 'bg-[#1c1933] border-[#7254d6]/60 text-white',
    hoverDocBg: 'hover:bg-[#18152c]/50',
    toolbarBg: 'bg-[#0f0d19]/95 border-[#201b35]',
    toolbarBtn: 'hover:bg-[#201c3b] text-[#b399ff] border-[#2d284f]',
    toolbarBtnActive: 'bg-[#7254d6]/30 text-[#d4b8ff] border-[#7254d6]/50',
    selectBg: 'bg-[#18152c] border-[#2d284f] text-[#e0ddf3]',
    placeholderColor: '#6e6896',
    editorColor: '#e0ddf3',
    pageBg: '#0a0814',
    paperBg: '#18152c',
    paperColor: '#e0ddf3',
    paperShadow: '0 4px 32px rgba(114,84,214,0.3), 0 1px 4px rgba(0,0,0,0.6)',
    rulerBg: '#0f0d19',
    rulerBorder: '#201b35',
    rulerTick: '#3d3560',
    rulerText: '#6e6896',
  },
  coffee: {
    name: 'Coffee',
    bg: 'bg-[#f9f6f0] text-[#3e2723]',
    editorBg: 'bg-white border-[#efe5d3] text-[#3e2723]',
    sidebarBg: 'bg-[#efe5d3] border-[#e2d4bd]',
    cardBg: 'bg-white border-[#efe5d3]',
    accent: 'bg-gradient-to-br from-[#a1887f] to-[#d7ccc8] text-[#3e2723] font-semibold',
    accentText: 'text-[#8d6e63]',
    buttonBg: 'bg-white hover:bg-[#f9f6f0] border-[#efe5d3] text-[#3e2723]',
    activeDocBg: 'bg-white border-[#d7ccc8] text-[#3e2723]',
    hoverDocBg: 'hover:bg-white/60',
    toolbarBg: 'bg-[#f9f6f0]/95 border-[#efe5d3]',
    toolbarBtn: 'hover:bg-[#efe5d3] text-[#3e2723] border-[#efe5d3]',
    toolbarBtnActive: 'bg-[#a1887f]/20 text-[#8d6e63] border-[#a1887f]/40',
    selectBg: 'bg-white border-[#efe5d3] text-[#3e2723]',
    placeholderColor: '#baa594',
    editorColor: '#3e2723',
    pageBg: '#d8cab4',
    paperBg: '#ffffff',
    paperColor: '#3e2723',
    paperShadow: '0 4px 24px rgba(161,136,127,0.2)',
    rulerBg: '#efe5d3',
    rulerBorder: '#e2d4bd',
    rulerTick: '#c4a882',
    rulerText: '#a08060',
  }
};

// Cetvel (Ruler)
const PAPER_WIDTH = 860;
const PAPER_PADDING_H = 80;
const CM_PX = 37.795; // 1cm = 37.795px at 96dpi

function Ruler({ theme }) {
  const totalCm = Math.ceil(PAPER_WIDTH / CM_PX);
  const ticks = [];
  for (let i = 0; i <= totalCm * 2; i++) {
    const x = i * (CM_PX / 2);
    const isMajor = i % 2 === 0;
    const cm = i / 2;
    ticks.push({ x, isMajor, cm });
  }
  return (
    <div style={{
      width: PAPER_WIDTH,
      margin: '0 auto',
      height: 30,
      position: 'relative',
      background: theme.rulerBg,
      borderBottom: `1px solid ${theme.rulerBorder}`,
      userSelect: 'none',
      flexShrink: 0,
    }}>
      {/* Margin shading */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: PAPER_PADDING_H, height: '100%', background: 'rgba(0,0,0,0.08)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: PAPER_PADDING_H, height: '100%', background: 'rgba(0,0,0,0.08)' }} />
      {/* Margin lines */}
      <div style={{ position: 'absolute', left: PAPER_PADDING_H, top: 0, width: 1, height: '100%', background: '#4f8ef7', opacity: 0.5 }} />
      <div style={{ position: 'absolute', right: PAPER_PADDING_H, top: 0, width: 1, height: '100%', background: '#4f8ef7', opacity: 0.5 }} />
      {ticks.map(({ x, isMajor, cm }) => (
        <div key={x} style={{ position: 'absolute', left: x, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 1,
            height: isMajor ? 10 : 5,
            background: theme.rulerTick,
          }} />
          {isMajor && cm > 0 && (
            <span style={{
              position: 'absolute',
              bottom: 12,
              fontSize: 8,
              color: theme.rulerText,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
            }}>{cm}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Toolbar button bileşeni
function ToolbarBtn({ onClick, active, title, children, className = '' }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium
        transition-all duration-150 cursor-pointer select-none
        ${className}
      `}
      aria-label={title}
    >
      {children}
    </button>
  );
}

// Divider
function Divider() {
  return <div className="w-px h-6 bg-current opacity-10 mx-1" />;
}

// Word Art Panel
function WordArtPanel({ onApply, onClose, theme }) {
  return (
    <div
      className="absolute z-50 top-full mt-2 left-0 rounded-2xl border shadow-2xl p-4 word-art-panel"
      style={{
        background: 'rgba(15, 15, 25, 0.97)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15)',
        width: '320px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>✨</span>
          <span className="font-bold text-sm" style={{ color: '#c084fc', letterSpacing: '0.05em' }}>WORD ART</span>
        </div>
        <button
          onMouseDown={(e) => { e.preventDefault(); onClose(); }}
          className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-all"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Select text then pick a style</p>
      <div className="grid grid-cols-3 gap-2">
        {WORD_ART_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onMouseDown={(e) => { e.preventDefault(); onApply(preset); }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl cursor-pointer transition-all group word-art-preset-btn"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            title={preset.label}
          >
            <span
              style={{
                ...Object.fromEntries(
                  preset.style.split(';')
                    .filter(s => s.trim())
                    .map(s => {
                      const [k, ...v] = s.split(':');
                      const key = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                      return [key, v.join(':').trim()];
                    })
                ),
                fontSize: '14px',
                lineHeight: '1.2'
              }}
              className="leading-none select-none"
            >
              {preset.preview}
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('hokka_docs_v2');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem('hokka_docs_v2');
    const parsed = saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    return parsed[0]?.id || '1';
  });
  const [theme, setTheme] = useState('coffee');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wordArtOpen, setWordArtOpen] = useState(false);
  const wordArtRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [selectedFont, setSelectedFont] = useState('inherit');
  const [selectedSize, setSelectedSize] = useState('16');

  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('hokka_docs_v2', JSON.stringify(documents));
  }, [documents]);

  // Close word art panel when clicking outside
  useEffect(() => {
    if (!wordArtOpen) return;
    const handler = (e) => {
      if (wordArtRef.current && !wordArtRef.current.contains(e.target)) {
        setWordArtOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [wordArtOpen]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0] || { title: '', content: '' };
  const activeTheme = THEMES[theme];

  // Editor içeriğini dokümana yükle
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const editor = editorRef.current;
      if (editor.innerHTML !== activeDoc.content) {
        editor.innerHTML = activeDoc.content || '';
      }
    }
  }, [activeId, activeDoc.content]);

  const updateFormattingState = useCallback(() => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsStrikethrough(document.queryCommandState('strikeThrough'));
  }, []);

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return {
          ...doc,
          content: html,
          updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
    setTimeout(() => { isUpdatingRef.current = false; }, 0);
    updateFormattingState();
  }, [activeId, updateFormattingState]);

  // Otomatik başlık oluşturma
  const DEFAULT_TITLE_PATTERNS = ['Untitled Document 📝', 'Untitled Document', ''];
  useEffect(() => {
    const doc = documents.find(d => d.id === activeId);
    if (!doc) return;
    const isDefaultTitle = DEFAULT_TITLE_PATTERNS.includes(doc.title);
    if (!isDefaultTitle) return;
    const text = (doc.content || '').replace(/<[^>]*>/g, '').trim();
    if (!text) return;
    // İlk anlamlı cümleden veya kelimelerden başlık üret
    const firstLine = text.split(/[\n\r.!?]/)[0].trim();
    const words = firstLine.split(/\s+/).filter(w => w.length > 1).slice(0, 5);
    if (words.length === 0) return;
    const generated = words.join(' ');
    setDocuments(prev => prev.map(d =>
      d.id === activeId ? { ...d, title: generated } : d
    ));
  }, [activeId, documents.find(d => d.id === activeId)?.content]);

  const applyWordArt = useCallback((preset) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // No selection — insert sample text
      const range = sel ? sel.getRangeAt(0) : null;
      const span = document.createElement('span');
      span.setAttribute('style', preset.style);
      span.textContent = 'Word Art';
      if (range) {
        range.deleteContents();
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      const span = document.createElement('span');
      span.setAttribute('style', preset.style);
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    handleEditorInput();
    setWordArtOpen(false);
  }, [restoreSelection, handleEditorInput]);

  const execFormat = useCallback((command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      updateFormattingState();
      handleEditorInput();
    }
  }, [updateFormattingState, handleEditorInput]);

  const handleFontChange = useCallback((font) => {
    setSelectedFont(font);
    if (font === 'inherit') {
      execFormat('fontName', 'Arial');
    } else {
      execFormat('fontName', font.split(',')[0].replace(/"/g, '').trim());
    }
    // Apply via inline style on selection
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
    }
  }, [execFormat]);

  const handleSizeChange = useCallback((size) => {
    setSelectedSize(size);
    execFormat('fontSize', '7');
    // Override font-size via selection trick
    const fontEls = editorRef.current?.querySelectorAll('font[size="7"]');
    fontEls?.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = size + 'px';
    });
    handleEditorInput();
  }, [execFormat, handleEditorInput]);

  const handleTitleChange = (title) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return {
          ...doc,
          title,
          updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
  };

  const createNewDoc = () => {
    const newDoc = {
      id: Date.now().toString(),
      title: 'Untitled Document 📝',
      content: '',
      updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveId(newDoc.id);
  };

  const deleteDoc = (id, e) => {
    e.stopPropagation();
    if (documents.length === 1) {
      alert('At least one document must remain!');
      return;
    }
    const remaining = documents.filter(d => d.id !== id);
    setDocuments(remaining);
    if (activeId === id) {
      setActiveId(remaining[0].id);
    }
  };

  const copyToClipboard = () => {
    const text = editorRef.current?.innerText || activeDoc.content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const text = editorRef.current?.innerText || activeDoc.content;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDoc.title.replace(/[^\w\s\u00C0-\u017F-]/g, '') || 'belge'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // İstatistikler
  const rawText = editorRef.current?.innerText || activeDoc.content?.replace(/<[^>]*>/g, '') || '';
  const charCount = rawText.length;
  const wordCount = rawText.trim() === '' ? 0 : rawText.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    (doc.content?.replace(/<[^>]*>/g, '') || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex ${activeTheme.bg} transition-colors duration-300 font-sans h-screen overflow-hidden`}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Sol Menü (Sidebar) */}
      <div
        className={`${sidebarOpen ? 'w-72' : 'w-0'} flex flex-col ${activeTheme.sidebarBg} border-r transition-all duration-300 overflow-hidden relative z-10`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${activeTheme.accent} flex items-center justify-center font-bold text-lg shadow-sm`}>
              H
            </div>
            <h1 className="font-semibold text-lg tracking-wide">Hokka</h1>
          </div>
          <button
            onClick={createNewDoc}
            className={`p-2 rounded-lg ${activeTheme.accent} transition-transform hover:scale-105 cursor-pointer flex items-center justify-center`}
            title="New Document"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-inherit opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${activeTheme.editorBg} focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveId(doc.id)}
              className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                activeId === doc.id
                  ? activeTheme.activeDocBg
                  : `border-transparent ${activeTheme.hoverDocBg}`
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="font-medium text-sm truncate">{doc.title || 'Untitled Document'}</span>
              </div>
              <button
                onClick={(e) => deleteDoc(doc.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all cursor-pointer shrink-0"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-8 opacity-40 text-sm">
              No documents found.
            </div>
          )}
        </div>

        {/* Sidebar Footer - Theme Switcher */}
        <div className="p-4 border-t border-inherit flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Theme</span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(THEMES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`px-2 py-1.5 text-xs rounded-md border transition-all cursor-pointer text-center font-medium ${
                  theme === key
                    ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-semibold'
                    : 'border-transparent opacity-75 hover:opacity-100 bg-black/10'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Üst Bar */}
        <header className="h-14 border-b border-inherit px-4 flex items-center justify-between gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <input
              type="text"
              value={activeDoc.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="bg-transparent font-semibold text-lg md:text-xl focus:outline-none border-b border-transparent hover:border-inherit/30 focus:border-violet-500 transition-all py-1 max-w-[200px] md:max-w-sm"
              placeholder="Enter Title"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title="Copy"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-green-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={downloadTxt}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title="Download (.txt)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </header>

        {/* Formatting Toolbar */}
        <div className={`shrink-0 border-b ${activeTheme.toolbarBg} px-4 py-2 flex items-center gap-1 flex-wrap z-10`}>
          {/* Font Ailesi */}
          <select
            id="font-family-select"
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className={`text-xs px-2 py-1.5 rounded-md border ${activeTheme.selectBg} focus:outline-none cursor-pointer transition-all h-8`}
            title="Font Ailesi"
          >
            {FONTS.map(f => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Boyutu */}
          <select
            id="font-size-select"
            value={selectedSize}
            onChange={(e) => handleSizeChange(e.target.value)}
            className={`text-xs px-2 py-1.5 rounded-md border ${activeTheme.selectBg} focus:outline-none cursor-pointer transition-all h-8 w-16`}
            title="Font Boyutu"
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>

          <Divider />

          {/* Bold */}
          <ToolbarBtn
            onClick={() => execFormat('bold')}
            active={isBold}
            title="Bold (Ctrl+B)"
            className={isBold ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6 4.5h5.25A3.75 3.75 0 0115 8.25a3.75 3.75 0 01-1.5 3 4.5 4.5 0 012.25 3.938A4.5 4.5 0 0111.25 19.5H6a.75.75 0 01-.75-.75V5.25A.75.75 0 016 4.5zm.75 6h4.5a2.25 2.25 0 000-4.5H6.75v4.5zm0 7.5h4.5a3 3 0 000-6H6.75v6z" />
            </svg>
          </ToolbarBtn>

          {/* Italic */}
          <ToolbarBtn
            onClick={() => execFormat('italic')}
            active={isItalic}
            title="Italic (Ctrl+I)"
            className={isItalic ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M10 4.5h8a.75.75 0 010 1.5H14.5L9.5 18H13a.75.75 0 010 1.5H5a.75.75 0 010-1.5h3.5L13.5 6H10a.75.75 0 010-1.5z" />
            </svg>
          </ToolbarBtn>

          {/* Underline */}
          <ToolbarBtn
            onClick={() => execFormat('underline')}
            active={isUnderline}
            title="Underline (Ctrl+U)"
            className={isUnderline ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M5.75 19.5a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H5.75zm1.5-15v7.75a4.75 4.75 0 009.5 0V4.5a.75.75 0 011.5 0v7.75a6.25 6.25 0 01-12.5 0V4.5a.75.75 0 011.5 0z" />
            </svg>
          </ToolbarBtn>

          {/* Strikethrough */}
          <ToolbarBtn
            onClick={() => execFormat('strikeThrough')}
            active={isStrikethrough}
            title="Strikethrough"
            className={isStrikethrough ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M4.5 12.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15zM8 7.5c0-1.657 1.791-3 4-3 1.331 0 2.508.506 3.226 1.268a.75.75 0 001.048-1.073C15.197 3.53 13.666 3 12 3c-3.038 0-5.5 1.944-5.5 4.5 0 .657.163 1.276.447 1.833a.75.75 0 001.346-.666A2.51 2.51 0 018 7.5zm8.053 9c0 1.657-1.791 3-4.003 3-1.425 0-2.682-.57-3.39-1.425a.75.75 0 10-1.17.942C8.39 20.337 10.08 21 12.05 21c3.038 0 5.503-1.944 5.503-4.5a3.9 3.9 0 00-.233-1.333.75.75 0 10-1.419.494c.097.268.152.552.152.839z" />
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Hizalama */}
          <ToolbarBtn
            onClick={() => execFormat('justifyLeft')}
            title="Align Left"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm0 4.5a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('justifyCenter')}
            title="Center"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm3 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9.75zm-3 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm3 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('justifyRight')}
            title="Align Right"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm6 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H9.75A.75.75 0 019 9.75zm-6 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm6 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H9.75a.75.75 0 01-.75-.75z" />
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Liste */}
          <ToolbarBtn
            onClick={() => execFormat('insertUnorderedList')}
            title="Bullet List"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('insertOrderedList')}
            title="Numbered List"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 6a.75.75 0 01.75-.75H4.5a.75.75 0 01.75.75v3.75H6a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75V6.75H3.75A.75.75 0 013 6zm0 7.5a.75.75 0 01.75-.75h2.25c.257 0 .5.103.682.284l.14.14a.75.75 0 11-1.06 1.06l-.072-.07H4.5v.75H5.25a.75.75 0 01.75.75v.75H4.5v.75h1.5a.75.75 0 010 1.5H3.75A.75.75 0 013 18v-.75a.75.75 0 01.75-.75H4.5v-.75H3.75A.75.75 0 013 15v-.75A.75.75 0 013.75 13.5H3A.75.75 0 013 13.5zm5.25-9a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 018.25 4.5zm0 4.5a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 018.25 9zm0 4.5a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Geri al / Yinele */}
          <ToolbarBtn
            onClick={() => execFormat('undo')}
            title="Undo (Ctrl+Z)"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('redo')}
            title="Redo (Ctrl+Y)"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M14.47 2.47a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.72-4.72H9a5.25 5.25 0 100 10.5h3a.75.75 0 010 1.5H9a6.75 6.75 0 010-13.5h10.19l-4.72-4.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Biçimlendirmeyi Temizle */}
          <ToolbarBtn
            onClick={() => execFormat('removeFormat')}
            title="Clear Formatting"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6.96 4.44l10.59 10.59-2.34 2.34H14l-2-2H9.34l-.36.36L7.25 17H5l2.5-2.5L3.44 10.5l3.52-6.06zM19 3L5 17l1.41 1.41L20.41 4.41 19 3z" />
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Word Art */}
          <div className="relative" ref={wordArtRef}>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setWordArtOpen(v => !v);
              }}
              title="Word Art"
              className={`
                flex items-center gap-1.5 px-2.5 h-8 rounded-md border text-xs font-semibold
                transition-all duration-150 cursor-pointer select-none
                ${wordArtOpen ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
              `}
              style={wordArtOpen ? {} : {}}
            >
              <span>✨ Word Art</span>
            </button>
            {wordArtOpen && (
              <WordArtPanel
                onApply={applyWordArt}
                onClose={() => setWordArtOpen(false)}
                theme={activeTheme}
              />
            )}
          </div>
        </div>

        {/* Yazı Editörü - Google Docs tarzı kağıt düzeni */}
        <main
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ background: activeTheme.pageBg }}
        >
          {/* Cetvel */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <Ruler theme={activeTheme} />
          </div>

          {/* Kağıt */}
          <div style={{ padding: '32px 0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: PAPER_WIDTH,
                minHeight: '1100px',
                background: activeTheme.paperBg,
                color: activeTheme.paperColor,
                boxShadow: activeTheme.paperShadow,
                padding: `60px ${PAPER_PADDING_H}px`,
                position: 'relative',
              }}
            >
              <div
                id="rich-text-editor"
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={updateFormattingState}
                onMouseUp={updateFormattingState}
                onSelect={updateFormattingState}
                data-placeholder="Start writing..."
                className="focus:outline-none editor-content"
                style={{
                  fontFamily: selectedFont === 'inherit' ? 'Inter, sans-serif' : selectedFont,
                  fontSize: selectedSize + 'px',
                  minHeight: '980px',
                  lineHeight: 1.8,
                  color: activeTheme.paperColor,
                }}
              />
            </div>
          </div>
        </main>

        {/* Alt Bilgi Barı */}
        <footer className="h-10 border-t border-inherit px-6 flex items-center justify-between text-xs opacity-60 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span><strong>Characters:</strong> {charCount}</span>
            <span><strong>Words:</strong> {wordCount}</span>
          </div>
          <div>
            <span>⏱️ {readingTime} min read</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
