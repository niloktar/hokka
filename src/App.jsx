import { useState, useEffect, useRef } from 'react';

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    icon: '🖋️',
    title: 'Yeni Bir Başlangıç',
    content: 'Bu, React ve Tailwind CSS v4 ile geliştirilmiş sevimli ve modern bir metin yazma aracıdır.\n\nÖzellikler:\n- 🚀 Sıfır yapılandırmalı Tailwind CSS v4 entegrasyonu\n- 🎨 Sevimli çalışma temaları (Şeftali Düşü, Matcha Latte, Lavanta Gecesi, Yulaf & Kahve)\n- 📂 Otomatik yerel kayıt (LocalStorage)\n- 📊 Kelime hedefi sayacı ve gerçek zamanlı istatistikler\n- 🔍 Arama ve filtreleme\n- 🍭 İnteraktif emoji seçici\n\nYazmaya başlamak için burayı temizleyebilir veya sol üstteki "+" butonuna basarak yeni bir sayfa açabilirsiniz. Keyifli yazmalar! ✨',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: '2',
    icon: '💡',
    title: 'Karalama Defteri',
    content: 'Harika fikirler genellikle basit karalamalarla başlar.\n\n- Proje fikri: Sevimli bir Markdown editörü.\n- Tasarım: Yuvarlak köşeler, pofuduk butonlar, yumuşak pastel renkler.\n- Teknolojiler: Vite + React + Tailwind v4.',
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
];

const THEMES = {
  peach: {
    name: '🍑 Şeftali Düşü',
    bg: 'bg-[#fff5f0] text-[#5c3a21]',
    editorBg: 'bg-white border-[#fce3d5] text-[#5c3a21] placeholder-[#c4a693] shadow-[0_8px_30px_rgb(254,235,224,0.3)]',
    sidebarBg: 'bg-[#fdf0e9] border-[#f8dbcc]',
    accent: 'bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white',
    accentText: 'text-[#ff7b88]',
    buttonBg: 'bg-white hover:bg-[#fff5f0] border-[#fce3d5] text-[#5c3a21] shadow-sm',
    activeDocBg: 'bg-white border-[#ffb3ba] text-[#5c3a21] shadow-md shadow-[#ffb3ba]/10',
    hoverDocBg: 'hover:bg-white/60',
    dotColor: '#fce3d5',
  },
  matcha: {
    name: '🍵 Matcha Latte',
    bg: 'bg-[#f4f7f2] text-[#2c3d24]',
    editorBg: 'bg-white border-[#e0ebd8] text-[#2c3d24] placeholder-[#9fb691] shadow-[0_8px_30px_rgb(228,239,218,0.3)]',
    sidebarBg: 'bg-[#ebf0e6] border-[#d8e3ce]',
    accent: 'bg-gradient-to-br from-[#a2b997] to-[#cbe3db] text-[#2c3d24]',
    accentText: 'text-[#87a07a]',
    buttonBg: 'bg-white hover:bg-[#f4f7f2] border-[#e0ebd8] text-[#2c3d24] shadow-sm',
    activeDocBg: 'bg-white border-[#c0d6ad] text-[#2c3d24] shadow-md shadow-[#c0d6ad]/10',
    hoverDocBg: 'hover:bg-white/60',
    dotColor: '#e0ebd8',
  },
  lavender: {
    name: '🌌 Lavanta Gecesi',
    bg: 'bg-[#12101e] text-[#e0ddf3]',
    editorBg: 'bg-[#18152c]/80 border-[#2d284f] text-[#e0ddf3] placeholder-[#6e6896] shadow-[0_8px_30px_rgba(24,21,44,0.5)]',
    sidebarBg: 'bg-[#0f0d19] border-[#201b35]',
    accent: 'bg-gradient-to-br from-[#b399ff] to-[#ff99f0] text-slate-950 font-semibold',
    accentText: 'text-[#b399ff]',
    buttonBg: 'bg-[#18152c] hover:bg-[#201c3b] border-[#2d284f] text-[#e0ddf3] shadow-sm',
    activeDocBg: 'bg-[#1c1933] border-[#7254d6]/60 text-white shadow-md shadow-[#7254d6]/20',
    hoverDocBg: 'hover:bg-[#18152c]/50',
    dotColor: '#2d284f',
  },
  oatmeal: {
    name: '☕ Yulaf & Kahve',
    bg: 'bg-[#f9f6f0] text-[#3e2723]',
    editorBg: 'bg-white border-[#efe5d3] text-[#3e2723] placeholder-[#baa594] shadow-[0_8px_30px_rgb(239,229,211,0.3)]',
    sidebarBg: 'bg-[#efe5d3] border-[#e2d4bd]',
    accent: 'bg-gradient-to-br from-[#a1887f] to-[#d7ccc8] text-[#3e2723] font-semibold',
    accentText: 'text-[#8d6e63]',
    buttonBg: 'bg-white hover:bg-[#f9f6f0] border-[#efe5d3] text-[#3e2723] shadow-sm',
    activeDocBg: 'bg-white border-[#d7ccc8] text-[#3e2723] shadow-md shadow-[#d7ccc8]/10',
    hoverDocBg: 'hover:bg-white/60',
    dotColor: '#efe5d3',
  }
};

