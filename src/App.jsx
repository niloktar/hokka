import { useState, useEffect, useRef, useCallback } from 'react';
import { useCollaboration } from './collaboration/useCollaboration';
import CollaborationBar from './collaboration/CollaborationBar';
import CursorOverlay from './collaboration/CursorOverlay';
import { useAuth } from './auth/AuthContext';
import LoginScreen from './auth/LoginScreen';

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

const FONT_OPTIONS = FONTS.map(f => ({ label: f.label, value: f.value, style: { fontFamily: f.value } }));
const FONT_SIZE_OPTIONS = FONT_SIZES.map(s => ({ label: s + 'px', value: s }));
const FORMAT_OPTIONS = [
  { label: 'Normal Text', value: 'p' },
  { label: 'Heading 1', value: 'h1', style: { fontWeight: 'bold', fontSize: '15px' } },
  { label: 'Heading 2', value: 'h2', style: { fontWeight: 'bold', fontSize: '13px' } },
  { label: 'Heading 3', value: 'h3', style: { fontWeight: 'bold', fontSize: '11px' } },
  { label: 'Blockquote', value: 'blockquote', style: { fontStyle: 'italic' } }
];
const LINE_SPACING_OPTIONS = [
  { label: 'Single', value: '1.0' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '1.8', value: '1.8' },
  { label: 'Double', value: '2.0' }
];
const INSERT_OPTIONS = [
  { label: '🔗 Link', value: 'link' },
  { label: '🖼️ Image URL', value: 'image' },
  { label: '📊 Table Grid', value: 'table' },
  { label: 'Divider Line', value: 'hr' }
];

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

