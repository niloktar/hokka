import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  COLLAB_SERVER_URL,
  generateUserName,
  getRandomColor,
  getAnimalForUser,
  getColorForUser,
  generateRoomId,
  applyDiff,
  getTextOffset,
  restoreCursorFromOffset,
} from './constants';

/**
 * useCollaboration — Ana ortak çalışma hook'u
 *
 * İzin sistemi: Yjs Y.Map üzerinden kalıcı kişi bazlı izinler.
 * Oda sahibi (ilk oluşturan) kişinin email/adını girip edit|view seçer.
 * Kişi odaya katıldığında izni otomatik uygulanır.
 */
export function useCollaboration({
  editorRef,
  activeDocId,
  title,
  isUpdatingRef,
  onRemoteChange,
  onRemoteTitleChange,
  googleUser,
}) {
  // --- State ---
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [localUser, setLocalUser] = useState(() => buildLocalUser(googleUser));
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [permissions, setPermissions] = useState({}); // { identifier: 'edit'|'view' }
  const [myPermission, setMyPermission] = useState('edit'); // Bu kullanıcının izni
  const [isRoomOwner, setIsRoomOwner] = useState(false); // Oda sahibi mi?

  // Google kullanıcısı değişince localUser güncelle
  useEffect(() => {
    if (googleUser) {
      setLocalUser(buildLocalUser(googleUser));
    }
  }, [googleUser]);

  // --- Refs ---
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const ytitleRef = useRef(null);
  const ypermissionsRef = useRef(null); // Y.Map for persistent permissions
  const yownerRef = useRef(null);       // Y.Text for room owner identifier
  const lastHtmlRef = useRef('');
  const lastTitleRef = useRef(title);
  const activeDocIdRef = useRef(activeDocId);
  const localUserRef = useRef(localUser);

  useEffect(() => { localUserRef.current = localUser; }, [localUser]);
  useEffect(() => { activeDocIdRef.current = activeDocId; }, [activeDocId]);
  useEffect(() => { lastTitleRef.current = title; }, [title]);

  // Persist user info
  useEffect(() => {
    localStorage.setItem('hokka_collab_user', JSON.stringify(localUser));
  }, [localUser]);

  // --- Kullanıcı tanımlayıcısı: email varsa email, yoksa ad ---
  const getUserIdentifier = useCallback((user) => {
    if (!user) return null;
    // Firebase kullanıcısı → email
    if (user.email) return user.email.toLowerCase();
    // Anonim → displayName (lowercase, trimmed)
    if (user.displayName) return user.displayName.toLowerCase().trim();
    return user.uid || null;
  }, []);

  // --- İzin yönetimi fonksiyonları ---

  /** Belirli bir kişiye izin ver (sadece oda sahibi çağırabilir) */
  const addPermission = useCallback((identifier, mode) => {
    if (!ypermissionsRef.current) return;
    const key = identifier.toLowerCase().trim();
    if (!key) return;
    ypermissionsRef.current.set(key, mode); // Yjs map → tüm kullanıcılara senkronize olur
  }, []);

  /** Kişinin iznini kaldır */
  const removePermission = useCallback((identifier) => {
    if (!ypermissionsRef.current) return;
    ypermissionsRef.current.delete(identifier.toLowerCase().trim());
  }, []);

  // --- Join Room ---
  const joinRoom = useCallback((roomName) => {
    if (providerRef.current) providerRef.current.destroy();
    if (ydocRef.current) ydocRef.current.destroy();

    const rid = roomName || generateRoomId();
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');
    const ytitle = ydoc.getText('title');
    const ypermissions = ydoc.getMap('permissions'); // Kalıcı izin haritası
    const yowner = ydoc.getText('owner');             // Oda sahibi identifier'ı

    const provider = new WebsocketProvider(COLLAB_SERVER_URL, `hokka-${rid}`, ydoc);

    // --- Sync: ilk senkronizasyon ---
    provider.on('sync', (isSynced) => {
      if (!isSynced) return;

      const currentUser = localUserRef.current;
      const myId = getUserIdentifier(googleUser || currentUser);

      // --- Oda sahibini belirle ---
      const existingOwner = yowner.toString();
      let amOwner = false;

      if (existingOwner === '') {
        // Odayı ilk oluşturan — sahip ol
        yowner.insert(0, myId || 'unknown');
        amOwner = true;
      } else {
        amOwner = (existingOwner === myId);
      }
      setIsRoomOwner(amOwner);

      // --- Kendi iznimi belirle ---
      const myPerm = ypermissions.get(myId) || (amOwner ? 'edit' : 'edit');
      setMyPermission(myPerm);

      // --- İzin listesini yükle ---
      const permObj = {};
      ypermissions.forEach((val, key) => { permObj[key] = val; });
      setPermissions(permObj);

      // --- Awareness: kullanıcı bilgisi + izni yayınla ---
      provider.awareness.setLocalStateField('user', {
        uid: currentUser.uid || null,
        name: currentUser.name,
        color: currentUser.color,
        animal: currentUser.animal || '🐾',
        photoURL: currentUser.photoURL || null,
        permission: myPerm,
        identifier: myId,
      });

      // --- İçerik senkronizasyonu ---
      const currentHtml = editorRef.current?.innerHTML || '';
      const currentTitle = lastTitleRef.current || 'Untitled Document 📝';
      const ytextContent = ytext.toString();
      const ytitleContent = ytitle.toString();

      if (ytextContent === '' && currentHtml !== '') {
        ytext.insert(0, currentHtml);
        lastHtmlRef.current = currentHtml;
      } else if (ytextContent !== '') {
        if (editorRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = ytextContent;
          lastHtmlRef.current = ytextContent;
          onRemoteChange?.(ytextContent);
          setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
      }

      if (ytitleContent === '') {
        ytitle.insert(0, currentTitle);
      } else if (ytitleContent !== currentTitle) {
        onRemoteTitleChange?.(ytitleContent);
      }
    });

    // --- İzin haritası değişince güncelle ve kendi iznimi kontrol et ---
    ypermissions.observe(() => {
      const permObj = {};
      ypermissions.forEach((val, key) => { permObj[key] = val; });
      setPermissions(permObj);

      // Kendi iznimde değişiklik var mı?
      const currentUser = localUserRef.current;
      const myId = getUserIdentifier(googleUser || currentUser);
      if (myId && ypermissions.has(myId)) {
        const newPerm = ypermissions.get(myId);
        setMyPermission(newPerm);
        // Awareness'ı güncelle
        if (providerRef.current) {
          const currentState = providerRef.current.awareness.getLocalState()?.user || {};
          providerRef.current.awareness.setLocalStateField('user', {
            ...currentState,
            permission: newPerm,
          });
        }
      }
    });

    // --- Bağlantı durumu ---
    provider.on('status', ({ status }) => {
      setIsConnected(status === 'connected');
    });

    // --- Uzak içerik değişiklikleri ---
    ytext.observe((event) => {
      if (event.transaction.local) return;
      const newHtml = ytext.toString();
      if (newHtml === lastHtmlRef.current || !editorRef.current) return;

      const sel = window.getSelection();
      let savedOffset = null;
      if (sel?.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        savedOffset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      }

      isUpdatingRef.current = true;
      editorRef.current.innerHTML = newHtml;
      lastHtmlRef.current = newHtml;
      onRemoteChange?.(newHtml);
      if (savedOffset !== null) restoreCursorFromOffset(editorRef.current, savedOffset);
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    });

    // --- Uzak başlık değişiklikleri ---
    ytitle.observe((event) => {
      if (event.transaction.local) return;
      onRemoteTitleChange?.(ytitle.toString());
    });

    // --- Awareness: uzak kullanıcılar ---
    const onAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const users = [];
      states.forEach((state, clientId) => {
        if (clientId !== ydoc.clientID && state.user) {
          users.push({ clientId, ...state.user, cursor: state.cursor || null });
        }
      });
      setRemoteUsers(users);
    };
    provider.awareness.on('change', onAwarenessChange);

    // --- Refs güncelle ---
    ydocRef.current = ydoc;
    providerRef.current = provider;
    ytextRef.current = ytext;
    ytitleRef.current = ytitle;
    ypermissionsRef.current = ypermissions;
    yownerRef.current = yowner;
    setRoomId(rid);

    // URL güncelle
    const url = new URL(window.location.href);
    url.searchParams.set('docId', rid);
    url.searchParams.delete('room');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());

  }, [localUser, googleUser, editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange, getUserIdentifier]);

  // --- Leave Room ---
  const leaveRoom = useCallback(() => {
    providerRef.current?.destroy();
    ydocRef.current?.destroy();
    providerRef.current = null;
    ydocRef.current = null;
    ytextRef.current = null;
    ytitleRef.current = null;
    ypermissionsRef.current = null;
    yownerRef.current = null;
    lastHtmlRef.current = '';
    setRoomId(null);
    setIsConnected(false);
    setRemoteUsers([]);
    setPermissions({});
    setMyPermission('edit');
    setIsRoomOwner(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('docId');
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // --- Push Local Content Change ---
  const pushLocalChange = useCallback((newHtml) => {
    if (!ytextRef.current) return;
    const oldHtml = lastHtmlRef.current;
    if (newHtml === oldHtml) return;
    applyDiff(ytextRef.current, oldHtml, newHtml);
    lastHtmlRef.current = newHtml;
  }, []);

  // --- Push Local Title Change ---
  const pushLocalTitleChange = useCallback((newTitle) => {
    if (!ytitleRef.current) return;
    const oldTitle = ytitleRef.current.toString();
    if (newTitle === oldTitle) return;
    applyDiff(ytitleRef.current, oldTitle, newTitle);
  }, []);

  // --- Update Cursor Position ---
  const updateCursorPosition = useCallback(() => {
    if (!providerRef.current || !editorRef.current) return;
    const sel = window.getSelection();
    if (sel?.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      providerRef.current.awareness.setLocalStateField('cursor', { offset });
    }
  }, [editorRef]);

  // --- Auto-join when activeDocId changes ---
  useEffect(() => {
    if (activeDocId) {
      const timer = setTimeout(() => {
        joinRoom(activeDocId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeDocId, joinRoom]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  return {
    isConnected,
    roomId,
    localUser,
    remoteUsers,
    permissions,      // { identifier: 'edit'|'view' }
    myPermission,     // Bu kullanıcının izni: 'edit' | 'view'
    isRoomOwner,      // Oda sahibi mi?
    joinRoom,
    leaveRoom,
    pushLocalChange,
    pushLocalTitleChange,
    updateCursorPosition,
    addPermission,    // (identifier, mode) => void
    removePermission, // (identifier) => void
    getUserIdentifier,
  };
}

// --- Yardımcı ---
function buildLocalUser(googleUser) {
  if (googleUser) {
    return {
      uid: googleUser.uid,
      name: googleUser.displayName || generateUserName(),
      email: googleUser.email || null,
      color: getColorForUser(googleUser.uid),
      animal: getAnimalForUser(googleUser.uid),
      photoURL: googleUser.photoURL || null,
    };
  }
  const saved = localStorage.getItem('hokka_collab_user');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return { name: generateUserName(), color: getRandomColor(), animal: '🐾', photoURL: null };
}
