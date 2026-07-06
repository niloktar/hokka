import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    title: 'Yeni Bir Başlangıç 🖋️',
    content: '<p>Bu, <strong>Hokka</strong> editörüne hoş geldiniz! Üstteki araç çubuğu ile metninizi biçimlendirebilirsiniz.</p><p><br></p><p>Özellikler:</p><ul><li>🚀 Font ailesi seçimi</li><li>🔠 Font boyutu ayarlama</li><li><strong>Kalın</strong>, <em>italik</em>, <u>altı çizili</u>, <s>üstü çizili</s> metin stilleri</li><li>🎨 Farklı çalışma temaları</li><li>📂 Otomatik kayıt (LocalStorage)</li></ul><p><br></p><p>Yazmaya başlamak için burayı temizleyebilir veya sol üstteki <strong>+</strong> butonuna basarak yeni bir belge açabilirsiniz.</p>',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: '2',
    title: 'Fikir Karalamaları 💡',
    content: '<p>Harika fikirler genellikle basit karalamalarla başlar.</p><p><br></p><ul><li>Proje fikri: <em>React ile modern bir zengin metin editörü.</em></li><li>Tasarım: <strong>Minimalist</strong>, gözü yormayan renkler, odaklanma modu.</li><li>Teknolojiler: Vite + React + Tailwind v4</li></ul>',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
];

