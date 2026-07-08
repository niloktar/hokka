import { useState, useEffect, useRef } from 'react';
import { generateRoomId } from './constants';

/**
 * CollaborationBar — Oda/kullanıcı UI bileşeni
 *
 * Header alanına yerleşen kompakt bir bileşen.
 * Oda oluşturma, katılma, kullanıcı yönetimi sağlar.
 */
export default function CollaborationBar({ collaboration, theme }) {
  const {
    isConnected,
    roomId,
    localUser,
    remoteUsers,
    joinRoom,
    leaveRoom,
    setUserName,
  } = collaboration;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(localUser.name);
  const [linkCopied, setLinkCopied] = useState(false);
  const popoverRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  const handleCreateRoom = () => {
    const rid = generateRoomId();
    joinRoom(rid);
    setPopoverOpen(false);
  };

  const handleJoinRoom = () => {
    if (!joinInput.trim()) return;
    joinRoom(joinInput.trim().toUpperCase());
    setPopoverOpen(false);
    setJoinInput('');
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
    setEditingName(false);
  };

  const allUsers = [localUser, ...remoteUsers];

  // --- Bağlı değilken: "Paylaş" butonu ---
  if (!roomId) {
    return (
      <div className="collab-bar" ref={popoverRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setPopoverOpen(v => !v)}
          className="collab-share-btn"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            color: '#fff',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span>Paylaş</span>
        </button>

        {popoverOpen && (
          <div className={`collab-popover ${theme.selectBg}`} style={{ borderColor: 'inherit' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🤝 Ortak Çalışma</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Bir oda oluşturun veya mevcut bir odaya katılın.</div>
            </div>

            {/* Oda Oluştur */}
            <button className="collab-popover-btn primary" onClick={handleCreateRoom} style={{ marginBottom: 10 }}>
              ✨ Yeni Oda Oluştur
            </button>

            {/* Odaya Katıl */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>
                veya oda kodunu girin
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="ÖRN: A1B2C3"
                  className={`collab-popover-input ${theme.selectBg}`}
                  style={{ flex: 1, borderColor: 'inherit' }}
                  maxLength={8}
                />
                <button className="collab-popover-btn primary" onClick={handleJoinRoom} style={{ width: 'auto', padding: '8px 14px' }}>
                  Katıl
                </button>
              </div>
            </div>

            {/* Kullanıcı adı */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid', borderColor: 'inherit', opacity: 0.8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: 6 }}>
                Kullanıcı adınız
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  className="collab-avatar"
                  style={{ backgroundColor: localUser.color, width: 24, height: 24, fontSize: 10 }}
                >
                  {localUser.name.split(' ').map(w => w[0]).join('')}
                </div>
                {editingName ? (
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className={`collab-popover-input ${theme.selectBg}`}
                      style={{ flex: 1, fontSize: 12, padding: '4px 8px', borderColor: 'inherit', textTransform: 'none', textAlign: 'left', letterSpacing: 'normal' }}
                      autoFocus
                    />
                    <button className="collab-popover-btn primary" onClick={handleSaveName} style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}>
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingName(true); setNameInput(localUser.name); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'inherit', padding: 0 }}
                  >
                    {localUser.name}
                    <span style={{ marginLeft: 4, opacity: 0.4, fontSize: 10 }}>✏️</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Bağlıyken: durum + kullanıcılar + oda kodu ---
  return (
    <div className="collab-bar">
      {/* Bağlantı durumu */}
      <div
        className={`collab-status-dot ${isConnected ? 'connected' : 'connecting'}`}
        title={isConnected ? 'Bağlı' : 'Bağlanıyor...'}
      />

      {/* Kullanıcı avatarları */}
      <div className="collab-avatar-stack">
        {allUsers.slice(0, 5).map((user, i) => (
          <div
            key={user.clientId || 'local-' + i}
            className="collab-avatar"
            style={{ backgroundColor: user.color }}
            title={i === 0 ? `${user.name} (Siz)` : user.name}
          >
            {user.name.split(' ').map(w => w[0]).join('')}
          </div>
        ))}
        {allUsers.length > 5 && (
          <div
            className="collab-avatar"
            style={{ backgroundColor: '#94a3b8', fontSize: 9 }}
            title={`${allUsers.length - 5} kişi daha`}
          >
            +{allUsers.length - 5}
          </div>
        )}
      </div>

      {/* Oda kodu */}
      <span
        className="collab-room-code"
        onClick={handleCopyLink}
        title="Linki kopyala"
      >
        {linkCopied ? '✓ Kopyalandı' : roomId}
      </span>

      {/* Odadan çık */}
      <button className="collab-leave-btn" onClick={leaveRoom}>
        Çık
      </button>
    </div>
  );
}