function Ruler({ theme, leftMargin, rightMargin, onLeftMarginChange, onRightMarginChange }) {
  const totalCm = Math.ceil(PAPER_WIDTH / CM_PX);
  const ticks = [];
  for (let i = 0; i <= totalCm * 2; i++) {
    const x = i * (CM_PX / 2);
    const isMajor = i % 2 === 0;
    const cm = i / 2;
    ticks.push({ x, isMajor, cm });
  }

  const rulerRef = useRef(null);
  const draggingRef = useRef(null); // 'left' | 'right' | null

  const handleMouseDown = useCallback((side, e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = side;

    const onMouseMove = (moveEvent) => {
      if (!rulerRef.current || !draggingRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;

      if (draggingRef.current === 'left') {
        const clamped = Math.max(20, Math.min(x, PAPER_WIDTH - rightMargin - 100));
        onLeftMarginChange(Math.round(clamped));
      } else {
        const fromRight = PAPER_WIDTH - (moveEvent.clientX - rect.left);
        const clamped = Math.max(20, Math.min(fromRight, PAPER_WIDTH - leftMargin - 100));
        onRightMarginChange(Math.round(clamped));
      }
    };

    const onMouseUp = () => {
      draggingRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftMargin, rightMargin, onLeftMarginChange, onRightMarginChange]);

  // Elegant handle renderer
  const renderHandle = (side) => {
    const marginVal = side === 'left' ? leftMargin : rightMargin;
    const posStyle = side === 'left'
      ? { left: marginVal - 7 }
      : { right: rightMargin - 7 };

    return (
      <div
        onMouseDown={(e) => handleMouseDown(side, e)}
        title={side === 'left' ? 'Sol kenar boşluğunu sürükle' : 'Sağ kenar boşluğunu sürükle'}
        className="ruler-handle"
        style={{
          position: 'absolute',
          bottom: 0,
          ...posStyle,
          width: 14,
          height: 20,
          cursor: 'col-resize',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/* Top triangle pointer */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: `5px solid ${theme.rulerTick}`,
          flexShrink: 0,
        }} />
        {/* Bottom rectangular grip */}
        <div style={{
          width: 10,
          height: 12,
          background: `linear-gradient(180deg, ${theme.rulerBg} 0%, ${theme.rulerTick} 100%)`,
          borderRadius: '0 0 3px 3px',
          border: `1px solid ${theme.rulerTick}`,
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}>
          {/* Grip lines */}
          <div style={{ width: 5, height: 1, background: theme.rulerText, borderRadius: 1, opacity: 0.6 }} />
          <div style={{ width: 5, height: 1, background: theme.rulerText, borderRadius: 1, opacity: 0.4 }} />
        </div>
      </div>
    );
  };

  return (
    <div
      ref={rulerRef}
      style={{
        width: PAPER_WIDTH,
        margin: '0 auto',
        height: 30,
        position: 'relative',
        background: theme.rulerBg,
        borderBottom: `1px solid ${theme.rulerBorder}`,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Margin shading */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: leftMargin, height: '100%', background: 'rgba(0,0,0,0.06)', transition: 'width 0.05s' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: rightMargin, height: '100%', background: 'rgba(0,0,0,0.06)', transition: 'width 0.05s' }} />
      {/* Margin lines — subtle dashed */}
      <div style={{ position: 'absolute', left: leftMargin, top: 0, width: 1, height: '100%', background: theme.rulerTick, opacity: 0.45, transition: 'left 0.05s' }} />
      <div style={{ position: 'absolute', right: rightMargin, top: 0, width: 1, height: '100%', background: theme.rulerTick, opacity: 0.45, transition: 'right 0.05s' }} />
      {/* Draggable handles */}
      {renderHandle('left')}
      {renderHandle('right')}
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

// Elegant Custom Dropdown Component
function Dropdown({ label, value, options, onChange, title, className = '', selectBg, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || { label };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setIsOpen(v => !v); }}
        className={`flex items-center justify-between gap-1 px-2 h-8 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${selectBg} ${className}`}
        title={title}
      >
        <span className="truncate max-w-[90px] flex items-center justify-center">
          {icon ? icon : selectedOption.label}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 rounded-xl border shadow-xl py-1 z-50 overflow-hidden min-w-[140px] max-h-60 overflow-y-auto ${selectBg}`}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-current/5 transition-colors cursor-pointer flex items-center justify-between gap-2 text-current"
              style={opt.style ? opt.style : {}}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-80 shrink-0">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Elegant Color Dropdown Component
function ColorDropdown({ type, value, onChange, theme, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const colors = type === 'text' ? [
    { value: '#000000', label: 'Default', bg: 'bg-black border border-current/20' },
    { value: '#ef4444', label: 'Red', bg: 'bg-red-500' },
    { value: '#3b82f6', label: 'Blue', bg: 'bg-blue-500' },
    { value: '#10b981', label: 'Green', bg: 'bg-emerald-500' },
    { value: '#f59e0b', label: 'Orange', bg: 'bg-amber-500' },
    { value: '#8b5cf6', label: 'Purple', bg: 'bg-violet-500' },
    { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  ] : [
    { value: 'transparent', label: 'None', bg: 'bg-transparent border border-dashed border-current/30' },
    { value: '#fef08a', label: 'Yellow', bg: 'bg-yellow-200 border border-yellow-300' },
    { value: '#bbf7d0', label: 'Green', bg: 'bg-green-200 border border-green-300' },
    { value: '#93c5fd', label: 'Blue', bg: 'bg-blue-200 border border-blue-300' },
    { value: '#fbcfe8', label: 'Pink', bg: 'bg-pink-200 border border-pink-300' },
    { value: '#ddd6fe', label: 'Purple', bg: 'bg-purple-200 border border-purple-300' },
  ];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`flex items-center justify-between gap-1.5 px-2 h-8 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${theme.selectBg}`}
        title={title}
      >
        <span className="flex flex-col items-center justify-center gap-0.5 w-4 h-4">
          {type === 'text' ? (
            <span className="font-bold text-[10px] leading-none">A</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.25 2.25 0 00-3.182-3.182l-9.37 9.37a4.5 4.5 0 106.364 6.364l.93-.93" />
            </svg>
          )}
          {value && value !== 'transparent' && (
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: value }} />
          )}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 rounded-xl border shadow-xl p-2 z-50 grid grid-cols-4 gap-1.5 ${theme.selectBg}`}
          style={{ width: '120px' }}
        >
          {colors.map((c) => (
            <button
              key={c.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(c.value);
                setIsOpen(false);
              }}
              className={`w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform relative flex items-center justify-center ${c.bg}`}
              title={c.label}
            >
              {value === c.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Elegant Advanced Color Dropdown Component
function AdvancedColorDropdown({ value, onChange, theme, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const colorInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const primaryColors = [
    { value: '#000000', label: 'Black' },
    { value: '#4b5563', label: 'Gray' },
    { value: '#ef4444', label: 'Red' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#f97316', label: 'Orange' },
  ];

  const pastelColors = [
    { value: '#fca5a5', label: 'Soft Red' },
    { value: '#93c5fd', label: 'Soft Blue' },
    { value: '#6ee7b7', label: 'Soft Green' },
    { value: '#fef08a', label: 'Soft Yellow' },
    { value: '#c084fc', label: 'Soft Purple' },
    { value: '#ffedd5', label: 'Soft Orange' },
    { value: '#fbcfe8', label: 'Soft Pink' },
    { value: '#e2e8f0', label: 'Slate' },
  ];

  const vividColors = [
    { value: '#dc2626', label: 'Vivid Red' },
    { value: '#2563eb', label: 'Vivid Blue' },
    { value: '#059669', label: 'Vivid Green' },
    { value: '#ca8a04', label: 'Vivid Yellow' },
    { value: '#7c3aed', label: 'Vivid Purple' },
    { value: '#ea580c', label: 'Vivid Orange' },
    { value: '#db2777', label: 'Vivid Pink' },
    { value: '#0891b2', label: 'Vivid Cyan' },
  ];

  const handleCustomColorClick = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (e) => {
    onChange(e.target.value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`flex items-center justify-between gap-1 px-2.5 h-8 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${theme.selectBg}`}
        title={title}
      >
        <span className="flex flex-col items-center justify-center relative w-5 h-5 font-bold">
          <span className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent text-sm leading-none">A</span>
          <span 
            className="w-4 h-0.5 rounded-full absolute bottom-0" 
            style={{ backgroundColor: value || '#000000' }} 
          />
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 rounded-xl border shadow-xl p-3 z-50 flex flex-col gap-3 ${theme.selectBg}`}
          style={{ width: '220px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}
        >
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Standard</div>
            <div className="grid grid-cols-8 gap-1">
              {primaryColors.map(c => (
                <button
                  key={c.value}
                  onMouseDown={(e) => { e.preventDefault(); onChange(c.value); setIsOpen(false); }}
                  className="w-4.5 h-4.5 rounded-full cursor-pointer hover:scale-110 transition-transform border border-current/10 relative flex items-center justify-center"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {value === c.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Pastel</div>
            <div className="grid grid-cols-8 gap-1">
              {pastelColors.map(c => (
                <button
                  key={c.value}
                  onMouseDown={(e) => { e.preventDefault(); onChange(c.value); setIsOpen(false); }}
                  className="w-4.5 h-4.5 rounded-full cursor-pointer hover:scale-110 transition-transform border border-current/10 relative flex items-center justify-center"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {value === c.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Vivid</div>
            <div className="grid grid-cols-8 gap-1">
              {vividColors.map(c => (
                <button
                  key={c.value}
                  onMouseDown={(e) => { e.preventDefault(); onChange(c.value); setIsOpen(false); }}
                  className="w-4.5 h-4.5 rounded-full cursor-pointer hover:scale-110 transition-transform border border-current/10 relative flex items-center justify-center"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {value === c.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-current/10 pt-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Custom</span>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleCustomColorClick(); }}
              className="text-[10px] font-semibold flex items-center gap-1.5 px-2 py-1 rounded bg-current/5 hover:bg-current/10 border border-current/10 cursor-pointer text-current"
            >
              <span>🎨 Choose...</span>
            </button>
            <input
              type="color"
              ref={colorInputRef}
              onChange={handleCustomColorChange}
              value={value && value.startsWith('#') ? value : '#000000'}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Word Art Panel
function WordArtPanel({ onApply, onClose, theme }) {
  return (
    <div
      className={`absolute z-50 top-full mt-2 right-0 rounded-2xl border shadow-2xl p-4 word-art-panel ${theme.selectBg}`}
      style={{
        width: '320px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-3 border-b border-current/10 pb-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>✨</span>
          <span className="font-bold text-xs tracking-wider uppercase opacity-85">Word Art</span>
        </div>
        <button
          onMouseDown={(e) => { e.preventDefault(); onClose(); }}
          className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-all hover:bg-current/10 text-current opacity-60 hover:opacity-100"
          style={{ background: 'transparent' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] mb-3 opacity-60">Select text in the document then click a style below:</p>
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {WORD_ART_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onMouseDown={(e) => { e.preventDefault(); onApply(preset); }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition-all border border-current/10 hover:border-current/25 bg-current/5 hover:bg-current/10 text-current"
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
                fontSize: '13px',
                lineHeight: '1.2'
              }}
              className="leading-none select-none font-bold"
            >
              {preset.preview}
            </span>
            <span className="text-[9px] font-medium opacity-75 truncate w-full text-center">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Convert rgb(...) color string to hex format
function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (match) {
    return '#' + match.slice(1).map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  return '#000000';
}

// Top Menu Bar component
function MenuBar({
  theme,
  onCreateNew,
  onDownload,
  onRename,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onInsertLink,
  onInsertImage,
  onInsertTable,
  onInsertHr,
  onFormat,
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenu]);

  const menuItems = {
    File: [
      { label: 'New Document', onClick: onCreateNew, shortcut: '⌘N' },
      { label: 'Download (.txt)', onClick: onDownload, shortcut: '⌘S' },
      { label: 'Rename', onClick: onRename },
    ],
    Edit: [
      { label: 'Undo', onClick: onUndo, shortcut: '⌘Z' },
      { label: 'Redo', onClick: onRedo, shortcut: '⌘Y' },
      { type: 'divider' },
      { label: 'Cut', onClick: onCut, shortcut: '⌘X' },
      { label: 'Copy', onClick: onCopy, shortcut: '⌘C' },
      { label: 'Paste', onClick: onPaste, shortcut: '⌘V' },
    ],
    Insert: [
      { label: 'Image', onClick: onInsertImage },
      { label: 'Link', onClick: onInsertLink, shortcut: '⌘K' },
      { label: 'Table Grid', onClick: onInsertTable },
      { label: 'Horizontal Line', onClick: onInsertHr },
    ],
    Format: [
      { label: 'Bold', onClick: () => onFormat('bold'), shortcut: '⌘B' },
      { label: 'Italic', onClick: () => onFormat('italic'), shortcut: '⌘I' },
      { label: 'Underline', onClick: () => onFormat('underline'), shortcut: '⌘U' },
      { label: 'Strikethrough', onClick: () => onFormat('strikeThrough') },
      { type: 'divider' },
      { label: 'Clear Formatting', onClick: () => onFormat('removeFormat') },
    ],
    Help: [
      { label: 'Keyboard Shortcuts', onClick: () => alert('Ctrl+B: Bold\nCtrl+I: Italic\nCtrl+U: Underline\nCtrl+Z: Undo\nCtrl+Y: Redo') },
      { label: 'About Hokka', onClick: () => alert('Hokka - Sleek Rich Text Editor') },
    ]
  };

  return (
    <div className="flex items-center gap-1 px-4 py-1.5 text-[11px] select-none border-b border-inherit bg-inherit/40 relative z-20" ref={menuRef}>
      {Object.entries(menuItems).map(([menuName, items]) => {
        const isOpen = activeMenu === menuName;
        return (
          <div key={menuName} className="relative">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveMenu(isOpen ? null : menuName);
              }}
              onMouseEnter={() => {
                if (activeMenu) setActiveMenu(menuName);
              }}
              className={`px-2.5 py-1 rounded hover:bg-current/5 cursor-pointer font-medium transition-all ${
                isOpen ? 'bg-current/10 font-bold' : ''
              }`}
            >
              {menuName}
            </button>

            {isOpen && (
              <div
                className={`absolute left-0 mt-1 rounded-lg border shadow-xl py-1 z-50 min-w-[170px] ${theme.selectBg}`}
                style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                {items.map((item, idx) => {
                  if (item.type === 'divider') {
                    return <div key={idx} className="h-px bg-current opacity-10 my-1" />;
                  }
                  return (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        item.onClick();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-current/5 transition-colors cursor-pointer flex items-center justify-between gap-4 text-current text-[11px]"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="opacity-40 text-[9px] tracking-wider font-mono">{item.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const { user, signOutUser } = useAuth();

  // Giriş yapılmamış veya yükleniyor
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c1e' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(139,92,246,0.3)', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user === null) {
    return <LoginScreen />;
  }

  return <AppInner user={user} signOutUser={signOutUser} />;
}

function AppInner({ user, signOutUser }) {
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

  // URL'den oda linkini oku (mod artık izin haritasından geliyor)
  // isViewOnly, collaboration.myPermission ile belirleniyor
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wordArtOpen, setWordArtOpen] = useState(false);
  const wordArtRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Ruler margin state
  const [leftMargin, setLeftMargin] = useState(PAPER_PADDING_H);
  const [rightMargin, setRightMargin] = useState(PAPER_PADDING_H);

  // Formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [selectedFont, setSelectedFont] = useState('inherit');
  const [selectedSize, setSelectedSize] = useState('16');
  const [selectedFormat, setSelectedFormat] = useState('p');
  const [selectedLineHeight, setSelectedLineHeight] = useState('1.8');
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');

  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // --- Collaboration Layer ---
  const handleRemoteChange = useCallback((html) => {
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
  }, [activeId]);

  const handleRemoteTitleChange = useCallback((newTitle) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return {
          ...doc,
          title: newTitle,
          updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
  }, [activeId]);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0] || { title: '', content: '' };

  const collaboration = useCollaboration({
    editorRef,
    activeDocId: activeId,
    title: activeDoc.title,
    isUpdatingRef,
    onRemoteChange: handleRemoteChange,
    onRemoteTitleChange: handleRemoteTitleChange,
    googleUser: user,
    isOwner: !activeDoc.isShared,
  });

  // İzin: oda aktifse collaboration'dan al, yoksa tam erişim
  const isViewOnly = collaboration.roomId ? collaboration.myPermission === 'view' : false;

  // Handle joining from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('docId') || params.get('room'); // Hem docId hem de eski room'u destekle
    if (roomParam) {
      setDocuments(prev => {
        const exists = prev.find(d => d.id === roomParam);
        if (exists) {
          setTimeout(() => setActiveId(roomParam), 0);
          return prev;
        } else {
          // Bu oda/belge için yeni bir yerel belge kaydı oluştur
          const newSharedDoc = {
            id: roomParam,
            title: 'Paylaşılan Belge 📝',
            content: '',
            updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isShared: true, // Sahibi olmadığımızı, başkasından gelen link olduğunu işaretliyoruz
          };
          setTimeout(() => setActiveId(roomParam), 0);
          return [newSharedDoc, ...prev];
        }
      });
    }
  }, []); // Run only once on mount

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
    
    try {
      const val = document.queryCommandValue('formatBlock') || 'p';
      const normalized = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (['h1', 'h2', 'h3', 'blockquote', 'p'].includes(normalized)) {
        setSelectedFormat(normalized);
      } else {
        setSelectedFormat('p');
      }
    } catch (e) {
      setSelectedFormat('p');
    }

    try {
      const colorVal = document.queryCommandValue('foreColor');
      setSelectedTextColor(rgbToHex(colorVal));
    } catch (e) {}
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
    // Collaboration: yerel değişikliği Yjs'e gönder
    collaboration.pushLocalChange(html);
  }, [activeId, updateFormattingState, collaboration.pushLocalChange]);

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
    collaboration.pushLocalTitleChange(generated);
  }, [activeId, documents.find(d => d.id === activeId)?.content, collaboration.pushLocalTitleChange]);

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

  const handleCut = useCallback(() => {
    document.execCommand('cut');
  }, []);

  const handleCopy = useCallback(() => {
    document.execCommand('copy');
  }, []);

  const handlePaste = useCallback(() => {
    alert('Pasting via menu is blocked by browser security. Please use Ctrl+V (or ⌘+V) instead.');
  }, []);

  const handleRename = useCallback(() => {
    const titleInput = document.querySelector('header input[type="text"]');
    titleInput?.focus();
    titleInput?.select();
  }, []);

  const handleFind = useCallback(() => {
    if (!findText) return;
    window.find(findText, false, false, true, false, true, true);
  }, [findText]);

  const handleReplace = useCallback(() => {
    if (!editorRef.current || !findText) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (range.toString().toLowerCase() === findText.toLowerCase()) {
        range.deleteContents();
        const textNode = document.createTextNode(replaceText);
        range.insertNode(textNode);
        range.selectNode(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        handleEditorInput();
      }
    }
  }, [findText, replaceText, handleEditorInput]);

  const handleReplaceAll = useCallback(() => {
    if (!editorRef.current || !findText) return;
    const editor = editorRef.current;
    const escapedFind = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedFind, 'gi');
    editor.innerHTML = editor.innerHTML.replace(regex, replaceText);
    handleEditorInput();
  }, [findText, replaceText, handleEditorInput]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter link URL (e.g. https://google.com):');
    if (!url) return;
    execFormat('createLink', url);
  }, [execFormat]);

  const insertImage = useCallback(() => {
    const choice = confirm('Do you want to upload an image from your computer?\n\n(Click OK to upload from file, or Cancel to enter a web URL)');
    if (choice) {
      imageInputRef.current?.click();
    } else {
      const url = prompt('Enter image URL:');
      if (url) {
        execFormat('insertImage', url);
      }
    }
  }, [execFormat]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, dataUrl);
        handleEditorInput();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [handleEditorInput]);

  const insertTable = useCallback(() => {
    const cols = parseInt(prompt('Enter number of columns:', '3'), 10);
    const rows = parseInt(prompt('Enter number of rows:', '3'), 10);
    if (isNaN(cols) || isNaN(rows) || cols <= 0 || rows <= 0) return;
    
    let tableHtml = '<table><thead><tr>';
    for (let c = 0; c < cols; c++) tableHtml += '<th>Header</th>';
    tableHtml += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) tableHtml += '<td>Cell</td>';
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, tableHtml);
      handleEditorInput();
    }
  }, [handleEditorInput]);

  const insertHorizontalRule = useCallback(() => {
    execFormat('insertHorizontalRule');
  }, [execFormat]);

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
    collaboration.pushLocalTitleChange(title);
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
        <header className="h-14 border-b border-inherit px-4 flex items-center justify-between gap-4 z-30 shrink-0 relative">
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

            <button
              onClick={() => window.print()}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title="Print (PDF)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.24 3h5.28l-.24-3M15 9V6.75A2.25 2.25 0 0012.75 4.5h-1.5A2.25 2.25 0 009 6.75V9m-6 3h18M18 9h.008v.008H18V9zm-3 9h.008v.008H15V18z" />
              </svg>
              <span>Print</span>
            </button>

            <div className="collab-divider" />

            {/* Collaboration Bar */}
            <CollaborationBar collaboration={collaboration} theme={activeTheme} />

            <div className="collab-divider" />

            {/* Kullanıcı avatarı + çıkış */}
            <button
              className="user-header-btn"
              onClick={signOutUser}
              title={`${user.displayName} — Çıkış yap`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="user-header-photo" />
              ) : (
                <span className="user-header-animal">{collaboration.localUser.animal || '🐾'}</span>
              )}
              <span className="user-header-name" style={{ opacity: 0.8, fontSize: 11 }}>
                {user.displayName?.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Top Menu Bar */}
        <MenuBar
          theme={activeTheme}
          onCreateNew={createNewDoc}
          onDownload={downloadTxt}
          onRename={handleRename}
          onUndo={() => execFormat('undo')}
          onRedo={() => execFormat('redo')}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onInsertLink={insertLink}
          onInsertImage={insertImage}
          onInsertTable={insertTable}
          onInsertHr={insertHorizontalRule}
          onFormat={execFormat}
        />

        {/* Formatting Toolbar */}
        <div className={`shrink-0 border-b ${activeTheme.toolbarBg} px-4 py-2 flex items-center gap-1 flex-wrap z-10`}>
          {/* Font Family */}
          <Dropdown
            label="Font"
            value={selectedFont}
            options={FONT_OPTIONS}
            onChange={handleFontChange}
            title="Font Family"
            selectBg={activeTheme.selectBg}
          />

          {/* Font Size */}
          <Dropdown
            label="Size"
            value={selectedSize}
            options={FONT_SIZE_OPTIONS}
            onChange={handleSizeChange}
            title="Font Size"
            selectBg={activeTheme.selectBg}
            className="w-16"
          />

          {/* Text Style */}
          <Dropdown
            label="Style"
            value={selectedFormat}
            options={FORMAT_OPTIONS}
            onChange={(val) => execFormat('formatBlock', val)}
            title="Text Style"
            selectBg={activeTheme.selectBg}
            className="w-28"
          />


          {/* Highlight Color Picker */}
          <ColorDropdown
            type="highlight"
            value=""
            onChange={(val) => execFormat('hiliteColor', val)}
            theme={activeTheme}
            title="Highlight Color"
          />


          {/* Insert Dropdown */}
          <Dropdown
            label="Insert..."
            value=""
            options={INSERT_OPTIONS}
            onChange={(val) => {
              if (val === 'link') insertLink();
              else if (val === 'image') insertImage();
              else if (val === 'table') insertTable();
              else if (val === 'hr') insertHorizontalRule();
            }}
            title="Insert Element"
            selectBg={activeTheme.selectBg}
            className="w-24"
          />

          <Divider />

          {/* Text Color Picker (Advanced) */}
          <AdvancedColorDropdown
            value={selectedTextColor}
            onChange={(val) => execFormat('foreColor', val)}
            theme={activeTheme}
            title="Text Color"
          />

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

          <ToolbarBtn
            onClick={() => execFormat('justifyFull')}
            title="Justify"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
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

          {/* Line Spacing */}
          <Dropdown
            label="Spacing"
            value={selectedLineHeight}
            options={LINE_SPACING_OPTIONS}
            onChange={setSelectedLineHeight}
            title="Line Spacing"
            selectBg={activeTheme.selectBg}
            className="w-12"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13m-13 4h13m-13 4h13m-13 4h13M19 4v16m0 0l-3-3m3 3l3-3M19 4l-3 3m3-3l3 3" />
              </svg>
            }
          />

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

          <Divider />

          {/* Find & Replace Toggle Button */}
          <ToolbarBtn
            onClick={() => setFindOpen(v => !v)}
            active={findOpen}
            title="Find & Replace"
            className={findOpen ? activeTheme.toolbarBtnActive : activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </ToolbarBtn>
        </div>

        {/* Find & Replace Panel */}
        {findOpen && (
          <div className={`px-4 py-2 border-b flex items-center gap-3 flex-wrap ${activeTheme.toolbarBg}`}>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60 font-medium">Find:</span>
              <input
                type="text"
                placeholder="Find text..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className={`px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[150px] ${activeTheme.selectBg}`}
              />
            </div>
            <button
              onClick={handleFind}
              className={`px-3 py-1 text-xs rounded font-medium cursor-pointer transition-all ${activeTheme.buttonBg}`}
            >
              Find Next
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60 font-medium">Replace:</span>
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className={`px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[150px] ${activeTheme.selectBg}`}
              />
            </div>
            <button
              onClick={handleReplace}
              className={`px-3 py-1 text-xs rounded font-medium cursor-pointer transition-all ${activeTheme.buttonBg}`}
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              className={`px-3 py-1 text-xs rounded font-medium cursor-pointer transition-all ${activeTheme.buttonBg}`}
            >
              Replace All
            </button>
          </div>
        )}

        {/* Yazı Editörü - Google Docs tarzı kağıt düzeni */}
        <main
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ background: activeTheme.pageBg }}
        >
          {/* Cetvel */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <Ruler
              theme={activeTheme}
              leftMargin={leftMargin}
              rightMargin={rightMargin}
              onLeftMarginChange={setLeftMargin}
              onRightMarginChange={setRightMargin}
            />
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
                padding: `60px ${rightMargin}px 60px ${leftMargin}px`,
                position: 'relative',
              }}
            >
              {/* Remote cursor overlay */}
              <CursorOverlay remoteUsers={collaboration.remoteUsers} editorRef={editorRef} />

              <div
                id="rich-text-editor"
                ref={editorRef}
                contentEditable={!isViewOnly}
                suppressContentEditableWarning
                onInput={isViewOnly ? undefined : handleEditorInput}
                onKeyUp={() => { updateFormattingState(); collaboration.updateCursorPosition(); }}
                onMouseUp={() => { updateFormattingState(); collaboration.updateCursorPosition(); }}
                onSelect={() => { updateFormattingState(); collaboration.updateCursorPosition(); }}
                data-placeholder={isViewOnly ? '' : 'Start writing...'}
                className="focus:outline-none editor-content"
                style={{
                  fontFamily: selectedFont === 'inherit' ? 'Inter, sans-serif' : selectedFont,
                  fontSize: selectedSize + 'px',
                  minHeight: '980px',
                  lineHeight: selectedLineHeight,
                  color: activeTheme.paperColor,
                  cursor: isViewOnly ? 'default' : undefined,
                }}
              />

              {/* View-only banner */}
              {isViewOnly && (
                <div className="view-only-banner">
                  <span>👁️</span>
                  <span>Görüntüleme modunda — düzenleme devre dışı</span>
                </div>
              )}
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

        {/* Hidden Input for Image Upload */}
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
}
