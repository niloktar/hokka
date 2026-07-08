import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  COLLAB_SERVER_URL,
  generateUserName,
  getRandomColor,
  generateRoomId,
  applyDiff,
  getTextOffset,
  restoreCursorFromOffset,
} from './constants';

/**
 * useCollaboration — Ana ortak çalışma hook'u
 *
 * Mevcut contentEditable editörüne katman olarak eklenir.
 * Yjs CRDT + y-websocket üzerinden gerçek zamanlı senkronizasyon sağlar.
 *
 * @param {Object} params
 * @param {React.RefObject} params.editorRef - contentEditable div referansı
 * @param {string} params.activeDocId - Aktif doküman ID'si
 * @param {string} params.title - Aktif dokümanın başlığı
 * @param {React.RefObject} params.isUpdatingRef - Editör güncelleme kilidi
 * @param {Function} params.onRemoteChange - Uzak içerik değişiklik callback'i (html) => void
 * @param {Function} params.onRemoteTitleChange - Uzak başlık değişiklik callback'i (title) => void
 */
export function useCollaboration({ editorRef, activeDocId, title, isUpdatingRef, onRemoteChange, onRemoteTitleChange }) {
  // --- State ---
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [localUser, setLocalUser] = useState(() => {
    // localStorage'dan kullanıcı bilgisi yükle veya yeni oluştur
    const saved = localStorage.getItem('hokka_collab_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { name: generateUserName(), color: getRandomColor() };
  });
  const [remoteUsers, setRemoteUsers] = useState([]);

  // --- Refs ---
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const ytitleRef = useRef(null);
  const lastHtmlRef = useRef('');
  const lastTitleRef = useRef(title);
  const activeDocIdRef = useRef(activeDocId);

  // Keep refs in sync
  useEffect(() => {
    activeDocIdRef.current = activeDocId;
  }, [activeDocId]);

  useEffect(() => {
    lastTitleRef.current = title;
  }, [title]);

  // Persist user info
  useEffect(() => {
    localStorage.setItem('hokka_collab_user', JSON.stringify(localUser));
  }, [localUser]);

  // --- Join Room ---
  const joinRoom = useCallback((roomName) => {
    // Cleanup previous connection
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
    }

    const rid = roomName || generateRoomId();
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');
    const ytitle = ydoc.getText('title');

    const provider = new WebsocketProvider(COLLAB_SERVER_URL, `hokka-${rid}`, ydoc);

    // Awareness — yerel kullanıcı bilgisi
    provider.awareness.setLocalStateField('user', {
      name: localUser.name,
      color: localUser.color,
    });

    // Bağlantı durumu
    provider.on('status', ({ status }) => {
      setIsConnected(status === 'connected');
    });

    // İlk senkronizasyon
    provider.on('sync', (isSynced) => {
      if (!isSynced) return;

      const currentHtml = editorRef.current?.innerHTML || '';
      const currentTitle = lastTitleRef.current || 'Untitled Document 📝';
      
      const ytextContent = ytext.toString();
      const ytitleContent = ytitle.toString();

      // Content Sync
      if (ytextContent === '' && currentHtml !== '') {
        // Odada henüz içerik yok — yerel içeriği gönder
        ytext.insert(0, currentHtml);
        lastHtmlRef.current = currentHtml;
      } else if (ytextContent !== '') {
        // Odada içerik var — onu al
        if (editorRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = ytextContent;
          lastHtmlRef.current = ytextContent;
          onRemoteChange?.(ytextContent);
          setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
      }

      // Title Sync
      if (ytitleContent === '') {
         // Odada başlık yok - yerel başlığı gönder
         ytitle.insert(0, currentTitle);
      } else if (ytitleContent !== currentTitle) {
         // Odada başlık var - onu al
         onRemoteTitleChange?.(ytitleContent);
      }
    });

    // Uzak içerik değişiklikleri izle
    ytext.observe((event) => {
      if (event.transaction.local) return; // Yerel değişiklikleri atla

      const newHtml = ytext.toString();
      if (newHtml === lastHtmlRef.current) return;

      if (!editorRef.current) return;

      // Cursor pozisyonunu kaydet
      const sel = window.getSelection();
      let savedOffset = null;
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        savedOffset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      }

      // Editörü güncelle
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = newHtml;
      lastHtmlRef.current = newHtml;
      onRemoteChange?.(newHtml);

      // Cursor'u geri yükle
      if (savedOffset !== null) {
        restoreCursorFromOffset(editorRef.current, savedOffset);
      }

      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    });

    // Uzak başlık değişiklikleri izle
    ytitle.observe((event) => {
      if (event.transaction.local) return;
      const newTitle = ytitle.toString();
      onRemoteTitleChange?.(newTitle);
    });

    // Awareness değişiklikleri — uzak kullanıcılar
    const onAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const users = [];
      states.forEach((state, clientId) => {
        if (clientId !== ydoc.clientID && state.user) {
          users.push({
            clientId,
            ...state.user,
            cursor: state.cursor || null,
          });
        }
      });
      setRemoteUsers(users);
    };
    provider.awareness.on('change', onAwarenessChange);

    // Refs'i güncelle
    ydocRef.current = ydoc;
    providerRef.current = provider;
    ytextRef.current = ytext;
    ytitleRef.current = ytitle;
    setRoomId(rid);

    // URL'yi güncelle (paylaşım kolaylığı)
    const url = new URL(window.location.href);
    url.searchParams.set('room', rid);
    window.history.replaceState({}, '', url.toString());

  }, [localUser, editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange]);

  // --- Leave Room ---
  const leaveRoom = useCallback(() => {
    providerRef.current?.destroy();
    ydocRef.current?.destroy();
    providerRef.current = null;
    ydocRef.current = null;
    ytextRef.current = null;
    ytitleRef.current = null;
    lastHtmlRef.current = '';
    setRoomId(null);
    setIsConnected(false);
    setRemoteUsers([]);

    // URL'den room parametresini kaldır
    const url = new URL(window.location.href);
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

  // --- Update Cursor Position (Awareness) ---
  const updateCursorPosition = useCallback(() => {
    if (!providerRef.current || !editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      providerRef.current.awareness.setLocalStateField('cursor', { offset });
    }
  }, [editorRef]);

  // --- Set User Name ---
  const setUserName = useCallback((name) => {
    setLocalUser(prev => {
      const updated = { ...prev, name };
      // Awareness'i da güncelle
      if (providerRef.current) {
        providerRef.current.awareness.setLocalStateField('user', {
          name,
          color: prev.color,
        });
      }
      return updated;
    });
  }, []);

  // --- Auto-join from URL param ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom && !roomId) {
      // Küçük gecikme — editörün mount olmasını bekle
      const timer = setTimeout(() => joinRoom(urlRoom), 500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Doc ID değiştiğinde odadan çık ---
  const prevDocIdRef = useRef(activeDocId);
  useEffect(() => {
    if (prevDocIdRef.current !== activeDocId && roomId) {
      // Yalnızca farklı bir dokümana geçtiysek ve o doküman bu oda değilse çık
      if (activeDocId !== roomId) {
        leaveRoom();
      }
    }
    prevDocIdRef.current = activeDocId;
  }, [activeDocId, roomId, leaveRoom]);

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
    joinRoom,
    leaveRoom,
    setUserName,
    pushLocalChange,
    pushLocalTitleChange,
    updateCursorPosition,
  };
}
