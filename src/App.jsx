import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TextAreaBinding } from 'y-textarea';

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    icon: '🖋️',
    title: 'Yeni Bir Başlangıç',
    content: 'Bu, React ve Tailwind CSS v4 ile geliştirilmiş sevimli ve modern bir metin yazma aracıdır.\n\nÖzellikler:\n- 🚀 Sıfır yapılandırmalı Tailwind CSS v4 entegrasyonu\n- 🎨 Sevimli çalışma temaları (Şeftali Düşü, Matcha Latte, Lavanta Gecesi, Yulaf & Kahve)\n- 📂 Otomatik yerel kayıt (LocalStorage)\n- 📊 Kelime hedefi sayacı ve gerçek zamanlı istatistikler\n- 🔍 Arama ve filtreleme\n- 🍭 İnteraktif emoji seçici\n- 🔮 Google Docs tarzı gerçek zamanlı işbirliği (Collab) desteği\n\nYazmaya başlamak için burayı temizleyebilir veya sol üstteki "+" butonuna basarak yeni bir sayfa açabilirsiniz. Keyifli yazmalar! ✨',
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

const CUTE_ADJECTIVES = ['Tonton', 'Uykucu', 'Meraklı', 'Pofuduk', 'Şapşik', 'Obur', 'Sevimli', 'Minnoş', 'Tombul', 'Şirin', 'Oyuncu', 'Mutlu', 'Süslü', 'Hızlı'];
const CUTE_ANIMALS = [
  { name: 'Tavşan', emoji: '🐰', color: '#ffb3ba' },
  { name: 'Koala', emoji: '🐨', color: '#baffc9' },
  { name: 'Kedi', emoji: '🐱', color: '#bae1ff' },
  { name: 'Ayı', emoji: '🧸', color: '#ffffba' },
  { name: 'Panda', emoji: '🐼', color: '#e8e8e8' },
  { name: 'Dino', emoji: '🦖', color: '#ffdfba' },
  { name: 'Unicorn', emoji: '🦄', color: '#e8c4ff' },
  { name: 'Tilki', emoji: '🦊', color: '#ffd1b3' },
  { name: 'Kurbağa', emoji: '🐸', color: '#c1ffb3' },
  { name: 'Civciv', emoji: '🐥', color: '#fff0b3' },
  { name: 'Penguen', emoji: '🐧', color: '#b3d1ff' }
];