const EMOJIS = ['🖋️', '💡', '📝', '✨', '🌸', '🍇', '☁️', '🎈', '🎨', '🧸', '🦖', '🌟', '🦄', '🐈', '🐕', '🌿', '📖', '☕', '🧁', '🍉', '🍿'];
const WORD_GOALS = [50, 100, 250, 500, 1000];

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
  const [theme, setTheme] = useState('peach');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [wordGoal, setWordGoal] = useState(100);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hokka_docs', JSON.stringify(documents));
  }, [documents]);

  // Click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0] || { title: '', content: '', icon: '📝' };

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

  const handleIconChange = (icon) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return {
          ...doc,
          icon,
          updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
    setShowEmojiPicker(false);
  };

  const createNewDoc = () => {
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const newDoc = {
      id: Date.now().toString(),
      icon: randomEmoji,
      title: 'Yeni Taslak',
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

  // Stats
  const charCount = activeDoc?.content?.length || 0;
  const wordCount = activeDoc?.content?.trim() === '' ? 0 : activeDoc?.content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Progress Goal
  const progressPercent = Math.min((wordCount / wordGoal) * 100, 100);
  const isGoalReached = wordCount >= wordGoal;

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.content.toLowerCase().includes(search.toLowerCase())
  );

  const activeTheme = THEMES[theme];

  return (
    <div className={`min-h-screen flex ${activeTheme.bg} transition-colors duration-500 font-sans h-screen overflow-hidden`}>
      {/* Sol Menü (Sidebar) */}
      <div 
        className={`${sidebarOpen ? 'w-80' : 'w-0'} flex flex-col ${activeTheme.sidebarBg} border-r border-inherit/30 transition-all duration-300 overflow-hidden relative z-20`}
      >
        {/* Sidebar Header */}
        <div className="h-20 px-5 border-b border-inherit/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${activeTheme.accent} flex items-center justify-center font-bold text-xl shadow-md transition-transform hover:rotate-6`}>
              H
            </div>
            <h1 className="font-bold text-xl tracking-wide">Hokka</h1>
          </div>
          <button 
            onClick={createNewDoc}
            className={`w-9 h-9 rounded-xl ${activeTheme.accent} transition-all hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center`}
            title="Yeni Taslak"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Arama Barı */}
        <div className="p-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-inherit opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input 
              type="text"
              placeholder="Taslaklarda ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border ${activeTheme.editorBg} focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all`}
            />
          </div>
        </div>

        {/* Belge Listesi */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => setActiveId(doc.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                activeId === doc.id 
                  ? activeTheme.activeDocBg 
                  : `border-transparent ${activeTheme.hoverDocBg}`
              }`}
            >
              <div className="flex justify-between items-start gap-2.5">
                <span className="text-lg flex-shrink-0">{doc.icon || '📝'}</span>
                <h3 className="font-semibold text-sm truncate flex-1 leading-snug">{doc.title || 'Başlıksız Belge'}</h3>
                <button 
                  onClick={(e) => deleteDoc(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                  title="Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <p className="text-xs opacity-50 truncate mt-1.5 pl-7">
                {doc.content ? doc.content.substring(0, 45) : 'Boş taslak...'}
              </p>
              <div className="flex justify-end items-center mt-2.5 pt-2 border-t border-inherit/10 pl-7">
                <span className="text-[10px] opacity-40 font-medium">{doc.updatedAt}</span>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-12 opacity-40 text-sm">
              🎨 Bulunamadı... Yeni bir sayfa aç!
            </div>
          )}
        </div>

        {/* Sidebar Footer - Tema Değiştirici */}
        <div className="p-4 border-t border-inherit/40 flex flex-col gap-2.5 bg-inherit">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-45 pl-1">Arayüz Teması</span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(THEMES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`px-2.5 py-2 text-xs rounded-xl border transition-all cursor-pointer text-center font-medium ${
                  theme === key 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-semibold' 
                    : 'border-transparent opacity-80 hover:opacity-100 bg-black/5 hover:bg-black/10'
                }`}
              >
                {value.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ana Çalışma Alanı (Workspace) */}
      <div 
        className="flex-1 flex flex-col h-full overflow-hidden relative"
        style={{
          backgroundImage: `radial-gradient(circle, ${activeTheme.dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Üst Bar */}
        <header className="h-20 border-b border-inherit/30 px-6 flex items-center justify-between gap-4 z-10 bg-inherit/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2.5 rounded-xl cursor-pointer ${activeTheme.buttonBg} transition-all hover:scale-105 active:scale-95`}
              title={sidebarOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>

            {/* Emoji Seçici & Başlık */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${activeTheme.buttonBg}`}
                title="Simge Değiştir"
              >
                {activeDoc.icon || '📝'}
              </button>

              {/* Emoji Seçici Açılır Kutu */}
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className={`absolute top-12 left-0 p-3 rounded-2xl border ${activeTheme.editorBg} shadow-xl z-30 grid grid-cols-5 gap-2 w-60`}
                >
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleIconChange(emoji)}
                      className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-lg cursor-pointer transition-transform hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <input 
                type="text"
                value={activeDoc.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-transparent font-bold text-lg md:text-xl focus:outline-none border-b-2 border-transparent hover:border-inherit/20 focus:border-amber-400 transition-all py-1 px-1 max-w-[150px] md:max-w-md font-sans"
                placeholder="Belge Başlığı"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className={`px-3.5 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer ${activeTheme.buttonBg} transition-all hover:scale-105 active:scale-95`}
              title="Panoya Kopyala"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500 animate-bounce">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-green-500 font-semibold">Kopyalandı!</span>
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
              className={`px-3.5 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer ${activeTheme.buttonBg} transition-all hover:scale-105 active:scale-95`}
              title="TXT Olarak İndir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>İndir</span>
            </button>
          </div>
        </header>

        {/* Yazı Editör Alanı */}
        <main className="flex-1 p-6 md:p-8 overflow-hidden flex flex-col justify-center items-center">
          <div className="w-full max-w-4xl flex-1 flex flex-col relative">
            <textarea
              value={activeDoc.content}
              onChange={(e) => handleTextChange(e.target.value)}
              className={`w-full flex-1 p-6 md:p-10 rounded-[28px] border-2 ${activeTheme.editorBg} focus:outline-none resize-none font-sans text-base md:text-lg leading-relaxed overflow-y-auto transition-all duration-300 focus:border-amber-400`}
              placeholder="Karalamaya başla... ✨"
            />
          </div>
        </main>

        {/* Alt Bilgi Barı (İstatistikler ve Hedef) */}
        <footer className="border-t border-inherit/30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs z-10 bg-inherit/90 backdrop-blur-md">
          {/* Kelime Hedefi */}
          <div className="flex items-center gap-3">
            <span className="font-semibold opacity-70">🎯 Hedef:</span>
            <select
              value={wordGoal}
              onChange={(e) => setWordGoal(Number(e.target.value))}
              className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none cursor-pointer ${activeTheme.buttonBg}`}
            >
              {WORD_GOALS.map(goal => (
                <option key={goal} value={goal}>{goal} Kelime</option>
              ))}
            </select>
            <div className="w-32 bg-black/10 rounded-full h-2 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${isGoalReached ? 'bg-green-500' : 'bg-amber-400'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-medium opacity-80">
              {isGoalReached ? 'Başarıldı! 🎉' : `%${Math.round(progressPercent)}`}
            </span>
          </div>

          <div className="flex items-center gap-5 opacity-70 font-medium">
            <span>📝 <strong>Karakter:</strong> {charCount}</span>
            <span>💬 <strong>Kelime:</strong> {wordCount}</span>
            <span>☕ <strong>Okuma Süresi:</strong> {readingTime} dk</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
