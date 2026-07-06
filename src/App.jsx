import { useState, useEffect } from 'react';

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    title: 'Yeni Bir Başlangıç 🖋️',
    content: 'Bu, React ve Tailwind CSS v4 ile geliştirilmiş premium bir metin yazma aracıdır.\n\nÖzellikler:\n- 🚀 Sıfır yapılandırmalı Tailwind CSS v4 entegrasyonu\n- 🎨 Farklı çalışma temaları (Gece Yarısı, Sepya, Aydınlık, Odak)\n- 📂 Yerel depolama (LocalStorage) entegrasyonu ile otomatik kayıt\n- 📊 Gerçek zamanlı istatistikler (Karakter, Kelime, Okuma Süresi)\n- 🔍 Belge içi ve belgeler arası hızlı arama\n\nYazmaya başlamak için burayı temizleyebilir veya sol üstteki "+" butonuna basarak yeni bir sayfa açabilirsiniz.',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: '2',
    title: 'Fikir Karalamaları 💡',
    content: 'Harika fikirler genellikle basit karalamalarla başlar.\n\n- Proje fikri: React ve Tailwind ile modern bir Markdown editörü.\n- Tasarım: Minimalist, gözü yormayan renkler, odaklanma modu.\n- Teknolojiler: Vite + React + Tailwind v4.',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
];

const THEMES = {
  midnight: {
    name: 'Gece Yarısı',
    bg: 'bg-slate-950 text-slate-100',
    editorBg: 'bg-slate-900/40 border-slate-800 text-slate-100 placeholder-slate-500',
    sidebarBg: 'bg-slate-900/90 border-slate-800/80',
    cardBg: 'bg-slate-900/50 border-slate-800/60',
    accent: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
    accentText: 'text-violet-400',
    buttonBg: 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200',
    activeDocBg: 'bg-violet-950/30 border-violet-800/50 text-violet-200',
    hoverDocBg: 'hover:bg-slate-800/50',
  },
  sepia: {
    name: 'Sepya',
    bg: 'bg-[#f4ecd8] text-[#433422]',
    editorBg: 'bg-[#faf6eb] border-[#e4d5b7] text-[#433422] placeholder-[#a69275]',
    sidebarBg: 'bg-[#ebdcb9] border-[#d8c399]',
    cardBg: 'bg-[#faf6eb]/80 border-[#e4d5b7]',
    accent: 'bg-gradient-to-r from-[#a05a2c] to-[#b86a34] text-white',
    accentText: 'text-[#a05a2c]',
    buttonBg: 'bg-[#e4d5b7] hover:bg-[#d8c399] border-[#cbb380] text-[#433422]',
    activeDocBg: 'bg-[#e4d5b7]/60 border-[#cbb380]/60 text-[#433422]',
    hoverDocBg: 'hover:bg-[#e4d5b7]/30',
  },
  light: {
    name: 'Aydınlık',
    bg: 'bg-slate-50 text-slate-900',
    editorBg: 'bg-white border-slate-200 text-slate-900 placeholder-slate-400',
    sidebarBg: 'bg-slate-100 border-slate-200',
    cardBg: 'bg-white border-slate-200/80',
    accent: 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white',
    accentText: 'text-indigo-600',
    buttonBg: 'bg-slate-200/60 hover:bg-slate-200 border-slate-300/80 text-slate-700',
    activeDocBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    hoverDocBg: 'hover:bg-slate-200/40',
  },
  focus: {
    name: 'Odak Modu',
    bg: 'bg-black text-zinc-300',
    editorBg: 'bg-zinc-950 border-zinc-900 text-zinc-200 placeholder-zinc-700',
    sidebarBg: 'bg-zinc-950/40 border-zinc-900/40',
    cardBg: 'bg-zinc-950/20 border-zinc-900/20',
    accent: 'bg-gradient-to-r from-zinc-200 to-zinc-400 text-black font-semibold',
    accentText: 'text-zinc-100',
    buttonBg: 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300',
    activeDocBg: 'bg-zinc-900/80 border-zinc-700/80 text-white',
    hoverDocBg: 'hover:bg-zinc-900/30',
  }
};

export default function App() {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('hokka_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem('hokka_docs');
    const parsed = saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    return parsed[0]?.id || '1';
  });
  const [theme, setTheme] = useState('midnight');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('hokka_docs', JSON.stringify(documents));
  }, [documents]);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0] || { title: '', content: '' };

  const handleTextChange = (content) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return {
          ...doc,
          content,
          updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
  };

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
      alert("En az bir belge kalmalıdır!");
      return;
    }
    const remaining = documents.filter(d => d.id !== id);
    setDocuments(remaining);
    if (activeId === id) {
      setActiveId(remaining[0].id);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([activeDoc.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDoc.title.replace(/[^\w\s\u00C0-\u017F-]/g, '') || 'belge'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // İstatistikler
  const charCount = activeDoc?.content?.length || 0;
  const wordCount = activeDoc?.content?.trim() === '' ? 0 : activeDoc?.content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.content.toLowerCase().includes(search.toLowerCase())
  );

  const activeTheme = THEMES[theme];

  return (
    <div className={`min-height-screen flex ${activeTheme.bg} transition-colors duration-300 font-sans h-screen overflow-hidden`}>
      {/* Sol Menü (Sidebar) */}
      <div 
        className={`${sidebarOpen ? 'w-80' : 'w-0'} flex flex-col ${activeTheme.sidebarBg} border-r transition-all duration-300 overflow-hidden relative z-10`}
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
                {doc.content ? doc.content.substring(0, 45) : 'Boş belge'}
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

      {/* Ana Çalışma Alanı (Workspace) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Üst Bar */}
        <header className="h-16 border-b border-inherit px-6 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg cursor-pointer ${activeTheme.buttonBg} transition-all`}
              title={sidebarOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <input 
              type="text"
              value={activeDoc.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="bg-transparent font-semibold text-lg md:text-xl focus:outline-none border-b border-transparent hover:border-inherit/30 focus:border-violet-500 transition-all py-1 max-w-[200px] md:max-w-md"
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a3.375 3.375 0 00-3.375 3.375v1.875m7.5 0H9m6 0v2.25c0 .621-.504 1.125-1.125 1.125h-9.75A1.125 1.125 0 013 18.75V15a2.25 2.25 0 012.25-2.25h1.5A3.375 3.375 0 0110 16.125v1.875M19 19.5v-1.5a1.5 1.5 0 00-1.5-1.5h-1.5m-4-3h.008v.008H12v-.008z" />
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

        {/* Yazı Editörü */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          <textarea
            value={activeDoc.content}
            onChange={(e) => handleTextChange(e.target.value)}
            className={`w-full flex-1 p-6 md:p-8 rounded-2xl border ${activeTheme.editorBg} focus:outline-none resize-none font-mono text-base md:text-lg leading-relaxed shadow-inner overflow-y-auto`}
            placeholder="Yazmaya başlayın..."
          />
        </main>

        {/* Alt Bilgi Barı (İstatistikler) */}
        <footer className="h-10 border-t border-inherit px-6 flex items-center justify-between text-xs opacity-60 z-10 bg-inherit">
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