function generateCuteNickname() {
  const adj = CUTE_ADJECTIVES[Math.floor(Math.random() * CUTE_ADJECTIVES.length)];
  const animal = CUTE_ANIMALS[Math.floor(Math.random() * CUTE_ANIMALS.length)];
  return {
    name: `${adj} ${animal.name}`,
    emoji: animal.emoji,
    color: animal.color
  };
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

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

  // İşbirliği (Collab) durumları
  const [collabRoom, setCollabRoom] = useState(() => new URLSearchParams(window.location.search).get('room'));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showCollabMenu, setShowCollabMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [userNickname] = useState(() => {
    const saved = localStorage.getItem('hokka_nickname');
    if (saved) return JSON.parse(saved);
    const generated = generateCuteNickname();
    localStorage.setItem('hokka_nickname', JSON.stringify(generated));
    return generated;
  });

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const collabMenuRef = useRef(null);
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hokka_docs', JSON.stringify(documents));
  }, [documents]);

  // Click outside to close pickers
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (collabMenuRef.current && !collabMenuRef.current.contains(event.target)) {
        setShowCollabMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0] || { title: '', content: '', icon: '📝' };

  // Yjs Gerçek Zamanlı Eşleme (Collab) Effect
  useEffect(() => {
    if (!collabRoom || !textareaRef.current) {
      cleanupCollab();
      return;
    }

    const doc = new Y.Doc();
    yDocRef.current = doc;

    const yText = doc.getText('content');

    // wss://demos.yjs.dev üzerinde oda adıyla bağlantı
    const provider = new WebsocketProvider('wss://demos.yjs.dev', collabRoom, doc);
    providerRef.current = provider;

    // Farkındalık (Presence/Cursor) verilerini set et
    provider.awareness.setLocalStateField('user', {
      name: userNickname.name,
      emoji: userNickname.emoji,
      color: userNickname.color
    });

    const updateUsers = () => {
      const states = provider.awareness.getStates();
      const users = [];
      states.forEach((state) => {
        if (state.user) {
          users.push(state.user);
        }
      });
      setOnlineUsers(users);
    };

    provider.awareness.on('change', updateUsers);

    // Eşitleme ilk tamamlandığında oda boşsa yerel içeriği Yjs'e yükle
    provider.on('sync', (isSynced) => {
      if (isSynced) {
        if (yText.toString() === '' && activeDoc.content !== '') {
          yText.insert(0, activeDoc.content);
        }
      }
    });

    // RGB renk dönüşümü ve Yjs metin bağlayıcısı
    const rgbColor = hexToRgb(userNickname.color) || { r: 120, g: 80, b: 240 };

    const binding = new TextAreaBinding(yText, textareaRef.current, {
      awareness: provider.awareness,
      clientName: `${userNickname.emoji} ${userNickname.name}`,
      color: rgbColor
    });
    bindingRef.current = binding;

    // Yjs üzerinden gelen güncellemeleri React state'e ve localStorage'a aktar
    const observer = () => {
      const newContent = yText.toString();
      setDocuments(prev => prev.map(doc => {
        if (doc.id === activeId) {
          return { ...doc, content: newContent };
        }
        return doc;
      }));
    };
    yText.observe(observer);

    return () => {
      yText.unobserve(observer);
      cleanupCollab();
    };
  }, [collabRoom, activeId]);

  const cleanupCollab = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }
    setOnlineUsers([]);
  };

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
    stopCollab();
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
      stopCollab();
    }
  };

  const handleActiveDocChange = (id) => {
    setActiveId(id);
    stopCollab();
  };

  // İşbirliği Odanı Başlat/Kapat
  const startCollab = () => {
    const roomId = `hokka-${activeId}-${Math.random().toString(36).substring(2, 9)}`;
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    window.history.pushState({}, '', newUrl);
    setCollabRoom(roomId);
  };

  const stopCollab = () => {
    if (!collabRoom) return;
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({}, '', newUrl);
    setCollabRoom(null);
  };

  const copyCollabLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${collabRoom}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
  
  // Hedef İlerlemesi
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
              onClick={() => handleActiveDocChange(doc.id)}
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
            {/* Aktif Yazarlar Avatarları */}
            {collabRoom && onlineUsers.length > 0 && (
              <div className="hidden sm:flex items-center -space-x-2 mr-2">
                {onlineUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm transition-transform hover:scale-115 cursor-help"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.emoji}
                  </div>
                ))}
              </div>
            )}

            {/* İşbirliği (Collab) Butonu */}
            <div className="relative" ref={collabMenuRef}>
              <button
                onClick={() => setShowCollabMenu(!showCollabMenu)}
                className={`px-3.5 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer ${
                  collabRoom ? 'bg-green-500/10 border-green-500/30 text-green-600 font-semibold' : activeTheme.buttonBg
                } transition-all hover:scale-105 active:scale-95`}
                title="İşbirliği yap"
              >
                {collabRoom ? (
                  <>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>İşbirliği Aktif ({onlineUsers.length})</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span>İşbirliği</span>
                  </>
                )}
              </button>

              {showCollabMenu && (
                <div className={`absolute top-12 right-0 p-4 rounded-2xl border ${activeTheme.editorBg} shadow-2xl z-40 w-72 flex flex-col gap-3 text-left`}>
                  <div className="flex items-center justify-between border-b border-inherit/15 pb-2">
                    <span className="font-bold text-sm">🔮 Ortak Çalışma</span>
                    <span className="text-[10px] bg-black/5 px-2.5 py-0.5 rounded-lg opacity-70">
                      Ben: {userNickname.emoji} {userNickname.name}
                    </span>
                  </div>

                  {!collabRoom ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs opacity-75 leading-relaxed">
                        Arkadaşlarını bu belgeye davet et! Aynı anda yazın, birbirinizin imleçlerini görün. 🦖
                      </p>
                      <button
                        onClick={startCollab}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all ${activeTheme.accent}`}
                      >
                        İşbirliği Odası Başlat 🚀
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase opacity-50">Davet Linki</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}${window.location.pathname}?room=${collabRoom}`}
                            className="w-full bg-black/5 border border-inherit/20 text-[10px] px-2 py-1.5 rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={copyCollabLink}
                            className={`p-1.5 rounded-lg cursor-pointer ${activeTheme.buttonBg}`}
                            title="Linki kopyala"
                          >
                            {copiedLink ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-green-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m1.5-.75h1.5a1.125 1.125 0 011.125 1.125v1.5m-3 0h.008v.008H9.75V8.25zm.008 3h.008v.008H9.75v-.008zm0 3h.008v.008H9.75v-.008z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase opacity-50">Yazarlar ({onlineUsers.length})</span>
                        <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                          {onlineUsers.map((user, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span 
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: user.color }}
                              >
                                {user.emoji}
                              </span>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={stopCollab}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all border border-red-500/20"
                      >
                        İşbirliğini Kapat ✖
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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
              id="editor-textarea"
              ref={textareaRef}
              key={activeId}
              defaultValue={activeDoc.content}
              value={collabRoom ? undefined : activeDoc.content}
              onChange={collabRoom ? undefined : (e) => handleTextChange(e.target.value)}
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
