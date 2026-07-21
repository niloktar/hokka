import { useState, useEffect, useRef } from 'react';

/**
 * CollaborationBar — Google Docs tarzı kişi bazlı paylaşım ve izin yönetim paneli
 */
export default function CollaborationBar({ collaboration, theme }) {
  const {
    isConnected,
    roomId: activeDocId,
    localUser,
    remoteUsers,
    permissions,
    myPermission,
    isRoomOwner,
    addPermission,
    removePermission,
  } = collaboration;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);

  // İzin ekleme formu
  const [permIdentifier, setPermIdentifier] = useState('');
  const [permMode, setPermMode] = useState('view');
  const [permError, setPermError] = useState('');
  const [permAdded, setPermAdded] = useState(false);

  // Link kopyalama
  const [linkCopied, setLinkCopied] = useState(false);

  const popoverRef = useRef(null);

  // Dışarı tıklayınca kapat
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

  const handleAddPermission = (e) => {
    e.preventDefault();
    const id = permIdentifier.trim().toLowerCase();
    if (!id) { setPermError('E-posta veya kullanıcı adı girin'); return; }
    if (id.length < 2) { setPermError('En az 2 karakter gerekli'); return; }
    addPermission(id, permMode);
    setPermIdentifier('');
    setPermError('');
    setPermAdded(true);
    setTimeout(() => setPermAdded(false), 2000);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('docId', activeDocId);
    url.searchParams.delete('room'); // Eski oda parametresini kaldır
    navigator.clipboard.writeText(url.toString());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendEmailInvite = (targetEmail) => {
    const docUrl = `${window.location.origin}/?docId=${activeDocId}`;
    const subject = encodeURIComponent(`[Hokka] ${collaboration.docTitle || 'Belge'} sizinle paylaşıldı`);
    const body = encodeURIComponent(
      `Merhaba,\n\n${localUser.name} sizinle Hokka üzerinde "${collaboration.docTitle || 'Belge'}" başlıklı bir belge paylaştı.\n\nBelgeye erişmek ve birlikte çalışmak için aşağıdaki bağlantıya tıklayın:\n${docUrl}\n\nKeyifli çalışmalar!`
    );
    // Gmail web composer
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const permEntries = Object.entries(permissions);
  const allUsers = [localUser, ...remoteUsers];

  return (
    <div className="collab-bar" style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bağlantı Noktası Göstergesi */}
      <div
        className={`collab-status-dot ${isConnected ? 'connected' : 'connecting'}`}
        title={isConnected ? 'Eşleşme sunucusuna bağlı' : 'Bağlanıyor...'}
      />

      {/* Aktif Kişilerin Hayvan Avatarları */}
      <div className="collab-avatar-stack">
        {allUsers.map((user, i) => (
          <div
            key={user.clientId || 'local-' + i}
            className="collab-animal-avatar"
            style={{ borderColor: user.color, boxShadow: `0 0 0 2px ${user.color}40` }}
            onMouseEnter={() => setHoveredUser(user.clientId || 'local')}
            onMouseLeave={() => setHoveredUser(null)}
          >
            {user.photoURL
              ? <img src={user.photoURL} alt={user.name} className="collab-animal-photo" />
              : <span className="collab-animal-emoji">{user.animal || '🐾'}</span>
            }
            {user.permission === 'view' && (
              <span className="collab-permission-badge view" title="Sadece görüntüleme yetkisi var">👁️</span>
            )}
            {hoveredUser === (user.clientId || 'local') && (
              <div className="collab-avatar-tooltip">
                <span className="collab-tooltip-animal">{user.animal || '🐾'}</span>
                <span className="collab-tooltip-name">{i === 0 ? `${user.name} (Siz)` : user.name}</span>
                {user.permission === 'view'
                  ? <span className="collab-tooltip-perm">👁️ Görüntüleyebilir</span>
                  : <span className="collab-tooltip-perm">✏️ Düzenleyebilir</span>
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paylaş Butonu (Google Docs stili) */}
      <button
        onClick={() => setPopoverOpen(v => !v)}
        className="collab-share-btn"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
          color: '#fff',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5V20a2 2 0 01-2 2H4a2 2 0 01-2-2v-9a2 2 0 012-2h5.5M12 2v9m0 0l-3-3m3 3l3-3" />
        </svg>
        <span>Paylaş</span>
      </button>

      {/* İzin ve Paylaşım Paneli Popover */}
      {popoverOpen && (
        <div className={`collab-popover ${theme.selectBg}`} style={{ borderColor: 'inherit', minWidth: 340 }}>

          {/* Panel Başlığı */}
          <div className="perm-panel-header">
            <span style={{ fontSize: 18 }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Erişim Ayarları</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>
                {isRoomOwner ? 'Bu belgenin sahibisiniz' : 'Ortak çalışma aktif'}
              </div>
            </div>
          </div>

          {/* Link Paylaşım Satırı */}
          <div className="perm-room-row" style={{ marginBottom: 12 }}>
            <div className="perm-room-code-box" style={{ padding: '6px 10px' }}>
              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.5, textTransform: 'uppercase' }}>Belge Bağlantısı</span>
              <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190, opacity: 0.85 }}>
                {window.location.origin}/?docId={activeDocId}
              </span>
            </div>
            <button className="perm-copy-btn" onClick={handleCopyLink} style={{ height: 34 }}>
              {linkCopied ? 'Kopyalandı ✓' : 'Bağlantıyı Kopyala'}
            </button>
          </div>

          {/* Sadece oda sahibi kişi ekleyebilir */}
          {isRoomOwner ? (
            <>
              <div className="perm-section-title">Kullanıcı Ekle</div>

              <form onSubmit={handleAddPermission} className="perm-add-form">
                <input
                  type="text"
                  value={permIdentifier}
                  onChange={e => { setPermIdentifier(e.target.value); setPermError(''); }}
                  placeholder="E-posta adresi veya kullanıcı adı"
                  className={`perm-identifier-input ${theme.selectBg}`}
                  style={{ borderColor: 'inherit' }}
                />
                <select
                  value={permMode}
                  onChange={e => setPermMode(e.target.value)}
                  className={`perm-mode-select ${theme.selectBg}`}
                  style={{ borderColor: 'inherit' }}
                >
                  <option value="edit">✏️ Düzenleyebilir</option>
                  <option value="view">👁️ Görüntüleyebilir</option>
                </select>
                <button type="submit" className="perm-add-btn">
                  {permAdded ? 'Eklendi ✓' : 'Ekle'}
                </button>
              </form>

              {permError && <div className="perm-error">{permError}</div>}

              {/* Erişim Listesi */}
              {permEntries.length > 0 && (
                <div className="perm-list">
                  <div className="perm-section-title" style={{ marginBottom: 6 }}>Erişimi Olan Kişiler</div>
                  {permEntries.map(([id, mode]) => (
                    <div key={id} className="perm-list-item">
                      <span className="perm-list-mode-badge">
                        {mode === 'edit' ? '✏️' : '👁️'}
                      </span>
                      <span className="perm-list-id" title={id}>{id}</span>
                      <span className="perm-list-mode-text">{mode === 'edit' ? 'Düzenleyebilir' : 'Görüntüleyebilir'}</span>
                      <button
                        className="perm-email-btn"
                        onClick={() => handleSendEmailInvite(id)}
                        title="Gmail ile Davet E-postası Gönder"
                      >
                        ✉️ Davet Et
                      </button>
                      <button
                        className="perm-remove-btn"
                        onClick={() => removePermission(id)}
                        title="Erişimi kaldır"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {permEntries.length === 0 && (
                <div className="perm-empty-note">
                  Henüz kimseye özel erişim izni tanımlanmadı.<br />
                  Bağlantıya sahip herkes düzenleyebilir.
                </div>
              )}
            </>
          ) : (
            /* Oda sahibi değilse sadece kendi iznini gösterir */
            <div className="perm-my-permission-box" data-mode={myPermission} style={{ marginTop: 8 }}>
              <span style={{ fontSize: 20 }}>{myPermission === 'edit' ? '✏️' : '👁️'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>
                  {myPermission === 'edit' ? 'Düzenleme Yetkiniz Var' : 'Görüntüleme Yetkiniz Var'}
                </div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>
                  {myPermission === 'edit' ? 'Belgede serbestçe değişiklik yapabilirsiniz.' : 'Belgeyi sadece okuyabilirsiniz.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