const FONTS = [
  { label: 'Varsayılan', value: 'inherit' },
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
  midnight: {
    name: 'Gece Yarısı',
    bg: 'bg-slate-950 text-slate-100',
    editorBg: 'bg-slate-900/40 border-slate-800 text-slate-100',
    sidebarBg: 'bg-slate-900/90 border-slate-800/80',
    cardBg: 'bg-slate-900/50 border-slate-800/60',
    accent: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
    accentText: 'text-violet-400',
    buttonBg: 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200',
    activeDocBg: 'bg-violet-950/30 border-violet-800/50 text-violet-200',
    hoverDocBg: 'hover:bg-slate-800/50',
    toolbarBg: 'bg-slate-900/95 border-slate-700/60',
    toolbarBtn: 'hover:bg-slate-700/70 text-slate-300 border-slate-700/40',
    toolbarBtnActive: 'bg-violet-600/30 text-violet-300 border-violet-500/50',
    selectBg: 'bg-slate-800 border-slate-700 text-slate-200',
    placeholderColor: '#64748b',
    editorColor: '#e2e8f0',
  },
  sepia: {
    name: 'Sepya',
    bg: 'bg-[#f4ecd8] text-[#433422]',
    editorBg: 'bg-[#faf6eb] border-[#e4d5b7] text-[#433422]',
    sidebarBg: 'bg-[#ebdcb9] border-[#d8c399]',
    cardBg: 'bg-[#faf6eb]/80 border-[#e4d5b7]',
    accent: 'bg-gradient-to-r from-[#a05a2c] to-[#b86a34] text-white',
    accentText: 'text-[#a05a2c]',
    buttonBg: 'bg-[#e4d5b7] hover:bg-[#d8c399] border-[#cbb380] text-[#433422]',
    activeDocBg: 'bg-[#e4d5b7]/60 border-[#cbb380]/60 text-[#433422]',
    hoverDocBg: 'hover:bg-[#e4d5b7]/30',
    toolbarBg: 'bg-[#f0e4c4]/95 border-[#d8c399]',
    toolbarBtn: 'hover:bg-[#e4d5b7] text-[#433422] border-[#d8c399]',
    toolbarBtnActive: 'bg-[#a05a2c]/20 text-[#a05a2c] border-[#a05a2c]/40',
    selectBg: 'bg-[#faf6eb] border-[#d8c399] text-[#433422]',
    placeholderColor: '#a69275',
    editorColor: '#433422',
  },
  light: {
    name: 'Aydınlık',
    bg: 'bg-slate-50 text-slate-900',
    editorBg: 'bg-white border-slate-200 text-slate-900',
    sidebarBg: 'bg-slate-100 border-slate-200',
    cardBg: 'bg-white border-slate-200/80',
    accent: 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white',
    accentText: 'text-indigo-600',
    buttonBg: 'bg-slate-200/60 hover:bg-slate-200 border-slate-300/80 text-slate-700',
    activeDocBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    hoverDocBg: 'hover:bg-slate-200/40',
    toolbarBg: 'bg-white/95 border-slate-200',
    toolbarBtn: 'hover:bg-slate-100 text-slate-600 border-slate-200',
    toolbarBtnActive: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    selectBg: 'bg-white border-slate-200 text-slate-700',
    placeholderColor: '#94a3b8',
    editorColor: '#0f172a',
  },
  focus: {
    name: 'Odak Modu',
    bg: 'bg-black text-zinc-300',
    editorBg: 'bg-zinc-950 border-zinc-900 text-zinc-200',
    sidebarBg: 'bg-zinc-950/40 border-zinc-900/40',
    cardBg: 'bg-zinc-950/20 border-zinc-900/20',
    accent: 'bg-gradient-to-r from-zinc-200 to-zinc-400 text-black font-semibold',
    accentText: 'text-zinc-100',
    buttonBg: 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300',
    activeDocBg: 'bg-zinc-900/80 border-zinc-700/80 text-white',
    hoverDocBg: 'hover:bg-zinc-900/30',
    toolbarBg: 'bg-zinc-950/95 border-zinc-800/60',
    toolbarBtn: 'hover:bg-zinc-800 text-zinc-400 border-zinc-800/40',
    toolbarBtnActive: 'bg-zinc-700/50 text-zinc-100 border-zinc-600/50',
    selectBg: 'bg-zinc-900 border-zinc-800 text-zinc-300',
    placeholderColor: '#52525b',
    editorColor: '#d4d4d8',
  }
};

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
  const [theme, setTheme] = useState('midnight');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
          updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
    setTimeout(() => { isUpdatingRef.current = false; }, 0);
    updateFormattingState();
  }, [activeId, updateFormattingState]);

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
          updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
  };

  const createNewDoc = () => {
    const newDoc = {
      id: Date.now().toString(),
      title: 'Başlıksız Belge 📝',
      content: '',
      updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveId(newDoc.id);
  };

  const deleteDoc = (id, e) => {
    e.stopPropagation();
    if (documents.length === 1) {
      alert('En az bir belge kalmalıdır!');
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
            title="Yeni Belge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Arama Barı */}
        <div className="p-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-inherit opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${activeTheme.editorBg} focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
            />
          </div>
        </div>

        {/* Belge Listesi */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveId(doc.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between group ${
                activeId === doc.id
                  ? activeTheme.activeDocBg
                  : `border-transparent ${activeTheme.hoverDocBg}`
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-sm truncate flex-1">{doc.title || 'Başlıksız Belge'}</h3>
                <button
                  onClick={(e) => deleteDoc(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all cursor-pointer"
                  title="Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <p className="text-xs opacity-50 truncate mt-1">
                {doc.content ? doc.content.replace(/<[^>]*>/g, '').substring(0, 45) : 'Boş belge'}
              </p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-inherit/20">
                <span className="text-[10px] opacity-40">{doc.updatedAt}</span>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-8 opacity-40 text-sm">
              Belge bulunamadı.
            </div>
          )}
        </div>

        {/* Sidebar Footer - Tema Değiştirici */}
        <div className="p-4 border-t border-inherit flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Tema</span>
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
              title={sidebarOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
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
              placeholder="Başlık Girin"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title="Kopyala"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-green-500 font-medium">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  <span>Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={downloadTxt}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title="İndir (.txt)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>İndir</span>
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
            title="Kalın (Ctrl+B)"
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
            title="İtalik (Ctrl+I)"
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
            title="Altı Çizili (Ctrl+U)"
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
            title="Üstü Çizili"
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
            title="Sola Hizala"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm0 4.5a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('justifyCenter')}
            title="Ortala"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm3 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9.75zm-3 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm3 4.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('justifyRight')}
            title="Sağa Hizala"
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
            title="Madde İşaretli Liste"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('insertOrderedList')}
            title="Numaralı Liste"
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
            title="Geri Al (Ctrl+Z)"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => execFormat('redo')}
            title="Yinele (Ctrl+Y)"
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
            title="Biçimlendirmeyi Temizle"
            className={activeTheme.toolbarBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6.96 4.44l10.59 10.59-2.34 2.34H14l-2-2H9.34l-.36.36L7.25 17H5l2.5-2.5L3.44 10.5l3.52-6.06zM19 3L5 17l1.41 1.41L20.41 4.41 19 3z" />
            </svg>
          </ToolbarBtn>
        </div>

        {/* Yazı Editörü */}
        <main className="flex-1 p-4 overflow-hidden flex flex-col">
          <div
            id="rich-text-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyUp={updateFormattingState}
            onMouseUp={updateFormattingState}
            onSelect={updateFormattingState}
            data-placeholder="Yazmaya başlayın..."
            className={`w-full flex-1 p-6 md:p-8 rounded-2xl border ${activeTheme.editorBg} focus:outline-none overflow-y-auto leading-relaxed text-base editor-content`}
            style={{
              fontFamily: selectedFont === 'inherit' ? 'Inter, sans-serif' : selectedFont,
              fontSize: selectedSize + 'px',
              minHeight: '200px',
            }}
          />
        </main>

        {/* Alt Bilgi Barı */}
        <footer className="h-10 border-t border-inherit px-6 flex items-center justify-between text-xs opacity-60 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span><strong>Karakter:</strong> {charCount}</span>
            <span><strong>Kelime:</strong> {wordCount}</span>
          </div>
          <div>
            <span>⏱️ {readingTime} dk okuma</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
